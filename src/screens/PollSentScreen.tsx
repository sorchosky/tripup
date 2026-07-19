/**
 * Poll sent confirmation — shown immediately after "Send poll to participants" on Create poll (#53),
 * before jumping into the live-voting screen. Sending used to drop straight into the auto-filling
 * vote counts, which read as abrupt; this screen gives the send its own beat (game-show energy, per
 * `BRAND.md`) before Ari either checks Activity or watches the votes land live.
 *
 * Added per issue #55. Open question tracked there and in the PR: this is a plain screen swap, no
 * auto-advance timer — the confirmation waits for Ari to tap a CTA rather than dismissing itself.
 * Exact transition/auto-advance timing is flagged as unresolved rather than guessed at here.
 */

import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { Button } from '../components/ui';
import { Vote } from '../components/icons';
import { useTrip } from '../state/TripContext';
import styles from './PollSentScreen.module.css';

const SMALL_NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

/** "Three spots" — the game-show-energy count from `BRAND.md`'s poll-notification example, computed
 * from the real option count rather than hardcoded, so it can't drift from what actually sent. */
function spotsCount(n: number): string {
  return SMALL_NUMBER_WORDS[n] ?? String(n);
}

export default function PollSentScreen() {
  const navigate = useNavigate();
  const { state } = useTrip();
  const optionCount = state.poll.options.length;

  return (
    <Screen
      bleed
      footer={
        <div className={styles.footerStack}>
          <Button onClick={() => navigate('/activity')}>See results in activity feed</Button>
          <button type="button" className={styles.secondaryLink} onClick={() => navigate('/poll')}>
            Watch votes come in
          </button>
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.badge}>
          <Vote size={40} strokeWidth={2.2} />
        </div>
        <h1 className={styles.title}>Poll&apos;s out.</h1>
        <p className={styles.sub}>
          {spotsCount(optionCount)} spots, one winner. Vote before Ren shows up hangry.
        </p>
      </div>
    </Screen>
  );
}
