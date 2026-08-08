import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

router.get('/', async (req, res) => {
  const classes = await prisma.classe.findMany({
    include: { cours: true },
    orderBy: { nom: 'asc' }
  })

  res.json(
    classes.map(classe => ({
      id: classe.id,
      nom: classe.nom,
      coursIds: classe.cours.map(c => c.coursId)
    }))
  )
})

router.post('/', async (req, res) => {
  const { nom, coursIds } = req.body

  const classe = await prisma.classe.create({
    data: {
      nom,
      cours: {
        create: coursIds.map((coursId: number) => ({
          cours: { connect: { id: coursId } }
        }))
      }
    },
    include: { cours: true }
  })

  res.status(201).json({
    id: classe.id,
    nom: classe.nom,
    coursIds: classe.cours.map(c => c.coursId)
  })
})

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { nom, coursIds } = req.body

  await prisma.classeCours.deleteMany({
    where: { classeId: id }
  })

  const classe = await prisma.classe.update({
    where: { id },
    data: {
      nom,
      cours: {
        create: coursIds.map((coursId: number) => ({
          cours: { connect: { id: coursId } }
        }))
      }
    },
    include: { cours: true }
  })

  res.json({
    id: classe.id,
    nom: classe.nom,
    coursIds: classe.cours.map(c => c.coursId)
  })
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  await prisma.classe.delete({
    where: { id }
  })

  res.sendStatus(204)
})

export default router