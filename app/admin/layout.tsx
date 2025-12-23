import { requireAdmin } from '@/lib/utils/auth'
import AdminLayoutClient from '@/app/_components/admin/AdminLayoutClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
