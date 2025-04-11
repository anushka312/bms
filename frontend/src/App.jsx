import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLogin from './pages/login/UserLogin';
import AdminLogin from './pages/login/AdminLogin';
import UDashboard from './pages/dashboard/UDashboard';
import ADashboard from './pages/dashboard/ADashboard';
import Settings from './pages/dashboard/Settings';
import Profile from './pages/dashboard/Profile';
import Transactions from './pages/dashboard/Transactions';
import Navbar from './pages/Navbar';
import Register from './pages/register/Register';
import Layout from './components/Layout';

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/ulogin" element={<UserLogin />} />
        <Route path="/alogin" element={<AdminLogin />} />
        <Route path="/uhome" element={<Layout><UDashboard /></Layout>} />
        <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;