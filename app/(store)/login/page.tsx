"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/_providers/auth-provider";
import { useGoogleLogin } from "@react-oauth/google";
import {
  LuEye,
  LuEyeOff,
  LuLoader,
  LuHeart,
  LuShieldCheck,
  LuTruck,
} from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { FiMapPin, FiArrowLeft } from "react-icons/fi";
import Logo from "@/components/ui/logo";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";

  const { login, loginWithGoogle, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already logged in, redirect to profile or specified path
  useEffect(() => {
    if (isAuthenticated) router.replace(redirectUrl);
  }, [isAuthenticated, redirectUrl, router]);

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        router.push(redirectUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      setError("Google sign-in was cancelled or failed.");
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col justify-center bg-store-page px-4 py-8 font-sans sm:px-6 sm:py-12 lg:px-8">
      {/* Top back button */}
      <div className="max-w-5xl mx-auto w-full mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-store-primary transition-colors uppercase tracking-wider"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden">
        {/* Left Column: Brand & Trust Showcase (5 cols) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-store-ink via-store-deep to-store-ink p-8 text-white lg:col-span-5 lg:flex lg:p-12">
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-store-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="mb-8">
              <Logo variant="light" size="md" />
            </div>


            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Welcome back to NovaMart
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 mt-3 leading-relaxed">
              Sign in to keep your orders and saved items close at hand.
            </p>

            {/* Value bullets */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-store-primary flex items-center justify-center shrink-0">
                  <LuShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Your account</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Manage your details in one place</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-store-primary flex items-center justify-center shrink-0">
                  <LuTruck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Your orders</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Check your orders and delivery updates</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-store-primary flex items-center justify-center shrink-0">
                  <LuHeart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Your saved items</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Find your wishlist when you return</p>
                </div>
              </div>
            </div>
          </div>

          {/* Founder & Location Footer */}
          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-store-primary/40 ring-2 ring-store-primary/20 shrink-0">
                <Image
                  src="/images/logo/update-logo.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full bg-white object-contain"
                />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="text-white font-bold">NovaMart Team</div>
                <div className="text-[10px] text-store-light font-medium">Customer support</div>
              </div>
            </div>
            <div className="text-right text-[10px] text-zinc-400">
              <div className="flex items-center justify-end gap-1 text-zinc-300">
                <FiMapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dhaka</span>
              </div>
              <a href="tel:01722301927" className="text-zinc-300 hover:text-store-light font-semibold block mt-0.5">
                01722301927
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form (7 cols) */}
        <div className="flex flex-col justify-center p-5 sm:p-10 lg:col-span-7 lg:p-12">
          <div className="max-w-md w-full mx-auto">
            {/* Header & Tabs */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-4">
              <div>
                <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
                  Sign In
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  Access your customer portal
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400">New here?</span>
                <Link
                  href="/signup"
                  className="font-bold text-store-primary hover:text-store-primary hover:underline"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div role="alert" className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* Google 1-Click Login */}
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              disabled={googleLoading || submitting}
              className="w-full flex items-center justify-center gap-3 border border-zinc-300 py-3 rounded-xl hover:bg-zinc-50 hover:border-zinc-400 transition-all font-semibold text-xs text-zinc-800 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {googleLoading ? <LuLoader className="w-4 h-4 animate-spin" /> : <FcGoogle className="w-5 h-5" />}
              <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
                  Or sign in with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900  focus:outline-none    transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Password
                  </label>
                  <a
                    href="tel:01722301927"
                    className="text-[11px] font-semibold text-store-primary hover:underline"
                  >
                    Call for sign-in help
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pr-11 text-sm text-zinc-900  focus:outline-none    transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-zinc-500 hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-store-primary"
                  >
                    {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || googleLoading}
                className="w-full bg-store-primary hover:bg-store-hover active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-store-primary/15 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting && <LuLoader className="w-4 h-4 animate-spin" />}
                <span>{submitting ? "Signing in..." : "Sign In to Account"}</span>
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-store-page">
          <LuLoader className="w-8 h-8 text-store-primary animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
