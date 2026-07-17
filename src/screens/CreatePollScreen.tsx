/**
 * Screen 4 — Create poll. Ari proposes where to eat with three named spots. The question is editable
 * and each spot can be toggled in or out; "Start poll" opens it to the group (screen 5). The three
 * options are the canonical set from CONTENT.md, so the vote that follows stays consistent.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavHeader } from '../components/Screen';
import { Eyebrow, Button } from '../components/ui';
import { ArrowLeft, Check, Sparkles, MapPin } from '../components/icons';
import { DINNER_POLL } from '../data/mock';
import { useTrip } from '../state/TripContext';
import styles from './CreatePollScreen.module.css';

const OPTION_META: Record<string, string> = {
  'cervejaria-ramiro': 'Seafood · 4 min walk · €€',
  'time-out-market': 'Food hall · 12 min · €€',
  'a-cevicheria': 'Peruvian · 9 min · €€€',
};

export default function CreatePollScreen() {
  const navigate = useNavigate();
  const { state } = useTrip();
  const [question, setQuestion] = useState(state.poll.question);
  const [selected, setSelected] = useState<Set<string>>(new Set(DINNER_POLL.options.map((o) => o.id)));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const canStart = selected.size >= 2 && question.trim().length > 0;

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
            setSelected(new Set());
          }}
        />
      }
      footer={
        <Button disabled={!canStart} onClick={() => navigate('/poll')}>
          Start poll
        </Button>
      }
    >
      <div className={styles.body}>
        <h1 className={styles.title}>New poll</h1>
        <input
          className={styles.questionField}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the group something"
          aria-label="Poll question"
        />

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <Eyebrow>The spots</Eyebrow>
          </div>
          <div className={styles.options}>
            {DINNER_POLL.options.map((o) => {
              const on = selected.has(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`${styles.option} ${on ? styles.optionOn : ''}`}
                  onClick={() => toggle(o.id)}
                  aria-pressed={on}
                >
                  <div className={styles.optionBody}>
                    <div className={styles.optionName}>{o.name}</div>
                    <div className={styles.optionMeta}>{OPTION_META[o.id]}</div>
                  </div>
                  <span className={`${styles.check} ${on ? styles.checkOn : styles.checkOff}`}>
                    <Check size={14} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.assist}>
            <button type="button" className={styles.assistChip}>
              <Sparkles size={16} />
              AI Suggest
            </button>
            <button type="button" className={styles.assistChip}>
              <MapPin size={16} />
              Pick from map
            </button>
          </div>
        </section>
      </div>
    </Screen>
  );
}
