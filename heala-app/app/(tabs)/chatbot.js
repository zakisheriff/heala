import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HealthChatbot() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const scrollRef = useRef();

  const callGemini = async (prompt) => {
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    const res = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Could not fetch data.";
  };

  const simulateTyping = async (text) => {
    setTypingText("");
    let i = 0;
    const speed = 30;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        setTypingText((prev) => prev + text[i]);
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setMessages((prev) => [...prev, { role: "ai", content: text }]);
          setTypingText("");
          resolve();
        }
        scrollRef.current?.scrollToEnd({ animated: true });
      }, speed);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const prompt = `
You are a professional medical assistant. 
User input: "${userMessage.content}"

Instructions:
1. If the input is a casual greeting (hi, hello, hey, good morning, etc.), respond warmly and ask how you can help with their health concerns.

2. If the input is a farewell (bye, goodbye, see you, etc.), respond politely and remind them you're here anytime they need health advice.

3. If the input is nonsense, random text, or unrelated to health, respond with:
"I can only help with disease names, symptoms, or medical conditions. Please describe your health concern."

4. If the input is a recognized disease, respond ONLY with:
- Lab tests available in Sri Lanka for this disease.
- Specialist to consult.

5. If the input describes symptoms, injuries, or general health complaints, respond ONLY with:
- Temporary solutions, first aid, or lifestyle suggestions.

6. If the input describes severe symptoms (severe pain, chest pain, difficulty breathing, heavy bleeding, loss of consciousness, stroke symptoms, etc.), respond with:
"⚠️ This sounds serious. Please seek immediate medical attention or visit the nearest emergency room."

Do not include extra explanations. Be concise and helpful.
`;

      const aiReply = await callGemini(prompt);
      await simulateTyping(aiReply);
    } catch (err) {
      console.error(err);
      await simulateTyping("⚠️ Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, typingText]);

  const renderMessage = (m, i) => {
    const isUser = m.role === "user";
    return (
      <View key={i} style={styles.messageRow}>
        <View style={styles.messageContainer}>
          <View style={[styles.avatar, isUser ? styles.userAvatar : styles.aiAvatar]}>
            <Text style={styles.avatarText}>{isUser ? "U" : "h"}</Text>
          </View>
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>{m.content}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>heala ai</Text>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>How can I help you today?</Text>
              <Text style={styles.emptySubtitle}>
                Type a disease or symptom to get tests or temporary advice
              </Text>
            </View>
          )}
          
          {messages.map(renderMessage)}
          
          {typingText.length > 0 && (
            <View style={styles.messageRow}>
              <View style={styles.messageContainer}>
                <View style={[styles.avatar, styles.aiAvatar]}>
                  <Text style={styles.avatarText}>AI</Text>
                </View>
                <View style={styles.messageContent}>
                  <Text style={styles.messageText}>{typingText}</Text>
                </View>
              </View>
            </View>
          )}
          
          {loading && typingText.length === 0 && (
            <View style={styles.messageRow}>
              <View style={styles.messageContainer}>
                <View style={[styles.avatar, styles.aiAvatar]}>
                  <Text style={styles.avatarText}>h</Text>
                </View>
                <View style={styles.messageContent}>
                  <View style={styles.typingIndicator}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message heala ai..."
              placeholderTextColor="#8e8e93"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              editable={!loading}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || loading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={loading || !input.trim()}
            >
              <Text style={styles.sendButtonText}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  chatArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatContent: {
    paddingVertical: 16,
    paddingBottom: 140,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#8e8e93",
    textAlign: "center",
    lineHeight: 22,
  },
  messageRow: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatar: {
    backgroundColor: "#007AFF",
  },
  aiAvatar: {
    backgroundColor: "#10a37f",
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  messageContent: {
    flex: 1,
    paddingTop: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 24,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8e8e93",
    marginRight: 6,
  },
  inputWrapper: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#e5e5ea",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
});