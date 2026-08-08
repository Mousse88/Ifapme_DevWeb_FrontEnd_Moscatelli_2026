import { Router } from 'express'
import { prisma } from '../prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' })
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// Route temporaire pour créer le compte admin — À SUPPRIMER APRÈS UTILISATION !
router.post('/reset', async (req, res) => {
  const { username, password } = req.body
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash: hash },
    create: { username, passwordHash: hash, role: 'admin' }
  })
  res.json({ message: 'OK', username: user.username })
})

export default router