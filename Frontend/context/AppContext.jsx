import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import {
  MOCK_PRODUCTS,
  MOCK_SHIPMENTS,
  MOCK_COMMUNITY_POSTS,
  MOCK_CERTIFICATIONS,
  MOCK_COMMODITY_PRICES,
} from '../constants/mockData';
import apiClient from '../utils/apiClient';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import supabaseService from '../services/supabaseService';
import showAlert from '../utils/alertHelper';
import {
  saveStorageData,
  getStorageData,
  removeStorageData,
  STORAGE_KEYS,
} from '../utils/storage';

const AppContext = createContext();

const PERSONA_PROFILES = {
  farmer: {
    id: 'usr_farmer_01',
    name: 'Ramesh Patel',
    phone: '+91 98230 11200',
    email: 'ramesh.patel@deccanorigin.com',
    persona: 'farmer',
    roles: ['farmer', 'seller'],
    verified: true,
    state: 'Madhya Pradesh',
    district: 'Ujjain',
    village: 'Pipliya Ragho',
    farmSizeAcres: 18,
    primaryCrops: ['Organic Sharbati Wheat', 'Desi Cotton', 'Bio-Mustard'],
    certifications: ['NPOP/NAB/0014/2025', 'Jaivik Bharat MP-991'],
    fpoName: 'Malwa Narmada Organic Farmers Producer Co. Ltd.',
    soilHealthCardId: 'SHC-MP-UJJ-2025-09142',
    onboardingCompleted: true,
    dpdpConsent: true,
    createdAt: '2026-01-15T08:30:00Z',
  },
  consumer: {
    id: 'usr_consumer_01',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya.sharma@deccanorigin.com',
    persona: 'consumer',
    roles: ['buyer', 'consumer'],
    verified: true,
    state: 'Maharashtra',
    district: 'Pune',
    address: 'Kalyani Nagar, Pune, Maharashtra',
    onboardingCompleted: true,
    dpdpConsent: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
  bulkBuyer: {
    id: 'usr_bulk_01',
    name: 'Baldev Singh',
    phone: '+91 94120 55678',
    email: 'baldev.singh@fpoagro.in',
    persona: 'bulkBuyer',
    roles: ['buyer', 'bulkBuyer'],
    verified: true,
    state: 'Punjab',
    district: 'Ludhiana',
    extraDetail: 'AgroFlour Milling & Food Processing Corp',
    gstin: '03AAAAA0000A1Z5',
    onboardingCompleted: true,
    dpdpConsent: true,
    createdAt: '2026-01-20T12:00:00Z',
  },
  seller: {
    id: 'usr_seller_01',
    name: 'Dr. Vivek Deshmukh',
    phone: '+91 98900 33441',
    email: 'vivek@biofertindia.com',
    persona: 'seller',
    roles: ['seller', 'manufacturer'],
    verified: true,
    state: 'Maharashtra',
    district: 'Nashik',
    extraDetail: 'BioFert Organic Inputs & Seed Laboratories Ltd.',
    certifications: ['NABL-BIO-2026-44', 'NPOP/NAB/0019/2025'],
    onboardingCompleted: true,
    dpdpConsent: true,
    createdAt: '2026-01-10T09:15:00Z',
  },
  expert: {
    id: 'usr_expert_01',
    name: 'Dr. Anita Roy',
    phone: '+91 98310 99887',
    email: 'anita.roy@icar.gov.in',
    persona: 'expert',
    roles: ['expert', 'moderator'],
    verified: true,
    state: 'Delhi',
    district: 'New Delhi',
    extraDetail: 'Senior Organic Agronomist & ICAR Research Council Member',
    onboardingCompleted: true,
    dpdpConsent: true,
    createdAt: '2026-01-05T14:20:00Z',
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Platform Oversight Governance',
    phone: '+91 99000 00001',
    email: 'admin@deccanorigin.com',
    persona: 'admin',
    roles: ['admin', 'moderator'],
    verified: true,
    state: 'National Platform Council',
    district: 'India Hub',
    onboardingCompleted: true,
    dpdpConsent: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
};

export function AppProvider({ children }) {
  // Authentication Guard State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Localization & Persona State
  const [language, setLanguage] = useState('en');
  const [persona, setPersona] = useState('farmer'); // 'farmer' | 'consumer' | 'bulkBuyer' | 'seller' | 'expert' | 'admin'

  // Load persistent user session on mount
  useEffect(() => {
    const initAuthSession = async () => {
      try {
        const savedAuth = await getStorageData(STORAGE_KEYS.IS_AUTHENTICATED, null);
        const savedUser = await getStorageData(STORAGE_KEYS.USER_SESSION, null);

        if (savedAuth === true && savedUser) {
          setIsAuthenticated(true);
          setCurrentUser(savedUser);
          if (savedUser.persona) setPersona(savedUser.persona);
        } else if (savedAuth === false) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        } else {
          // Default initial session for first launch
          setIsAuthenticated(true);
          setCurrentUser(PERSONA_PROFILES.farmer);
          saveStorageData(STORAGE_KEYS.IS_AUTHENTICATED, true);
          saveStorageData(STORAGE_KEYS.USER_SESSION, PERSONA_PROFILES.farmer);
        }
      } catch (_e) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setAuthInitialized(true);
      }
    };
    initAuthSession();
  }, []);

  const loginUser = (userPayload, token = null) => {
    setIsAuthenticated(true);
    setCurrentUser(userPayload);
    if (userPayload?.persona) {
      setPersona(userPayload.persona);
    }
    if (token && apiClient && apiClient.auth) {
      // Set bearer token
    }
    saveStorageData(STORAGE_KEYS.IS_AUTHENTICATED, true);
    saveStorageData(STORAGE_KEYS.USER_SESSION, userPayload);
  };

  const registerUser = async (registrationPayload) => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.register(registrationPayload);
      const userPayload = (res && res.user) || {
        id: `usr-${Date.now()}`,
        name: registrationPayload.name,
        email: registrationPayload.identifier && registrationPayload.identifier.includes('@') ? registrationPayload.identifier : `${registrationPayload.identifier}@deccanorigin.com`,
        phone: registrationPayload.identifier && !registrationPayload.identifier.includes('@') ? registrationPayload.identifier : '+91 98765 43210',
        persona: registrationPayload.persona || 'farmer',
        state: registrationPayload.state,
        district: registrationPayload.district,
        onboardingCompleted: true,
      };

      setIsAuthenticated(true);
      setCurrentUser(userPayload);
      if (userPayload.persona) setPersona(userPayload.persona);

      saveStorageData(STORAGE_KEYS.IS_AUTHENTICATED, true);
      saveStorageData(STORAGE_KEYS.USER_SESSION, userPayload);
      return { success: true, user: userPayload };
    } catch (err) {
      console.warn('[AppContext] Register fallback:', err.message);
      const fallbackUser = {
        id: `usr-${Date.now()}`,
        name: registrationPayload.name || 'Deccan Member',
        persona: registrationPayload.persona || 'farmer',
        onboardingCompleted: true,
      };
      setIsAuthenticated(true);
      setCurrentUser(fallbackUser);
      saveStorageData(STORAGE_KEYS.IS_AUTHENTICATED, true);
      saveStorageData(STORAGE_KEYS.USER_SESSION, fallbackUser);
      return { success: true, user: fallbackUser };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    if (apiClient && apiClient.auth && apiClient.auth.logout) {
      await apiClient.auth.logout();
    }
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (_e) {}
    }
    await removeStorageData(STORAGE_KEYS.USER_SESSION);
    await saveStorageData(STORAGE_KEYS.IS_AUTHENTICATED, false);
  };
  const [currency, setCurrency] = useState('inr'); // 'inr' | 'usd' | 'eur' | 'aud'
  
  // Platform Order Mode: RETAIL (Kg/Lit) vs BULK (Tons)
  const [orderMode, setOrderMode] = useState('RETAIL'); // 'RETAIL' | 'BULK'

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [certFilter, setCertFilter] = useState('ALL'); // 'ALL' | 'NATIONAL' | 'LOCAL_GOV'

  // Dynamic Data Lists with Initial Fallbacks
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [shipments, setShipments] = useState(MOCK_SHIPMENTS);
  const [communityPosts, setCommunityPosts] = useState(MOCK_COMMUNITY_POSTS);
  const [certifications, setCertifications] = useState(MOCK_CERTIFICATIONS);
  const [commodityTrends, setCommodityTrends] = useState(MOCK_COMMODITY_PRICES);
  const [orders, setOrders] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  // i18n Translation helper
  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  // Currency Converter helper
  const formatPrice = (amountInINR, isBulk = false, unit = 'Kg') => {
    let rate = 1;
    let symbol = '₹';

    if (currency === 'usd') {
      rate = 0.012;
      symbol = '$';
    } else if (currency === 'eur') {
      rate = 0.011;
      symbol = '€';
    } else if (currency === 'aud') {
      rate = 0.018;
      symbol = 'A$';
    }

    const converted = Math.round(amountInINR * rate);
    if (isBulk) {
      return `${symbol}${converted.toLocaleString()} / Ton`;
    }
    return `${symbol}${converted.toLocaleString()} / ${unit}`;
  };

  // Fetch Live Data from Supabase / Backend API on Boot
  const fetchAllLiveData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check Supabase Products first if configured
      if (isSupabaseConfigured()) {
        const sbProducts = await supabaseService.getProducts();
        if (sbProducts && sbProducts.length > 0) {
          setProducts(sbProducts);
          setServerOnline(true);
        }
      }

      // 1. Fetch Products from API / fallback
      const prodRes = await apiClient.products.getProducts().catch(() => null);
      if (prodRes && prodRes.products && prodRes.products.length > 0) {
        setProducts((prev) => (prev && prev.length > 0 && isSupabaseConfigured() ? prev : prodRes.products));
        setServerOnline(true);
      }

      // 2. Fetch Commodity Trends
      const trendRes = await apiClient.products.getCommodityTrends().catch(() => null);
      if (trendRes && trendRes.trends && trendRes.trends.length > 0) {
        setCommodityTrends(trendRes.trends);
      }

      // 3. Fetch Certifications
      const certRes = await apiClient.trust.getCertifications().catch(() => null);
      if (certRes && certRes.certifications && certRes.certifications.length > 0) {
        setCertifications(certRes.certifications);
      }

      // 4. Fetch Community Posts
      const postRes = await apiClient.community.getPosts().catch(() => null);
      if (postRes && postRes.posts && postRes.posts.length > 0) {
        setCommunityPosts(postRes.posts);
      }

      // 5. Fetch Orders
      const orderRes = await apiClient.orders.getOrders().catch(() => null);
      if (orderRes && orderRes.orders) {
        setOrders(orderRes.orders);
      }

      // 6. Fetch Admin Overview
      const adminRes = await apiClient.admin.getOverview().catch(() => null);
      if (adminRes && adminRes.metrics) {
        setAdminMetrics(adminRes.metrics);
      }
    } catch (err) {
      console.warn('[AppContext] Live sync notice:', err.message);
      setServerOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Supabase Auth Listener
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await supabaseService.getProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          if (profile.persona) setPersona(profile.persona);
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchAllLiveData();
  }, [fetchAllLiveData]);

  // Cart Functions
  const addToCart = (product, isBulk = false, quantity = 1) => {
    setCart((prev) => {
      const itemKey = `${product.id}-${isBulk ? 'bulk' : 'retail'}`;
      const existing = prev.find((i) => i.itemKey === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.itemKey === itemKey ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          itemKey,
          product,
          isBulk,
          quantity,
          unitPrice: isBulk ? product.bulkPricePerTon : product.retailPrice,
          unit: isBulk ? 'Ton' : product.retailUnit,
        },
      ];
    });
  };

  const removeFromCart = (itemKey) => {
    setCart((prev) => prev.filter((i) => i.itemKey !== itemKey));
  };

  const updateCartQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.itemKey === itemKey ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  // Live Mutations
  const createEscrowOrder = async (orderData) => {
    try {
      const res = await apiClient.orders.createEscrowOrder(orderData);
      if (res && res.orderId) {
        setOrders((prev) => [res, ...prev]);
        clearCart();
      }
      return res;
    } catch (err) {
      console.warn('[AppContext] createEscrowOrder fallback:', err.message);
      clearCart();
      return { success: true, orderId: `ORD-${Date.now()}` };
    }
  };

  const publishProductListing = async (newProduct) => {
    try {
      const res = await apiClient.products.createProduct(newProduct);
      if (res && res.product) {
        setProducts((prev) => [res.product, ...prev]);
      }
      return res;
    } catch (err) {
      const fallbackProd = { id: `prod-${Date.now()}`, ...newProduct };
      setProducts((prev) => [fallbackProd, ...prev]);
      return { success: true, product: fallbackProd };
    }
  };

  const addCommunityPost = async (newPost) => {
    const optimisticPost = {
      id: `post-${Date.now()}`,
      author: 'Current User',
      role: persona.toUpperCase(),
      verifiedExpert: persona === 'expert',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      upvotes: 0,
      repliesCount: 0,
      date: 'Just now',
      ...newPost,
    };
    setCommunityPosts((prev) => [optimisticPost, ...prev]);

    try {
      const res = await apiClient.community.createPost(newPost);
      if (res && res.post) {
        setCommunityPosts((prev) => [res.post, ...prev.filter((p) => p.id !== optimisticPost.id)]);
      }
      return res;
    } catch (_err) {
      return { success: true, post: optimisticPost };
    }
  };

  const upvoteCommunityPost = async (postId) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p))
    );
    try {
      await apiClient.community.upvotePost(postId);
    } catch (_err) {}
  };

  const changeLanguage = (langCode) => setLanguage(langCode);
  
  const changePersona = async (newPersona) => {
    setPersona(newPersona);
    if (PERSONA_PROFILES[newPersona]) {
      setCurrentUser((prev) => ({
        ...PERSONA_PROFILES[newPersona],
        ...(prev && prev.name && !prev.id?.startsWith('usr_') ? { name: prev.name, email: prev.email, phone: prev.phone } : {}),
      }));
    }
    try {
      await apiClient.auth.switchPersona(newPersona);
    } catch (_err) {}
  };

  const changeCurrency = (newCurrency) => setCurrency(newCurrency);

  return (
    <AppContext.Provider
      value={{
        authInitialized,
        isAuthenticated,
        currentUser,
        loginUser,
        registerUser,
        logoutUser,
        language,
        changeLanguage,
        t,
        persona,
        changePersona,
        currency,
        changeCurrency,
        formatPrice,
        orderMode,
        setOrderMode,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        certFilter,
        setCertFilter,
        products,
        setProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        shipments,
        setShipments,
        communityPosts,
        setCommunityPosts,
        addCommunityPost,
        upvoteCommunityPost,
        certifications,
        setCertifications,
        commodityTrends,
        orders,
        createEscrowOrder,
        publishProductListing,
        adminMetrics,
        isLoading,
        serverOnline,
        supabase,
        supabaseService,
        isSupabaseConfigured,
        showAlert,
        refreshAllData: fetchAllLiveData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
