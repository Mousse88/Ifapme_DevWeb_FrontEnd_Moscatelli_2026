import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

function parseSlots(horaire: any) {
  return {
    ...horaire,
    slots: typeof horaire.slots === 'string'
      ? JSON.parse(horaire.slots)
      : (horaire.slots ?? [])
  }
}

router.get('/', async (req, res) => {
  const cours = await prisma.cours.findMany({
    orderBy: { nom: 'asc' }
  })
  res.json(cours)
})

router.post('/', async (req, res) => {
  const { nom } = req.body
  const cours = await prisma.cours.create({
    data: { nom }
  })
  res.status(201).json(cours)
})

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { nom } = req.body

  // Récupère l'ancien nom avant modification
  const ancienCours = await prisma.cours.findUnique({ where: { id } })
  const ancienNom = ancienCours?.nom

  // Met à jour le cours
  const cours = await prisma.cours.update({
    where: { id },
    data: { nom }
  })

  // Met à jour tous les slots des horaires qui contiennent l'ancien nom
  if (ancienNom && ancienNom !== nom) {
    const horaires = await prisma.horaire.findMany()
    for (const horaire of horaires) {
      const parsed = parseSlots(horaire)
      const slotsModifies = parsed.slots.map((slot: any) =>
        slot.cours === ancienNom ? { ...slot, cours: nom } : slot
      )
      // Sauvegarder seulement si des slots ont changé
      const aChange = parsed.slots.some((s: any) => s.cours === ancienNom)
      if (aChange) {
        await prisma.horaire.update({
          where: { id: horaire.id },
          data: { slots: slotsModifies }
        })
      }
    }
  }

  res.json(cours)
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.cours.delete({ where: { id } })
  res.sendStatus(204)
})

export default router