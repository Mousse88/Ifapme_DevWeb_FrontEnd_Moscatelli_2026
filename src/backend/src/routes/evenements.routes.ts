import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

router.get('/', async (req, res) => {
  const evenements = await prisma.evenementCalendrier.findMany({
    orderBy: { dateDebut: 'asc' }
  })

  res.json(evenements)
})

router.post('/', async (req, res) => {
  const {
    titre,
    type,
    jourEntier,
    dateDebut,
    dateFin,
    heureDebut,
    heureFin,
    emplacement,
    description,
    couleur
  } = req.body

  const evenement = await prisma.evenementCalendrier.create({
    data: {
      titre,
      type,
      jourEntier,
      dateDebut,
      dateFin,
      heureDebut,
      heureFin,
      emplacement,
      description,
      couleur
    }
  })

  res.status(201).json(evenement)
})

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)

  const {
    titre,
    type,
    jourEntier,
    dateDebut,
    dateFin,
    heureDebut,
    heureFin,
    emplacement,
    description,
    couleur
  } = req.body

  const evenement = await prisma.evenementCalendrier.update({
    where: { id },
    data: {
      titre,
      type,
      jourEntier,
      dateDebut,
      dateFin,
      heureDebut,
      heureFin,
      emplacement,
      description,
      couleur
    }
  })

  res.json(evenement)
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  await prisma.evenementCalendrier.delete({
    where: { id }
  })

  res.sendStatus(204)
})

export default router