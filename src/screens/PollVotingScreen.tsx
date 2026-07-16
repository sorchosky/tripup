// Screen 5 — Poll voting (live vote counts). See DESIGN.md §Screens 5.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function PollVotingScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '5')!} />;
}
