import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = 'pscsuper47@gmail.com';
const SUPER_ADMIN_PASSWORD = 'super123';
const SUPER_ADMIN_NAME = 'PSC Super Admin';

async function main() {
  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  const admin = await prisma.admin.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      name: SUPER_ADMIN_NAME,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      updatedBy: 'seed-super-admin',
    },
    create: {
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      createdBy: 'seed-super-admin',
      updatedBy: 'seed-super-admin',
    },
  });

  console.log(
    `Super admin ready: ${admin.email} (${admin.role})`,
  );
}

main()
  .catch((error) => {
    console.error('Failed to seed super admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
