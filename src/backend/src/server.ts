import express from 'express'
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

import coursRoutes from './routes/cours.routes'
import classesRoutes from './routes/classes.routes'
import elevesRoutes from './routes/eleves.routes'
import interrosRoutes from './routes/interros.routes'
import notesRoutes from './routes/notes.routes'
import horairesRoutes from './routes/horaires.routes'
import evenementsRoutes from './routes/evenements.routes'
import authRoutes from './routes/auth.routes'
import semainierNotesRoutes from './routes/semainierNotes'
import presencesRoutes from './routes/presences.routes'
import parametresRoutes from './routes/parametres.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/cours', coursRoutes)
app.use('/api/classes', classesRoutes)
app.use('/api/eleves', elevesRoutes)
app.use('/api/interros', interrosRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/horaires', horairesRoutes)
app.use('/api/evenements', evenementsRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/semainier-notes', semainierNotesRoutes)
app.use('/api/presences', presencesRoutes)
app.use('/api/parametres', parametresRoutes)

app.get('/', (req, res) => {
  res.send('API TFE fonctionne')
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`API lancée sur http://localhost:${PORT}`)
})