import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Require admin access for server components and server actions
 *
 * Note: This function performs a database query to verify admin status.
 * While user.user_metadata.role could be used for faster checks,
 * we maintain the DB query here for defense-in-depth security:
 * - Ensures role hasn't changed since JWT was issued
 * - Provides an additional security layer beyond middleware
 * - Protects against potential JWT manipulation
 *
 * For high-traffic scenarios, consider caching with a short TTL.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify admin status from database (defense-in-depth)
  // Middleware already checks user_metadata.role, but we double-check here
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return { user, profile }
}
