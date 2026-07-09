import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Inquiries from './pages/Inquiries';
import InquiryThread from './pages/InquiryThread';
import MyListings from './pages/MyListings';
import AdminPanel from './pages/AdminPanel';

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
      {user && user.role === 'seller' && (
        <>
          <Link to="/create-listing" style={{ marginRight: '15px' }}>Create Listing</Link>
          <Link to="/my-listings" style={{ marginRight: '15px' }}>My Listings</Link>
        </>
      )}
      {user && (
        <Link to="/inquiries" style={{ marginRight: '15px' }}>Inquiries</Link>
      )}
      {user && user.role === 'admin' && (
        <Link to="/admin" style={{ marginRight: '15px' }}>Admin</Link>
      )}
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
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/edit-listing/:id" element={<EditListing />} />
            <Route path="/inquiries" element={<Inquiries />} />
            <Route path="/inquiries/:id" element={<InquiryThread />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
