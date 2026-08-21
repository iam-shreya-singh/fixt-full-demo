export const dynamic = 'force-dynamic'

import { getOwnerServices } from '@/app/actions/services'
import { ServicesManager } from '@/components/dashboard/services-manager'

export default async function ServicesPage() {
  const services = await getOwnerServices()
  return <ServicesManager initialServices={services} />
}
