"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  LockKeyhole,
  Mail,
  PlaneTakeoff,
  Sparkles,
  Ticket,
} from "lucide-react";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

type Props = {
  nextPath: string;
};

export default function LoginForm({ nextPath }: Props) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = React.useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted && data.user) {
        router.replace(nextPath);
      }
    };

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, [nextPath, router, supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (!normalizedEmail || !password) {
        throw new Error("Email and password are required.");
      }

      if (mode === "sign-up") {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
      }

      if (mode === "sign-in") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error("Sign in failed. Please try again.");
        }

        router.replace(nextPath);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setInfoMessage(
        "Account created. Please verify your email, then sign in.",
      );
      setMode("sign-in");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to continue",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-88px)] overflow-auto bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(219,234,254,0.45)_32%,_rgba(14,165,233,0.12)_62%,_rgba(15,23,42,0.04)_100%)] px-4 py-4 sm:px-6 sm:py-4 lg:h-[calc(100vh-88px)] lg:overflow-hidden lg:px-8 lg:py-4">
      <div className="absolute inset-0 -z-0 opacity-80">
        <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute right-[-7rem] top-20 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-1/3 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-8 lg:h-full lg:grid-cols-[1.02fr_0.98fr] lg:items-center xl:gap-12">
        <div className="max-w-xl space-y-6 px-1 text-slate-900 lg:pr-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-sm font-medium text-sky-700 shadow-sm backdrop-blur">
            <PlaneTakeoff className="h-4 w-4" />
            AeroBook Premium Access
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-700/80">
              Flight management, refined
            </p>
            <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Book, cancel, and reschedule with confidence.
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-600 sm:text-base">
              Use your account to book, cancel, and reschedule flights securely.
            </p>
          </div>

          <div className="grid gap-2.5 sm:max-w-xl sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {[
              "Secure account access for every itinerary",
              "Realtime seat changes across active flights",
              "Fast booking, reschedule, and cancellation updates",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5 rounded-2xl border border-white/60 bg-white/55 px-3 py-2.5 text-sm text-slate-700 shadow-sm backdrop-blur"
              >
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur lg:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                Account access
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {mode === "sign-in"
                  ? "Sign in to AeroBook"
                  : "Create your AeroBook account"}
              </h2>
            </div>

            <div className="hidden rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-sky-700 sm:block">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-1.5 text-sm leading-5 text-slate-600">
            Sign in to continue booking. If you do not have an account yet,
            switch to sign up.
          </p>

          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 lg:h-11"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>{mode === "sign-up" ? "New password" : "Password"}</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 lg:h-11"
                  placeholder={
                    mode === "sign-up"
                      ? "Enter your new password"
                      : "Enter your password"
                  }
                  minLength={6}
                  required
                />
              </div>
            </label>

            {mode === "sign-up" ? (
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                <span>Confirm password</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                    }}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 lg:h-11"
                    placeholder="Confirm your password"
                    minLength={6}
                    required
                  />
                </div>
              </label>
            ) : null}

            {errorMessage ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            {infoMessage ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {infoMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition duration-200 hover:-translate-y-0.5 hover:from-sky-500 hover:via-cyan-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-sky-300 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:bg-none disabled:shadow-none"
            >
              {loading
                ? "Please wait..."
                : mode === "sign-in"
                  ? "Sign in"
                  : "Sign up"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600">
            <div className="flex items-start gap-2.5">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <p>
                {mode === "sign-in"
                  ? "Need an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setInfoMessage(null);
                    setConfirmPassword("");
                    setMode((current) =>
                      current === "sign-in" ? "sign-up" : "sign-in",
                    );
                  }}
                  className="font-semibold text-sky-700 transition hover:text-sky-800"
                >
                  {mode === "sign-in" ? "Sign up" : "Sign in"}
                </button>
                .
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-4 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-slate-700">
              Back to home
            </Link>
            <span className="hidden sm:inline">
              AeroBook secure travel access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
