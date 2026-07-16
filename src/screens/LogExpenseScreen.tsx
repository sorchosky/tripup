// Screen 7 — Log expense (+ receipt-scan mocked state). See DESIGN.md §Screens 7.
import { ScreenScaffold } from './_ScreenScaffold';
import { SCREENS } from './registry';

export default function LogExpenseScreen() {
  return <ScreenScaffold screen={SCREENS.find((s) => s.id === '7')!} />;
}
