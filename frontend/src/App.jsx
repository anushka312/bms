import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLogin from './pages/login/UserLogin';
import AdminLogin from './pages/login/AdminLogin';
import UDashboard from './pages/dashboard/UDashboard';
import ADashboard from './pages/dashboard/ADashboard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/ulogin" element={<UserLogin />} />
        <Route path="/alogin" element={<AdminLogin />} />
        <Route path="/uhome" element={<UDashboard/>} />
        <Route path="/ahome" element={<ADashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;