/**
 * App — router + the locked 390×844 device frame.
 *
 * The flow is Ari's Lisbon journey end to end. Screens 7 (log expense) and 8 (exclusions/balances) are
 * fused into one "Scan & assign" screen (/split) to match the hi-fi mock, so the ≤10-screen flow lands
 * at nine routes. See src/screens/registry.ts for the canonical list.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './state/TripContext';

import HomeScreen from './screens/HomeScreen';
import TripDetailScreen from './screens/TripDetailScreen';
import AddParticipantScreen from './screens/AddParticipantScreen';
import CreatePollScreen from './screens/CreatePollScreen';
import PollVotingScreen from './screens/PollVotingScreen';
import PollClosedScreen from './screens/PollClosedScreen';
import SplitScreen from './screens/SplitScreen';
import SettleUpScreen from './screens/SettleUpScreen';
import SettlementConfirmationScreen from './screens/SettlementConfirmationScreen';

export default function App() {
  return (
    <div className="device-frame">
      <TripProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/trip" element={<TripDetailScreen />} />
            <Route path="/trip/add" element={<AddParticipantScreen />} />
            <Route path="/poll/new" element={<CreatePollScreen />} />
            <Route path="/poll" element={<PollVotingScreen />} />
            <Route path="/poll/closed" element={<PollClosedScreen />} />
            <Route path="/split" element={<SplitScreen />} />
            <Route path="/settle" element={<SettleUpScreen />} />
            <Route path="/settle/done" element={<SettlementConfirmationScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TripProvider>
    </div>
  );
}
