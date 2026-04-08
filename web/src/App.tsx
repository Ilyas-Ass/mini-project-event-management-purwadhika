import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import TransactionsPage from './pages/TransactionsPage';
import EoDashboard from './pages/EoDashboard';
import EoTransactions from './pages/EoTransactions';
import EoPromotions from './pages/EoPromotions';
import TicketInvoicePage from './pages/TicketInvoicePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout/:eventId" element={<CheckoutPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/eo/dashboard" element={<EoDashboard />} />
            <Route path="/eo/transactions" element={<EoTransactions />} />
            <Route path="/eo/promotions" element={<EoPromotions />} />
            <Route path="/ticket/:id" element={<TicketInvoicePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
