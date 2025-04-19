import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLogin from './pages/login/UserLogin';
import AdminLogin from './pages/login/AdminLogin';
import UDashboard from './pages/dashboard/UDashboard';
import ADashboard from './pages/dashboard/ADashboard';
import Profile from './pages/dashboard/Profile';
import Transactions from './pages/dashboard/Transactions';
import Users from './pages/dashboard/Users';
import Navbar from './pages/Navbar';
import Register from './pages/register/Register';
import UserDetail from './pages/dashboard/UserDetail';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import { AuthProvider } from './context/AuthContext';  // User Context
import { AdminAuthProvider } from './context/AdminAuthContext';  // Admin Context
import Home from './pages/Home';
import About from './pages/About';
import Loan from './pages/loan/Loan';
import Services from './pages/Services';
import Contact from './pages/Contact';

const App = () => {
  return (
    <BrowserRouter>
      {/* Wrap the entire app with AuthProvider and AdminAuthProvider to provide context globally */}
      <AuthProvider>
        <AdminAuthProvider>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/ulogin" element={<UserLogin />} />
            <Route path="/alogin" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />

            {/* User Routes (wrapped in Layout) */}
            <Route path="/uhome" element={<Layout><UDashboard /></Layout>} />
            <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/loan" element={<Layout><Loan /></Layout>} />

            {/* Admin Routes (wrapped in AdminLayout) */}
            <Route path="/ahome" element={<AdminLayout><ADashboard /></AdminLayout>} />
            <Route path="/users" element={<AdminLayout><Users /></AdminLayout>} />
            <Route path="/user/:id" element={<AdminLayout><UserDetail /></AdminLayout>} />
          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
