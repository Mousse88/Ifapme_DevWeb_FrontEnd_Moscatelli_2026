import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

router.get('/', async (req, res) => {
  const classeId = req.query.classeId ? Number(req.query.classeId) : undefined

  const eleves = await prisma.eleve.findMany({
    where: classeId ? { classeId } : undefined,
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }]
  })

  res.json(eleves)
})

router.post('/', async (req, res) => {
  const { classeId, nom, prenom, dateNaissance } = req.body

  const eleve = await prisma.eleve.create({
    data: { classeId, nom, prenom, dateNaissance }
  })

  res.status(201).json(eleve)
})

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { classeId, nom, prenom, dateNaissance } = req.body

  const eleve = await prisma.eleve.update({
    where: { id },
    data: { classeId, nom, prenom, dateNaissance }
  })

  res.json(eleve)
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  await prisma.eleve.delete({
    where: { id }
  })

  res.sendStatus(204)
})

export default router