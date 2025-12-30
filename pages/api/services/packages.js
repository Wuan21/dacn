const prisma = require('../../../lib/prisma')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { isActive, search, popular } = req.query
      
      const where = {}
      
      if (isActive === 'true') {
        where.isActive = true
      }
      
      if (popular === 'true') {
        where.isPopular = true
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      }
      
      const packages = await prisma.servicepackage.findMany({
        where,
        include: {
          items: {
            orderBy: { displayOrder: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      return res.status(200).json(packages)
    } catch (error) {
      console.error('Error fetching service packages:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { name, description, price, duration, icon, isActive, isPopular, items } = req.body
      
      if (!name || !price || !duration) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' })
      }
      
      const packageData = {
        name,
        description: description || '',
        price: parseFloat(price),
        duration: parseInt(duration),
        icon: icon || '🏥',
        isActive: isActive !== false,
        isPopular: isPopular === true
      }
      
      // Nếu có items, tạo cùng lúc
      if (items && Array.isArray(items) && items.length > 0) {
        packageData.items = {
          create: items.map((item, index) => ({
            name: item.name,
            description: item.description || '',
            category: item.category || '',
            displayOrder: item.displayOrder !== undefined ? item.displayOrder : index
          }))
        }
      }
      
      const servicePackage = await prisma.servicepackage.create({
        data: packageData,
        include: {
          items: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      })
      
      return res.status(201).json(servicePackage)
    } catch (error) {
      console.error('Error creating service package:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
