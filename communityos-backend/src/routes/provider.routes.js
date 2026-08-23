import express from 'express';

import { authMiddleware, requireRole } from '../middleware/auth.js';
import { prisma } from '../db/connection.js';

const router = express.Router();

/**
 * Provider dashboard
 */
router.get(
  '/dashboard',
  authMiddleware,
  requireRole('PROVIDER_REP', 'PROVIDER', 'MANAGER', 'ADMIN'),
  async (req, res, next) => {
    try {
      const tenantId = req.user.tenantId;

      const providers = await prisma.provider.findMany({
        where: {
          tenantId,
        },
        include: {
          services: true,
        },
        orderBy: {
  companyName: 'asc',
},
      });

      res.json({
        success: true,
        data: {
          providers,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * List providers
 */
router.get(
  '/',
  authMiddleware,
  async (req, res, next) => {
    try {
      const providers = await prisma.provider.findMany({
        where: {
          tenantId: req.user.tenantId,
        },
        include: {
          services: true,
        },
       orderBy: {
  companyName: 'asc',
},
      });

      res.json({
        success: true,
        data: providers,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get provider
 */
router.get(
  '/:id',
  authMiddleware,
  async (req, res, next) => {
    try {
      const provider = await prisma.provider.findFirst({
        where: {
          id: req.params.id,
          tenantId: req.user.tenantId,
        },
        include: {
          services: true,
          employees: true,
        },
      });

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Provider not found',
        });
      }

      res.json({
        success: true,
        data: provider,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;