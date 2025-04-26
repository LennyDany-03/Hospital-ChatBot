"use client"

import { createContext, useState, useContext, useEffect } from "react"

// Create the translation context
export const TranslationContext = createContext()

// Dictionary of all translatable text in the application
const translationDictionary = {
  // ChatBot component
  chatPlaceholder: "Ask Sara about health issues or appointments...",
  chatHeader: "Sage Assistant",
  downloadAppointment: "Download Appointment",
  appointmentConfirmed: "Appointment Confirmed!",
  patientLabel: "Patient:",
  doctorLabel: "Doctor:",
  dateLabel: "Date:",
  timeLabel: "Time:",
  appointmentIdLabel: "Appointment ID:",
  arriveEarly: "Please arrive 15 minutes before your scheduled time.",

  // ConsultancyBot component
  sageHealthBridge: "Sara HealthBridge",

  // Empty chat message
  emptyChat: "Say hello to Sara, your HealthBridge Hospital assistant!",

  // Appointment modal
  appointmentDetails: "HealthBridge Hospital",

  // Common buttons
  sendButton: "Send",
  closeButton: "Close",

  // BotDesistion page
  whyAreYouHere: "Why are you here today?",
  lookingForDoctor: "I'm looking for a doctor",
  lookingForPatient: "I'm looking for a patient",
  helpYouWith: "How can I help you today?",
  doctorDescription: "Get medical advice or book an appointment",
  patientDescription: "Find information about a patient",
}

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en")
  const [translations, setTranslations] = useState(translationDictionary)
  const [isLoading, setIsLoading] = useState(false)

  // Function to translate a single text
  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=AIzaSyBU_VSOvAgHm6QgDPysqp2CxwGC8woPJ3o`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: text,
            target: targetLang,
            source: "en",
            format: "text",
          }),
        },
      )
      const data = await response.json()
      return data.data.translations[0].translatedText
    } catch (error) {
      console.error("Translation error:", error)
      return text // Return original text if translation fails
    }
  }

  // Function to translate all text in the dictionary
  const translateAllContent = async (targetLang) => {
    if (targetLang === "en") {
      setTranslations(translationDictionary)
      return
    }

    setIsLoading(true)

    try {
      const translatedEntries = await Promise.all(
        Object.entries(translationDictionary).map(async ([key, value]) => {
          const translatedValue = await translateText(value, targetLang)
          return [key, translatedValue]
        }),
      )

      const translatedDictionary = Object.fromEntries(translatedEntries)
      setTranslations(translatedDictionary)
    } catch (error) {
      console.error("Error translating content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Translate content when language changes
  useEffect(() => {
    translateAllContent(language)
  }, [language])

  // Function to change the language
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
  }

  return (
    <TranslationContext.Provider value={{ language, translations, changeLanguage, isLoading }}>
      {children}
    </TranslationContext.Provider>
  )
}

// Custom hook to use the translation context
export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
