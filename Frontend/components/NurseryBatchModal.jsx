import React from 'react';
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
import { useApp } from '../context/AppContext';
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

export default function NurseryBatchModal({ visible, onClose }) {
  const { t } = useApp();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="leaf-outline" size={20} color={safePrimary} />
              <Text style={styles.modalTitle}>{t('nurseryTitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={safeTextPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.batchCard}>
              <Badge label="NURSERY BOARD CERTIFIED" variant="success" size="sm" />
              <Text style={styles.lotText}>{t('batchLotNo')} #LOT-2026-SEEDS-882</Text>

              <View style={styles.metricRow}>
                <Text style={styles.metricKey}>{t('germinationRate')}</Text>
                <Text style={styles.metricVal}>98.4% (Ultra High)</Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricKey}>{t('purityScore')}</Text>
                <Text style={styles.metricVal}>99.1% Non-GMO Organic</Text>
              </View>

              <Button
                title="✓ Close Seed Quality Report"
                variant="primary"
                size="md"
                onPress={onClose}
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
  batchCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: safeRadiusMd,
    padding: safeSpacingMd,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  lotText: {
    fontSize: 12,
    fontWeight: '800',
    color: safePrimaryDark,
    marginVertical: safeSpacingXs,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  metricKey: {
    fontSize: 11,
    color: safeTextSecondary,
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '700',
    color: safePrimary,
  },
});
