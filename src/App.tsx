/**
 * App — router + the locked 390x844 device frame.
 *
 * Routes are derived from the screen registry so the flow lives in one place. Each route currently
 * renders a placeholder stub; swap in the real screen UI as it's built.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TripProvider } from './state/TripContext';

import HomeScreen from './screens/HomeScreen';
import TripDetailScreen from './screens/TripDetailScreen';
import AddParticipantScreen from './screens/AddParticipantScreen';
import CreatePollScreen from './screens/CreatePollScreen';
import PollVotingScreen from './screens/PollVotingScreen';
import PollClosedScreen from './screens/PollClosedScreen';
import LogExpenseScreen from './screens/LogExpenseScreen';
import BalancesScreen from './screens/BalancesScreen';
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
            <Route path="/expense/new" element={<LogExpenseScreen />} />
            <Route path="/balances" element={<BalancesScreen />} />
            <Route path="/settle" element={<SettleUpScreen />} />
            <Route path="/settle/done" element={<SettlementConfirmationScreen />} />
          </Routes>
        </BrowserRouter>
      </TripProvider>
    </div>
  );
}
