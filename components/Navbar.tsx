"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Home, Search, Plane, Calendar, UserCircle2, LogOut } from 'lucide-react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import { useStore, useUserStore } from '../store/useStore'

export default function Navbar() {
  const [open, setOpen] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  React.useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (mounted) {
        setUserEmail(data.user?.email ?? null)
      }
    }

    void loadUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUserEmail(session?.user?.email ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // reset client-side Zustand stores on logout
    try {
      useStore.getState().reset()
    } catch (e) {
      // ignore
    }
    try {
      useUserStore.getState().reset()
    } catch (e) {
      // ignore
    }
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))

  const navLinkClass = (href: string) => [
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
    isActive(href)
      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
  ].join(' ')

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white shadow-soft-lg">AB</div>
              <div className="hidden sm:block">
                <div className="text-lg font-semibold text-slate-900">AeroBook</div>
                <div className="text-xs text-slate-500">Smart flight booking & seat management</div>
              </div>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm">
            <Link href="/" className={navLinkClass('/')}>
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href="/search" className={navLinkClass('/search')}>
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>
            <Link href="/flights" className={navLinkClass('/flights')}>
              <Plane className="h-4 w-4" />
              <span>Flights</span>
            </Link>
            <Link href="/bookings" className={navLinkClass('/bookings')}>
              <Calendar className="h-4 w-4" />
              <span>My Bookings</span>
            </Link>
            {userEmail ? (
              <div className="ml-2 flex items-center gap-3 pl-3">
                <span className="inline-flex max-w-[220px] items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                  <UserCircle2 className="h-4 w-4 text-slate-500" />
                  <span className="truncate">{userEmail}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void handleLogout()
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-110">Login</Link>
            )}
          </nav>
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden">
          <div className="space-y-3 px-4 py-4">
            <Link href="/" className={navLinkClass('/')}><Home className="h-4 w-4" /> Home</Link>
            <Link href="/search" className={navLinkClass('/search')}><Search className="h-4 w-4" /> Search</Link>
            <Link href="/flights" className={navLinkClass('/flights')}><Plane className="h-4 w-4" /> Flights</Link>
            <Link href="/bookings" className={navLinkClass('/bookings')}><Calendar className="h-4 w-4" /> My Bookings</Link>
            {userEmail ? (
              <button
                type="button"
                onClick={() => {
                  void handleLogout()
                }}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link href="/login" className="mt-2 block w-full rounded-full bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm">Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
