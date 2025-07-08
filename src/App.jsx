import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Suitability from './pages/Suitability';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Recommendation from './pages/Recommendation';
import History from './pages/History';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import Cards from './pages/Cards';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

// Public Route Component (redirect to home if authenticated)
function PublicRoute({ children }) {
  return !isAuthenticated() ? children : <Navigate to="/home" />;
}

function App() {
  // Initialize GTM dataLayer
  if (typeof window !== 'undefined' && !window.dataLayer) {
    window.dataLayer = [];
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/suitability" element={
            <ProtectedRoute>
              <Suitability />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/recommendation/:id" element={
            <ProtectedRoute>
              <Recommendation />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/plans" element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/payment-success" element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          } />
          <Route path="/cards" element={
            <ProtectedRoute>
              <Cards />
            </ProtectedRoute>
          } />

          {/* Default Routes */}
          <Route path="/" element={
            isAuthenticated() ? <Navigate to="/home" /> : <Navigate to="/login" />
          } />
          <Route path="*" element={
            <Navigate to={isAuthenticated() ? "/home" : "/login"} />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

