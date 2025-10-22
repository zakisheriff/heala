import CustomAlert from '@/components/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { deleteUser, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import auth from '../firebaseConfig';

const { width } = Dimensions.get('window');

export default function ProfileSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('logout'); // 'logout' | 'delete' | 'error' | 'info'

  const [emailSent, setEmailSent] = useState(false);

  const user = auth.currentUser;

  const userInfo = {
    name: user?.displayName || 'Ze',
    email: user?.email || '',
    phone: '+94 77 123 4567',
    dob: '15 March 1995',
    gender: 'Male',
    bloodGroup: 'O+',
  };

  // ================= Handlers =================

  const handleLogout = () => {
    setAlertType('logout');
    setAlertMessage('Are you sure you want to logout?');
    setAlertVisible(true);
  };

  const handleDeleteAccount = () => {
    setAlertType('delete');
    setAlertMessage('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.');
    setAlertVisible(true);
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
    if (alertType === 'logout') handleLogoutConfirmed();
    else if (alertType === 'delete') handleDeleteConfirmed();
  };

  const handleUpgrade = () => {
    console.log('Navigate to subscription');
  };

  const handleLogoutConfirmed = () => {
    signOut(auth)
      .then(() => router.navigate('/login'))
      .catch((error) => {
        setAlertMessage(`Logout Error: ${error.message}`);
        setAlertType('error');
        setAlertVisible(true);
      });
  };

  const handleDeleteConfirmed = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    deleteUser(currentUser)
      .then(() => router.replace('/login'))
      .catch((error) => {
        if (error.code === 'auth/requires-recent-login') {
          setAlertMessage('Please log out and log in again before deleting your account.');
        } else {
          setAlertMessage(`Delete Error: ${error.message}`);
        }
        setAlertType('error');
        setAlertVisible(true);
      });
  };

  const handleResetPassword = () => {
    const emailToSend = resetEmail || user?.email;
    if (!emailToSend) {
      setAlertMessage("No email found for this account.");
      setAlertType('error');
      setAlertVisible(true);
      return;
    }

    sendPasswordResetEmail(auth, emailToSend)
      .then(() => {
        setEmailSent(true);
        setAlertMessage("Password reset email sent! Check your inbox.");
        setAlertType('info');
        setAlertVisible(true);
        setShowResetPasswordModal(false);
        setResetEmail('');
      })
      .catch((error) => {
        if (error.code === "auth/user-not-found") setAlertMessage("No account found with this email.");
        else setAlertMessage("Failed to send reset email. Please try again.");
        setAlertType('error');
        setAlertVisible(true);
      });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
              colors={['#e8f4ff', '#f5f0ff', '#fff5f5', '#f0fff4']}
              locations={[0, 0.3, 0.6, 1]}
              style={{ flex: 1 }}
              >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.headerSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userInfo.name[0]}</Text>
              </View>
            </View>
            <Text style={styles.profileName}>{userInfo.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
        </View>

        {/* Premium Glass Card */}
        <View style={styles.section}>
          <View style={styles.premiumGlassCard}>
            <View style={styles.premiumContent}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>✨ FREE PLAN</Text>
              </View>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumSubtitle}>
                Unlock unlimited storage, advanced analytics, and priority support
              </Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><Text style={styles.featureIcon}>☁️</Text></View>
                  <Text style={styles.featureText}>Unlimited Storage</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><Text style={styles.featureIcon}>📊</Text></View>
                  <Text style={styles.featureText}>Analytics</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}><Text style={styles.featureIcon}>💊</Text></View>
                  <Text style={styles.featureText}>Reminders</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                <Text style={styles.upgradeArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Personal Info Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Personal Information</Text>
          <View style={styles.infoGrid}>
            {[
              { label: 'Full Name', value: userInfo.name, icon: '👤' },
              { label: 'Birthday', value: userInfo.dob, icon: '🎂' },
              { label: 'Gender', value: userInfo.gender, icon: '♂' },
              { label: 'Blood Group', value: userInfo.bloodGroup, icon: '🩸' },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.infoGridCard}>
                <View style={styles.infoIconContainer}><Text style={styles.infoIcon}>{item.icon}</Text></View>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account Settings</Text>
          <View style={styles.glassCard}>
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listIconContainer}><Text style={styles.listIcon}>📧</Text></View>
              <View style={styles.listContent}>
                <Text style={styles.listLabel}>Email Address</Text>
                <Text style={styles.listValue}>{userInfo.email}</Text>
              </View>
              <Text style={styles.listChevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.listItem} onPress={() => setShowResetPasswordModal(true)}>
              <View style={styles.listIconContainer}><Text style={styles.listIcon}>🔐</Text></View>
              <Text style={styles.listLabel}>Change Password</Text>
              <Text style={styles.listChevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences</Text>
          <View style={styles.glassCard}>
            <View style={styles.listItem}>
              <View style={styles.listIconContainer}><Text style={styles.listIcon}>🔔</Text></View>
              <Text style={styles.listLabel}>Notifications</Text>
              <Switch style={{ marginLeft: 'auto' }} value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#E5E7EB', true: '#10B981' }} thumbColor='#fff' ios_backgroundColor="#E5E7EB"/>
            </View>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Legal</Text>
          <View style={styles.glassCard}>
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listIconContainer}><Text style={styles.listIcon}>📋</Text></View>
              <Text style={styles.listLabel}>Privacy Policy</Text>
              <Text style={styles.listChevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listIconContainer}><Text style={styles.listIcon}>📄</Text></View>
              <Text style={styles.listLabel}>Terms of Service</Text>
              <Text style={styles.listChevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout & Delete */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}><Text style={styles.logoutText}>Sign Out</Text></TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}><Text style={styles.deleteText}>Delete Account</Text></TouchableOpacity>
        </View>

        <View style={styles.footer}><Text style={styles.footerText}>Heala v1.0.0 </Text></View>
      </ScrollView>

     

      {/* Reset Password Modal */}
      <Modal visible={showResetPasswordModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowResetPasswordModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Reset Password</Text>

            <Text style={{ textAlign: 'center', marginBottom: 16 }}>
              A password reset link will be sent to your registered email:
            </Text>

            <View
              style={{
                backgroundColor: '#F3F4F6',
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                {user?.email || 'No email found'}
              </Text>
            </View>

            <TouchableOpacity style={styles.upgradeButton} onPress={handleResetPassword}>
              <Text style={[styles.upgradeButtonText, { marginRight: 0 }]}>
                Send Reset Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancelButton, { marginTop: 10 }]}
              onPress={() => setShowResetPasswordModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        showConfirm={alertType === 'logout' || alertType === 'delete'}
        onConfirm={handleAlertConfirm}
        confirmText={alertType === 'delete' ? 'Delete' : 'Logout'}
        confirmDestructive={true}
      />
      </LinearGradient>
    </View>
  );
}

// ================ Styles (extended) ================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 130 },
  headerSection: { paddingHorizontal: 20, paddingTop: 70, paddingBottom: 20 },
  profileCard: { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 32, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.08, shadowRadius: 40, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)' },
  avatarContainer: { position: 'relative', marginBottom: 20 },
  avatarGlow: { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 56, backgroundColor: 'rgba(99, 102, 241, 0.15)' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  avatarText: { fontSize: 42, fontWeight: '700', color: '#fff' },
  profileName: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  profileEmail: { fontSize: 15, color: '#6B7280', marginBottom: 24, paddingHorizontal: 50 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  listIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  listIcon: { fontSize: 20 },
  listContent: { flex: 1 },
  listLabel: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  listValue: { fontSize: 14, color: '#6B7280' },
  listChevron: { fontSize: 24, color: '#D1D5DB', marginLeft: 8 },
  separator: { height: 1, backgroundColor: 'rgba(229, 231, 235, 0.5)', marginLeft: 80 },
  logoutButton: { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 20, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginBottom: 10 },
  logoutText: { fontSize: 17, fontWeight: '700', color: '#DC2626' },
  deleteButton: { backgroundColor: 'rgba(127, 29, 29, 0.08)', borderRadius: 20, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(127, 29, 29, 0.2)', marginBottom: 20 },
  deleteText: { fontSize: 17, fontWeight: '700', color: '#7F1D1D' },
  footer: { alignItems: 'center', paddingVertical: 16, },
  footerText: { color: '#9CA3AF'},

  premiumGlassCard: { backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: 32, padding: 20, marginBottom: 24 },
  premiumContent: {},
  premiumBadge: { backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 10 },
  premiumBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  premiumTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  premiumSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  featuresGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  featureItem: { alignItems: 'center', width: '30%' },
  featureIconContainer: { backgroundColor: '#fff', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  featureIcon: { fontSize: 22 },
  featureText: { fontSize: 12, textAlign: 'center' },
  upgradeButton: { backgroundColor: '#6366F1', borderRadius: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  upgradeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16, marginRight: 8 },
  upgradeArrow: { color: '#fff', fontWeight: '700', fontSize: 16 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  infoGridCard: { backgroundColor: 'rgba(255,255,255,0.7)', width: (width - 60) / 2, borderRadius: 20, padding: 16, marginBottom: 16 },
  infoIconContainer: { backgroundColor: '#E5E7EB', borderRadius: 10, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  infoIcon: { fontSize: 18 },
  infoLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#1F2937' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  checkContainer: { backgroundColor: '#6366F1', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  modalCancelButton: { backgroundColor: '#E5E7EB', borderRadius: 20, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  modalCancelText: { fontWeight: '700', color: '#1F2937' },
  input: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, marginBottom: 12 }
});
