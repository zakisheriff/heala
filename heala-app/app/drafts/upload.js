import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Video } from "expo-av";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";

export default function LabReportAnalyzerFast() {
  const GEMINI_API_KEY = "AIzaSyAJBgV6a7L8yEP1drIbpKhxiyessih3Sb8";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // ===========================
  // SYSTEM PROMPTS
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

  =================================
    THINGS YOU SHOULD DO AND AVOID TO OVERCOME IT
  =================================

[Provide lifestyle or habit advice relevant to the report results]

  =========================
    FOODS YOU SHOULD CONSUME AND REFRAIN
  =========================

[Provide diet recommendations — what foods to eat and what to avoid]

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

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required to access your gallery.");
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
        [{ resize: { width: 1024 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const img = {
        uri: manipulated.uri,
        base64: manipulated.base64,
      };

      setImage(img);
      await verifyDocumentType(img, type);
    }
  };

  // ===========================
  // STEP 1: VERIFY DOCUMENT TYPE
  // ===========================
  const verifyDocumentType = async (img, type) => {
    setLoading(true);
    setAnalysis("");

    try {
      const mimeType = img.uri.endsWith(".png") ? "image/png" : "image/jpeg";

      const body = {
        contents: [
          {
            parts: [
              { text: CLASSIFIER_PROMPT },
              { inlineData: { data: img.base64, mimeType } },
            ],
          },
        ],
      };

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || "";

      if (reply.includes(type)) {
        await sendToGemini(img, type);
      } else {
        setAnalysis(
          "⚠️ Please upload this image to the correct analyzer.\n\n" +
            "It appears to be a " +
            (reply === "lab" ? "lab report" : reply === "prescription" ? "prescription" : "different document") +
            "."
        );
        setShowResult(true);
      }
    } catch (err) {
      console.error(err);
      setAnalysis("🚫 Network error during classification.");
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // STEP 2: REAL ANALYSIS
  // ===========================
  const sendToGemini = async (img, type) => {
    setLoading(true);
    setAnalysis("");

    const systemPrompt =
      type === "lab" ? LAB_SYSTEM_PROMPT : PRESCRIPTION_SYSTEM_PROMPT;

    try {
      const mimeType = img.uri.endsWith(".png") ? "image/png" : "image/jpeg";

      const body = {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { inlineData: { data: img.base64, mimeType } },
            ],
          },
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
        reply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "⚠️ No valid response received.";
      } catch {
        reply = text;
      }

      setAnalysis(reply);
    } catch (err) {
      console.error(err);
      setAnalysis("🚫 Network error.");
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  // ===========================
  // HELPER TO DETECT VALID EXTRACTION
  // ===========================
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
        colors={['#e8f4ff', '#f5f0ff', '#fff5f5', '#f0fff4']}
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
            <Video
              source={require('@/assets/videos/analyse_loader.mp4')}
              rate={1.0}
              isMuted={true}
              resizeMode="contain"
              shouldPlay
              isLooping
              style={{ width: 200, height: 200 }}
            />
            <Text style={styles.processingText}>
              {selectedType === "prescription"
                ? "Reading Prescription...  "
                : "Analyzing Lab Report...  "}
            </Text>
          </View>
        )}
      </LinearGradient>

      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{justifyContent: "center", alignItems:"center"}}>
                    <Image style={{width: 40, height: 40, margin: 20, justifyContent: "center", alignContent: "center"}} source={require("@/assets/images/heala-app-use.png")}/>
                </View>
              
              <Text style={styles.modalText}>{analysis}</Text>
            </ScrollView>

            {isExtractionValid() && (
              <TouchableOpacity
                style={[styles.okButton, { marginTop: 18 }]}
                onPress={() => {
                  Clipboard.setStringAsync(analysis);
                }}
              >
                <Text style={styles.okText}>Copy</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.okButton, { marginTop: 18, backgroundColor: "#0a84ff" }]}
              onPress={() => {
                setShowResult(false);
                setImage(null);
                setAnalysis("");
                setSelectedType(null);
              }}
            >
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 70,
    margin: 20,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#000", marginBottom: 4 },
  subtitle: {
    fontSize: 13,
    color: "#8e8e93",
    paddingHorizontal: 40,
    marginBottom: 30,
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  uploadButton: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "rgba(77, 75, 75, 0.13)",
  },
  uploadText: { fontSize: 16, fontWeight: "600", color: "#84afefff" },
  processingText: { fontSize: 14, marginTop: 20, color: "#8e8e93" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(32, 33, 36, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffffff",
    borderRadius: 23,
    padding: 32,
    width: "85%",
    maxWidth: 400,
    maxHeight: "80%",

  },
  modalText: {
    fontSize: 15,
    color: "#202124",
    lineHeight: 22,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
    marginBottom: 24,
  },
  okButton: {
    backgroundColor: "#00A89A",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    minWidth: 120,
    marginHorizontal: 20
  },
  okText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Roboto-Medium",
    textTransform: "uppercase",
  },
});