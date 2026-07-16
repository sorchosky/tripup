// Screen 6 — Poll closed → itinerary updated. See DESIGN.md §Screens 6.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function PollClosedScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '6')!} />;
}
