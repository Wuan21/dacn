const prisma = require('../../../lib/prisma')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { category, isActive, search } = req.query
      
      const where = {}
      
      if (category && category !== 'all') {
        where.category = category
      }
      
      if (isActive === 'true') {
        where.isActive = true
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      }
      
      const services = await prisma.service.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })
      
      return res.status(200).json(services)
    } catch (error) {
      console.error('Error fetching services:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { name, description, price, duration, category, icon, isActive } = req.body
      
      if (!name || !price || !duration || !category) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' })
      }
      
      const service = await prisma.service.create({
        data: {
          name,
          description: description || '',
          price: parseFloat(price),
          duration: parseInt(duration),
          category,
          icon: icon || null,
          isActive: isActive !== false
        }
      })
      
      return res.status(201).json(service)
    } catch (error) {
      console.error('Error creating service:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
