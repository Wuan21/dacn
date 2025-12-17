const prisma = require('../../../lib/prisma')

export default async function handler(req, res){
  if (req.method === 'GET'){
    const list = await prisma.specialty.findMany()
    return res.json(list)
  }
  res.status(405).end()
}
