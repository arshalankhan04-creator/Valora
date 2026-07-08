import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingDetail from './pages/ListingDetail';

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
      {user ? (
        <>
          <span style={{ marginRight: '15px' }}>Welcome, {user.name} ({user.role})</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: '15px' }}>Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
