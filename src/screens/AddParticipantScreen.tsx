/**
 * Screen 3 — Add/edit participants. A full-height sheet over the hub (#15): Ari searches, picks Ren,
 * and the group updates (2 avatars → 3). Suggestions are the real roster members not yet on the trip,
 * filtered by the query — no invented contacts. With an empty query, up to 3 of them surface by
 * default under a "Suggested" eyebrow (roster order, ALL_PARTICIPANTS — issue #50) instead of showing
 * nothing until the user types. Adding dispatches ADD_PARTICIPANT; the trip updates live in the sheet,
 * and again on the hub once the sheet closes.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';
import { Avatar, Eyebrow, Toast } from '../components/ui';
import { Search, Plus } from '../components/icons';
import { ALL_PARTICIPANTS, useTrip } from '../state/TripContext';
import { participantById } from '../data/mock';
import styles from './AddParticipantScreen.module.css';

export default function AddParticipantScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useTrip();
  const [query, setQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const onTrip = new Set(state.participants.map((p) => p.id));
  const notOnTrip = useMemo(
    () => ALL_PARTICIPANTS.filter((p) => !onTrip.has(p.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.participants],
  );

  // Empty query: up to 3 suggested people, in roster order (ALL_PARTICIPANTS — the
  // suggested-ordering source). Typed query: same roster, name-prefix filtered, still capped at 3.
  const trimmedQuery = query.trim().toLowerCase();
  const suggestions = useMemo(
    () =>
      (trimmedQuery.length > 0
        ? notOnTrip.filter((p) => p.name.toLowerCase().startsWith(trimmedQuery))
        : notOnTrip
      ).slice(0, 3),
    [notOnTrip, trimmedQuery],
  );

  function add(id: string) {
    dispatch({ type: 'ADD_PARTICIPANT', id });
    setQuery('');
    setToastMessage(`${participantById(id).name} has been added to the trip.`);
  }

  return (
    <>
      <BottomSheet
        title="Add/edit participants"
        onClose={() => navigate('/trip')}
        footer={
          <label className={styles.search}>
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name"
              autoComplete="off"
            />
          </label>
        }
      >
        <p className={styles.sub}>Bring a friend into Lisbon 2026. They&apos;ll see the plan and pitch in on the tab.</p>

        <div className={styles.current}>
          <Eyebrow>On the trip</Eyebrow>
          <div className={styles.currentRow}>
            {state.participants.map((p) => (
              <div key={p.id} className={styles.profile}>
                <Avatar personId={p.id} size="xl" variant="filled" />
                <span className={styles.profileName}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {suggestions.length > 0 ? (
          <div className={styles.results}>
            <Eyebrow>{trimmedQuery.length > 0 ? 'From your contacts' : 'Suggested'}</Eyebrow>
            {suggestions.map((p) => (
              <div key={p.id} className={styles.resultRow}>
                <Avatar personId={p.id} size="lg" variant="neutral" />
                <div className={styles.resultBody}>
                  <div className={styles.resultName}>{p.name}</div>
                  <div className={styles.resultMeta}>Travels with you often</div>
                </div>
                <button type="button" className={styles.addBtn} onClick={() => add(p.id)}>
                  <Plus size={14} />
                  Add
                </button>
              </div>
            ))}
          </div>
        ) : trimmedQuery.length > 0 ? (
          <p className={styles.emptyResults}>No one matches &ldquo;{query.trim()}&rdquo;.</p>
        ) : null}
      </BottomSheet>
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </>
  );
}
