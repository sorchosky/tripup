/**
 * Screen 3 — Add participant. A bottom sheet over the hub: Ari searches, picks Ren, and the group
 * updates (2 avatars → 3). Suggestions are the real roster members not yet on the trip, filtered by the
 * query — no invented contacts. Adding dispatches ADD_PARTICIPANT and returns to the hub.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBar, HomeIndicator, Avatar, Eyebrow } from '../components/ui';
import { Search, Plus } from '../components/icons';
import { ALL_PARTICIPANTS, useTrip } from '../state/TripContext';
import styles from './AddParticipantScreen.module.css';

export default function AddParticipantScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useTrip();
  const [query, setQuery] = useState('');

  const onTrip = new Set(state.participants.map((p) => p.id));
  const suggestions = useMemo(
    () =>
      ALL_PARTICIPANTS.filter((p) => !onTrip.has(p.id)).filter((p) =>
        p.name.toLowerCase().startsWith(query.trim().toLowerCase()),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, state.participants],
  );

  function add(id: string) {
    dispatch({ type: 'ADD_PARTICIPANT', id });
    navigate('/trip');
  }

  return (
    <div className={styles.screen}>
      <StatusBar />
      <button type="button" className={styles.scrim} aria-label="Close" onClick={() => navigate('/trip')} />

      <div className={styles.sheet} role="dialog" aria-label="Add someone to the trip">
        <div className={styles.grabber} aria-hidden />
        <h1 className={styles.title}>Add someone</h1>
        <p className={styles.sub}>Bring a friend into Lisbon 2026. They&apos;ll see the plan and pitch in on the tab.</p>

        <div className={styles.current}>
          {state.participants.map((p) => (
            <Avatar key={p.id} personId={p.id} size="md" variant="filled" />
          ))}
          <span className={styles.currentLabel}>on the trip</span>
        </div>

        <label className={styles.search}>
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            autoComplete="off"
          />
        </label>

        <div style={{ marginTop: 'var(--space-4)' }}>
          <Eyebrow>From your contacts</Eyebrow>
        </div>

        {suggestions.length > 0 ? (
          <div className={styles.results}>
            {suggestions.slice(0, 3).map((p) => (
              <button key={p.id} type="button" className={styles.resultRow} onClick={() => add(p.id)}>
                <Avatar personId={p.id} size="lg" variant="neutral" />
                <div className={styles.resultBody}>
                  <div className={styles.resultName}>{p.name}</div>
                  <div className={styles.resultMeta}>Travels with you often</div>
                </div>
                <Plus size={20} className={styles.addPlus} />
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.emptyResults}>Everyone&apos;s already here. That&apos;s the whole group.</p>
        )}
      </div>

      <HomeIndicator />
    </div>
  );
}
