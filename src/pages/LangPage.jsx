"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Check } from "lucide-react"
import { useTranslation } from "../context/TranslationContext"

import ChatBot from "../assets/ChatBot.jpg"

const LangPage = () => {
  const navigate = useNavigate()
  const { changeLanguage } = useTranslation()
  const [selectedLang, setSelectedLang] = useState(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [currentText, setCurrentText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const welcomeText = "Please select your preferred language to continue:"

  // Start typing animation after component mounts
  useEffect(() => {
    setTimeout(() => {
      setShowWelcome(true)
    }, 500)
  }, [])

  // Handle typing animation
  useEffect(() => {
    if (!showWelcome) return

    if (currentText.length < welcomeText.length) {
      setIsTyping(true)
      const timeout = setTimeout(() => {
        setCurrentText(welcomeText.substring(0, currentText.length + 1))
      }, 50)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
      setTimeout(() => {
        setShowOptions(true)
      }, 500)
    }
  }, [currentText, showWelcome])

  // Mouth animation based on typing
  const mouthVariants = {
    closed: { height: "10px", y: 0 },
    open: { height: "20px", y: -5 },
  }

  // Handle language selection
  const handleSelectLang = (lang) => {
    setSelectedLang(lang)

    // Set the language in the translation context
    if (lang === "english") {
      changeLanguage("en")
    } else if (lang === "tamil") {
      changeLanguage("ta")
    }

    // Simulate saving language preference
    setTimeout(() => {
      navigate("/consultancybot")
    }, 1000)
  }

  return (
    <div className="language-container">

      <div className="language-content">
        <motion.div
          className="character-container"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="character-wrapper">
            <div className="character">
              <img src={ChatBot || "/placeholder.svg"} alt="Priya - Health Assistant" />

              {/* Animated mouth */}
              <motion.div
                className="character-mouth"
                variants={mouthVariants}
                animate={isTyping ? "open" : "closed"}
                transition={{ duration: 0.1 }}
              ></motion.div>
            </div>

            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  className="speech-bubble language-bubble"
                  initial={{ opacity: 0, scale: 0, x: -50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p>
                    {currentText}
                    <span className={isTyping ? "cursor-blink" : "cursor-hidden"}>|</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              className="language-options"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className={`language-option ${selectedLang === "english" ? "selected" : ""}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectLang("english")}
              >
                <div className="language-flag english-flag">
                  <span>EN</span>
                </div>
                <div className="language-details">
                  <h3>English</h3>
                  <p>Continue in English</p>
                </div>
                {selectedLang === "english" && (
                  <motion.div
                    className="language-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <Check size={24} />
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className={`language-option ${selectedLang === "tamil" ? "selected" : ""}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectLang("tamil")}
              >
                <div className="language-flag tamil-flag">
                  <span>தமிழ்</span>
                </div>
                <div className="language-details">
                  <h3>தமிழ்</h3>
                  <p>தமிழில் தொடரவும்</p>
                </div>
                {selectedLang === "tamil" && (
                  <motion.div
                    className="language-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <Check size={24} />
                  </motion.div>
                )}
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

export default LangPage
