import { PrismaClient, JuteBagSize } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const bags = [
    { size: JuteBagSize.KG_60, quantity: 1000, price: 50, lowStockAlert: 100 },
    { size: JuteBagSize.KG_50, quantity: 1000, price: 45, lowStockAlert: 100 },
    { size: JuteBagSize.KG_30, quantity: 1000, price: 30, lowStockAlert: 100 },
    { size: JuteBagSize.KG_85, quantity: 500, price: 60, lowStockAlert: 50 },
  ]

  for (const bag of bags) {
    await prisma.juteBagInventory.upsert({
      where: { size: bag.size },
      update: {},
      create: {
        size: bag.size,
        quantity: bag.quantity,
        pricePerBag: bag.price,
        lowStockAlert: bag.lowStockAlert,
      },
    })
  }

  console.log('Jute bag inventory seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
