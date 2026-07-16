/**
 * TripContext — shared trip state for the flow.
 *
 * SKELETON: the reducer is intentionally minimal. As screens are built, extend TripState and the
 * actions so the graded transitions fire through here (adding a participant, casting/closing a vote,
 * logging an expense with exclusions, recalculating balances, settling up). Keeping state in one
 * reducer is what lets the flow actually play out across screens rather than faking each screen.
 */

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { PARTICIPANTS, type Participant } from '../data/mock';

export interface TripState {
  participants: Participant[];
  // TODO: poll (options, votes, status, winner), expenses (with exclusions), balances, settlements.
}

export type TripAction =
  | { type: 'ADD_PARTICIPANT'; participant: Participant };
// TODO: | { type: 'CAST_VOTE'; ... } | { type: 'CLOSE_POLL' } | { type: 'LOG_EXPENSE'; ... } | { type: 'SETTLE' }

const initialState: TripState = {
  participants: PARTICIPANTS,
};

function reducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.participant] };
    default:
      return state;
  }
}

const TripStateContext = createContext<TripState | null>(null);
const TripDispatchContext = createContext<Dispatch<TripAction> | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <TripStateContext.Provider value={state}>
      <TripDispatchContext.Provider value={dispatch}>{children}</TripDispatchContext.Provider>
    </TripStateContext.Provider>
  );
}

export function useTripState(): TripState {
  const ctx = useContext(TripStateContext);
  if (!ctx) throw new Error('useTripState must be used within TripProvider');
  return ctx;
}

export function useTripDispatch(): Dispatch<TripAction> {
  const ctx = useContext(TripDispatchContext);
  if (!ctx) throw new Error('useTripDispatch must be used within TripProvider');
  return ctx;
}
