import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export function createSupabaseServerClient() {
	const cookieStore = cookies()

	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value
			},
			set(name: string, value: string, options: any) {
				try {
					cookieStore.set({ name, value, ...options })
				} catch {
					// Server components cannot always write cookies.
				}
			},
			remove(name: string, options: any) {
				try {
					cookieStore.set({ name, value: '', ...options, maxAge: 0 })
				} catch {
					// Server components cannot always write cookies.
				}
			}
		}
	})
}
