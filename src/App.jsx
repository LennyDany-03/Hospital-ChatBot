import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ChatBot from "./components/ChatBot"
import "./index.css"
import { Hospital } from "lucide-react"

function App() {
  return (
    <div className="app-container">
      <div className="app-header">
        <Hospital size={28} className="hospital-icon" />
        <h1>Sage HealthBridge</h1>
      </div>
      <div className="app-content">
        <ChatBot />
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}

export default App
