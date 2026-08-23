import express from 'express';

import authRoutes from './auth.routes.js';
import communitiesRoutes from './communities.routes.js';
import ordersRoutes from './orders.routes.js';
import providerRoutes from './provider.routes.js';
import servicesRoutes from './services.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/communities', communitiesRoutes);
router.use('/orders', ordersRoutes);
router.use('/providers', providerRoutes);
router.use('/services', servicesRoutes);

export default router;