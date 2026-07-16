// Screen 4 — Create poll. See DESIGN.md §Screens 4.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function CreatePollScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '4')!} />;
}
