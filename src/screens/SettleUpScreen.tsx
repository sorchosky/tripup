// Screen 9 — Debt consolidation / Settle up. See DESIGN.md §Screens 9.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function SettleUpScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '9')!} />;
}
