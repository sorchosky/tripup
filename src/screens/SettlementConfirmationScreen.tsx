// Screen 10 — Settlement confirmation. See DESIGN.md §Screens 10.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function SettlementConfirmationScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '10')!} />;
}
