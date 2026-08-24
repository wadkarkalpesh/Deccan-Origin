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
const safePrimaryDark = (COLORS && COLORS.primaryDark) || '#12361C';
const safeTextPrimary = (COLORS && COLORS.textPrimary) || '#1A2E1E';
const safeTextSecondary = (COLORS && COLORS.textSecondary) || '#5A6E5D';
const safeTextMuted = (COLORS && COLORS.textMuted) || '#8A9E8C';
const safeTerracotta = (COLORS && COLORS.terracotta) || '#D84315';

export default function BulkContractModal({ visible, onClose, itemData }) {
  const { t, formatPrice } = useApp();
  const [signed, setSigned] = useState(false);

  const product = itemData || {
    name: 'Organic Sharbati Wheat (Direct Farm Batch)',
    sellerName: 'Swadesh Farmers Collective',
    bulkPricePerTon: 42000,
    bulkMinTons: 10,
    origin: 'Punjab, India',
    certLicense: 'NPOP/NAB/0014/2025',
  };

  const totalContractVal = (product.bulkPricePerTon || 42000) * (product.bulkMinTons || 10);

  const handleSign = () => {
    setSigned(true);
    setTimeout(() => {
      setSigned(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="document-text-outline" size={20} color={safeTerracotta} />
              <Text style={styles.modalTitle}>{t('contractTitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={safeTextPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.badgeRow}>
              <Badge label="MIDDLEMAN-FREE B2B CONTRACT" variant="bulk" size="sm" />
              <Badge label="LEGAL ESCROW PROTECTED" variant="trust" size="sm" style={{ marginLeft: 4 }} />
            </View>

            <View style={styles.contractDocBox}>
              <Text style={styles.docHeading}>CONTRACT AGREEMENT ID: #SWD-B2B-2026-9041</Text>

              <View style={styles.lineRow}>
                <Text style={styles.lineKey}>{t('sellerLabel')}</Text>
                <Text style={styles.lineVal}>{product.sellerName}</Text>
              </View>

              <View style={styles.lineRow}>
                <Text style={styles.lineKey}>{t('buyerLabel')}</Text>
                <Text style={styles.lineVal}>Verified Commercial Buyer</Text>
              </View>

              <View style={styles.lineRow}>
                <Text style={styles.lineKey}>Commodity Item:</Text>
                <Text style={styles.lineVal}>{product.name}</Text>
              </View>

              <View style={styles.lineRow}>
                <Text style={styles.lineKey}>{t('quantityTon')}</Text>
                <Text style={styles.lineVal}>{product.bulkMinTons || 10} Tons</Text>
              </View>

              <View style={styles.lineRow}>
                <Text style={styles.lineKey}>{t('pricePerTon')}</Text>
                <Text style={styles.lineVal}>{formatPrice(product.bulkPricePerTon || 42000, true)}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Contract Value:</Text>
                <Text style={styles.totalVal}>{formatPrice(totalContractVal)}</Text>
              </View>

              <View style={styles.escrowNotice}>
                <Ionicons name="shield-checkmark" size={14} color={safeTerracotta} />
                <Text style={styles.escrowText}>{t('escrowClause')}</Text>
              </View>

              {/* Electronic Touchpad Simulator */}
              <View style={styles.signaturePad}>
                <Text style={styles.sigPlaceholder}>
                  {signed ? '✓ SIGNED BY FARMER & BUYER (HASH: 0x8F92...)' : '✍️ Touchpad E-Signature Area (Draw to Sign)'}
                </Text>
              </View>

              <Button
                title={signed ? '✓ Contract Executed & Sealed!' : t('signContract')}
                variant={signed ? 'secondary' : 'terracotta'}
                size="md"
                onPress={handleSign}
                style={{ marginTop: safeSpacingSm }}
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
  badgeRow: {
    flexDirection: 'row',
    marginBottom: safeSpacingXs,
  },
  contractDocBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: safeRadiusMd,
    padding: safeSpacingMd,
    borderWidth: 1,
    borderColor: '#FFE082',
    marginTop: safeSpacingXs,
  },
  docHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: safePrimaryDark,
    marginBottom: safeSpacingXs,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  lineKey: {
    fontSize: 11,
    color: safeTextSecondary,
  },
  lineVal: {
    fontSize: 11,
    fontWeight: '700',
    color: safeTextPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#FFE082',
    paddingTop: 6,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: safePrimaryDark,
  },
  totalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: safeTerracotta,
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: safeSpacingXs + 2,
  },
  escrowText: {
    fontSize: 10,
    color: safeTerracotta,
    marginLeft: 4,
    fontWeight: '600',
  },
  signaturePad: {
    height: 60,
    backgroundColor: safeCard,
    borderRadius: safeRadiusMd,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: safeTextMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: safeSpacingSm,
  },
  sigPlaceholder: {
    fontSize: 11,
    color: safeTextMuted,
    fontWeight: '600',
  },
});
