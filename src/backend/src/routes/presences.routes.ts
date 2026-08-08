import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/presences?classeId=1&coursId=2&date=2026-05-23&periode=7&periodeCotation=1
router.get('/', async (req, res) => {
  try {
    const { classeId, coursId, date, periode, periodeCotation, anneeDebut } = req.query

    const where: any = {}
    if (classeId) where.classeId = Number(classeId)
    if (coursId) where.coursId = Number(coursId)
    if (date) where.date = String(date)
    if (periode) where.periode = Number(periode)
    if (periodeCotation) where.periodeCotation = Number(periodeCotation)
    if (anneeDebut) where.anneeDebut = Number(anneeDebut)

    const presences = await prisma.presence.findMany({ where })
    res.json(presences)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des présences' })
  }
})

// POST /api/presences/bulk
router.post('/bulk', async (req, res) => {
  try {
    const { classeId, coursId, date, periode, periodeCotation, anneeDebut, presences } = req.body

    if (!classeId || !coursId || !date || !periode || !periodeCotation || !anneeDebut || !Array.isArray(presences)) {
      return res.status(400).json({ error: 'Données manquantes' })
    }

    const resultats = await Promise.all(
      presences.map((p: { eleveId: number; statut: string }) =>
        prisma.presence.upsert({
          where: {
            eleveId_classeId_coursId_date_periode_anneeDebut: {
              eleveId: p.eleveId,
              classeId: Number(classeId),
              coursId: Number(coursId),
              date: String(date),
              periode: Number(periode),
              anneeDebut: Number(anneeDebut),
            },
          },
          update: {
            statut: p.statut,
            periodeCotation: Number(periodeCotation),
          },
          create: {
            eleveId: p.eleveId,
            classeId: Number(classeId),
            coursId: Number(coursId),
            date: String(date),
            periode: Number(periode),
            periodeCotation: Number(periodeCotation),
            anneeDebut: Number(anneeDebut),
            statut: p.statut,
          },
        })
      )
    )

    res.json(resultats)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erreur lors de l'enregistrement des présences" })
  }
})

// DELETE /api/presences/bulk?classeId=1&coursId=2&date=2026-05-23&periode=7
router.delete('/bulk', async (req, res) => {
  try {
    const { classeId, coursId, date, periode, anneeDebut } = req.query

    if (!classeId || !coursId || !date || !periode || !anneeDebut) {
      return res.status(400).json({ error: 'Données manquantes' })
    }

    await prisma.presence.deleteMany({
      where: {
        classeId: Number(classeId),
        coursId: Number(coursId),
        date: String(date),
        periode: Number(periode),
        anneeDebut: Number(anneeDebut),
      }
    })

    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression présences' })
  }
})

export default router