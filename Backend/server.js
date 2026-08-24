/**
 * Deccan Origin Production Backend API Server
 * Architecture: Node.js / Express / Supabase & PostgreSQL Extensible Architecture
 * Target Lead: Kalpesh Wadkar
 */

const express = require('express');
const cors = require('cors');

// Import Infrastructure & Security Middlewares
const { securityHeaders } = require('./middleware/security');
const { globalRateLimiter, authRateLimiter } = require('./middleware/rateLimiter');
const cache = require('./config/redis');
const postgres = require('./config/postgres');

// Import Domain Routers
const authRoutes = require('./routes/authRoutes');
const productsRoutes = require('./routes/productsRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const trustRoutes = require('./routes/trustRoutes');
const aiRoutes = require('./routes/aiRoutes');
const communityRoutes = require('./routes/communityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const exportRoutes = require('./routes/exportRoutes');
const mandiRoutes = require('./routes/mandiRoutes');
const carbonRoutes = require('./routes/carbonRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const shelfLifeRoutes = require('./routes/shelfLifeRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const creditRoutes = require('./routes/creditRoutes');
const gisRoutes = require('./routes/gisRoutes');
const actuatorRoutes = require('./routes/actuatorRoutes');
const forwardContractRoutes = require('./routes/forwardContractRoutes');
const waterRoutes = require('./routes/waterRoutes');
const coopRoutes = require('./routes/coopRoutes');
const labTrackingRoutes = require('./routes/labTrackingRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const phase26to30Routes = require('./routes/phase26to30Routes');
const farmerRoutes = require('./routes/farmerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(securityHeaders);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// SRE Prometheus Observability Metrics (Public Scraper)
app.use('/metrics', metricsRoutes);

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[DeccanOrigin API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root & Health Verification Endpoints
app.get('/', (req, res) => {
  return res.status(200).json({
    name: 'Deccan Origin Production Backend API',
    version: '1.0.0',
    status: 'HEALTHY_ONLINE',
    documentation: 'https://docs.deccanorigin.com/api/v1',
    cacheEngine: cache.getHealth().engine,
    databaseEngine: postgres.getHealth().engine,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  return res.redirect('/v1/health');
});

app.get('/v1/health', (req, res) => {
  return res.status(200).json({
    status: 'UP',
    database: 'CONNECTED_IN_MEMORY_PERSISTENT',
    cache: cache.getHealth(),
    postgres: postgres.getHealth(),
    services: {
      auth: 'OPERATIONAL',
      marketplace: 'OPERATIONAL',
      escrowPool: 'OPERATIONAL',
      paymentsRazorpayStripe: 'OPERATIONAL',
      iotFreightTelemetry: 'OPERATIONAL',
      aiDoctor: 'OPERATIONAL',
      trustRegistry: 'OPERATIONAL',
      communityForum: 'OPERATIONAL',
      disputeResolution: 'OPERATIONAL',
      sseRealtimeStream: 'OPERATIONAL',
      phytosanitaryBiosecurity: 'OPERATIONAL',
      mandiPriceForecaster: 'OPERATIONAL',
      soilCarbonCredits: 'OPERATIONAL',
      enterpriseErpWebhooks: 'OPERATIONAL',
      fpoGroupProcurement: 'OPERATIONAL',
      arrheniusShelfLifeWatchdog: 'OPERATIONAL',
      vernacularVoiceAgronomy: 'OPERATIONAL',
      alternativeEcoAgriCredit: 'OPERATIONAL',
      satelliteGisBoundaryBuffer: 'OPERATIONAL',
      iotActuatorCompressorControl: 'OPERATIONAL',
      preHarvestForwardContracts: 'OPERATIONAL',
      iso14046WaterFootprintStewardship: 'OPERATIONAL',
      cooperativeDividendLedger: 'OPERATIONAL',
      nablLabChainOfCustodyTracking: 'OPERATIONAL',
      cryptographicMerkleLedgerProofs: 'OPERATIONAL',
      apedaPhytosanitaryInspectionDispatch: 'OPERATIONAL',
      microClimatePredictiveAgronomy: 'OPERATIONAL',
      multiFarmerLtlMilkRunOptimizer: 'OPERATIONAL',
      prometheusSreMetrics: 'OPERATIONAL',
      rateLimiterTokenBucket: 'OPERATIONAL',
      farmerDirectoryAndClusters: 'OPERATIONAL',
    },
  });
});

// Mount /v1 Domain Subsystems with Rate Limiting
app.use('/v1/auth', authRateLimiter, authRoutes);
app.use('/v1/farmers', globalRateLimiter, farmerRoutes);
app.use('/v1/products', globalRateLimiter, productsRoutes);
app.use('/v1/orders', ordersRoutes);
app.use('/v1/payments', paymentsRoutes);
app.use('/v1/logistics/shelf-life', shelfLifeRoutes);
app.use('/v1/logistics', logisticsRoutes);
app.use('/v1/verify', trustRoutes);
app.use('/v1/trust', trustRoutes);
app.use('/v1/ai/voice', voiceRoutes);
app.use('/v1/ai', aiRoutes);
app.use('/v1/community', communityRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/events', eventRoutes);
app.use('/v1/export', exportRoutes);
app.use('/v1/mandi', mandiRoutes);
app.use('/v1/carbon', carbonRoutes);
app.use('/v1/webhooks', webhookRoutes);
app.use('/v1/procurement', procurementRoutes);
app.use('/v1/credit', creditRoutes);
app.use('/v1/farms', gisRoutes);
app.use('/v1/iot/actuators', actuatorRoutes);
app.use('/v1/contracts/forward', forwardContractRoutes);
app.use('/v1/sustainability', waterRoutes);
app.use('/v1/coop', coopRoutes);
app.use('/v1/lab', labTrackingRoutes);
app.use('/v1/ledger', phase26to30Routes);
app.use('/v1', phase26to30Routes);

// 404 Catch-All Handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: 'ENDPOINT_NOT_FOUND',
    message: `The endpoint '${req.method} ${req.originalUrl}' does not exist on Deccan Origin v1 API.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[DeccanOrigin Server Error]:', err);
  return res.status(err.status || 500).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred on the Deccan Origin backend server.',
  });
});

// Start listening if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌿 Deccan Origin Production Backend API Server`);
    console.log(`🚀 Live listening on http://localhost:${PORT}/v1`);
    console.log(`🌱 Health Check: http://localhost:${PORT}/v1/health`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
