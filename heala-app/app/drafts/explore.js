// AIzaSyAJBgV6a7L8yEP1drIbpKhxiyessih3Sb8

import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ChatScreen() {
  const GEMINI_API_KEY = "AIzaSyAJBgV6a7L8yEP1drIbpKhxiyessih3Sb8";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Upload your lab report, and I’ll extract the data and provide a complete 4-section analysis: extracted data, your condition summary, do’s & don’ts, and food advice.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission required to access your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      });
    }
  };

  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/[*_~`#>]/g, '')
      .replace(/\n{2,}/g, '\n\n')
      .trim();
  };

  const sendMessage = async () => {
    if (!input.trim() && !image) return;

    const userMessage = input.trim() ? input : '[Image Attached]';
    const newMessages = [...messages, { role: 'user', content: userMessage, imageUri: image?.uri }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // 🌿 Custom structured prompt
      const systemPrompt = `
You are a professional AI health assistant.
Analyze the attached lab report carefully and give your answer in EXACTLY the following structured format, with each heading capitalized and spaced properly.

FORMAT STRICTLY:

LAB REPORT EXTRACTED DATA

[List every available test name and its value, for example:
Haemoglobin: 13.0 g/dL
WBC Count: 7.2 ×10⁹/L
Platelet Count: 280 ×10⁹/L
etc.]

SUMMARY OF YOUR CURRENT CONDITION

[Explain what the lab report means for the user’s body and how they might feel — e.g., fatigue, weakness, dehydration, etc.]

THINGS YOU SHOULD DO AND AVOID TO OVERCOME IT

[Explain what lifestyle changes and habits they should adopt or avoid.]

FOODS YOU SHOULD CONSUME AND REFRAIN

[Clearly explain what foods they should eat more of and what foods or drinks to avoid.]

Rules:
- Keep spacing between sections exactly as shown.
- No bullet points, emojis, or markdown symbols.
- Write in a professional, friendly tone.
`;

      const parts = [{ text: systemPrompt }];
      if (input.trim()) parts.push({ text: input });

      if (image?.base64) {
        const mimeType = image.uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
        parts.push({ inlineData: { data: image.base64, mimeType } });
      }

      const body = { contents: [{ parts }] };

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const textResponse = await response.text();
      console.log('🔍 Raw Response:', textResponse);
      const data = JSON.parse(textResponse);

      if (!response.ok) {
        const errorMessage = data.error?.message || 'Unknown API error';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `❌ API Error (${response.status}): ${errorMessage}` },
        ]);
        return;
      }

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '⚠️ No valid reply received.';
      const cleanReply = cleanText(reply);

      setMessages((prev) => [...prev, { role: 'assistant', content: cleanReply }]);
    } catch (err) {
      console.error('Network error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '🚫 Network error. Please check your connection or API key.' },
      ]);
    } finally {
      setImage(null);
      setLoading(false);
    }
  };

  const renderMessage = (m, i) => (
    <View
      key={i}
      style={[
        styles.message,
        m.role === 'user' ? styles.userMsg : styles.assistantMsg,
      ]}
    >
      <Text style={styles.messageText}>{m.content}</Text>
      {m.role === 'user' && m.imageUri && (
        <Image source={{ uri: m.imageUri }} style={styles.sentImage} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.chatBox} 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {image && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
          <TouchableOpacity 
            style={styles.removeImageButton} 
            onPress={() => setImage(null)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>X</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Upload a report or type a question..."
          editable={!loading}
        />
        <TouchableOpacity style={styles.button} onPress={pickImage} disabled={loading}>
          <Text style={{ color: '#fff' }}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#1E90FF' }]} 
          onPress={sendMessage} 
          disabled={loading || (!input.trim() && !image)}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Send</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7', paddingTop: 50, margin: 10, marginTop: 20 },
  chatBox: { flex: 1, paddingHorizontal: 10 },
  message: { marginVertical: 5, padding: 15, borderRadius: 20, maxWidth: '80%' },
  messageText: { fontSize: 15, lineHeight: 20 },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#d1e7ff' },
  assistantMsg: { alignSelf: 'flex-start', backgroundColor: '#e8e8e8' },
  sentImage: { width: 120, height: 120, borderRadius: 10, marginTop: 8 },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ddd', alignItems: 'center', marginBottom: 100 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, height: 40 },
  button: { padding: 10, marginLeft: 5, borderRadius: 8, backgroundColor: '#888', justifyContent: 'center', alignItems: 'center' },
  previewContainer: { padding: 10, alignItems: 'center', position: 'relative' },
  previewImage: { width: 150, height: 150, borderRadius: 10, marginBottom: 5 },
  removeImageButton: { position: 'absolute', top: 5, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', zIndex: 10 }
});
