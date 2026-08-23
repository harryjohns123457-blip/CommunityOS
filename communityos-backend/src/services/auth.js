import bcryptjs from 'bcryptjs';
import { prisma } from '../db/connection.js';
import { signToken } from '../utils/jwt.js';
import { AuthenticationError, ValidationError } from '../utils/errors.js';
import logger from '../config/logger.js';

export async function registerUser(data) {
  const { email, password, fullName, phone, tenantId, role = 'RESIDENT' } = data;

  const existingUser = await prisma.user.findFirst({
    where: {
      AND: [{ email }, { tenantId }],
    },
  });

  if (existingUser) {
    throw new ValidationError('User already exists in this tenant');
  }

  const passwordHash = await bcryptjs.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone,
      tenantId,
      roles: {
        create: {
          role,
          tenantId,
        },
      },
    },
    include: {
      roles: true,
    },
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: user.roles[0]?.role || role,
  });

  logger.info({ userId: user.id, email: user.email }, 'User registered');

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.roles[0]?.role || role,
    },
  };
}

export async function loginUser(email, password, tenantId) {
  const user = await prisma.user.findFirst({
    where: {
      AND: [{ email }, { tenantId }],
    },
    include: {
      roles: true,
    },
  });

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const passwordMatch = await bcryptjs.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: user.roles[0]?.role || 'RESIDENT',
  });

  logger.info({ userId: user.id, email: user.email }, 'User logged in');

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.roles[0]?.role || 'RESIDENT',
    },
  };
}
