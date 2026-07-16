// Screen 2 — Trip detail / Group view. See DESIGN.md §Screens 2.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function TripDetailScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '2')!} />;
}
