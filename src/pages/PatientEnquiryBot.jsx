"use client"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ChatBot from "../components/PatientEnquiryBot"
import "../index.css"
import { Hospital, ArrowLeft } from "lucide-react"
import { useTranslation } from "../context/TranslationContext"
import { useNavigate } from "react-router-dom"

function ConsultancyBot() {
  const { translations } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-left">
          <button
            className="back-button-small"
            onClick={() => navigate("/langpage")}
            aria-label="Back to language selection"
          >
            <ArrowLeft size={20} />
          </button>
          <Hospital size={28} className="hospital-icon" />
          <h1>{translations.sageHealthBridge}</h1>
        </div>
      </div>
      <div className="app-content">
        <ChatBot />
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}

export default ConsultancyBot
