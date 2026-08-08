import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

router.get('/', async (req, res) => {
  const notes = await prisma.note.findMany()
  res.json(notes)
})

router.put('/', async (req, res) => {
  const { interroId, eleveId, pointsObtenus } = req.body

  const note = await prisma.note.upsert({
    where: {
      interroId_eleveId: {
        interroId,
        eleveId
      }
    },
    update: {
      pointsObtenus
    },
    create: {
      interroId,
      eleveId,
      pointsObtenus
    }
  })

  res.json(note)
})

export default router