import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/LandingPage'
import LangPage from './pages/LangPage'
import ConsultancyBot from './pages/ConsultancyBot'
import PatientEnquiry from './pages/PatientEnquiryBot'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/langpage" element={<LangPage />} />
        <Route path="/consultancybot" element={<ConsultancyBot />} />
        <Route path="/patientenquirybot" element={<PatientEnquiry />} />
      </Routes>
    </Router>
  )
}

export default App
