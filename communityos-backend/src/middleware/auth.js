import { getUserFromToken } from '../config/supabase.js';
import { prisma } from '../db/connection.js';

function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  if (req.cookies?.token) {
    return req.cookies.token;
  }

  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }

  return null;
}

export async function authMiddleware(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Validate the Supabase access token
    const supabaseUser = await getUserFromToken(token);

    if (!supabaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      });
    }

    // Find the corresponding local CommunityOS user
    const user = await prisma.user.findUnique({
      where: {
        id: supabaseUser.id,
      },
      include: {
        roles: true,
        providers: true,
        providerEmployees: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'CommunityOS user account not found',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    req.user = user;
    req.supabaseUser = supabaseUser;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles.map((role) =>
          typeof role === 'string'
            ? role
            : role.role || role.name
        )
      : [];

    const hasRole = allowedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
}

export function getUserId(req) {
  return req.user?.id;
}

export function getTenantId(req) {
  return req.user?.tenantId;
}
