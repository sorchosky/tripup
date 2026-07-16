// Screen 3 — Add participant (sheet/modal state). See DESIGN.md §Screens 3.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function AddParticipantScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '3')!} />;
}
