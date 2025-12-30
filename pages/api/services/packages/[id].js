const prisma = require('../../../../lib/prisma')

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const servicePackage = await prisma.servicepackage.findUnique({
        where: { id: parseInt(id) },
        include: {
          items: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      })

      if (!servicePackage) {
        return res.status(404).json({ error: 'Không tìm thấy gói khám' })
      }

      return res.status(200).json(servicePackage)
    } catch (error) {
      console.error('Error fetching service package:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, description, price, duration, icon, isActive, isPopular, items } = req.body

      // Update package
      const updateData = {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        icon,
        isActive,
        isPopular
      }

      // Xóa items cũ và tạo mới nếu có
      if (items && Array.isArray(items)) {
        // Xóa items cũ
        await prisma.servicepackageitem.deleteMany({
          where: { packageId: parseInt(id) }
        })
        
        // Tạo items mới
        updateData.items = {
          create: items.map((item, index) => ({
            name: item.name,
            description: item.description || '',
            category: item.category || '',
            displayOrder: item.displayOrder !== undefined ? item.displayOrder : index
          }))
        }
      }

      const servicePackage = await prisma.servicepackage.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          items: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      })

      return res.status(200).json(servicePackage)
    } catch (error) {
      console.error('Error updating service package:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.servicepackage.delete({
        where: { id: parseInt(id) }
      })

      return res.status(200).json({ message: 'Xóa gói khám thành công' })
    } catch (error) {
      console.error('Error deleting service package:', error)
      return res.status(500).json({ error: 'Lỗi server' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
