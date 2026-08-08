import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (_req, res) => {
  const notes = await prisma.noteSemainier.findMany()
  res.json(notes)
})

router.put('/', async (req, res) => {
  const { horaireId, date, day, period, contenu } = req.body

  const noteExistante = await prisma.noteSemainier.findFirst({
    where: { horaireId, date, day, period },
  })

  if (noteExistante) {
    const noteModifiee = await prisma.noteSemainier.update({
      where: { id: noteExistante.id },
      data: { contenu },
    })
    return res.json(noteModifiee)
  }

  const nouvelleNote = await prisma.noteSemainier.create({
    data: { horaireId, date, day, period, contenu },
  })

  res.json(nouvelleNote)
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.noteSemainier.delete({ where: { id } })
  res.json({ success: true })
})

// Supprime toutes les notes d'un horaire
router.delete('/horaire/:horaireId', async (req, res) => {
  const horaireId = Number(req.params.horaireId)
  await prisma.noteSemainier.deleteMany({ where: { horaireId } })
  res.json({ success: true })
})

export default router