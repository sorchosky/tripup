/**
 * App — router + the locked 390×844 device frame.
 *
 * The flow is Ari's Lisbon journey end to end. Screens 7 (log expense) and 8 (exclusions/balances) are
 * fused into one "Scan & assign" screen (/split) to match the hi-fi mock, so the ≤10-screen flow lands
 * at nine routes. Activity (/activity) is a tenth, cross-cutting route added per issue #57 — a deliberate
 * exception to the ≤10 budget (see DESIGN.md → Screens, and docs/decisions.md). See
 * src/screens/registry.ts for the canonical list.
 *
 * `/trip/add` (Add/edit participants) is presented as a sheet overlay ON the trip hub rather than a
 * full route swap (issue #51): the underlying `Routes` always renders the trip hub for that path, and
 * `AddParticipantScreen` is layered on top as its own overlay, so the hub stays mounted and visible
 * (no duplicate status bar, no new-screen flash) while the sheet slides up/down over it.
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TripProvider } from './state/TripContext';

import HomeScreen from './screens/HomeScreen';
import TripDetailScreen from './screens/TripDetailScreen';
import AddParticipantScreen from './screens/AddParticipantScreen';
import CreatePollScreen from './screens/CreatePollScreen';
import PollSentScreen from './screens/PollSentScreen';
import PollVotingScreen from './screens/PollVotingScreen';
import PollClosedScreen from './screens/PollClosedScreen';
import SplitScreen from './screens/SplitScreen';
import SettleUpScreen from './screens/SettleUpScreen';
import SettlementConfirmationScreen from './screens/SettlementConfirmationScreen';
import ActivityScreen from './screens/ActivityScreen';

function AppRoutes() {
  const location = useLocation();
  const isAddParticipantOverlay = location.pathname === '/trip/add';
  // While the sheet overlay is open, the routed hub underneath renders as if it were still at /trip —
  // that's what keeps it mounted and visible behind the sheet instead of swapping out.
  const routesLocation = isAddParticipantOverlay ? { ...location, pathname: '/trip' } : location;

  return (
    <>
      <Routes location={routesLocation}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/trip" element={<TripDetailScreen />} />
        <Route path="/poll/new" element={<CreatePollScreen />} />
        <Route path="/poll/sent" element={<PollSentScreen />} />
        <Route path="/poll" element={<PollVotingScreen />} />
        <Route path="/poll/closed" element={<PollClosedScreen />} />
        <Route path="/split" element={<SplitScreen />} />
        <Route path="/settle" element={<SettleUpScreen />} />
        <Route path="/settle/done" element={<SettlementConfirmationScreen />} />
        <Route path="/activity" element={<ActivityScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isAddParticipantOverlay ? <AddParticipantScreen /> : null}
    </>
  );
}

export default function App() {
  return (
    <div className="device-frame">
      <TripProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TripProvider>
    </div>
  );
}
