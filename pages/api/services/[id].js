const prisma = require('../../../lib/prisma')

export default async function handler(req, res) {
  const { id } = req.query
  const serviceId = parseInt(id)
  
  if (isNaN(serviceId)) {
    return res.status(400).json({ error: 'ID không hợp lệ' })
  }
  
  if (req.method === 'GET') {
    try {
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      })
      
      if (!service) {
        return res.status(404).json({ error: 'Không tìm thấy dịch vụ' })
      }
      
      return res.status(200).json(service)
    } catch (error) {
      console.error('Error fetching service:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { name, description, price, duration, category, icon, isActive } = req.body
      
      const service = await prisma.service.update({
        where: { id: serviceId },
        data: {
          name,
          description,
          price: parseFloat(price),
          duration: parseInt(duration),
          category,
          icon,
          isActive
        }
      })
      
      return res.status(200).json(service)
    } catch (error) {
      console.error('Error updating service:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      await prisma.service.delete({
        where: { id: serviceId }
      })
      
      return res.status(200).json({ message: 'Đã xóa dịch vụ' })
    } catch (error) {
      console.error('Error deleting service:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
