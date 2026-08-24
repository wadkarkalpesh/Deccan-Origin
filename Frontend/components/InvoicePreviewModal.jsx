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
const safePrimaryDark = (COLORS && COLORS.primaryDark) || '#12361C';
const safeTextPrimary = (COLORS && COLORS.textPrimary) || '#1A2E1E';
const safeTextSecondary = (COLORS && COLORS.textSecondary) || '#5A6E5D';
const safeSunGold = (COLORS && COLORS.sunGold) || '#FFA000';
const safeSuccess = (COLORS && COLORS.success) || '#2E7D32';

export default function InvoicePreviewModal({ visible, onClose }) {
  const { t, cart, formatPrice } = useApp();

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 42000);
  const taxGST = subtotal * 0.05;
  const grandTotal = subtotal + taxGST;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="receipt-outline" size={20} color={safePrimaryDark} />
              <Text style={styles.modalTitle}>{t('invoiceTitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={safeTextPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.invoiceSheet}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.brandTitle}>ECO SWADESH B2B MANDI</Text>
                  <Text style={styles.invNo}>{t('invoiceNo')} #INV-2026-88021</Text>
                </View>
                <Badge label="VERIFIED GST INVOICE" variant="gov" size="sm" />
              </View>

              <View style={styles.taxBox}>
                <Text style={styles.taxHeading}>{t('taxBreakdown')}</Text>
                <View style={styles.rowItem}>
                  <Text style={styles.keyText}>Base Items Subtotal:</Text>
                  <Text style={styles.valText}>{formatPrice(subtotal)}</Text>
                </View>

                <View style={styles.rowItem}>
                  <Text style={styles.keyText}>5% Agro Bio-Input GST Tax:</Text>
                  <Text style={styles.valText}>{formatPrice(taxGST)}</Text>
                </View>

                <View style={[styles.rowItem, styles.grandRow]}>
                  <Text style={styles.grandKey}>Landed Invoice Total:</Text>
                  <Text style={styles.grandVal}>{formatPrice(grandTotal)}</Text>
                </View>
              </View>

              <View style={styles.escrowStatusBox}>
                <Ionicons name="lock-closed" size={18} color={safeSuccess} />
                <View style={{ marginLeft: safeSpacingXs, flex: 1 }}>
                  <Text style={styles.escrowHead}>{t('escrowReceipt')}</Text>
                  <Text style={styles.escrowSub}>Funds locked in escrow pool until destination quality check.</Text>
                </View>
              </View>

              <Button
                title="📥 Download PDF Tax Invoice"
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
  invoiceSheet: {
    backgroundColor: '#F4F7F4',
    borderRadius: safeRadiusMd,
    padding: safeSpacingMd,
    borderWidth: 1,
    borderColor: safeBorder,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: safeSpacingSm,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: safePrimaryDark,
  },
  invNo: {
    fontSize: 10,
    color: safeTextSecondary,
  },
  taxBox: {
    backgroundColor: safeCard,
    borderRadius: safeRadiusMd,
    padding: safeSpacingSm,
    borderWidth: 1,
    borderColor: safeBorder,
  },
  taxHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: safeTextSecondary,
    marginBottom: 4,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  keyText: {
    fontSize: 11,
    color: safeTextSecondary,
  },
  valText: {
    fontSize: 11,
    fontWeight: '600',
    color: safeTextPrimary,
  },
  grandRow: {
    borderTopWidth: 1,
    borderTopColor: safeBorder,
    paddingTop: 4,
    marginTop: 4,
  },
  grandKey: {
    fontSize: 12,
    fontWeight: '800',
    color: safePrimaryDark,
  },
  grandVal: {
    fontSize: 14,
    fontWeight: '800',
    color: safeSunGold,
  },
  escrowStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: safeRadiusMd,
    padding: safeSpacingSm,
    marginTop: safeSpacingSm,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  escrowHead: {
    fontSize: 11,
    fontWeight: '700',
    color: safeSuccess,
  },
  escrowSub: {
    fontSize: 10,
    color: safeTextSecondary,
  },
});
