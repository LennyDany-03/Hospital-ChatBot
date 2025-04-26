"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, UserRound, Stethoscope, ArrowRight } from "lucide-react"
import { useTranslation } from "../context/TranslationContext"

import ChatBot from "../assets/ChatBot.jpg"

const BotDesistion = () => {
  const navigate = useNavigate()
  const { translations, language } = useTranslation()
  const [selectedOption, setSelectedOption] = useState(null)
  const [showContent, setShowContent] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  // Animation sequence
  useEffect(() => {
    // First show the main content
    const contentTimer = setTimeout(() => {
      setShowContent(true)
    }, 400)

    // Then show the options
    const optionsTimer = setTimeout(() => {
      setShowOptions(true)
    }, 1000)

    return () => {
      clearTimeout(contentTimer)
      clearTimeout(optionsTimer)
    }
  }, [])

  // Handle option selection
  const handleSelectOption = (option) => {
    setSelectedOption(option)

    // Navigate to the appropriate page after a short delay
    setTimeout(() => {
      if (option === "doctor") {
        navigate("/consultancybot")
      } else if (option === "patient") {
        navigate("/patientenquirybot")
      }
    }, 500)
  }

  return (
    <div className="language-container">
      <motion.button
        className="back-button"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/langpage")}
      >
        <ArrowLeft size={20} />
        Back
      </motion.button>

      <div className="language-content">
        <AnimatePresence>
          {showContent && (
            <motion.div
              className="character-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="character-wrapper">
                <motion.div
                  className="character"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <img src={ChatBot || "/placeholder.svg"} className="SaraImage" alt="Sage - Health Assistant" />
                </motion.div>

                <motion.div
                  className="speech-bubble language-bubble"
                  initial={{ opacity: 0, scale: 0, x: -50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#6a3de8" }}
                  >
                    {translations.whyAreYouHere}
                  </motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                    {translations.helpYouWith}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              className="decision-options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                gap: "30px",
                marginTop: "40px",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <motion.div
                className={`decision-option ${selectedOption === "doctor" ? "selected" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(106, 61, 232, 0.2)",
                  backgroundColor: "rgba(106, 61, 232, 0.05)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectOption("doctor")}
                style={{
                  background: selectedOption === "doctor" ? "rgba(106, 61, 232, 0.1)" : "white",
                  border: selectedOption === "doctor" ? "2px solid #6a3de8" : "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "16px",
                  padding: "30px",
                  width: "280px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    background: "rgba(106, 61, 232, 0.1)",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <Stethoscope size={40} color="#6a3de8" />
                </div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{translations.lookingForDoctor}</h3>
                <p style={{ textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
                  {translations.doctorDescription}
                </p>
                <motion.div
                  className="select-button"
                  whileHover={{ scale: 1.1 }}
                  style={{
                    marginTop: "20px",
                    background: "#6a3de8",
                    color: "white",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </motion.div>

              <motion.div
                className={`decision-option ${selectedOption === "patient" ? "selected" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(106, 61, 232, 0.2)",
                  backgroundColor: "rgba(106, 61, 232, 0.05)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectOption("patient")}
                style={{
                  background: selectedOption === "patient" ? "rgba(106, 61, 232, 0.1)" : "white",
                  border: selectedOption === "patient" ? "2px solid #6a3de8" : "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "16px",
                  padding: "30px",
                  width: "280px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    background: "rgba(106, 61, 232, 0.1)",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <UserRound size={40} color="#6a3de8" />
                </div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{translations.lookingForPatient}</h3>
                <p style={{ textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
                  {translations.patientDescription}
                </p>
                <motion.div
                  className="select-button"
                  whileHover={{ scale: 1.1 }}
                  style={{
                    marginTop: "20px",
                    background: "#6a3de8",
                    color: "white",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative elements */}
      <div className="decorative-elements">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="decorative-dot"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              opacity: 0.3,
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
            }}
            style={{
              width: 5 + Math.random() * 10,
              height: 5 + Math.random() * 10,
              background: `rgba(106, 61, 232, ${0.1 + Math.random() * 0.3})`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default BotDesistion
