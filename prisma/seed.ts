import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@esset.com' },
    update: {},
    create: {
      email: 'admin@esset.com',
      name: 'System Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      active: true,
    },
  })

  console.log('✓ Created admin user:', admin.email)

  // Create CEO user
  const ceo = await prisma.user.upsert({
    where: { email: 'ceo@esset.com' },
    update: {},
    create: {
      email: 'ceo@esset.com',
      name: 'CEO',
      password: hashedPassword,
      role: 'CEO',
      active: true,
    },
  })

  console.log('✓ Created CEO user:', ceo.email)

  // Create sample users for each role
  const roles = [
    { email: 'purchasing@esset.com', name: 'Purchasing Manager', role: 'PURCHASING' },
    { email: 'security@esset.com', name: 'Security Officer', role: 'SECURITY' },
    { email: 'quality@esset.com', name: 'Quality Inspector', role: 'QUALITY' },
    { email: 'warehouse@esset.com', name: 'Warehouse Manager', role: 'WAREHOUSE' },
    { email: 'plant@esset.com', name: 'Plant Manager', role: 'PLANT_MANAGER' },
    { email: 'export@esset.com', name: 'Export Manager', role: 'EXPORT_MANAGER' },
    { email: 'finance@esset.com', name: 'Finance Manager', role: 'FINANCE' },
  ]

  for (const roleData of roles) {
    const user = await prisma.user.upsert({
      where: { email: roleData.email },
      update: {},
      create: {
        ...roleData,
        password: hashedPassword,
        active: true,
      } as any,
    })
    console.log(`✓ Created ${roleData.role} user:`, user.email)
  }

  console.log('\n✓ Seed completed successfully!')
  console.log('\nYou can login with any of these accounts using password: admin123')
  console.log('- admin@esset.com (Administrator)')
  console.log('- ceo@esset.com (CEO)')
  console.log('- purchasing@esset.com (Purchasing)')
  console.log('- And others...\n')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

