import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    let parametres = await prisma.parametres.findFirst()
    if (!parametres) {
      const anneeParDefaut = new Date().getMonth() < 7
        ? new Date().getFullYear() - 1
        : new Date().getFullYear()
      parametres = await prisma.parametres.create({
        data: {
          anneeDebut: anneeParDefaut,
          periodeActive: 1,
          anneesCreees: JSON.stringify([anneeParDefaut]),
        }
      })
    }
    res.json({
      anneeDebut: parametres.anneeDebut,
      periodeActive: parametres.periodeActive,
      anneesCreees: JSON.parse(parametres.anneesCreees),
    })
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération paramètres' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { anneeDebut, periodeActive, anneesCreees } = req.body
    const existant = await prisma.parametres.findFirst()
    if (existant) {
      const mis = await prisma.parametres.update({
        where: { id: existant.id },
        data: {
          anneeDebut: Number(anneeDebut),
          periodeActive: Number(periodeActive),
          anneesCreees: JSON.stringify(anneesCreees),
        }
      })
      res.json({ anneeDebut: mis.anneeDebut, periodeActive: mis.periodeActive, anneesCreees: JSON.parse(mis.anneesCreees) })
    } else {
      const cree = await prisma.parametres.create({
        data: {
          anneeDebut: Number(anneeDebut),
          periodeActive: Number(periodeActive),
          anneesCreees: JSON.stringify(anneesCreees),
        }
      })
      res.json({ anneeDebut: cree.anneeDebut, periodeActive: cree.periodeActive, anneesCreees: JSON.parse(cree.anneesCreees) })
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur sauvegarde paramètres' })
  }
})

export default router