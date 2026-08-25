import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, CATEGORY_THEMES } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import TrustBadge from '../../components/ui/TrustBadge';
import Button from '../../components/ui/Button';
import BulkContractModal from '../../components/BulkContractModal';
import NurseryBatchModal from '../../components/NurseryBatchModal';

import { MOCK_PRODUCTS } from '../../constants/mockData';

const safeBg = (COLORS && COLORS.background) || '#F4F7F4';
const safePrimary = (COLORS && COLORS.primary) || '#1E4D2B';
const safePrimaryDark = (COLORS && COLORS.primaryDark) || '#12361C';
const safeTextPrimary = (COLORS && COLORS.textPrimary) || '#1A2E1E';
const safeTextSecondary = (COLORS && COLORS.textSecondary) || '#5A6E5D';
const safeTextMuted = (COLORS && COLORS.textMuted) || '#8A9E8C';
const safeCard = (COLORS && COLORS.card) || '#FFFFFF';
const safeBorder = (COLORS && COLORS.border) || '#E2E8E2';
const safeAccentLight = (COLORS && COLORS.accentLight) || '#E8F5E9';
const safeTerracotta = (COLORS && COLORS.terracotta) || '#D84315';
const safeRadiusMd = (RADIUS && RADIUS.md) || 14;
const safeRadiusSm = (RADIUS && RADIUS.sm) || 8;
const safeSpacingXs = (SPACING && SPACING.xs) || 4;
const safeSpacingSm = (SPACING && SPACING.sm) || 8;
const safeSpacingMd = (SPACING && SPACING.md) || 16;
const safeSpacingXxl = (SPACING && SPACING.xxl) || 48;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { products, addToCart, formatPrice, t } = useApp();

  // Bulletproof product resolution with offline mock fallback
  const product =
    (products && products.find((p) => String(p.id) === String(id))) ||
    (MOCK_PRODUCTS && MOCK_PRODUCTS.find((p) => String(p.id) === String(id))) ||
    (products && products[0]) ||
    (MOCK_PRODUCTS && MOCK_PRODUCTS[0]) ||
    {};

  const isBulkCategory = product?.category === 'bulkHarvest';
  const [buyMode, setBuyMode] = useState(isBulkCategory ? 'BULK' : 'RETAIL');
  const [qty, setQty] = useState(buyMode === 'BULK' ? (product?.bulkMinTons || 2) : 1);
  const [showContract, setShowContract] = useState(false);
  const [showNurseryBatch, setShowNurseryBatch] = useState(false);

  const isBulk = buyMode === 'BULK';
  const categoryTheme =
    (product?.category && CATEGORY_THEMES && CATEGORY_THEMES[product.category]) ||
    (CATEGORY_THEMES && CATEGORY_THEMES.fertilizers) ||
    { name: 'Organic Product' };

  if (!product || !product.id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: safeTextSecondary, marginBottom: 12 }}>Product information loading or unavailable offline.</Text>
        <Button title="Back to Marketplace" variant="primary" onPress={() => router.push('/(tabs)')} />
      </View>
    );
  }


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollBody}>
      {/* Image Gallery Mockup */}
      <Image source={{ uri: product.image }} style={styles.heroImage} />

      <View style={styles.content}>
        {/* Category & Badge */}
        <View style={styles.badgeRow}>
          <Badge
            label={categoryTheme.name.toUpperCase()}
            variant={product.category}
            size="sm"
          />
          {product.certifiedType === 'LOCAL_GOV' ? (
            <Badge label="LOCAL GOVT SEAL APPROVED" variant="gov" size="sm" style={{ marginLeft: 4 }} />
          ) : (
            <Badge label="NATIONAL ORGANIC STANDARD" variant="trust" size="sm" style={{ marginLeft: 4 }} />
          )}
        </View>

        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.sellerText}>By {product.sellerName} • {product.sellerType}</Text>
        <Text style={styles.originText}>📍 Origin: {product.origin}</Text>

        {/* Multi-Level Trust Badge */}
        <TrustBadge
          certifiedType={product.certifiedType}
          certName={product.certName}
          licenseNo={product.certLicense}
          labPurityRating={product.labPurityRating}
          showQRSeal
        />

        {/* Mode Selector (Retail vs Bulk) */}
        {product.bulkAvailable && (
          <View style={styles.modeSelectorCard}>
            <Text style={styles.modeSelectorTitle}>Choose Order Mode:</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeTab, !isBulk && styles.activeModeTab]}
                onPress={() => {
                  setBuyMode('RETAIL');
                  setQty(1);
                }}
              >
                <Text style={[styles.modeTabText, !isBulk && styles.activeModeTabText]}>
                  Small Retail Pack
                </Text>
                <Text style={styles.modeTabPrice}>{formatPrice(product.retailPrice, false, product.retailUnit)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeTab, isBulk && styles.activeModeTabBulk]}
                onPress={() => {
                  setBuyMode('BULK');
                  setQty(product.bulkMinTons || 2);
                }}
              >
                <Text style={[styles.modeTabText, isBulk && styles.activeModeTabTextBulk]}>
                  Direct Bulk (Tons)
                </Text>
                <Text style={styles.modeTabPriceBulk}>{formatPrice(product.bulkPricePerTon, true)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Price & Quantity Selector */}
        <Card style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <View>
              <Text style={styles.priceLabel}>{isBulk ? 'Bulk Freight Price' : 'Retail Price'}</Text>
              <Text style={isBulk ? styles.bulkPriceText : styles.retailPriceText}>
                {isBulk
                  ? formatPrice(product.bulkPricePerTon, true)
                  : formatPrice(product.retailPrice, false, product.retailUnit)}
              </Text>
            </View>

            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(Math.max(isBulk ? (product.bulkMinTons || 1) : 1, qty - 1))}
              >
                <Ionicons name="remove" size={16} color={safeTextPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>
                {qty} {isBulk ? 'Tons' : product.retailUnit}
              </Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
                <Ionicons name="add" size={16} color={safeTextPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {isBulk && (
            <View style={styles.escrowNote}>
              <Ionicons name="shield-checkmark" size={14} color={safeTerracotta} />
              <Text style={styles.escrowNoteText}>
                Zero Middlemen Direct Freight. Payment held in Escrow until destination lab check.
              </Text>
            </View>
          )}
        </Card>

        {/* Category-Specific Tailored Module Cards */}

        {/* Category 1: Bio-Fertilizers & Soil Inputs */}
        {product.category === 'fertilizers' && (
          <Card bg="#E8F5E9" style={{ marginVertical: safeSpacingSm, borderColor: '#A5D6A7' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="flask" size={20} color="#1B5E20" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#1B5E20' }}>
                Soil Health & N-P-K Nutrient Analysis
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 10, borderRadius: safeRadiusSm, marginBottom: 8 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: safeTextMuted }}>NPK Ratio</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1B5E20' }}>{product.npkRatio || '4:2:1 (Organic)'}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: safeTextMuted }}>Organic Carbon</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1B5E20' }}>&gt; 18.5%</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: safeTextMuted }}>Target Soil pH</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1B5E20' }}>6.5 - 7.8</Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, color: '#2E7D32' }}>
              💡 Application Tip: Mix {product.usageDose || '50 kg / acre'} with irrigation water or moist compost during seed bed preparation.
            </Text>
          </Card>
        )}

        {/* Category 2: Bio-Pesticides & Crop Protection */}
        {product.category === 'bioPesticides' && (
          <Card bg="#E0F2F1" style={{ marginVertical: safeSpacingSm, borderColor: '#80CBC4' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="shield-checkmark" size={20} color="#004D40" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#004D40' }}>
                Botanical Bio-Control & Eco-Safety
              </Text>
            </View>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 12, color: '#00695C', fontWeight: '700' }}>
                🎯 Target Pests: Aphids, Whiteflies, Bollworms, Stem Borers
              </Text>
              <Text style={{ fontSize: 11, color: safeTextSecondary }}>
                🌿 Active Bio-organism: Azadirachtin / Trichoderma Harzianum (10,000 PPM)
              </Text>
              <Text style={{ fontSize: 11, color: '#004D40', fontWeight: '600' }}>
                ✅ Harvest Safety Interval: 0 Days (100% Non-Toxic to Bees & Soil Microbes)
              </Text>
            </View>
          </Card>
        )}

        {/* Category 3: Certified Seeds & Planting Material */}
        {product.category === 'seeds' && (
          <Card bg="#F1F8E9" style={{ marginVertical: safeSpacingSm, borderColor: '#C5E1A5' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="leaf" size={20} color="#33691E" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#33691E' }}>
                Desi Heritage Seed Passport & Quality Assurance
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 8, borderRadius: safeRadiusSm }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#33691E' }}>Germination: 98% Min</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#33691E' }}>Purity: 99.2%</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#33691E' }}>Treated: Bio-Jeevamrutha</Text>
            </View>
          </Card>
        )}

        {/* Category 4: Bulk Harvest Tiered Pricing Table */}
        {product.category === 'bulkHarvest' && (
          <Card bg="#FBE9E7" style={{ marginVertical: safeSpacingSm, borderColor: '#FFAB91' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="bus" size={20} color="#BF360C" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#BF360C' }}>
                B2B Tiered Volume Pricing & APMC Mandi Rates
              </Text>
            </View>
            <View style={{ backgroundColor: '#FFF', borderRadius: safeRadiusSm, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', padding: 8, backgroundColor: '#FFCCBC' }}>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '800', color: '#BF360C' }}>Order Volume</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '800', color: '#BF360C' }}>Price / Ton</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '800', color: '#BF360C' }}>Freight Rebate</Text>
              </View>
              <View style={{ flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderColor: '#FBE9E7' }}>
                <Text style={{ flex: 1, fontSize: 11, color: safeTextPrimary }}>2 - 10 Tons</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: safeTerracotta }}>{formatPrice(product.bulkPricePerTon, true)}</Text>
                <Text style={{ flex: 1, fontSize: 11, color: safeTextSecondary }}>Standard</Text>
              </View>
              <View style={{ flexDirection: 'row', padding: 8 }}>
                <Text style={{ flex: 1, fontSize: 11, color: safeTextPrimary }}>10+ Tons (Direct)</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: safeTerracotta }}>{formatPrice(product.bulkPricePerTon * 0.95, true)}</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: '#2E7D32' }}>5% Bulk Subsidy</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Description & Specifications */}
        <Card style={styles.descCard}>
          <Text style={styles.sectionHeader}>Product Overview</Text>
          <Text style={styles.descText}>{product.description}</Text>

          {product.npkRatio && (
            <View style={styles.specRow}>
              <Text style={styles.specKey}>NPK Composition:</Text>
              <Text style={styles.specVal}>{product.npkRatio}</Text>
            </View>
          )}
          {product.usageDose && (
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Recommended Dose:</Text>
              <Text style={styles.specVal}>{product.usageDose}</Text>
            </View>
          )}
          {product.moistureContent && (
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Moisture Content:</Text>
              <Text style={styles.specVal}>{product.moistureContent}</Text>
            </View>
          )}
        </Card>


        {/* Lab Certification Report & Digital Contract Buttons */}
        <View style={{ flexDirection: 'row', gap: safeSpacingXs, marginVertical: safeSpacingSm }}>
          <Button
            title="📄 Lab CoA Report"
            variant="outline"
            size="md"
            onPress={() => router.push('/trust-center')}
            style={{ flex: 1 }}
          />
          {product.category === 'seeds' ? (
            <Button
              title="🌱 Nursery Batch Quality"
              variant="secondary"
              size="md"
              onPress={() => setShowNurseryBatch(true)}
              style={{ flex: 1 }}
            />
          ) : isBulk ? (
            <Button
              title="✍️ Digital B2B Contract"
              variant="terracotta"
              size="md"
              onPress={() => setShowContract(true)}
              style={{ flex: 1 }}
            />
          ) : null}
        </View>

        <BulkContractModal
          visible={showContract}
          onClose={() => setShowContract(false)}
          itemData={product}
        />

        <NurseryBatchModal
          visible={showNurseryBatch}
          onClose={() => setShowNurseryBatch(false)}
        />

        {/* Actions Footer */}
        <View style={styles.actionsRow}>
          <Button
            title={t('addToCart')}
            variant={isBulk ? 'terracotta' : 'primary'}
            size="lg"
            onPress={() => {
              addToCart(product, isBulk, qty);
              router.push('/cart');
            }}
            style={{ flex: 1, marginRight: safeSpacingSm }}
          />
          <Button
            title="Track Shipping"
            variant="secondary"
            size="lg"
            onPress={() => router.push('/logistics')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: safeBg,
  },
  scrollBody: {
    paddingBottom: safeSpacingXxl,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: safeBorder,
  },
  content: {
    padding: safeSpacingMd,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: safeSpacingXs,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: safeTextPrimary,
  },
  sellerText: {
    fontSize: 12,
    color: safeTextMuted,
    marginTop: 2,
  },
  originText: {
    fontSize: 12,
    color: safeTextSecondary,
    marginBottom: safeSpacingXs,
  },
  modeSelectorCard: {
    backgroundColor: safeCard,
    borderRadius: safeRadiusMd,
    padding: safeSpacingMd,
    borderWidth: 1,
    borderColor: safeBorder,
    marginVertical: safeSpacingXs,
  },
  modeSelectorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: safeTextSecondary,
    marginBottom: safeSpacingXs,
  },
  modeRow: {
    flexDirection: 'row',
    gap: safeSpacingXs,
  },
  modeTab: {
    flex: 1,
    padding: safeSpacingSm,
    borderRadius: safeRadiusSm,
    borderWidth: 1,
    borderColor: safeBorder,
    alignItems: 'center',
  },
  activeModeTab: {
    backgroundColor: safeAccentLight,
    borderColor: safePrimary,
  },
  activeModeTabBulk: {
    backgroundColor: '#FBE9E7',
    borderColor: safeTerracotta,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: safeTextMuted,
  },
  activeModeTabText: {
    color: safePrimary,
    fontWeight: '700',
  },
  activeModeTabTextBulk: {
    color: safeTerracotta,
    fontWeight: '700',
  },
  modeTabPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: safePrimaryDark,
    marginTop: 2,
  },
  modeTabPriceBulk: {
    fontSize: 11,
    fontWeight: '700',
    color: safeTerracotta,
    marginTop: 2,
  },
  priceCard: {
    marginVertical: safeSpacingXs,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: safeTextMuted,
  },
  retailPriceText: {
    fontSize: 22,
    fontWeight: '800',
    color: safePrimaryDark,
  },
  bulkPriceText: {
    fontSize: 22,
    fontWeight: '800',
    color: safeTerracotta,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: safeBg,
    borderRadius: safeRadiusMd,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: safeRadiusSm,
    backgroundColor: safeCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: safeTextPrimary,
    marginHorizontal: safeSpacingSm,
  },
  escrowNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: safeSpacingXs + 2,
    paddingTop: safeSpacingXs,
    borderTopWidth: 1,
    borderTopColor: safeBorder,
  },
  escrowNoteText: {
    fontSize: 11,
    color: safeTerracotta,
    marginLeft: 4,
    fontWeight: '600',
  },
  descCard: {
    marginVertical: safeSpacingXs,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: safeTextPrimary,
    marginBottom: 6,
  },
  descText: {
    fontSize: 13,
    color: safeTextSecondary,
    lineHeight: 18,
    marginBottom: safeSpacingXs,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: safeBorder,
  },
  specKey: {
    fontSize: 12,
    fontWeight: '600',
    color: safeTextSecondary,
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    color: safeTextPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: safeSpacingMd,
  },
});
