import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Landing from "./pages/LandingPage"
import LangPage from "./pages/LangPage"
import ConsultancyBot from "./pages/ConsultancyBot"
import PatientEnquiry from "./pages/PatientEnquiryBot"
import BotDesistion from "./pages/BotDesistion"
import { TranslationProvider } from "./context/TranslationContext"

const App = () => {
  return (
    <TranslationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/langpage" element={<LangPage />} />
          <Route path="/botdesistion" element={<BotDesistion />} />
          <Route path="/consultancybot" element={<ConsultancyBot />} />
          <Route path="/patientenquirybot" element={<PatientEnquiry />} />
        </Routes>
      </Router>
    </TranslationProvider>
  )
}

export default App
