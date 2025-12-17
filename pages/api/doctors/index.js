const prisma = require('../../../lib/prisma')

export default async function handler(req, res){
  if (req.method === 'GET'){
    const { specialty, includeImage } = req.query
    
    // Build where condition to filter by specialty if provided
    const where = specialty 
      ? { specialty: { name: specialty } }
      : {}
    
    // Select fields based on whether images are needed
    const select = {
      id: true,
      bio: true,
      profileImage: includeImage === 'true',
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      specialty: {
        select: {
          name: true
        }
      }
    }
    
    // Fetch doctor profiles with specialty filter
    const profiles = await prisma.doctorprofile.findMany({ 
      where,
      select
    })
    
    const result = profiles.map(p => ({ 
      id: p.user.id, 
      name: p.user.name, 
      email: p.user.email, 
      specialty: p.specialty.name, 
      bio: p.bio,
      profileImage: p.profileImage || null
    }))
    
    return res.json(result)
  }
  res.status(405).end()
}
