import CustomAlert from '@/components/CustomAlert';
import recordsData from "@/data/healthRecords.json";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HealthRecords() {
  const [search, setSearch] = useState("");
  const [expandedType, setExpandedType] = useState(null);
  const [expandedDisease, setExpandedDisease] = useState(null);

  // --- ALERT STATE ---
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const insets = useSafeAreaInsets();

  const records = recordsData;

  // --- GROUP RECORDS BY TYPE ---
  const grouped = records.reduce((acc, record) => {
    if (!acc[record.type]) acc[record.type] = [];
    acc[record.type].push(record);
    return acc;
  }, {});

  // --- FILTER BASED ON SEARCH ---
  const filtered = Object.entries(grouped).reduce((acc, [type, items]) => {
    acc[type] = items.filter((r) => {
      const lowerSearch = search.toLowerCase();
      if (type === "Prescription") {
        const diseaseMatch = r.disease.toLowerCase().includes(lowerSearch);
        const medicineMatch = r.medicines.some(
          (med) =>
            med.name.toLowerCase().includes(lowerSearch) ||
            med.details.toLowerCase().includes(lowerSearch)
        );
        return diseaseMatch || medicineMatch;
      } else if (type === "Lab Report") {
        const titleMatch = r.title.toLowerCase().includes(lowerSearch);
        const detailsMatch = r.details.toLowerCase().includes(lowerSearch);
        return titleMatch || detailsMatch;
      }
      return false;
    });
    return acc;
  }, {});

  // --- AUTO-EXPAND MATCHED RECORD ---
  useEffect(() => {
    if (search === "") {
      setExpandedType(null);
      setExpandedDisease(null);
      return;
    }

    if (filtered["Prescription"]?.length > 0) {
      setExpandedType("Prescription");
      const firstPrescription = filtered["Prescription"][0];
      setExpandedDisease(`${firstPrescription.id}-${firstPrescription.disease}`);
    } else if (filtered["Lab Report"]?.length > 0) {
      setExpandedType("Lab Report");
      setExpandedDisease(null);
    } else {
      setExpandedType(null);
      setExpandedDisease(null);
    }
  }, [search]);

  const handleTypePress = (type) => {
    setExpandedType(expandedType === type ? null : type);
    setExpandedDisease(null);
  };

  const handleDiseasePress = (diseaseKey) => {
    setExpandedDisease(expandedDisease === diseaseKey ? null : diseaseKey);
  };

  // --- FUNCTION TO SHOW ALERT ---
  const showRecordAlert = (title, details) => {
    setAlertMessage(`${title}\n \n${details}`);
    setAlertVisible(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#9cafcb27" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={-90}
    >
      <LinearGradient
              colors={['#e8f4ff', '#f5f0ff', '#fff5f5', '#f0fff4']}
              locations={[0, 0.3, 0.6, 1]}
              style={{ flex: 1 }}
              >
      
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={[styles.headerContainer, { marginTop: insets.top + 200 }]}>
              <Text style={styles.title}>Health Records</Text>

              <View style={styles.dashboardContainer}>
                {/* --- Prescription Section --- */}
                {filtered["Prescription"] && (
                  <View style={styles.typeSection}>
                    <TouchableOpacity
                      style={styles.typeHeader}
                      onPress={() => handleTypePress("Prescription")}
                    >
                      <View style={styles.typeHeaderContent}>
                        <Text style={styles.typeHeaderIcon}>💊</Text>
                        <View style={styles.typeHeaderText}>
                          <Text style={styles.typeHeaderTitle}>Prescription</Text>
                          <Text style={styles.typeHeaderCount}>
                            {filtered["Prescription"].length} record
                            {filtered["Prescription"].length !== 1 ? "s" : ""}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.chevron,
                          expandedType === "Prescription" && styles.chevronOpen,
                        ]}
                      >
                        ›
                      </Text>
                    </TouchableOpacity>

                    {expandedType === "Prescription" && (
                      <View style={styles.typeContent}>
                        {filtered["Prescription"].length > 0 ? (
                          filtered["Prescription"].map((record) => {
                            const diseaseKey = `${record.id}-${record.disease}`;
                            const isExpanded = expandedDisease === diseaseKey;
                            return (
                              <View key={record.id}>
                                <TouchableOpacity
                                  style={styles.diseaseHeader}
                                  onPress={() => handleDiseasePress(diseaseKey)}
                                >
                                  <View style={styles.diseaseContent}>
                                    <Text style={styles.diseaseName}>{record.disease}</Text>
                                    <Text style={styles.diseaseDate}>{record.date}</Text>
                                  </View>
                                  <Text
                                    style={[
                                      styles.chevron,
                                      isExpanded && styles.chevronOpen,
                                    ]}
                                  >
                                    ›
                                  </Text>
                                </TouchableOpacity>

                                {isExpanded && (
                                  <View style={styles.medicinesContainer}>
                                    {record.medicines.map((medicine, idx) => (
                                      <TouchableOpacity
                                        key={idx}
                                        style={styles.medicineCard}
                                        onPress={() =>
                                          showRecordAlert(medicine.name, medicine.details)
                                        }
                                        activeOpacity={0.7}
                                      >
                                        <View style={styles.medicineCardGlass}>
                                          <View style={styles.medicineCardContent}>
                                            <Text style={styles.medicineName}>{medicine.name}</Text>
                                          </View>
                                        </View>
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                )}
                              </View>
                            );
                          })
                        ) : (
                          <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No prescriptions found</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}

                {/* --- Lab Report Section --- */}
                {filtered["Lab Report"] && (
                  <View style={styles.typeSection}>
                    <TouchableOpacity
                      style={styles.typeHeader}
                      onPress={() => handleTypePress("Lab Report")}
                    >
                      <View style={styles.typeHeaderContent}>
                        <Text style={styles.typeHeaderIcon}>🧪</Text>
                        <View style={styles.typeHeaderText}>
                          <Text style={styles.typeHeaderTitle}>Lab Report</Text>
                          <Text style={styles.typeHeaderCount}>
                            {filtered["Lab Report"].length} record
                            {filtered["Lab Report"].length !== 1 ? "s" : ""}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.chevron,
                          expandedType === "Lab Report" && styles.chevronOpen,
                        ]}
                      >
                        ›
                      </Text>
                    </TouchableOpacity>

                    {expandedType === "Lab Report" && (
                      <View style={styles.typeContent}>
                        {filtered["Lab Report"].length > 0 ? (
                          filtered["Lab Report"].map((record) => (
                            <TouchableOpacity
                              key={record.id}
                              style={styles.labCard}
                              onPress={() =>
                                showRecordAlert(
                                  record.title,
                                  `Provider: ${record.provider}\n\nDetails:\n${record.details}`
                                )
                              }
                              activeOpacity={0.7}
                            >
                              <View style={styles.labCardGlass}>
                                <View style={styles.labCardContent}>
                                  <Text style={styles.labCardTitle}>{record.title}</Text>
                                  <Text style={styles.labCardDate}>{record.date}</Text>
                                  <Text style={styles.labCardProvider}>{record.provider}</Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No lab reports found</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        

        {/* --- SEARCH BAR --- */}
        <View style={[styles.searchContainer, { bottom: insets.bottom + 20 }]}>
          <View style={styles.searchGlass}>
            <Image
              style={styles.searchIcon}
              source={require("@/assets/images/Search.png")}
            />
            <TextInput
              style={styles.search}
              placeholder="Search records..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#999"
            />
            {search !== "" && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        

        {/* --- CUSTOM ALERT --- */}
        <CustomAlert
          visible={alertVisible}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      </View>
      </LinearGradient>  
    </KeyboardAvoidingView>
  );
}

// --- STYLES ---
// (Keep all your existing styles from your previous code)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#9cafcb27", paddingBottom: 50 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    borderRadius: 30,
    backgroundColor: "#fff",
    paddingBottom: 40,
    paddingVertical: 70,

  },
  dashboardContainer: { marginTop: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#1a1a1a", marginBottom: 4, textAlign: "center", paddingTop: 15 },
  typeSection: { marginBottom: 12 },
  typeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, marginBottom: 8, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)" },
  typeHeaderContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  typeHeaderIcon: { fontSize: 28, marginRight: 16 },
  typeHeaderText: { flex: 1 },
  typeHeaderTitle: { fontSize: 15, fontWeight: "700", color: "#1a1a1a", marginBottom: 2 },
  typeHeaderCount: { fontSize: 13, fontWeight: "500", color: "#9ca3af" },
  typeContent: { paddingHorizontal: 4, marginBottom: 8 },
  diseaseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, marginBottom: 8, borderWidth: 1, borderColor: "rgba(99, 102, 241, 0.2)" },
  diseaseContent: { flex: 1 },
  diseaseName: { fontSize: 16, fontWeight: "600", color: "#1a1a1a", marginBottom: 4 },
  diseaseDate: { fontSize: 12, color: "#9ca3af", fontWeight: "500" },
  medicinesContainer: { paddingHorizontal: 8, marginBottom: 12, backgroundColor: "#9cafcb3e", borderRadius: 12, padding: 8 },
  medicineCard: { marginBottom: 10, borderRadius: 14, overflow: "hidden" },
  medicineCardGlass: { backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(99, 102, 241, 0.2)", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  medicineCardContent: { padding: 14 },
  medicineName: { fontSize: 15, fontWeight: "600", color: "#1a1a1a", marginBottom: 4 },
  labCard: { marginBottom: 12, borderRadius: 16, overflow: "hidden" },
  labCardGlass: { backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(99, 102, 241, 0.15)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  labCardContent: { padding: 16 },
  labCardTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 },
  labCardDate: { fontSize: 13, color: "#9ca3af", marginBottom: 4, fontWeight: "500" },
  labCardProvider: { fontSize: 14, color: "#6b7280", fontWeight: "500" },
  chevron: { fontSize: 24, color: "#9ca3af", fontWeight: "300" },
  chevronOpen: { transform: [{ rotate: "90deg" }] },
  emptyState: { paddingVertical: 32, alignItems: "center" },
  emptyText: { fontSize: 15, color: "#9ca3af", fontWeight: "500" },
  searchContainer: { position: "absolute", left: 0, right: 0, paddingHorizontal: 24, paddingVertical: 70, backgroundColor: "transparent" },
  searchGlass: { height: 56, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.95)", borderRadius: 28, paddingHorizontal: 20, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.13)", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  searchIcon: { width: 23, height: 23, marginRight: 12 },
  search: { flex: 1, fontSize: 16, color: "#1a1a1a", fontWeight: "500" },
  clearIcon: { fontSize: 18, color: "#9ca3af", paddingLeft: 12 },
});