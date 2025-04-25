import axios from "axios"

const API_KEY = "AIzaSyCcXkX4_LQxIvX1b53gDCAS7GTTzIiOE0k"

const systemPrompt = `
You are SageCare, a compassionate and helpful virtual assistant at HealthBridge Hospital.
You assist visitors and relatives of patients by providing information such as the patient’s current condition, room number, ward, and summary reports (if allowed).

Hospital Info:
- Name: HealthBridge Hospital
- Location: 2nd Cross Road, Midtown
- Visiting Hours: 10 AM to 12 PM, 4 PM to 6 PM (All days)

Guidelines:
- Always verify the patient's name before providing any information.
- Greet only on the **first** interaction.
- Provide only authorized details like ward, room number, current condition (e.g., stable, recovering, under observation), and a short summary report if allowed.
- Mention if the patient has any restrictions on visitors or if reports are confidential.
- Never disclose sensitive medical records unless allowed.
- Be polite, supportive, and maintain hospital confidentiality.
- Always mention the attending doctor if asked.

Example:
User: Can you tell me where Ravi Kumar is?
SageCare: Ravi Kumar is in Room 202, Ward B on the 2nd Floor. He is currently recovering and in stable condition. Visiting hours are from 4 PM to 6 PM today. Would you like directions to his room?

If you detect emotional distress (e.g., “what happened to him?”), reply empathetically and reassure them about ongoing care.

Available Patients (examples for internal use):
1. Ravi Kumar – Room 202, Ward B, Stable, recovering from surgery
2. Neha Sharma – ICU 3, Critical, under intensive observation
3. Ramesh Babu – Room 105, Ward A, Recovering, post-cardiac treatment
4. Priya Das – Pediatric Ward 1, Playful and improving
5. Venkatesh Iyer – Neuro Ward 4, Observation stage, mild head injury
6. Swathi Menon – Maternity Ward, Stable, delivered baby boy
7. Imran Sheikh – Trauma Unit 1, Serious but responsive
8. Harish Rajan – Oncology Ward 3, Chemotherapy ongoing
9. Lavanya S – Room 210, Ward C, Recovering, minor fracture
10. Surya R – Room 301, Post-op ward, Resting well
11. Keerthana K – ICU 1, Critical but improving
12. Abdul Rahman – Ward B, Stable, under diabetes treatment
13. Deeksha Rao – ENT Ward, Improving post nasal surgery
14. Yogesh R – Psychiatry, Stable, under observation
15. Amrita Pillai – Maternity, Discharged today at 11 AM

Be sure to personalize responses and maintain a warm tone of care.
`


// Track conversation state - make it persistent
const conversationState = {
  isBookingAppointment: false,
  doctorName: null,
  patientName: null,
  appointmentDate: null,
  appointmentTime: null,
  stage: "initial", // initial, name, date, time, confirmed
  previousMessages: [], // Store previous messages for context
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

    // Add user message to previous messages for context
    conversationState.previousMessages.push({ role: "user", content: userPrompt })

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

          // Add bot response to previous messages
          conversationState.previousMessages.push({ role: "assistant", content: response })

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

          // Add bot response to previous messages
          conversationState.previousMessages.push({ role: "assistant", content: response })

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

          // Create confirmation message BEFORE resetting state
          response = `Your appointment with ${conversationState.doctorName} has been confirmed for ${conversationState.patientName} on ${conversationState.appointmentDate} at ${conversationState.appointmentTime}. Your appointment ID is ${appointmentId}. You can download your appointment letter from the button below.`

          // Add bot response to previous messages
          conversationState.previousMessages.push({ role: "assistant", content: response })

          // Reset booking state but keep previous messages
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

        // Add bot response to previous messages
        conversationState.previousMessages.push({ role: "assistant", content: bookingResponse })

        // If language is not English, translate the response
        if (language !== "en") {
          return await translateText(bookingResponse, language)
        }
        return bookingResponse
      }
    }

    // If we reach here, use the Gemini API for a response
    console.log("Using Gemini API for response")

    // Build context from previous messages (limit to last 5 for brevity)
    const recentMessages = conversationState.previousMessages.slice(-10)
    let contextPrompt = systemPrompt + "\n\nConversation history:\n"

    recentMessages.forEach((msg) => {
      if (msg.role === "user") {
        contextPrompt += `User: ${msg.content}\n`
      } else {
        contextPrompt += `Sage: ${msg.content}\n`
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

    // Add bot response to previous messages
    conversationState.previousMessages.push({ role: "assistant", content: botResponse })

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
    console.error("Gemini API Error:", error.response?.data || error.message)
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
