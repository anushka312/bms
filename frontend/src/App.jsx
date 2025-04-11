import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLogin from './pages/login/UserLogin';
import AdminLogin from './pages/login/AdminLogin';
import UDashboard from './pages/dashboard/UDashboard';
import ADashboard from './pages/dashboard/ADashboard';
import Navbar from './pages/Navbar';
import Register from './pages/register/Register';

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/ulogin" element={<UserLogin />} />
        <Route path="/alogin" element={<AdminLogin />} />
        <Route path="/uhome" element={<UDashboard/>} />
        <Route path="/ahome" element={<ADashboard />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;