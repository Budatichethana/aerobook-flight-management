"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '../lib/supabase/client'

type Props = {
  nextPath: string
}

export default function LoginForm({ nextPath }: Props) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [mode, setMode] = React.useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (mounted && data.user) {
        router.replace(nextPath)
      }
    }

    void checkAuth()

    return () => {
      mounted = false
    }
  }, [nextPath, router, supabase])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setInfoMessage(null)

    try {
      if (!email || !password) {
        throw new Error('Email and password are required.')
      }

      if (mode === 'sign-in') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          throw error
        }

        if (!data.user) {
          throw new Error('Sign in failed. Please try again.')
        }

        router.replace(nextPath)
        router.refresh()
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        throw error
      }

      if (data.session) {
        router.replace(nextPath)
        router.refresh()
        return
      }

      setInfoMessage('Account created. Please verify your email, then sign in.')
      setMode('sign-in')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to continue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Account</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {mode === 'sign-in' ? 'Sign in' : 'Create account'}
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        Sign in to continue booking. If you do not have an account yet, switch to sign up.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
            }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
            }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
            minLength={6}
            required
          />
        </label>

        {errorMessage ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
        ) : null}

        {infoMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{infoMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading
            ? 'Please wait...'
            : mode === 'sign-in'
              ? 'Sign in'
              : 'Sign up'}
        </button>
      </form>

      <div className="mt-5 text-sm text-slate-600">
        {mode === 'sign-in' ? 'Need an account?' : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === 'sign-in' ? 'sign-up' : 'sign-in'))
          }}
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
        </button>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-700">Back to home</Link>
      </div>
    </section>
  )
}