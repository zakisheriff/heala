import CustomAlert from '@/components/CustomAlert';
import hospital from '@/hospitals/hospitals.json';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

export default function HomeDashboard() {
  const [userName] = useState("Ze");
  const [search, setSearch] = useState("");
  const insets = useSafeAreaInsets();
  const [currentLocation, setCurrentLocation] = useState(null);

  // Get user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use Uber integration');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    })();
  }, []);

  // 🕒 Medicine Schedule
  const [schedule, setSchedule] = useState([
    { id: 1, medicine: 'Amoxicillin 500mg', time: '8:00 AM', period: 'morning', taken: false },
    { id: 2, medicine: 'Vitamin D3', time: '2:00 PM', period: 'evening', taken: false },
    { id: 3, medicine: 'Paracetamol', time: '9:00 PM', period: 'night', taken: false },
  ]);

  // 📋 Prescriptions (Static for now)
  const [prescriptions] = useState([
    { id: 1, medicine: 'Amoxicillin 500mg', date: 'Oct 5', doctor: 'Dr. Smith', dosage: '500mg, 3× daily', days: 7 },
    { id: 2, medicine: 'Vitamin D3', date: 'Oct 1', doctor: 'Dr. Johnson', dosage: '1000 IU, 1× daily', days: 28 },
    { id: 3, medicine: 'Paracetamol', date: 'Oct 10', doctor: 'Dr. Adams', dosage: '500mg, 2× daily', days: 5 },
  ]);

  // 🏥 Hospital State
  const [hospitalModalVisible, setHospitalModalVisible] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);

  // 🚨 Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);

  // 📍 Hospital Data
  const hospitals = hospital;

  // Filter medicines based on search
  const filteredSchedule = schedule.filter((item) =>
    item.medicine.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Add distance to hospitals and sort by distance
  const hospitalsWithDistance = hospitals.map(h => {
    if (currentLocation && h.latitude && h.longitude) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        parseFloat(h.latitude),
        parseFloat(h.longitude)
      );
      return { ...h, distance };
    }
    return { ...h, distance: null };
  }).sort((a, b) => {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  // Filter hospitals based on search in modal
  const filteredHospitals = hospitalsWithDistance.filter((h) =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    h.location.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  // Get nearest 3 hospitals
  const nearestHospitals = hospitalsWithDistance.filter(h => h.distance !== null).slice(0, 3);

  // 🧾 Medicine Handlers
  const handleMarkTaken = (id) => {
    setSchedule(prev => prev.map(m => m.id === id ? { ...m, taken: true } : m));
  };

  const [showCallAlert, setShowCallAlert] = useState(false);
  const [pendingPhone, setPendingPhone] = useState(null);

  const handleCallHospital = (phone) => {
    if (!phone) {
      // Using CustomAlert as a simple message box (assuming CustomAlert supports single message display)
      setAlertMessage("This hospital doesn't have a phone number listed.");
      setShowSimpleAlert(true);
      return;
    }

    setPendingPhone(phone);
    setShowCallAlert(true);
  };

  const confirmCall = () => {
    if (pendingPhone) {
      const phoneNumber = `tel:${pendingPhone}`;
      Linking.openURL(phoneNumber);
    }
    setShowCallAlert(false);
  };

  const handleUberNavigation = async (hospital) => {
    if (!currentLocation) {
      Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
      return;
    }

    // Parse hospital coordinates if they exist
    const pickupLat = currentLocation.latitude;
    const pickupLng = currentLocation.longitude;
    
    const dropoffLat = hospital.latitude || '6.9271'; // Fallback coordinate (e.g., Colombo)
    const dropoffLng = hospital.longitude || '79.8612'; // Fallback coordinate (e.g., Colombo)

    const uberUrl = `uber://?action=setPickup&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${dropoffLat}&dropoff[longitude]=${dropoffLng}&dropoff[nickname]=${encodeURIComponent(hospital.name)}`;
    
    const uberWebUrl = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${dropoffLat}&dropoff[longitude]=${dropoffLng}&dropoff[nickname]=${encodeURIComponent(hospital.name)}`;

    try {
      const supported = await Linking.canOpenURL(uberUrl);
      if (supported) {
        await Linking.openURL(uberUrl);
      } else {
        // Open web version if app is not installed
        await Linking.openURL(uberWebUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open Uber. Please make sure Uber is installed.');
    }
  };

  const handleDeleteMedicine = (id) => {
    setMedicineToDelete(id);
    setAlertVisible(true);
  };

  const confirmDelete = () => {
    if (medicineToDelete) {
      setSchedule(prev => prev.filter(m => m.id !== medicineToDelete));
      setMedicineToDelete(null);
    }
    setAlertVisible(false);
  };

  const cancelDelete = () => {
    setMedicineToDelete(null);
    setAlertVisible(false);
  };

  // 🕐 Render medicine schedule (by period)
  const renderScheduleSection = (period, emoji) => {
    const filtered = filteredSchedule.filter(item => item.period === period);
    if (filtered.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{emoji} {period.charAt(0).toUpperCase() + period.slice(1)}</Text>
        {filtered.map((item) => (
          <View key={item.id} style={styles.glassCard}>
            <View style={styles.glassOverlay} />
            <View style={styles.scheduleContent}>
              <View style={styles.scheduleLeft}>
                <View style={styles.timeCircle}>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleMedicine}>{item.medicine}</Text>
                  <Text style={styles.scheduleNote}>Take with food</Text>
                </View>
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  disabled={item.taken}
                  style={[styles.takeButton, item.taken && styles.takenButton]}
                  onPress={() => handleMarkTaken(item.id)}
                >
                  <LinearGradient
                    colors={item.taken ? ['#9DD6C5', '#BEECC2'] : ['#007AFF', '#5AC8FA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.takeGradient}
                  >
                    <Text style={styles.takeButtonText}>
                      {item.taken ? 'Taken' : 'Take'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMedicine(item.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#e8f4ff', '#f5f0ff', '#fff5f5', '#f0fff4']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Navbar */}
          <View style={styles.navBar}>
            <View style={styles.navContent}>
              <TouchableOpacity
                style={[styles.profileButton, { marginLeft: 'auto' }]}
                onPress={() => router.navigate('/profile')}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.6)']}
                  style={styles.profileGlass}
                >
                  <Text style={styles.profileInitial}>{userName[0]}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <View style={styles.glassCard}>
              <View style={styles.glassOverlay} />
              <View style={styles.heroContent}>
                <Text style={styles.heroGreeting}>Good Afternoon</Text>
                <Text style={styles.heroName}>{userName}</Text>
                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatNumber}>{schedule.filter(m => !m.taken).length}</Text>
                    <Text style={styles.heroStatLabel}>Due Today</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Schedule Sections or Search Results */}
          {search === "" ? (
            <>
              {renderScheduleSection('morning', '🌅')}
              {renderScheduleSection('evening', '🌇')}
              {renderScheduleSection('night', '🌙')}
            </>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔍 Search Results</Text>
              {filteredSchedule.length > 0 ? (
                filteredSchedule.map((item) => (
                  <View key={item.id} style={styles.glassCard}>
                    <View style={styles.glassOverlay} />
                    <View style={styles.scheduleContent}>
                      <View style={styles.scheduleLeft}>
                        <View style={styles.timeCircle}>
                          <Text style={styles.timeText}>{item.time}</Text>
                        </View>
                        <View style={styles.scheduleInfo}>
                          <Text style={styles.scheduleMedicine}>{item.medicine}</Text>
                          <Text style={styles.scheduleNote}>
                            {item.period.charAt(0).toUpperCase() + item.period.slice(1)} • Take with food
                          </Text>
                        </View>
                      </View>

                      <View style={styles.buttonGroup}>
                        <TouchableOpacity
                          disabled={item.taken}
                          style={[styles.takeButton, item.taken && styles.takenButton]}
                          onPress={() => handleMarkTaken(item.id)}
                        >
                          <LinearGradient
                            colors={item.taken ? ['#9DD6C5', '#BEECC2'] : ['#007AFF', '#5AC8FA']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.takeGradient}
                          >
                            <Text style={styles.takeButtonText}>
                              {item.taken ? 'Taken' : 'Take'}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteMedicine(item.id)}
                        >
                          <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>🔍</Text>
                  <Text style={styles.emptyStateText}>No medicines found</Text>
                  <Text style={styles.emptyStateSubtext}>Try searching with a different name</Text>
                </View>
              )}
            </View>
          )}

          {/* Hospitals Section - Updated to show nearest 3 */}
          {search === "" && (
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionTitle}>🏥 Nearest Hospitals</Text>
              
              {currentLocation && nearestHospitals.length > 0 ? (
                nearestHospitals.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    style={styles.glassCard} // Reuse existing card style
                    onPress={() => {
                      setSelectedHospital(h);
                      setHospitalModalVisible(true);
                    }}
                  >
                    <View style={styles.glassOverlay} />
                    <View style={styles.hospitalPreviewContent}>
                      <View style={styles.hospitalIconCircle}>
                        <Text style={styles.hospitalIcon}>🏥</Text>
                      </View>
                      <View style={styles.hospitalPreviewInfo}>
                        <Text style={styles.hospitalPreviewName}>{h.name}</Text>
                        <Text style={styles.hospitalPreviewLocation}>
                          {h.distance ? `${h.distance.toFixed(1)} km away` : h.location}
                        </Text>
                      </View>
                      <View style={[
                        styles.listStatusBadge,
                        { backgroundColor: ['Open', 'Open (Private)', 'Open (Government)'].includes(h.status) ? '#E8F5E9' : '#FFEBEE' }
                      ]}>
                        <Text style={[
                          styles.listStatusText,
                          { color: ['Open', 'Open (Private)', 'Open (Government)'].includes(h.status) ? '#4CAF50' : '#f44336' }
                        ]}>
                          {h.status}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={[styles.glassCard, { padding: 20, alignItems: 'center' }]}>
                    <Text style={styles.scheduleNote}>
                        {currentLocation ? 'No nearby hospitals found.' : 'Getting your location...'}
                    </Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => setHospitalModalVisible(true)}
              >
                <Text style={styles.viewAllButtonText}>View All Hospitals</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        
      </LinearGradient>

      {/* Hospital Modal */}
      <Modal 
        visible={hospitalModalVisible} 
        animationType="none" 
        onRequestClose={() => {
          setHospitalModalVisible(false);
          setSelectedHospital(null);
          setHospitalSearch('');
        }}
      >
        <LinearGradient 
          colors={['#e8f4ff73', '#f5f0ff84', '#fff5f587']} 
          style={styles.modalContainer}
        >
          {!selectedHospital ? (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Hospitals</Text>
                <TouchableOpacity onPress={() => {
                  setHospitalModalVisible(false);
                  setHospitalSearch('');
                }}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalSearchContainer}>
                <View style={styles.modalSearchGlass}>
                  <Image
                    style={styles.searchIcon}
                    source={require("@/assets/images/Search.png")}
                  />
                  <TextInput
                    placeholder="Search hospitals..."
                    placeholderTextColor="#999"
                    style={styles.modalSearch}
                    value={hospitalSearch}
                    onChangeText={setHospitalSearch}
                  />
                  {hospitalSearch !== "" && (
                    <TouchableOpacity onPress={() => setHospitalSearch("")}>
                      <Text style={styles.clearIcon}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

            {filteredHospitals.length > 0 ? (
              <FlatList
                data={filteredHospitals}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.hospitalItem}
                    onPress={() => setSelectedHospital(item)}
                  >
                    <View style={styles.hospitalItemContent}>
                      <View style={styles.hospitalItemLeft}>
                        <Text style={styles.hospitalName}>{item.name}</Text>
                        <Text style={styles.hospitalLocation}>
                          📍 {item.location}
                          {item.distance !== null && ` (${item.distance.toFixed(1)} km)`}
                        </Text>
                      </View>
                      <View style={[
                        styles.listStatusBadge,
                        { backgroundColor: ['Open', 'Open (Private)', 'Open (Government)'].includes(item.status) ? '#E8F5E9' : '#FFEBEE' }
                      ]}>
                        <Text style={[
                          styles.listStatusText,
                          { color: ['Open', 'Open (Private)', 'Open (Government)'].includes(item.status) ? '#4CAF50' : '#f44336' }
                        ]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                />
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>🔍</Text>
                    <Text style={styles.emptyStateText}>No hospitals found</Text>
                    <Text style={styles.emptyStateSubtext}>Try searching with a different name or location</Text>
                  </View>
                )}

            </>
          ) : (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedHospital(null)}>
                  <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setHospitalModalVisible(false);
                  setSelectedHospital(null);
                  setHospitalSearch('');
                }}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.detailsScrollView}>
                <View style={styles.detailsContent}>
                  <View style={styles.detailsHeader}>
                    <View style={styles.detailsIconCircle}>
                      <Text style={styles.detailsIcon}>🏥</Text>
                    </View>
                    <Text style={styles.detailsTitle}>{selectedHospital.name}</Text>
                    <View style={[
                      styles.detailsStatusBadge,
                      { backgroundColor: ['Open', 'Open (Private)', 'Open (Government)'].includes(selectedHospital.status) ? '#E8F5E9' : '#FFEBEE' }
                    ]}>
                      <Text style={[
                        styles.detailsStatusText,
                        { color: ['Open', 'Open (Private)', 'Open (Government)'].includes(selectedHospital.status) ? '#4CAF50' : '#f44336' }
                      ]}>
                        {selectedHospital.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsInfoSection}>
                    <View style={styles.detailsInfoItem}>
                      <View style={styles.detailsInfoIcon}>
                        <Text style={styles.infoIconText}>📍</Text>
                      </View>
                      <View style={styles.detailsInfoText}>
                        <Text style={styles.infoLabel}>Location</Text>
                        <Text style={styles.infoValue}>{selectedHospital.location}</Text>
                      </View>
                    </View>
                    
                    {selectedHospital.distance !== null && (
                      <View style={styles.detailsInfoItem}>
                        <View style={styles.detailsInfoIcon}>
                          <Text style={styles.infoIconText}>🗺️</Text>
                        </View>
                        <View style={styles.detailsInfoText}>
                          <Text style={styles.infoLabel}>Distance</Text>
                          <Text style={styles.infoValue}>{selectedHospital.distance.toFixed(1)} km</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.detailsInfoItem}>
                      <View style={styles.detailsInfoIcon}>
                        <Text style={styles.infoIconText}>📞</Text>
                      </View>
                      <View style={styles.detailsInfoText}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{selectedHospital.phone || 'N/A'}</Text>
                      </View>
                    </View>

                    <View style={[styles.detailsInfoItem, { borderBottomWidth: 0 }]}>
                      <View style={styles.detailsInfoIcon}>
                        <Text style={styles.infoIconText}>🕒</Text>
                      </View>
                      <View style={styles.detailsInfoText}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <Text style={[
                          styles.infoValue,
                          { color: ['Open', 'Open (Private)', 'Open (Government)'].includes(selectedHospital.status) ? '#4CAF50' : '#f44336', fontWeight: '700' }
                        ]}>
                          {selectedHospital.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={() => handleCallHospital(selectedHospital.phone)}
                  >
                    <LinearGradient
                      colors={['#007AFF', '#5AC8FA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.callGradient}
                    >
                      <Text style={styles.callButtonText}>📞 Call {selectedHospital.name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.uberButton}
                    onPress={() => handleUberNavigation(selectedHospital)}
                  >
                    <Image source={require("@/assets/images/Uber.jpeg")}
                    style={{width:360, height: 50}}
                    />
                  </TouchableOpacity>

                </View>
              </ScrollView>
            </>
          )}
        </LinearGradient>
      </Modal>

      {/* Custom Alert for Delete Confirmation */}
      <CustomAlert
        visible={alertVisible}
        message="Are you sure you want to remove this medicine?"
        onClose={cancelDelete}
        showConfirm={true}
        onConfirm={confirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmDestructive={true}
      />

      <CustomAlert
        visible={showCallAlert}
        message={`Do you want to call ${pendingPhone}?`}
        onClose={() => setShowCallAlert(false)}
        showConfirm={true}
        onConfirm={confirmCall}
        confirmText="Call"
        cancelText="Cancel"
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0f9ff' 
  },
  gradient: { 
    flex: 1 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    paddingBottom: 120
  },
  navBar: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 16 
  },
  navContent: { 
    justifyContent: 'right', 
    alignItems: 'center' 
  },
  navTitle: { 
    fontSize: 34, 
    fontWeight: '700', 
    color: '#000' 
  },
  profileButton: { 
    width: 40, 
    height: 40 
  },
  profileGlass: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.5)',
  },
  profileInitial: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#007AFF' 
  },
  heroContainer: { 
    paddingHorizontal: 20, 
    marginBottom: 28 
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  glassOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255,255,255,0.25)' 
  },
  heroContent: { 
    padding: 24, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroGreeting: { 
    fontSize: 15, 
    color: '#8e8e93', 
    marginBottom: 4 
  },
  heroName: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#000', 
    marginBottom: 20 
  },
  heroStats: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  heroStat: { 
    flex: 1, 
    alignItems: 'center'
  },
  heroStatNumber: { 
    fontSize: 30, 
    fontWeight: '700', 
    color: '#007AFF' 
  },
  heroStatLabel: { 
    fontSize: 13, 
    color: '#8e8e93' 
  },
  heroStatDivider: { 
    width: 1, 
    height: 50, 
    backgroundColor: 'rgba(0,0,0,0.08)' 
  },
  section: { 
    paddingHorizontal: 20, 
    marginBottom: 28 
  },
  lastSection: { 
    marginBottom: 40 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#000',
    marginBottom: 12
  },
  scheduleContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20 
  },
  scheduleLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
    marginRight: 12
  },
  timeCircle: {
    width: 64, 
    height: 64, 
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#007AFF',
    textAlign: 'center'
  },
  scheduleInfo: {
    flex: 1
  },
  scheduleMedicine: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#000' 
  },
  scheduleNote: { 
    fontSize: 14, 
    color: '#8e8e93',
    marginTop: 2
  },
  buttonGroup: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  takeButton: { 
    borderRadius: 20, 
    overflow: 'hidden', 
    marginRight: 8, 
    marginBottom: 20
  },
  takenButton: {
    opacity: 0.6
  },
  takeGradient: { 
    paddingHorizontal: 18, 
    paddingVertical: 8 
  },
  takeButtonText: { 
    fontSize: 15, 
    color: '#fff', 
    fontWeight: '600' 
  },
  deleteButton: { 
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  deleteButtonText: { 
    fontSize: 18 
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    marginTop: 8
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8e8e93'
  },
  // --- Hospital Preview Styles (Used on Dashboard) ---
  hospitalPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20
  },
  hospitalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  hospitalIcon: {
    fontSize: 24
  },
  hospitalPreviewInfo: {
    flex: 1,
    marginRight: 12
  },
  hospitalPreviewName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4
  },
  hospitalPreviewLocation: {
    fontSize: 14,
    color: '#8e8e93'
  },
  // --- Status Badges (Reused in List and Preview) ---
  listStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  listStatusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  // --- Button & Search Styles ---
  viewAllButton: {
    backgroundColor: '#9cafcb',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderColor: '#fff',
    height: 70,
    textAlign: 'center',
    justifyContent: 'center'
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    backgroundColor: 'transparent'
  },
  searchGlass: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.13)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  searchIcon: {
    width: 23,
    height: 23,
    marginRight: 12
  },
  search: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500'
  },
  clearIcon: {
    fontSize: 18,
    color: '#9ca3af',
    paddingLeft: 12
  },
  // --- Modal Styles ---
  modalContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 70,
    marginTop: 0
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 28,
    paddingHorizontal: 4
  },
  modalTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5
  },
  closeText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 17
  },
  backText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 17
  },
  modalSearchContainer: {
    marginBottom: 24
  },
  modalSearchGlass: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  modalSearch: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    fontWeight: '500'
  },
  hospitalList: {
    flex: 1
  },
  hospitalItem: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 15
  },
  hospitalItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  hospitalItemLeft: {
    flex: 1,
    marginRight: 12
  },
  hospitalName: { 
    fontSize: 15, 
    color: '#000', 
    fontWeight: '600',
    marginBottom: 4
  },
  hospitalLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  // --- Hospital Details Modal Styles ---
  detailsScrollView: {
    flex: 1
  },
  detailsContent: {
    padding: 20
  },
  detailsHeader: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  detailsIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  detailsIcon: {
    fontSize: 40
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12
  },
  detailsStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16
  },
  detailsStatusText: {
    fontSize: 15,
    fontWeight: '600'
  },
  detailsInfoSection: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20
  },
  detailsInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  detailsInfoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  infoIconText: {
    fontSize: 24,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8e8e93'
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    paddingRight: 20
  },
  callButton: {
    borderRadius: 20, 
    overflow: 'hidden', 
    marginBottom: 12
  },
  callGradient: {
    paddingVertical: 18,
    alignItems: 'center'
  },
  callButtonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '700'
  },
  uberButton: {
    borderRadius: 20, 
    overflow: 'hidden', 
  },
});
