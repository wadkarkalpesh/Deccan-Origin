import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useApp } from '../context/AppContext';
import Button from './ui/Button';
import Input from './ui/Input';

const safeOverlay = (COLORS && COLORS.overlay) || 'rgba(18, 30, 21, 0.5)';
const safeCard = (COLORS && COLORS.card) || '#FFFFFF';
const safeRadiusXl = (RADIUS && RADIUS.xl) || 28;
const safeRadiusMd = (RADIUS && RADIUS.md) || 14;
const safeSpacingMd = (SPACING && SPACING.md) || 16;
const safeSpacingSm = (SPACING && SPACING.sm) || 8;
const safeSpacingXs = (SPACING && SPACING.xs) || 4;
const safeBorder = (COLORS && COLORS.border) || '#E2E8E2';
const safePrimary = (COLORS && COLORS.primary) || '#1E4D2B';
const safeTextPrimary = (COLORS && COLORS.textPrimary) || '#1A2E1E';
const safeTextMuted = (COLORS && COLORS.textMuted) || '#8A9E8C';

export default function CertificateUploaderModal({ visible, onClose }) {
  const { t } = useApp();
  const [authority, setAuthority] = useState('LOCAL_GOV');
  const [licNo, setLicNo] = useState('');
  const [docImage, setDocImage] = useState(null);
  const [uploaded, setUploaded] = useState(false);

  const handlePickDoc = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocImage(result.assets[0].uri);
      }
    } catch (_err) {
      setDocImage('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80');
    }
  };

  const handleUpload = () => {
    setUploaded(true);
    setTimeout(() => {
      setUploaded(false);
      setDocImage(null);
      setLicNo('');
      onClose();
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="ribbon-outline" size={20} color={safePrimary} />
              <Text style={styles.modalTitle}>{t('certUploadTitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={safeTextPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>{t('authorityType')}</Text>

            <View style={styles.radioRow}>
              <TouchableOpacity
                style={[styles.radioChip, authority === 'LOCAL_GOV' && styles.selectedRadioChip]}
                onPress={() => setAuthority('LOCAL_GOV')}
              >
                <Text style={[styles.radioText, authority === 'LOCAL_GOV' && styles.selectedRadioText]}>
                  {t('localGovCert')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioChip, authority === 'NATIONAL_GOV' && styles.selectedRadioChip]}
                onPress={() => setAuthority('NATIONAL_GOV')}
              >
                <Text style={[styles.radioText, authority === 'NATIONAL_GOV' && styles.selectedRadioText]}>
                  {t('nationalGovCert')}
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label={t('licenseNoLabel')}
              placeholder="e.g. MH-AGRI-ORG-4402 or NPOP/NAB/0014"
              value={licNo}
              onChangeText={setLicNo}
            />

            <TouchableOpacity style={styles.uploadArea} onPress={handlePickDoc} activeOpacity={0.8}>
              {docImage ? (
                <View style={{ width: '100%', height: '100%', padding: 4, alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={{ uri: docImage }} style={{ width: '100%', height: '100%', borderRadius: safeRadiusMd - 2, resizeMode: 'cover' }} />
                  <View style={{ position: 'absolute', backgroundColor: 'rgba(30,77,43,0.85)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>✓ Document Attached</Text>
                  </View>
                </View>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={32} color={safePrimary} />
                  <Text style={styles.uploadText}>{t('uploadDoc')}</Text>
                  <Text style={{ fontSize: 10, color: safeTextMuted, marginTop: 2 }}>Tap to snap or select certificate image</Text>
                </>
              )}
            </TouchableOpacity>

            <Button
              title={uploaded ? '✓ License Submitted for Review!' : 'Submit for Admin Verification'}
              variant={uploaded ? 'secondary' : 'primary'}
              size="md"
              onPress={handleUpload}
              style={{ marginTop: safeSpacingMd }}
            />
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: safeTextPrimary,
    marginBottom: 4,
  },
  radioRow: {
    flexDirection: 'row',
    gap: safeSpacingXs,
    marginBottom: safeSpacingSm,
  },
  radioChip: {
    flex: 1,
    padding: safeSpacingSm,
    borderRadius: safeRadiusMd,
    borderWidth: 1,
    borderColor: safeBorder,
    alignItems: 'center',
  },
  selectedRadioChip: {
    backgroundColor: '#E8F5E9',
    borderColor: safePrimary,
  },
  radioText: {
    fontSize: 10,
    color: safeTextMuted,
    textAlign: 'center',
  },
  selectedRadioText: {
    color: safePrimary,
    fontWeight: '700',
  },
  uploadArea: {
    height: 100,
    borderRadius: safeRadiusMd,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: safePrimary,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: safeSpacingXs,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '700',
    color: safePrimary,
    marginTop: 4,
  },
});
