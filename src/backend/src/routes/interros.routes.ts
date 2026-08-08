import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

router.get('/', async (req, res) => {
  const classeId = req.query.classeId ? Number(req.query.classeId) : undefined
  const coursId = req.query.coursId ? Number(req.query.coursId) : undefined
  const periode = req.query.periode ? Number(req.query.periode) : undefined

  const interros = await prisma.interro.findMany({
    where: {
      classeId,
      coursId,
      periode
    },
    orderBy: { id: 'asc' }
  })

  res.json(interros)
})

router.post('/', async (req, res) => {
  const { classeId, coursId, periode, titre, nombrePoints } = req.body

  const interro = await prisma.interro.create({
    data: { classeId, coursId, periode, titre, nombrePoints }
  })

  res.status(201).json(interro)
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  await prisma.interro.delete({
    where: { id }
  })

  res.sendStatus(204)
})

export default router