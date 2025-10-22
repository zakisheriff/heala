import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CustomAlert({ 
  visible, 
  message, 
  onClose, 
  showConfirm = false,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmDestructive = false
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.message}>{message}</Text>
          
          {showConfirm ? (
            // Two-button layout for confirmations
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.button, 
                  styles.confirmButton,
                  confirmDestructive && styles.destructiveButton
                ]} 
                onPress={onConfirm}
              >
                <Text style={styles.buttonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Single OK button for simple alerts
            <TouchableOpacity style={styles.singleButton} onPress={onClose}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  message: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    flex: 1,
    alignItems: "center",
  },
  singleButton: {
    backgroundColor: "#9cafcb",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(142, 142, 147, 0.12)",
  },
  confirmButton: {
    backgroundColor: "#9cafcb",
  },
  destructiveButton: {
    backgroundColor: "#dc2626b7",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});