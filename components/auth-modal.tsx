"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useAuth } from "@/app/_providers/auth-provider";
import { useGoogleLogin } from "@react-oauth/google";
import {
  LuX,
  LuEye,
  LuEyeOff,
  LuLoader,
  LuShieldCheck,
  LuTruck,
  LuGift,
} from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { FiMapPin } from "react-icons/fi";
import Logo from "@/components/ui/logo";

type AuthView = "login" | "register";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register, loginWithGoogle } = useAuth();

  const [view, setView] = useState<AuthView>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const handleClose = useCallback(() => {
    setShowAuthModal(false);
    resetForm();
  }, [setShowAuthModal, resetForm]);

  useEffect(() => {
    if (!showAuthModal) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      } else if (event.key === "Tab") {
        const elements = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])');
        if (!elements?.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [showAuthModal, handleClose]);

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        handleClose();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
        if (msg.includes("Failed to fetch") || msg.toLowerCase().includes("cannot connect")) {
          setError("Sign-in is unavailable right now. Please try again.");
        } else {
          setError(msg);
        }
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      setError("Google sign-in was cancelled or failed.");
    },
  });

  if (!showAuthModal) return null;

  const switchView = () => {
    const next = view === "login" ? "register" : "login";
    setView(next);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (view === "register") {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (view === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please check credentials.";
      if (msg.includes("Failed to fetch") || msg.toLowerCase().includes("cannot connect")) {
        setError("Sign-in is unavailable right now. Please try again.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-4 animate-fadeIn font-sans">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="relative grid max-h-[90dvh] w-full min-w-0 max-w-4xl grid-cols-1 overflow-y-auto overscroll-y-contain rounded-2xl border border-zinc-200 bg-white shadow-xl md:grid-cols-12">
        {/* Close Button */}
        <button
          type="button"
          ref={closeButtonRef}
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          aria-label="Close"
        >
          <LuX className="w-5 h-5" />
        </button>

        {/* Left Decorative & Info Section (5 cols on md) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#142638] via-[#324d64] to-[#142638] text-white p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#174A76]/15 rounded-full blur-2xl pointer-events-none" />

          <div>
            <Logo variant="light" size="sm" />

            <h3 className="mt-7 text-xl font-semibold leading-snug tracking-tight text-white">
              {view === "login"
                ? "Your shopping, all in one place"
                : "Make shopping easier with an account"}
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/70">
              {view === "login" ? "Sign in to pick up where you left off." : "Create an account to keep track of your orders and favourites."}
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2.5">
                <LuShieldCheck className="w-4 h-4 text-store-light shrink-0 mt-0.5" />
                <span className="text-xs text-white/80">Manage your account details</span>
              </div>
              <div className="flex items-start gap-2.5">
                <LuTruck className="w-4 h-4 text-store-light shrink-0 mt-0.5" />
                <span className="text-xs text-white/80">View orders and delivery updates</span>
              </div>
              <div className="flex items-start gap-2.5">
                <LuGift className="w-4 h-4 text-[#E88443] shrink-0 mt-0.5" />
                <span className="text-xs text-white/80">Keep your favourites in one place</span>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#174A76]/40 ring-2 ring-[#174A76]/20 shrink-0">
                <Image
                  src="/images/logo/update-logo.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full bg-white object-contain"
                />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="text-white font-bold">MiniThailandBD Team</div>
                <div className="text-[10px] text-[#C7D5DF] font-medium">Customer support</div>
              </div>
            </div>
            <div className="text-right text-[10px] text-zinc-400">
              <div className="flex items-center justify-end gap-1 text-zinc-300">
                <FiMapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Dhaka</span>
              </div>
              <a href="tel:01722301927" className="text-zinc-300 hover:text-indigo-300 font-semibold block mt-0.5">
                01722301927
              </a>
            </div>
          </div>
        </div>

        {/* Right Form Section (7 cols on md) */}
        <div className="min-w-0 md:col-span-7 p-4 sm:p-8 flex flex-col justify-center">
          {/* Header & Tabs - pr-12 leaves ample space for close button */}
          <div className="flex flex-wrap gap-3 items-start justify-between pb-3 border-b border-zinc-100 mb-5 pr-12">
            <div>
              <h2 id="auth-modal-title" className="text-2xl font-semibold text-zinc-950 tracking-tight">
                {view === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {view === "login" ? "Enter your details to sign in." : "Enter your details to get started."}
              </p>
            </div>

          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Google 1-Click */}
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            disabled={googleLoading || submitting}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-60"
          >
            {googleLoading ? <LuLoader className="w-4 h-4 animate-spin" /> : <FcGoogle className="w-4 h-4" />}
            <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
                Or with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {view === "register" && (
              <div>
                <label htmlFor="auth-modal-name" className="block text-sm font-medium text-zinc-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="auth-modal-name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 min-h-12 py-3 text-sm text-zinc-900  focus:outline-none    transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-modal-email" className="block text-sm font-medium text-zinc-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="auth-modal-email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 min-h-12 py-3 text-sm text-zinc-900  focus:outline-none    transition-all"
              />
            </div>

            <div className={`grid gap-3 ${view === "register" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              <div>
                <label htmlFor="auth-modal-password" className="block text-sm font-medium text-zinc-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="auth-modal-password"
                    name="password"
                    autoComplete={view === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-zinc-900  focus:outline-none    transition-all"
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

              {view === "register" && (
                <div>
                  <label htmlFor="auth-modal-confirm-password" className="block text-sm font-medium text-zinc-600 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="auth-modal-confirm-password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat"
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-zinc-900  focus:outline-none    transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                      aria-pressed={showConfirmPassword}
                      className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-zinc-500 hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-store-primary"
                    >
                      {showConfirmPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {view === "login" && (
              <div className="flex justify-end text-xs pt-1">
                <a href="tel:01722301927" className="text-[#174A76] hover:underline">
                  Call for sign-in help
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="w-full bg-[#174A76] hover:bg-[#103858] active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl  transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {submitting && <LuLoader className="w-4 h-4 animate-spin" />}
              <span>
                {submitting
                  ? "Processing..."
                  : view === "login"
                    ? "Sign In"
                    : "Create Account"}
              </span>
            </button>
          </form>

          {/* Bottom Switch View */}
          <div className="mt-4 pt-3 border-t border-zinc-100 text-center text-xs text-zinc-500">
            {view === "login" ? (
              <span>
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  onClick={switchView}
                  className="font-bold text-[#174A76] hover:text-[#103858] hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchView}
                  className="font-bold text-[#174A76] hover:text-[#103858] hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}
