
import { prisma } from "./src/lib/prisma"

async function checkUsers() {
  const plantManagers = await prisma.user.findMany({
    where: { role: "PLANT_MANAGER" }
  })
  console.log("Plant Managers:", plantManagers)
}

checkUsers()
