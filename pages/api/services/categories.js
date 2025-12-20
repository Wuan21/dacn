const prisma = require('../../../lib/prisma')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categories = await prisma.service.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category']
      })
      
      return res.status(200).json(categories.map(c => c.category))
    } catch (error) {
      console.error('Error fetching categories:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
