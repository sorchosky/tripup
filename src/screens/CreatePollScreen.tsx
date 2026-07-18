/**
 * Screen 4 — Create poll. Ari proposes where to eat. The question sits under its own label, and the
 * spots start as an empty set of free-text inputs the creator fills in — one per idea — each with a
 * delete control. "Add option" appends a blank row; "AI Suggest" pulls spots from past trips
 * (frequent-traveler favorites) into the list. "Send poll to …" opens it to the rest of the group
 * (screen 5). No review step in between — one tap sends.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Button } from '../components/ui';
import { ArrowLeft, Plus, Sparkles, Trash2 } from '../components/icons';
import { AI_SUGGESTED_SPOTS, ORGANIZER_ID } from '../data/mock';
import { useTrip } from '../state/TripContext';
import styles from './CreatePollScreen.module.css';

interface OptionRow {
  key: string;
  value: string;
}

// Stable keys for editable/deletable rows so React doesn't remount an input mid-edit as siblings
// come and go. A monotonic counter is enough — rows never outlive the screen.
let rowSeq = 0;
function blankRow(value = ''): OptionRow {
  rowSeq += 1;
  return { key: `opt-${rowSeq}`, value };
}

/** "Ren & Nic", "Ren, Nic & Josie", or a single name — the group minus the creator. */
function recipientList(names: string[]): string {
  if (names.length === 0) return 'the group';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

export default function CreatePollScreen() {
  const navigate = useNavigate();
  const { state } = useTrip();
  const [question, setQuestion] = useState(state.poll.question);
  // Empty by default (two blank rows, the minimum a poll needs) — the creator types the spots in.
  const [options, setOptions] = useState<OptionRow[]>(() => [blankRow(), blankRow()]);

  function updateOption(key: string, value: string) {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, value } : o)));
  }
  function removeOption(key: string) {
    setOptions((prev) => prev.filter((o) => o.key !== key));
  }
  function addOption() {
    setOptions((prev) => [...prev, blankRow()]);
  }

  // AI Suggest (wireframe 29:2384): pull past-trip / frequent-traveler favorites into the list.
  // Non-destructive — keeps anything already typed, then appends suggestions not already present.
  function suggest() {
    setOptions((prev) => {
      const filled = prev.filter((o) => o.value.trim().length > 0);
      const have = new Set(filled.map((o) => o.value.trim().toLowerCase()));
      const additions = AI_SUGGESTED_SPOTS.filter((name) => !have.has(name.toLowerCase())).map((name) =>
        blankRow(name),
      );
      return [...filled, ...additions];
    });
  }

  const recipients = state.participants.filter((p) => p.id !== ORGANIZER_ID).map((p) => p.name);
  const filledCount = options.filter((o) => o.value.trim().length > 0).length;
  const canSend = filledCount >= 2 && question.trim().length > 0;

  return (
    <Screen
      nav={
        <NavHeader
          onBack={() => navigate('/trip')}
          leftIcon={<ArrowLeft />}
          leftAriaLabel="Back to trip"
          rightText="Clear"
          onRight={() => {
            setQuestion('');
            setOptions([blankRow(), blankRow()]);
          }}
        />
      }
      footer={
        <Button disabled={!canSend} onClick={() => navigate('/poll')}>
          Send poll to {recipientList(recipients)}
        </Button>
      }
    >
      <div className={styles.body}>
        <h1 className={styles.title}>New poll</h1>

        <div className={styles.field}>
          <Eyebrow>The question</Eyebrow>
          <input
            className={styles.questionField}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask the group something"
            aria-label="Poll question"
          />
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <Eyebrow>The spots</Eyebrow>
          </div>

          {options.length === 0 ? (
            <p className={styles.emptyHint}>No spots yet. Add one, or let AI Suggest pull from past trips.</p>
          ) : (
            <div className={styles.options}>
              {options.map((o, i) => (
                <div key={o.key} className={styles.option}>
                  <input
                    className={styles.optionInput}
                    value={o.value}
                    onChange={(e) => updateOption(o.key, e.target.value)}
                    placeholder={`Spot ${i + 1}`}
                    aria-label={`Option ${i + 1}`}
                  />
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => removeOption(o.key)}
                    aria-label={`Remove option ${i + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" className={styles.addOption} onClick={addOption}>
            <Plus size={16} />
            Add option
          </button>

          <div className={styles.assist}>
            <button type="button" className={styles.assistChip} onClick={suggest}>
              <Sparkles size={16} />
              AI Suggest
            </button>
            <p className={styles.assistHint}>Pulls spots you and frequent travelers liked on past trips.</p>
          </div>
        </section>
      </div>
    </Screen>
  );
}
