export default function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email } = req.body || {}
    console.log('API /leads POST:', { name, email })
    return res.status(200).json({ ok: true, message: 'POST received' })
  }
  return res.status(200).json({ ok: true, message: 'GET ok' })
}
