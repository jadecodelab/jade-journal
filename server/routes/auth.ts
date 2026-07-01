import { Router } from 'express'

export const authRouter = Router()

authRouter.post('/verify', (req, res) => {
  const { password } = req.body as { password?: string }
  const appPassword = process.env.APP_PASSWORD

  if (!appPassword) {
    res.json({ ok: true })
    return
  }

  if (password === appPassword) {
    res.json({ ok: true })
  } else {
    res.status(401).json({ ok: false, error: 'Incorrect password' })
  }
})
