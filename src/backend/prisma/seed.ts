import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.env.SEED_USERNAME
  const password = process.env.SEED_PASSWORD

  if (!username || !password) {
    throw new Error(
      'SEED_USERNAME et SEED_PASSWORD doivent être définis dans le fichier .env avant de lancer le seed.'
    )
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: {
      username,
      passwordHash,
      role: 'admin',
    },
  })

  console.log(`Utilisateur ${username} créé/mis à jour`)
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
