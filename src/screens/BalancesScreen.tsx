// Screen 8 — Expense exclusions / Balances. See DESIGN.md §Screens 8.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function BalancesScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '8')!} />;
}
