import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

// Fonction utilitaire pour parser les slots
function parseSlots(horaire: any) {
  return {
    ...horaire,
    slots: typeof horaire.slots === 'string'
      ? JSON.parse(horaire.slots)
      : (horaire.slots ?? [])
  }
}

router.get('/', async (req, res) => {
  const horaires = await prisma.horaire.findMany({
    orderBy: { id: 'desc' }
  })

  res.json(horaires.map(parseSlots))  // ← parser chaque horaire
})

router.post('/', async (req, res) => {
  const { nom, startDate, endDate, slots } = req.body

  const horaire = await prisma.horaire.create({
    data: {
      nom,
      startDate,
      endDate,
      slots: slots ?? []  // ← s'assurer que c'est pas undefined
    }
  })

  res.status(201).json(parseSlots(horaire))  // ← parser avant d'envoyer
})

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { nom, startDate, endDate, slots } = req.body

  const horaire = await prisma.horaire.update({
    where: { id },
    data: { nom, startDate, endDate, slots: slots ?? [] }
  })

  res.json(parseSlots(horaire))  // ← parser avant d'envoyer
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  await prisma.horaire.delete({ where: { id } })

  res.sendStatus(204)
})

export default router