import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import Browse from './pages/Browse';
import ComingSoon from './pages/ComingSoon';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const PageWrapper = ({ children }) => (
  <div className="container-valora py-8 text-center flex-1">
    {children}
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<PageWrapper><Browse /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/listings/:id" element={<PageWrapper><ListingDetail /></PageWrapper>} />
            <Route path="/create-listing" element={<PageWrapper><CreateListing /></PageWrapper>} />
            <Route path="/edit-listing/:id" element={<PageWrapper><EditListing /></PageWrapper>} />
            <Route path="/inquiries" element={<PageWrapper><Inquiries /></PageWrapper>} />
            <Route path="/inquiries/:id" element={<PageWrapper><InquiryThread /></PageWrapper>} />
            <Route path="/my-listings" element={<PageWrapper><MyListings /></PageWrapper>} />
            <Route path="/admin" element={<PageWrapper><AdminPanel /></PageWrapper>} />
            
            {/* Stub/Placeholder Routes */}
            <Route path="/about" element={<PageWrapper><ComingSoon /></PageWrapper>} />
            <Route path="/finance" element={<PageWrapper><ComingSoon /></PageWrapper>} />
            <Route path="/faq" element={<PageWrapper><ComingSoon /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><ComingSoon /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><ComingSoon /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><ComingSoon /></PageWrapper>} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
