import { prisma } from './connection.js';
import bcryptjs from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create tenant (community/organization)
  const tenant = await prisma.tenant.upsert({
    where: { id: 'green-valley' },
    update: {},
    create: {
      id: 'green-valley',
      name: 'Green Valley Estate',
      slug: 'green-valley',
    },
  });
  console.log('✓ Tenant:', tenant.name);

  // Create community
  const community = await prisma.community.upsert({
    where: { id: 'block-a' },
    update: {},
    create: {
      id: 'block-a',
      tenantId: tenant.id,
      name: 'Block A',
      address: 'Green Valley Estate, Nairobi',
    },
  });
  console.log('✓ Community:', community.name);

  // Create admin user
  const adminHash = await bcryptjs.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@greenvally.com' },
    update: {},
    create: {
      id: 'user-admin-1',
      email: 'admin@greenvally.com',
      passwordHash: adminHash,
      fullName: 'System Admin',
      phone: '+254700000001',
      tenantId: tenant.id,
      roles: {
        create: {
          role: 'PLATFORM_ADMIN',
          tenantId: tenant.id,
        },
      },
    },
  });
  console.log('✓ Admin user:', admin.email);

  // Create manager user
  const managerHash = await bcryptjs.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@greenvally.com' },
    update: {},
    create: {
      id: 'user-manager-1',
      email: 'manager@greenvally.com',
      passwordHash: managerHash,
      fullName: 'John Kipchoge',
      phone: '+254700000002',
      tenantId: tenant.id,
      roles: {
        create: {
          role: 'MANAGER',
          tenantId: tenant.id,
          resourceId: community.id,
        },
      },
    },
  });
  console.log('✓ Manager user:', manager.email);

  // Create resident user
  const residentHash = await bcryptjs.hash('resident123', 10);
  const resident = await prisma.user.upsert({
    where: { email: 'resident@example.com' },
    update: {},
    create: {
      id: 'user-resident-1',
      email: 'resident@example.com',
      passwordHash: residentHash,
      fullName: 'Charles Mosoti',
      phone: '+254700000003',
      tenantId: tenant.id,
      roles: {
        create: {
          role: 'RESIDENT',
          tenantId: tenant.id,
          resourceId: community.id,
        },
      },
    },
  });
  console.log('✓ Resident user:', resident.email);

  // Create provider
  const providerHash = await bcryptjs.hash('provider123', 10);
  const providerUser = await prisma.user.upsert({
    where: { email: 'aquaflow@provider.com' },
    update: {},
    create: {
      id: 'user-provider-1',
      email: 'aquaflow@provider.com',
      passwordHash: providerHash,
      fullName: 'AquaFlow Manager',
      phone: '+254700000004',
      tenantId: tenant.id,
      roles: {
        create: {
          role: 'PROVIDER_REP',
          tenantId: tenant.id,
        },
      },
    },
  });

  const provider = await prisma.provider.upsert({
    where: { id: 'aquaflow-ksh' },
    update: {},
    create: {
      id: 'aquaflow-ksh',
      tenantId: tenant.id,
      companyName: 'AquaFlow Kenya',
      contact: '+254700000004',
      verificationStatus: 'VERIFIED',
      userId: providerUser.id,
    },
  });
  console.log('✓ Provider:', provider.companyName);

  // Create water service
  const waterService = await prisma.service.upsert({
    where: { id: 'water-20l' },
    update: {},
    create: {
      id: 'water-20l',
      tenantId: tenant.id,
      providerId: provider.id,
      name: 'Water Delivery - 20L Jerry Can',
      description: 'Fresh drinking water delivery, 20 liter capacity',
      unitPrice: 50,
      serviceType: 'WATER',
    },
  });
  console.log('✓ Service:', waterService.name);

  console.log('\n✅ Database seeded successfully!');
}

main()
  .then(() => {
    console.log('✓ Seeding complete');
  })
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
