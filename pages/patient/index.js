import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function PatientIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/patient/dashboard')
  }, [router])

  return null
}
