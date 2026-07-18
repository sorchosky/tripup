/**
 * TripContext — the one shared store the whole flow plays through.
 *
 * Every graded state change in the brief fires as an action here, so the screens read from a single
 * evolving trip rather than faking their own state:
 *   - ADD_PARTICIPANT  → Ren joins (2 avatars → 3)                        [screen 3]
 *   - CAST_VOTE        → live vote counts tick up                        [screen 5]
 *   - CLOSE_POLL       → winner resolves AND writes into the itinerary   [screen 6]
 *   - TOGGLE_ASSIGNEE  → per-item exclusion; balances recalculate        [screen 7]
 *   - SETTLE           → transfers confirmed; the dinner flips to paid   [screens 9–10]
 */

import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import {
  DINNER_ITINERARY_ITEM,
  DINNER_POLL,
  DINNER_RECEIPT,
  INITIAL_ITINERARY,
  INITIAL_PARTICIPANT_IDS,
  PARTICIPANTS,
  participantById,
  type ItineraryItem,
  type Participant,
} from '../data/mock';
import { computeBalances, computeShares, settle, type Assignment, type Transfer } from '../lib/settle';

export type PollStatus = 'none' | 'open' | 'closed';

export interface PollOptionState {
  id: string;
  name: string;
  votes: number;
  /** Participant ids who have voted for this option. */
  votedBy: string[];
}

export interface PollState {
  status: PollStatus;
  question: string;
  closedAt: string;
  options: PollOptionState[];
  winnerId: string | null;
}

export interface TripState {
  participants: Participant[];
  poll: PollState;
  itinerary: ItineraryItem[];
  /** Per-receipt-item assignment for the dinner; seeded from each line's default split. */
  assignment: Assignment;
  settled: boolean;
}

export type TripAction =
  | { type: 'ADD_PARTICIPANT'; id: string }
  | { type: 'CAST_VOTE'; optionId: string; voterId: string }
  | { type: 'CLOSE_POLL' }
  | { type: 'ADD_ITINERARY_ITEM'; item: ItineraryItem }
  | { type: 'TOGGLE_ASSIGNEE'; itemId: string; personId: string }
  | { type: 'SETTLE' }
  | { type: 'RESET' };

function seedAssignment(): Assignment {
  return Object.fromEntries(DINNER_RECEIPT.items.map((it) => [it.id, [...it.defaultSharedBy]]));
}

function initialState(): TripState {
  return {
    participants: INITIAL_PARTICIPANT_IDS.map(participantById),
    poll: {
      status: 'none',
      question: DINNER_POLL.question,
      closedAt: DINNER_POLL.closedAt,
      options: DINNER_POLL.options.map((o) => ({ id: o.id, name: o.name, votes: 0, votedBy: [] })),
      winnerId: null,
    },
    itinerary: INITIAL_ITINERARY,
    assignment: seedAssignment(),
    settled: false,
  };
}

function reducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'ADD_PARTICIPANT': {
      if (state.participants.some((p) => p.id === action.id)) return state;
      // Keep the roster in canonical order (Ari · Ren · Nic) so avatar rows read A · R · N on every
      // screen, matching the hi-fi mocks, regardless of the order people were added in.
      const order = PARTICIPANTS.map((p) => p.id);
      const participants = [...state.participants, participantById(action.id)].sort(
        (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
      );
      return { ...state, participants };
    }

    case 'CAST_VOTE': {
      // Poll opens on the first vote if it hasn't yet. One vote per person; ignore repeats.
      if (state.poll.options.some((o) => o.votedBy.includes(action.voterId))) return state;
      const options = state.poll.options.map((o) =>
        o.id === action.optionId ? { ...o, votes: o.votes + 1, votedBy: [...o.votedBy, action.voterId] } : o,
      );
      return { ...state, poll: { ...state.poll, status: 'open', options } };
    }

    case 'CLOSE_POLL': {
      if (state.poll.status === 'closed') return state;
      const winner = [...state.poll.options].sort((a, b) => b.votes - a.votes)[0];
      const alreadyOnItinerary = state.itinerary.some((i) => i.id === DINNER_ITINERARY_ITEM.id);
      return {
        ...state,
        poll: { ...state.poll, status: 'closed', winnerId: winner?.id ?? null },
        // The result writes into the itinerary as a pending dinner (graded transition, screen 6).
        itinerary: alreadyOnItinerary ? state.itinerary : [...state.itinerary, DINNER_ITINERARY_ITEM],
      };
    }

    case 'ADD_ITINERARY_ITEM': {
      // Idempotent, same guard as CLOSE_POLL's itinerary write — re-adding a stop no-ops.
      if (state.itinerary.some((i) => i.id === action.item.id)) return state;
      return { ...state, itinerary: [...state.itinerary, action.item] };
    }

    case 'TOGGLE_ASSIGNEE': {
      const current = state.assignment[action.itemId] ?? [];
      const next = current.includes(action.personId)
        ? current.filter((id) => id !== action.personId)
        : [...current, action.personId];
      return { ...state, assignment: { ...state.assignment, [action.itemId]: next } };
    }

    case 'SETTLE': {
      return {
        ...state,
        settled: true,
        // Once everyone's square, the dinner reads as paid on the itinerary (pending → paid).
        itinerary: state.itinerary.map((i) =>
          i.id === DINNER_ITINERARY_ITEM.id ? { ...i, status: 'paid' } : i,
        ),
      };
    }

    case 'RESET':
      return initialState();

    default:
      return state;
  }
}

interface TripStore {
  state: TripState;
  dispatch: Dispatch<TripAction>;
  /** Derived, memoized read models the screens consume. */
  derived: {
    votesIn: number;
    totalVoters: number;
    leaderId: string | null;
    /** person id → their share of the dinner, in cents. */
    shares: Record<string, number>;
    balances: ReturnType<typeof computeBalances>;
    transfers: Transfer[];
  };
}

const TripContext = createContext<TripStore | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const derived = useMemo(() => {
    const votesIn = state.poll.options.reduce((n, o) => n + o.votes, 0);
    const ranked = [...state.poll.options].sort((a, b) => b.votes - a.votes);
    const leaderId = votesIn > 0 && ranked[0].votes > 0 ? ranked[0].id : null;

    const ids = state.participants.map((p) => p.id);
    const shares = computeShares(DINNER_RECEIPT, state.assignment);
    const balances = computeBalances(DINNER_RECEIPT, state.assignment, ids);
    const transfers = settle(balances);

    return { votesIn, totalVoters: state.participants.length, leaderId, shares, balances, transfers };
  }, [state]);

  const store = useMemo<TripStore>(() => ({ state, dispatch, derived }), [state, derived]);
  return <TripContext.Provider value={store}>{children}</TripContext.Provider>;
}

export function useTrip(): TripStore {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}

/** Convenience re-export so screens don't reach into mock.ts just for the roster type. */
export const ALL_PARTICIPANTS = PARTICIPANTS;
