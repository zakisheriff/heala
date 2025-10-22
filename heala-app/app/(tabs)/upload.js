import { Video } from "expo-av";
import * as Clipboard from "expo-clipboard";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function LabReportAnalyzerFast() {

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [textCompleted, setTextCompleted] = useState(false);
  const [currentLang, setCurrentLang] = useState("English");
  const [toast, setToast] = useState("");

  const scrollRef = useRef();

  // ===========================
  // SYSTEM PROMPTS (omitted for brevity)
  // ===========================
  const LAB_SYSTEM_PROMPT = `
You are a professional AI health assistant.
Analyze the attached LAB REPORT carefully and provide your answer in EXACTLY the following format:

      heala's Lab Report Analyzer
      
  ========================
    LAB REPORT EXTRACTED DATA
  ========================

[List every test name and its value clearly]

  =========================
    SUMMARY OF YOUR CURRENT CONDITION
  =========================

[Summarize what the lab report indicates about the user's health — mention abnormalities or possible issues]

  =========================
    THINGS YOU SHOULD DO AND AVOID TO OVERCOME IT
  =========================

[Provide lifestyle or habit advice relevant to the report results]

  =========================
    FOODS YOU SHOULD CONSUME AND REFRAIN
  =========================

[Provide diet recommendations — what foods to eat and what to avoid]

Finish it with =========================

Rules:
- Keep spacing exactly as shown.
- No bullet points, emojis, or markdown.
- Write in a clear, empathetic, and professional tone.
`;

  const PRESCRIPTION_SYSTEM_PROMPT = `
You are a prescription handwriting reader AI.

Your task is to read the attached prescription image and extract only the medicines with their dosage, usage timing, and purposes.

Provide your output in EXACTLY this format:

      heala's Prescription Reader

    ========================
      MEDICINES AND DOSAGE
    ========================

[List each medicine name, dosage, and duration clearly, e.g.:
Amoxicillin 5g × 5 Days
Panadol 5g × 3 Days]

    ==============
      USAGE TIME
    ==============

[List when to take each medicine — morning, afternoon, evening, or night, based on the doctor's notes]

    =======================
      PURPOSE AND DETAILS
    =======================

[For each medicine, explain briefly what it is used for, e.g.:
Amoxicillin: Used to treat bacterial infections such as sore throat or chest infection.
Panadol: Used to relieve pain and reduce fever.]

Finish it with =========================

Rules:
- Output only in this structure.
- No other information like patient name, doctor name, or date.
- Keep tone clear, simple, and factual.
- No emojis, bullet points, or markdown formatting.
`;

  const CLASSIFIER_PROMPT = `
You are a document classifier.
Determine if the uploaded image is a LAB REPORT or a DOCTOR'S PRESCRIPTION.

Respond with exactly one word: "lab" or "prescription".
If unclear, respond with "unknown".
`;

  // ===========================
  // IMAGE PICKER
  // ===========================
  const pickImage = async (type) => {
    setSelectedType(type);
    setLoading(true);
    setAnalysis("");
    setDisplayedText("");
    setTextCompleted(false);
    setCurrentLang("English");
    setShowResult(false); // Hide previous results

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required to access your gallery.");
      setLoading(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 512 } }],
        { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const img = { uri: manipulated.uri, base64: manipulated.base64 };
      setImage(img);
      await verifyDocumentType(img, type);
    } else {
      setLoading(false);
    }
  };

  // ===========================
  // VERIFY DOCUMENT TYPE (FIXED)
  // ===========================
  const verifyDocumentType = async (img, type) => {
    try {
      const mimeType = img.uri.endsWith(".png") ? "image/png" : "image/jpeg";
      const body = {
        contents: [
          { parts: [{ text: CLASSIFIER_PROMPT }, { inlineData: { data: img.base64, mimeType } }] },
        ],
      };

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || "";

      if (reply.includes(type)) {
        await sendToGemini(img, type);
      } else {
        const msg =
          "⚠️ Please upload this image to the correct analyzer.\n\n" +
          "It appears to be a " +
          (reply.includes("lab") ? "'Lab Report'" : reply.includes("prescription") ? "'Prescription'" : "'Different Document'") +
          ".";
        setAnalysis(msg);
        setDisplayedText(msg);
        setShowResult(true);
        setLoading(false);
        // FIX: Set textCompleted to true on document mismatch
        setTextCompleted(true); 
      }
    } catch (err) {
      console.error(err);
      const errorMsg = "🚫 Network error during classification.";
      setAnalysis(errorMsg);
      setDisplayedText(errorMsg);
      setShowResult(true);
      setLoading(false);
      // FIX: Set textCompleted to true on network error
      setTextCompleted(true); 
    }
  };

  // ===========================
  // SEND IMAGE TO GEMINI & TYPING EFFECT (FIXED)
  // ===========================
  const sendToGemini = async (img, type) => {
    const systemPrompt = type === "lab" ? LAB_SYSTEM_PROMPT : PRESCRIPTION_SYSTEM_PROMPT;

    try {
      const mimeType = img.uri.endsWith(".png") ? "image/png" : "image/jpeg";
      const body = {
        contents: [
          { parts: [{ text: systemPrompt }, { inlineData: { data: img.base64, mimeType } }] },
        ],
      };

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await response.text();

      let reply;
      try {
        const data = JSON.parse(text);
        reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No valid response received.";
      } catch {
        reply = text;
      }

      setAnalysis(reply);
      setShowResult(true);
      setDisplayedText("");
      setCurrentLang("English");

      // Typing Effect (Typing effect kept for the main analysis)
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(prev => prev + reply.charAt(index));
        index++;
        scrollRef.current?.scrollToEnd({ animated: true });
        if (index >= reply.length) {
          clearInterval(interval);
          setTextCompleted(true);
          setLoading(false);
        }
      }, 12); // Speed of initial typing effect
    } catch (err) {
      console.error(err);
      const errorMsg = "🚫 Network error.";
      setAnalysis(errorMsg);
      setDisplayedText(errorMsg);
      setShowResult(true);
      setLoading(false);
      // FIX: Set textCompleted to true on network error
      setTextCompleted(true);
    }
  };

  // ===========================
  // TRANSLATION FUNCTION (MODIFIED FOR INSTANT DISPLAY & HEADER PROTECTION)
  // ===========================
  const translateOutput = async (language) => {
    if (!analysis) return;

    if (currentLang === language) {
      setToast(`Already in ${language}`);
      setTimeout(() => setToast(""), 2000);
      return;
    }

    setTranslating(true);
    setTextCompleted(false);

    // 1. Identify and extract the header based on the selected type
    const isLab = selectedType === 'lab';
    // Regex to capture the header block: '  heala's ... Analyzer/Reader\n\n  ========================\n'
    // It captures up to the first '===' line after the title.
    const headerPattern = isLab 
      ? /(^.*?heala's Lab Report Analyzer\s*[\n\r]+\s*={10,}\s*[\n\r]+)/s
      : /(^.*?heala's Prescription Reader\s*[\n\r]+\s*={10,}\s*[\n\r]+)/s; 
    
    const headerMatch = analysis.match(headerPattern);
    const originalHeader = headerMatch ? headerMatch[0] : '';
    const textToTranslate = headerMatch ? analysis.substring(originalHeader.length).trim() : analysis;
    
    // 2. Define the translation prompt for the body content only
    const TRANSLATION_PROMPT = `
Translate the following text into ${language}.
Keep the structure, spacing, and formatting exactly as it is. Do NOT translate any headers, titles, or section delimiters (e.g., '========').

Text:
${textToTranslate}
`;

    try {
      const body = { contents: [{ parts: [{ text: TRANSLATION_PROMPT }] }] };
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const translatedBody =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ Translation failed.";

      // 3. Recombine the original header with the translated body
      const fullTranslatedText = originalHeader + translatedBody;

      // INSTANTLY set the displayed text
      setDisplayedText(fullTranslatedText); 
      
      // INSTANTLY complete the process
      setTextCompleted(true);
      setTranslating(false);
      setCurrentLang(language);
      
      // Scroll to the bottom after the UI has updated
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50); 
      
    } catch (err) {
      console.error(err);
      alert("Translation failed.");
      setTranslating(false);
      setTextCompleted(true); // Re-enable buttons
    }
  };

  const isExtractionValid = () => {
    const lower = analysis.toLowerCase();
    return (
      analysis &&
      !lower.includes("please upload this image") &&
      !lower.includes("network error") &&
      !lower.includes("no valid response")
    );
  };

  // ===========================
  // UI
  // ===========================
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e8f4ff", "#f5f0ff", "#fff5f5", "#f0fff4"]}
        locations={[0, 0.3, 0.6, 1]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        {!image && !loading && (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Upload Your Health Record</Text>
            <Text style={styles.subtitle}>
              Choose the type of document you want to analyze
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage("prescription")}
            >
              <Text style={styles.uploadText}>📜 Prescription Reader</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.uploadButton, { marginTop: 20 }]}
              onPress={() => pickImage("lab")}
            >
              <Text style={styles.uploadText}>🧪 Lab Report Analyzer</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={[styles.centerContent, { paddingHorizontal: 40 }]}>
            {/* NOTE: You need to have the video file at assets/videos/analyse_loader.mp4 */}
            <Video
              source={require("@/assets/videos/analyse_loader.mp4")} 
              rate={1.0}
              isMuted
              resizeMode="contain"
              shouldPlay
              isLooping
              style={{ width: 200, height: 200 }}
            />
            <Text style={styles.processingText}>
              {selectedType === "prescription"
                ? "Reading Prescription... "
                : "Analyzing Lab Report...  "}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Full-screen AI output modal */}
      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.fullScreenModal}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContainer}
          >
            <View style={styles.aiBubble}>
              <Text style={styles.modalText}>{displayedText}</Text>
            </View>
          </ScrollView>

          {/* Language Buttons */}
          {isExtractionValid() && textCompleted && !translating && (
            <View style={styles.langRow}>
              <TouchableOpacity
                style={styles.langButton}
                onPress={() => translateOutput("English")}
              >
                <Text style={styles.langText}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.langButton}
                onPress={() => translateOutput("Tamil")}
              >
                <Text style={styles.langText}>தமிழ்</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.langButton}
                onPress={() => translateOutput("Sinhala")}
              >
                <Text style={styles.langText}>සිංහල</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading + Toast */}
          {translating && (
            <Text style={styles.translatingText}>Translating...</Text>
          )}
          {toast !== "" && (
            <Text style={styles.toastText}>{toast}</Text>
          )}

          {/* Copy + Close buttons (only after typing completes OR on instant error) */}
          <View style={styles.buttonRow}>
            {/* Copy Button: Only show if extraction is valid and text is complete */}
            {isExtractionValid() && textCompleted && (
              <TouchableOpacity
                style={styles.sideButton}
                onPress={() => Clipboard.setStringAsync(analysis)}
              >
                <Text style={styles.okText}>Copy</Text>
              </TouchableOpacity>
            )}
            
            {/* Close Button: Show if text is complete (valid output, mismatch error, or network error) */}
            {textCompleted && (
              <TouchableOpacity
                // Use the distinct red color for the close button, as per your code's style
                style={[styles.sideButton, { backgroundColor: "#ff3a30d7" }]} 
                onPress={() => {
                  setShowResult(false);
                  setImage(null);
                  setAnalysis("");
                  setDisplayedText("");
                  setSelectedType(null);
                  setTextCompleted(false);
                  setCurrentLang("English");
                }}
              >
                <Text style={styles.okText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ===========================
// STYLES
// ===========================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f7" },
  centerContent: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24, backgroundColor: "#fff", borderRadius: 30, paddingVertical: 70, margin: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#000", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#8e8e93", paddingHorizontal: 40, marginBottom: 30, textAlign: "center", fontFamily: "Helvetica" },
  uploadButton: { backgroundColor: "#fff", borderRadius: 18, paddingVertical: 18, paddingHorizontal: 40, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, borderWidth: 1, borderColor: "rgba(77, 75, 75, 0.13)" },
  uploadText: { fontSize: 16, fontWeight: "600", color: "#84afefff" },
  processingText: { fontSize: 14, marginTop: 20, color: "#8e8e93" },
  fullScreenModal: { flex: 1, backgroundColor: "#1c1c1e", paddingTop: 60, paddingBottom: 20 },
  chatContainer: { paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1, justifyContent: "center", alignItems: "center" },
  aiBubble: { backgroundColor: "#2c2c2e", borderRadius: 16, padding: 20, maxWidth: "90%", alignSelf: "center" },
  modalText: { color: "#fff", fontSize: 16, lineHeight: 24, textAlign: "center" },
  langRow: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  langButton: { backgroundColor: "#3a3a3c", paddingVertical: 8, paddingHorizontal: 18, borderRadius: 12, marginHorizontal: 6 },
  langText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  buttonRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 12, marginHorizontal: 20, marginVertical: 10 },
  sideButton: { flex: 1, backgroundColor: "#0a84ff", paddingVertical: 14, marginHorizontal: 8, borderRadius: 16, alignItems: "center" }, 
  okText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  translatingText: { color: "#aaa", textAlign: "center", marginTop: 10, fontSize: 14 },
  toastText: { color: "#a6e3a1", textAlign: "center", marginTop: 8, fontSize: 14 }
});