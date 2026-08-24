import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import Button from './ui/Button';
import Badge from './ui/Badge';

const safeOverlay = (COLORS && COLORS.overlay) || 'rgba(18, 30, 21, 0.5)';
const safeCard = (COLORS && COLORS.card) || '#FFFFFF';
const safeRadiusXl = (RADIUS && RADIUS.xl) || 28;
const safeRadiusMd = (RADIUS && RADIUS.md) || 14;
const safeSpacingMd = (SPACING && SPACING.md) || 16;
const safeSpacingSm = (SPACING && SPACING.sm) || 8;
const safeSpacingXs = (SPACING && SPACING.xs) || 4;
const safeBorder = (COLORS && COLORS.border) || '#E2E8E2';
const safePrimary = (COLORS && COLORS.primary) || '#1E4D2B';
const safePrimaryDark = (COLORS && COLORS.primaryDark) || '#12361C';
const safeTextPrimary = (COLORS && COLORS.textPrimary) || '#1A2E1E';
const safeTextSecondary = (COLORS && COLORS.textSecondary) || '#5A6E5D';

export default function ExpertBookingModal({ visible, onClose, expertData }) {
  const [booked, setBooked] = useState(false);

  const expert = expertData || {
    name: 'Dr. Ramesh Sharma, PhD',
    title: 'Senior Agronomist & Organic Soil Scientist',
    experience: '18 Years Experience',
    fee: '₹499 / 30 Min Video Audit',
  };

  const handleConfirm = () => {
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="school-outline" size={20} color={safePrimary} />
              <Text style={styles.modalTitle}>Book Agronomist Consultation</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={safeTextPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.expertCard}>
              <Badge label="VERIFIED AGRI-SCIENTIST" variant="gov" size="sm" />
              <Text style={styles.nameText}>{expert.name}</Text>
              <Text style={styles.titleText}>{expert.title}</Text>
              <Text style={styles.expText}>📍 {expert.experience}</Text>
              <Text style={styles.feeText}>Consultation Fee: {expert.fee}</Text>

              <Button
                title={booked ? '✓ Video Audit Session Booked!' : 'Confirm Video Call Booking'}
                variant={booked ? 'secondary' : 'primary'}
                size="md"
                onPress={handleConfirm}
                style={{ marginTop: safeSpacingMd }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: safeOverlay,
    justifyContent: 'center',
    padding: safeSpacingMd,
  },
  modalCard: {
    backgroundColor: safeCard,
    borderRadius: safeRadiusXl,
    padding: safeSpacingMd,
    maxHeight: '85%',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: safeSpacingSm,
    paddingBottom: safeSpacingXs,
    borderBottomWidth: 1,
    borderBottomColor: safeBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: safeTextPrimary,
    marginLeft: 6,
  },
  scrollContent: {
    paddingVertical: safeSpacingXs,
  },
  expertCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: safeRadiusMd,
    padding: safeSpacingMd,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
    color: safePrimaryDark,
    marginTop: safeSpacingXs,
  },
  titleText: {
    fontSize: 12,
    color: safeTextSecondary,
  },
  expText: {
    fontSize: 11,
    color: safeTextSecondary,
    marginTop: 2,
  },
  feeText: {
    fontSize: 13,
    fontWeight: '800',
    color: safePrimary,
    marginTop: safeSpacingXs,
  },
});
