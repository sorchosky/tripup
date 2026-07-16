// Screen 1 — Home / Trip list. See DESIGN.md §Screens 1.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function HomeScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '1')!} />;
}
