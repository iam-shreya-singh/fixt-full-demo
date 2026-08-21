export const dynamic = 'force-dynamic'

import { getOwnerCustomers } from '@/app/actions/customers'
import { CustomerManager } from '@/components/dashboard/customer-manager'

export default async function CustomersPage() { return <CustomerManager initialCustomers={await getOwnerCustomers()} /> }
