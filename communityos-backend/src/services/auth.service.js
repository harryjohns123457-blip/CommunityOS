import { getDb } from '../db/connection.js';
import { getSupabase } from '../config/supabase.js';

export const AuthService = {
  /**
   * Register a new user using Supabase Auth
   * and create the matching local CommunityOS user.
   */
  async register(email, password, fullName, phone, role = 'resident') {
    const supabase = getSupabase();
    const prisma = getDb();

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || null,
        phone: phone || null,
        role,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const supabaseUser = data.user;

    if (!supabaseUser) {
      throw new Error('Supabase user was not created');
    }

    // Use a tenant ID for the MVP.
    // This can later come from the registration request.
    const tenantId = 'default';

    // Create local CommunityOS user
    const user = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        tenantId,
        email: supabaseUser.email,
        passwordHash: '',
        fullName: fullName || null,
        phone: phone || null,
        isActive: true,
      },
    });

    // Convert API role to Prisma enum
    const roleMap = {
      resident: 'RESIDENT',
      manager: 'MANAGER',
      provider: 'PROVIDER_REP',
      worker: 'WORKER',
    };

    const prismaRole = roleMap[role];

    if (prismaRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          tenantId,
          role: prismaRole,
        },
      });
    }

    return user;
  },

  /**
   * Login using Supabase Auth.
   */
  async login(email, password) {
    const supabase = getSupabase();

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error('Login failed');
    }

    const prisma = getDb();

    const localUser = await prisma.user.findUnique({
      where: {
        id: data.user.id,
      },
    });

    return {
      token: data.session.access_token,
      user: localUser || data.user,
    };
  },

  /**
   * Get the current local CommunityOS user.
   */
  async getCurrentUser(userId) {
    const prisma = getDb();

    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        roles: true,
        providers: true,
        providerEmployees: true,
      },
    });
  },

  /**
   * Link an existing Supabase user to the local user table.
   */
  async linkUser(supabaseUser, tenantId, roles = []) {
    const prisma = getDb();

    const data = {
      id: supabaseUser.id,
      tenantId: tenantId || 'default',
      email: supabaseUser.email,
      passwordHash: '',
      fullName:
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        null,
      phone: supabaseUser.user_metadata?.phone || null,
      isActive: true,
    };

    const existing = await prisma.user.findUnique({
      where: {
        id: supabaseUser.id,
      },
    });

    if (!existing) {
      await prisma.user.create({
        data,
      });
    } else {
      await prisma.user.update({
        where: {
          id: supabaseUser.id,
        },
        data,
      });
    }

    for (const r of roles) {
      const exists = await prisma.userRole.findFirst({
        where: {
          userId: supabaseUser.id,
          role: r.role,
          resourceId: r.resourceId || null,
        },
      });

      if (!exists) {
        await prisma.userRole.create({
          data: {
            userId: supabaseUser.id,
            tenantId: tenantId || 'default',
            role: r.role,
            resourceId: r.resourceId || null,
          },
        });
      }
    }

    return prisma.user.findUnique({
      where: {
        id: supabaseUser.id,
      },
    });
  },
};
