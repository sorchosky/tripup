/**
 * Screen 4 — Create poll. Ari proposes where to eat. The question sits under its own label, and the
 * spots start as an empty set of free-text inputs the creator fills in — one per idea — each with a
 * delete control. "Add option" appends a blank row. Focusing/typing in an option field opens a
 * typeahead (issue #93, replacing the old standalone "AI Suggest" chip): the first 3 rows are AI
 * picks pulled from past trips, everything below is a broader sample of real Lisbon venues — tapping
 * a row fills the field and closes the dropdown. "Send poll to participants" opens it to the rest of
 * the group — one tap sends and drops straight into live voting (screen 5), confirmed by a toast
 * there rather than a separate confirmation screen (issue #104, superseding #55's `PollSentScreen`).
 *
 * Issue #113: below the option rows / "Add option," a dismissible "Recommend with AI" card offers a
 * screen-level shortcut to the same `AI_SUGGESTED_SPOTS` data already surfacing one row at a time in
 * `SpotTypeahead` above — tapping its CTA bulk-fills the whole option list in one tap (replacing
 * whatever's there, not appending) rather than requiring a per-field pick. A materially different job
 * from the standalone "AI Suggest" chip issue #93 removed (that chip suggested into one focused field);
 * this is a bulk autofill, not a reintroduction of that chip.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Button } from '../components/ui';
import { ArrowLeft, ArrowUpRight, Plus, Sparkles, Trash2, X } from '../components/icons';
import { AI_SUGGESTED_SPOTS, LISBON_POLL_SUGGESTIONS } from '../data/mock';
import { useTrip } from '../state/TripContext';
import styles from './CreatePollScreen.module.css';

// Locked copy — CONTENT.md → "AI autofill card" (issue #113). Voice-passed against BRAND.md (short,
// fact-first, no exclamation point) from the mock's starting-point line.
const AI_CARD_TITLE = 'Recommend with AI';
const AI_CARD_BODY = "We'll fill in spots you've liked on past trips.";
const AI_CARD_CTA = 'Add AI recommendations';

interface OptionRow {
  key: string;
  value: string;
}

/**
 * Generic-ish field typeahead: given what's typed, ranks up to 3 "AI" picks (starred) above a broader
 * "venue" pool (arrow-marked), both filtered by substring match, and reports the pick back via
 * `onSelect`. Kept local to this screen for now (only one caller), but the split from `CreatePollScreen`
 * is deliberate so it can be lifted into `src/components` unchanged if a second field needs it.
 */
function SpotTypeahead({
  query,
  aiSpots,
  venueSpots,
  onSelect,
}: {
  query: string;
  aiSpots: string[];
  venueSpots: string[];
  onSelect: (value: string) => void;
}) {
  const q = query.trim().toLowerCase();
  const matches = (name: string) => q === '' || name.toLowerCase().includes(q);

  const ai = aiSpots.filter(matches).slice(0, 3);
  const aiLower = new Set(aiSpots.map((n) => n.toLowerCase()));
  const venues = venueSpots.filter((name) => !aiLower.has(name.toLowerCase()) && matches(name));

  if (ai.length === 0 && venues.length === 0) return null;

  return (
    <div className={styles.typeahead} role="listbox" aria-label="Spot suggestions">
      {ai.map((name) => (
        <button
          key={`ai-${name}`}
          type="button"
          role="option"
          aria-selected={false}
          className={styles.typeaheadRow}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(name)}
        >
          <span>{name}</span>
          <Sparkles size={14} className={styles.typeaheadIconAi} />
        </button>
      ))}
      {venues.map((name) => (
        <button
          key={`venue-${name}`}
          type="button"
          role="option"
          aria-selected={false}
          className={styles.typeaheadRow}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(name)}
        >
          <span>{name}</span>
          <ArrowUpRight size={14} className={styles.typeaheadIconVenue} />
        </button>
      ))}
    </div>
  );
}

// Stable keys for editable/deletable rows so React doesn't remount an input mid-edit as siblings
// come and go. A monotonic counter is enough — rows never outlive the screen.
let rowSeq = 0;
function blankRow(value = ''): OptionRow {
  rowSeq += 1;
  return { key: `opt-${rowSeq}`, value };
}

export default function CreatePollScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useTrip();
  const [question, setQuestion] = useState(state.poll.question);
  // Empty by default (two blank rows, the minimum a poll needs) — the creator types the spots in.
  const [options, setOptions] = useState<OptionRow[]>(() => [blankRow(), blankRow()]);
  // Which option row's typeahead is open, if any — only one dropdown shows at a time (issue #93).
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  // Dismissing the AI-autofill card is local-only, for the remainder of this screen visit — no
  // persistence, matching the scope contract for this phase (issue #113).
  const [aiCardDismissed, setAiCardDismissed] = useState(false);

  function updateOption(key: string, value: string) {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, value } : o)));
  }
  function removeOption(key: string) {
    setOptions((prev) => prev.filter((o) => o.key !== key));
  }
  function addOption() {
    setOptions((prev) => [...prev, blankRow()]);
  }
  function selectSuggestion(key: string, name: string) {
    updateOption(key, name);
    setFocusedKey(null);
  }
  // Replaces the option rows outright with one row per AI_SUGGESTED_SPOTS entry, in that array's
  // order — overwrites any already-typed values rather than only filling blanks, per the issue's
  // explicit "replace... rather than appending" framing.
  function autofillWithAI() {
    setOptions(AI_SUGGESTED_SPOTS.map((name) => blankRow(name)));
    setFocusedKey(null);
  }

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
      floatingFooter
      footer={
        <Button
          variant="primary-glass"
          disabled={!canSend}
          onClick={() => {
            dispatch({ type: 'OPEN_POLL' });
            // The send confirmation now surfaces as a toast on the voting screen (issue #104)
            // instead of a dedicated `/poll/sent` screen — `pollSent` is the on-mount trigger flag
            // `PollVotingScreen` reads once and clears.
            navigate('/poll', { state: { pollSent: true } });
          }}
        >
          Send poll to participants
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
            <p className={styles.emptyHint}>No spots yet. Add one to see suggestions.</p>
          ) : (
            <div className={styles.options}>
              {options.map((o, i) => (
                <div key={o.key} className={styles.optionWrap}>
                  <div className={styles.option}>
                    <input
                      className={styles.optionInput}
                      value={o.value}
                      onChange={(e) => updateOption(o.key, e.target.value)}
                      onFocus={() => setFocusedKey(o.key)}
                      onBlur={() => setFocusedKey((prev) => (prev === o.key ? null : prev))}
                      placeholder={`Spot ${i + 1}`}
                      aria-label={`Option ${i + 1}`}
                      autoComplete="off"
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
                  {focusedKey === o.key && (
                    <SpotTypeahead
                      query={o.value}
                      aiSpots={AI_SUGGESTED_SPOTS}
                      venueSpots={LISBON_POLL_SUGGESTIONS}
                      onSelect={(name) => selectSuggestion(o.key, name)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <button type="button" className={styles.addOption} onClick={addOption}>
            <Plus size={16} />
            Add option
          </button>

          {!aiCardDismissed && (
            <div className={styles.aiCard}>
              <div className={styles.aiCardHead}>
                <span className={styles.aiCardTitle}>{AI_CARD_TITLE}</span>
                <button
                  type="button"
                  className={styles.aiCardDismiss}
                  onClick={() => setAiCardDismissed(true)}
                  aria-label="Dismiss AI recommendations card"
                >
                  <X size={14} />
                </button>
              </div>
              <p className={styles.aiCardBody}>{AI_CARD_BODY}</p>
              <Button variant="primary" className={styles.aiCardCta} onClick={autofillWithAI}>
                <Sparkles size={16} />
                {AI_CARD_CTA}
              </Button>
            </div>
          )}
        </section>
      </div>
    </Screen>
  );
}
