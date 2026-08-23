import { prisma } from '../db/connection.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../config/logger.js';

export async function getProviders(tenantId) {
  const providers = await prisma.provider.findMany({
    where: { tenantId },
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
          phone: true,
        },
      },
      services: true,
      employees: true,
    },
  });

  return providers;
}

export async function getProviderById(providerId, tenantId) {
  const provider = await prisma.provider.findFirst({
    where: {
      AND: [{ id: providerId }, { tenantId }],
    },
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
          phone: true,
        },
      },
      services: true,
      employees: true,
    },
  });

  if (!provider) {
    throw new NotFoundError('Provider');
  }

  return provider;
}

export async function getProviderOrders(providerId, tenantId, status = null) {
  const where = {
    AND: [{ providerId }, { tenantId }],
  };

  if (status) {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          service: true,
        },
      },
      resident: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders;
}
