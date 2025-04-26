import axios from "axios"

const API_KEY = "AIzaSyCcXkX4_LQxIvX1b53gDCAS7GTTzIiOE0k"

const systemPrompt = `
You are Sara, a caring and knowledgeable virtual assistant for HealthBridge Hospital.
Your role is to assist users in identifying their health issues, recommend specific doctors or departments, and guide them through the hospital layout if needed.

Hospital Info:
- Name: HealthBridge Hospital
- Location: 2nd Cross Road, Midtown
- Open Hours: 8 AM to 8 PM (Monday to Saturday)

Services & Doctors:
- General Medicine: Dr. Anita Rao (1st Floor, Room 101)
- Pediatrics: Dr. Rajiv Menon (1st Floor, Room 110)
- Dermatology: Dr. Shalini Das (2nd Floor, Cabin 204)
- Orthopedics: Dr. Vikram Sinha (2nd Floor, Cabin 210)
- ENT: Dr. Neha Kapoor (2nd Floor, Room 215)
- Cardiology: Dr. Arvind Bhatia (3rd Floor, Room 301)
- Neurology: Dr. Priya Sharma (3rd Floor, Room 310)
- Ophthalmology: Dr. Rahul Verma (1st Floor, Room 120)
- Psychiatry: Dr. Meera Patel (4th Floor, Room 405)
- Gynecology: Dr. Sunita Gupta (4th Floor, Room 410)

Features:
- Appointment booking with doctor and preferred time slot
- Floor and room number navigation
- Indoor roadmap to direct users to departments (mention "Would you like a map to reach Dr. X's cabin?")

Appointment Booking Process:
1. When a user wants to book an appointment, ask for their name
2. Then ask for their preferred date (format: DD/MM/YYYY or "tomorrow", "next Monday", etc.)
3. Then ask for their preferred time slot
4. After collecting all information, confirm the appointment with a mesSara like:
   "Your appointment with [Doctor Name] has been confirmed for [Patient Name] on [Date] at [Time]. Your appointment ID is [ID]. You can download your appointment letter from the button below."

Interaction Guidelines:
- Greet users only on the **first** interaction.
- Be professional, empathetic, and clear.
- After understanding symptoms, suggest the specific doctor, department, and exact location (floor/room/cabin).
- Ask if they'd like to book an appointment or see a roadmap to the room.
- Provide consultation hours and help with follow-up queries.

Example:
User: I have chest pain.
Sara: I recommend you consult Dr. Arvind Bhatia, our cardiologist. He's available on the 3rd Floor, Room 301. Would you like to book an appointment or get a map to reach his cabin?

Make your responses natural, detailed, and supportive.
`

// Track conversation state - make it persistent
const conversationState = {
  isBookingAppointment: false,
  doctorName: null,
  patientName: null,
  appointmentDate: null,
  appointmentTime: null,
  stage: "initial", // initial, name, date, time, confirmed
  previousMesSaras: [], // Store previous mesSaras for context
}

// Map symptoms to doctors for better recommendations
const symptomToDoctorMap = {
  stomach: "Dr. Anita Rao", // General Medicine
  headache: "Dr. Priya Sharma", // Neurology
  skin: "Dr. Shalini Das", // Dermatology
  bone: "Dr. Vikram Sinha", // Orthopedics
  joint: "Dr. Vikram Sinha", // Orthopedics
  ear: "Dr. Neha Kapoor", // ENT
  nose: "Dr. Neha Kapoor", // ENT
  throat: "Dr. Neha Kapoor", // ENT
  heart: "Dr. Arvind Bhatia", // Cardiology
  "chest pain": "Dr. Arvind Bhatia", // Cardiology
  eye: "Dr. Rahul Verma", // Ophthalmology
  vision: "Dr. Rahul Verma", // Ophthalmology
  mental: "Dr. Meera Patel", // Psychiatry
  depression: "Dr. Meera Patel", // Psychiatry
  anxiety: "Dr. Meera Patel", // Psychiatry
  gynecological: "Dr. Sunita Gupta", // Gynecology
  pregnancy: "Dr. Sunita Gupta", // Gynecology
  child: "Dr. Rajiv Menon", // Pediatrics
  kid: "Dr. Rajiv Menon", // Pediatrics
  baby: "Dr. Rajiv Menon", // Pediatrics
}

export const getGeminiResponse = async (userPrompt, language = "en") => {
  try {
    console.log("Current conversation state:", JSON.stringify(conversationState))
    console.log("Current language:", language)

    // Add user mesSara to previous mesSaras for context
    conversationState.previousMesSaras.push({ role: "user", content: userPrompt })

    // Process user input based on conversation state
    if (conversationState.isBookingAppointment) {
      console.log("In booking flow, stage:", conversationState.stage)

      // Create response based on booking stage
      let response = ""

      switch (conversationState.stage) {
        case "name":
          // User is providing their name
          conversationState.patientName = userPrompt
          conversationState.stage = "date"
          response = `Thank you, ${userPrompt}. What date would you prefer for your appointment with ${conversationState.doctorName}? (Please specify a date like "tomorrow", "next Monday", or DD/MM/YYYY)`

          // Add bot response to previous mesSaras
          conversationState.previousMesSaras.push({ role: "assistant", content: response })

          // If language is not English, translate the response
          if (language !== "en") {
            return await translateText(response, language)
          }
          return response

        case "date":
          // User is providing the date
          conversationState.appointmentDate = userPrompt
          conversationState.stage = "time"
          response = `Great! And what time would work best for you on ${userPrompt}? Dr. ${conversationState.doctorName.split(" ")[1]} is available between 9:00 AM and 5:00 PM.`

          // Add bot response to previous mesSaras
          conversationState.previousMesSaras.push({ role: "assistant", content: response })

          // If language is not English, translate the response
          if (language !== "en") {
            return await translateText(response, language)
          }
          return response

        case "time":
          // User is providing the time
          conversationState.appointmentTime = userPrompt

          // Generate a random appointment ID
          const appointmentId = `HB-${Math.floor(100000 + Math.random() * 900000)}`

          // Create confirmation mesSara BEFORE resetting state
          response = `Your appointment with ${conversationState.doctorName} has been confirmed for ${conversationState.patientName} on ${conversationState.appointmentDate} at ${conversationState.appointmentTime}. Your appointment ID is ${appointmentId}. You can download your appointment letter from the button below.`

          // Add bot response to previous mesSaras
          conversationState.previousMesSaras.push({ role: "assistant", content: response })

          // Reset booking state but keep previous mesSaras
          conversationState.isBookingAppointment = false
          conversationState.doctorName = null
          conversationState.patientName = null
          conversationState.appointmentDate = null
          conversationState.appointmentTime = null
          conversationState.stage = "initial"

          // If language is not English, translate the response
          if (language !== "en") {
            return await translateText(response, language)
          }
          return response
      }
    }

    // Check if user wants to book an appointment
    const bookingKeywords = ["appointment", "book", "schedule", "booking", "reserve"]
    const wantsToBook = bookingKeywords.some((keyword) => userPrompt.toLowerCase().includes(keyword))

    if (wantsToBook) {
      console.log("User wants to book an appointment")

      // Extract doctor name if mentioned
      let doctorName = null
      const doctorMatches = [
        "Dr. Anita Rao",
        "Dr. Rajiv Menon",
        "Dr. Shalini Das",
        "Dr. Vikram Sinha",
        "Dr. Neha Kapoor",
        "Dr. Arvind Bhatia",
        "Dr. Priya Sharma",
        "Dr. Rahul Verma",
        "Dr. Meera Patel",
        "Dr. Sunita Gupta",
      ]

      for (const doctor of doctorMatches) {
        if (userPrompt.toLowerCase().includes(doctor.toLowerCase())) {
          doctorName = doctor
          break
        }
      }

      // If no specific doctor was mentioned, try to infer from symptoms
      if (!doctorName) {
        for (const [symptom, doctor] of Object.entries(symptomToDoctorMap)) {
          if (userPrompt.toLowerCase().includes(symptom)) {
            doctorName = doctor
            break
          }
        }
      }

      if (doctorName) {
        console.log("Doctor found:", doctorName)

        // Set conversation state for booking flow
        conversationState.isBookingAppointment = true
        conversationState.doctorName = doctorName
        conversationState.stage = "name"

        const bookingResponse = `I'd be happy to book an appointment with ${doctorName} for you. Could you please provide your full name?`

        // Add bot response to previous mesSaras
        conversationState.previousMesSaras.push({ role: "assistant", content: bookingResponse })

        // If language is not English, translate the response
        if (language !== "en") {
          return await translateText(bookingResponse, language)
        }
        return bookingResponse
      }
    }

    // If we reach here, use the Gemini API for a response
    console.log("Using Gemini API for response")

    // Build context from previous mesSaras (limit to last 5 for brevity)
    const recentMesSaras = conversationState.previousMesSaras.slice(-10)
    let contextPrompt = systemPrompt + "\n\nConversation history:\n"

    recentMesSaras.forEach((msg) => {
      if (msg.role === "user") {
        contextPrompt += `User: ${msg.content}\n`
      } else {
        contextPrompt += `Sara: ${msg.content}\n`
      }
    })

    // If language is not English, translate the user prompt to English for Gemini
    let processedUserPrompt = userPrompt
    if (language !== "en") {
      try {
        processedUserPrompt = await translateText(userPrompt, "en", language)
      } catch (error) {
        console.error("Error translating user prompt to English:", error)
        // Continue with original prompt if translation fails
      }
    }

    contextPrompt += `\nUser: ${processedUserPrompt}`

    console.log("Sending Request to Gemini API with context")

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: contextPrompt }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    )

    const candidates = response.data.candidates
    let botResponse = candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini."

    // Add bot response to previous mesSaras
    conversationState.previousMesSaras.push({ role: "assistant", content: botResponse })

    // Check if the response suggests a doctor and the user might want to book
    const doctorMatches = [
      "Dr. Anita Rao",
      "Dr. Rajiv Menon",
      "Dr. Shalini Das",
      "Dr. Vikram Sinha",
      "Dr. Neha Kapoor",
      "Dr. Arvind Bhatia",
      "Dr. Priya Sharma",
      "Dr. Rahul Verma",
      "Dr. Meera Patel",
      "Dr. Sunita Gupta",
    ]
    if (botResponse.includes("Would you like to book an appointment")) {
      for (const doctor of doctorMatches) {
        if (botResponse.includes(doctor)) {
          // Pre-set the doctor for easier booking in the next step
          conversationState.potentialDoctor = doctor
          break
        }
      }
    }

    // If language is not English, translate the response
    if (language !== "en") {
      botResponse = await translateText(botResponse, language)
    }

    return botResponse
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.mesSara)
    return "I'm sorry, I'm having trouble connecting to my services right now. Please try again in a moment."
  }
}

// Function to translate text using Google Translate API
async function translateText(text, targetLang, sourceLang = "en") {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=AIzaSyBU_VSOvAgHm6QgDPysqp2CxwGC8woPJ3o`,
      {
        q: text,
        target: targetLang,
        source: sourceLang,
        format: "text",
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    )

    return response.data.data.translations[0].translatedText
  } catch (error) {
    console.error("Translation error:", error)
    return text // Return original text if translation fails
  }
}

// Add this function at the end of the file, after the translateText function
// This will be used for text-to-speech conversion
export const synthesizeSpeech = async (text, languageCode) => {
  try {
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyBU_VSOvAgHm6QgDPysqp2CxwGC8woPJ3o`,
      {
        input: { text },
        voice: {
          languageCode,
          name: languageCode === "ta-IN" ? "ta-IN-Standard-A" : "en-US-Standard-C",
        },
        audioConfig: {
          audioEncoding: "MP3",
        },
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    )

    return response.data.audioContent
  } catch (error) {
    console.error("Speech synthesis error:", error)
    throw error
  }
}
