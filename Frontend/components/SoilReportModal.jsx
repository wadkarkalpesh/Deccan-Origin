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
import Input from './ui/Input';

const safeOverlay = (COLORS && COLORS.overlay) || 'rgba(18, 30, 21, 0.5)';
const safeCard = (COLORS && COLORS.card) || '#FFFFFF';
const safeRadiusXl = (RADIUS && RADIUS.xl) || 28;
const safeRadiusMd = (RADIUS && RADIUS.md) || 14;
const safeRadiusFull = (RADIUS && RADIUS.full) || 9999;
const safeSpacingMd = (SPACING && SPACING.md) || 16;
const safeSpacingSm = (SPACING && SPACING.sm) || 8;
const safeSpacingXs = (SPACING && SPACING.xs) || 4;
const safeBorder = (COLORS && COLORS.border) || '#E2E8E2';
const safePrimary = (COLORS && COLORS.primary) || '#1E4D2B';
const safePrimaryDark = (COLORS && COLORS.primaryDark) || '#12361C';
const safeTextPrimary = (COLORS && COLORS.textPrimary) || '#1A2E1E';
const safeTextSecondary = (COLORS && COLORS.textSecondary) || '#5A6E5D';
const safeTextMuted = (COLORS && COLORS.textMuted) || '#8A9E8C';
const safeTextLight = (COLORS && COLORS.textLight) || '#FFFFFF';

export default function SoilReportModal({ visible, onClose }) {
  const { t } = useApp();
  const [ph, setPh] = useState('6.8');
  const [nitrogen, setNitrogen] = useState('0.42');
  const [phosphorus, setPhosphorus] = useState('18');
  const [potassium, setPotassium] = useState('140');
  const [soc, setSoc] = useState('0.65');
  const [scorecard, setScorecard] = useState(null);

  const handleGenerateScorecard = () => {
    const phNum = parseFloat(ph) || 7.0;
    const socNum = parseFloat(soc) || 0.5;

    let healthScore = 75;
    if (phNum >= 6.5 && phNum <= 7.5) healthScore += 10;
    if (socNum >= 0.75) healthScore += 15;
    else if (socNum < 0.5) healthScore -= 10;

    setScorecard({
      score: Math.min(100, Math.max(40, healthScore)),
      phStatus: phNum < 6.0 ? 'Acidic (Needs Lime)' : phNum > 7.8 ? 'Alkaline (Needs Gypsum)' : 'Optimal Balanced pH',
      socStatus: socNum < 0.5 ? 'Low Soil Organic Carbon' : 'Moderate SOC',
      recommendations: [
        'Apply 250 Kg/Acre Vermicompost to raise Soil Organic Carbon (SOC).',
        'Incorporate Bio-Active Liquid NPK via drip irrigation to boost microbial activity.',
        'Spray 5ml/L Cold-Pressed Neem Oil to prevent soil nematodes naturally.',
      ],
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="analytics-outline" size={20} color={safePrimary} />
              <Text style={styles.modalTitle}>{t('soilReportTitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={safeTextPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionSub}>
              Enter lab test values or field meter readings to generate an instant Soil Health Scorecard:
            </Text>

            <View style={styles.inputGrid}>
              <Input
                label="Soil pH (4.0 - 9.0)"
                value={ph}
                onChangeText={setPh}
                keyboardType="numeric"
                style={{ flex: 1, marginRight: 4 }}
              />
              <Input
                label="Organic Carbon SOC %"
                value={soc}
                onChangeText={setSoc}
                keyboardType="numeric"
                style={{ flex: 1, marginLeft: 4 }}
              />
            </View>

            <View style={styles.inputGrid}>
              <Input
                label="Nitrogen N %"
                value={nitrogen}
                onChangeText={setNitrogen}
                keyboardType="numeric"
                style={{ flex: 1, marginRight: 4 }}
              />
              <Input
                label="Phosphorus P (PPM)"
                value={phosphorus}
                onChangeText={setPhosphorus}
                keyboardType="numeric"
                style={{ flex: 1, marginLeft: 4 }}
              />
            </View>

            <Input
              label="Potassium K (PPM)"
              value={potassium}
              onChangeText={setPotassium}
              keyboardType="numeric"
            />

            <Button
              title="🔬 Generate Soil Health Scorecard"
              variant="primary"
              size="md"
              onPress={handleGenerateScorecard}
              style={{ marginTop: safeSpacingXs }}
            />

            {scorecard && (
              <View style={styles.scorecardBox}>
                <View style={styles.scoreHeader}>
                  <View>
                    <Text style={styles.scoreTitle}>{t('soilScoreLabel')}</Text>
                    <Text style={styles.scoreSub}>{scorecard.phStatus}</Text>
                  </View>
                  <View style={styles.scoreBadgeCircle}>
                    <Text style={styles.scoreValText}>{scorecard.score}/100</Text>
                  </View>
                </View>

                <Text style={styles.recTitle}>{t('recAction')}</Text>
                {scorecard.recommendations.map((rec, idx) => (
                  <Text key={idx} style={styles.recText}>
                    {idx + 1}. {rec}
                  </Text>
                ))}
              </View>
            )}
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
    fontSize: 16,
    fontWeight: '800',
    color: safeTextPrimary,
    marginLeft: 6,
  },
  scrollContent: {
    paddingVertical: safeSpacingXs,
  },
  sectionSub: {
    fontSize: 11,
    color: safeTextMuted,
    marginBottom: safeSpacingXs,
  },
  inputGrid: {
    flexDirection: 'row',
  },
  scorecardBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: safeRadiusMd,
    padding: safeSpacingMd,
    marginTop: safeSpacingMd,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: safeSpacingXs,
    paddingBottom: safeSpacingXs,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: safePrimaryDark,
  },
  scoreSub: {
    fontSize: 11,
    color: safeTextSecondary,
  },
  scoreBadgeCircle: {
    width: 48,
    height: 48,
    borderRadius: safeRadiusFull,
    backgroundColor: safePrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValText: {
    fontSize: 12,
    fontWeight: '800',
    color: safeTextLight,
  },
  recTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: safePrimaryDark,
    marginVertical: 4,
  },
  recText: {
    fontSize: 11,
    color: safeTextPrimary,
    marginVertical: 2,
    lineHeight: 15,
  },
});
