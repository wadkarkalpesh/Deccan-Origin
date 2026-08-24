import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { registerAlertListener } from '../../utils/alertHelper';

const safeOverlay = (COLORS && COLORS.overlay) || 'rgba(18, 30, 21, 0.65)';
const safeCard = (COLORS && COLORS.card) || '#FFFFFF';
const safePrimary = (COLORS && COLORS.primary) || '#1E4D2B';
const safePrimaryDark = (COLORS && COLORS.primaryDark) || '#12361C';
const safePrimaryLight = (COLORS && COLORS.primaryLight) || '#2E7D32';
const safeTextPrimary = (COLORS && COLORS.textPrimary) || '#1A2E1E';
const safeTextSecondary = (COLORS && COLORS.textSecondary) || '#5A6E5D';
const safeBorder = (COLORS && COLORS.border) || '#E2E8E2';
const safeSunGold = (COLORS && COLORS.sunGold) || '#FFA000';
const safeTerracotta = (COLORS && COLORS.terracotta) || '#D84315';
const safeDanger = (COLORS && COLORS.danger) || '#D32F2F';
const safeRadiusXl = (RADIUS && RADIUS.xl) || 28;
const safeRadiusMd = (RADIUS && RADIUS.md) || 14;
const safeSpacingMd = (SPACING && SPACING.md) || 16;
const safeSpacingSm = (SPACING && SPACING.sm) || 8;
const safeSpacingXs = (SPACING && SPACING.xs) || 4;

export default function AlertModal() {
  const [alertConfig, setAlertConfig] = useState(null);

  useEffect(() => {
    const unregister = registerAlertListener((config) => {
      setAlertConfig(config);
    });
    return unregister;
  }, []);

  if (!alertConfig) return null;

  const { title, message, buttons = [{ text: 'OK' }] } = alertConfig;

  const handleButtonPress = (btn) => {
    setAlertConfig(null);
    if (btn && typeof btn.onPress === 'function') {
      btn.onPress();
    }
  };

  // Determine icon based on title / message content
  const lowerTitle = (title || '').toLowerCase();
  let iconName = 'leaf-outline';
  let iconColor = safePrimary;

  if (lowerTitle.includes('error') || lowerTitle.includes('failed') || lowerTitle.includes('quarantine')) {
    iconName = 'alert-circle';
    iconColor = safeDanger;
  } else if (lowerTitle.includes('success') || lowerTitle.includes('created') || lowerTitle.includes('minted') || lowerTitle.includes('published') || lowerTitle.includes('granted') || lowerTitle.includes('locked')) {
    iconName = 'checkmark-circle';
    iconColor = safePrimaryLight;
  } else if (lowerTitle.includes('security') || lowerTitle.includes('dpdp') || lowerTitle.includes('verification')) {
    iconName = 'shield-checkmark';
    iconColor = safeSunGold;
  } else if (lowerTitle.includes('warning') || lowerTitle.includes('notice') || lowerTitle.includes('required')) {
    iconName = 'information-circle';
    iconColor = safeTerracotta;
  }

  return (
    <Modal
      visible={!!alertConfig}
      transparent
      animationType="fade"
      onRequestClose={() => setAlertConfig(null)}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
              <Ionicons name={iconName} size={28} color={iconColor} />
            </View>
            <Text style={styles.titleText}>{title}</Text>
          </View>

          {message ? (
            <Text style={styles.messageText}>{message}</Text>
          ) : null}

          <View style={[styles.buttonContainer, buttons.length > 2 && styles.buttonContainerColumn]}>
            {buttons.map((btn, idx) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              const isPrimary = idx === buttons.length - 1 && !isCancel && !isDestructive;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.button,
                    isPrimary && styles.primaryButton,
                    isCancel && styles.cancelButton,
                    isDestructive && styles.destructiveButton,
                    buttons.length === 2 && { flex: 1 },
                  ]}
                  onPress={() => handleButtonPress(btn)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isPrimary && styles.primaryButtonText,
                      isCancel && styles.cancelButtonText,
                      isDestructive && styles.destructiveButtonText,
                    ]}
                  >
                    {btn.text || 'OK'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: safeOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: safeSpacingMd,
    zIndex: 99999,
  },
  dialogCard: {
    backgroundColor: safeCard,
    borderRadius: safeRadiusXl,
    padding: 24,
    maxWidth: 480,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: safeBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: safeSpacingSm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: safeTextPrimary,
    flex: 1,
    lineHeight: 22,
  },
  messageText: {
    fontSize: 13,
    color: safeTextSecondary,
    lineHeight: 19,
    marginVertical: safeSpacingSm,
    paddingHorizontal: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 18,
  },
  buttonContainerColumn: {
    flexDirection: 'column',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: safeRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  primaryButton: {
    backgroundColor: safePrimary,
  },
  cancelButton: {
    backgroundColor: '#F0F4F0',
  },
  destructiveButton: {
    backgroundColor: '#FFEBEE',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: safePrimary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: safeTextSecondary,
  },
  destructiveButtonText: {
    color: safeDanger,
  },
});
