"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
} from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAppBaseUrlClient } from "@/lib/appBaseUrl";

const VALID_PERSONAS = ["homeowner", "buyer", "realtor"] as const;
type Persona = (typeof VALID_PERSONAS)[number];

const PERSONA_LABELS: Record<Persona, string> = {
  homeowner: "Homeowner",
  buyer: "Buyer",
  realtor: "Realtor",
};

const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  homeowner: "Explore a new way to unlock equity without a loan.",
  buyer: "Model a pathway to ownership through shared equity.",
  realtor: "Participate as a referral partner and co-pilot.",
};

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_DURATION_MS = 60 * 60 * 1000;

export type RegistrationGateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona?: Persona;
  pendingAction?: "save" | "share";
  resumeUrl?: string | null;
  tokenError?: string | null;
  minting?: boolean;
};

export function RegistrationGateModal({
  open,
  onOpenChange,
  persona: prefillPersona,
  pendingAction,
  resumeUrl,
  tokenError,
  minting,
}: RegistrationGateModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [persona, setPersona] = useState<string>(prefillPersona || "");
  const [submitting, setSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [verificationStateId, setVerificationStateId] = useState<string | null>(
    null,
  );
  const [verificationExpired, setVerificationExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);
  const APP = getAppBaseUrlClient();

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setSignupDone(false);
      setVerificationStateId(null);
      setVerificationExpired(false);
      stopPolling();
      requestAnimationFrame(() => emailRef.current?.focus());
    } else {
      stopPolling();
    }
  }, [open, stopPolling]);

  useEffect(() => {
    if (prefillPersona) setPersona(prefillPersona);
  }, [prefillPersona]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startPolling = useCallback(
    (stateId: string, appResumeUrl: string) => {
      stopPolling();
      pollStartRef.current = Date.now();

      pollTimerRef.current = setInterval(async () => {
        if (Date.now() - pollStartRef.current > MAX_POLL_DURATION_MS) {
          stopPolling();
          setVerificationExpired(true);
          return;
        }

        try {
          const res = await fetch(
            `/api/verification-status?id=${encodeURIComponent(stateId)}`,
          );
          if (!res.ok) return;

          const data = await res.json();

          if (data.status === "verified") {
            stopPolling();
            const targetUrl = data.resumeUrl || appResumeUrl;
            window.location.assign(`${APP}${targetUrl}`);
          } else if (data.status === "expired") {
            stopPolling();
            setVerificationExpired(true);
          }
        } catch {
          // network error — continue polling
        }
      }, POLL_INTERVAL_MS);
    },
    [APP, stopPolling],
  );

  const helperText =
    pendingAction === "share"
      ? "Create your free account to continue to your draft and share it securely in FractPath."
      : "Create your free account to save this scenario and continue in FractPath.";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || minting) return;

    if (!resumeUrl) {
      setError("Unable to save your scenario. Please close and try again.");
      return;
    }

    const trimEmail = email.trim();
    if (!trimEmail || !trimEmail.includes("@")) return;
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!persona) {
      setError("Please select your role.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const callbackNext = resumeUrl.startsWith("/")
        ? resumeUrl
        : `/resume?token=${resumeUrl}`;

      let stateId: string | null = null;
      try {
        const vsRes = await fetch("/api/verification-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimEmail,
            resumeUrl: callbackNext,
            persona,
          }),
        });
        if (vsRes.ok) {
          const vsData = await vsRes.json();
          stateId = vsData.id || null;
        }
      } catch {
        // verification state creation failed — continue without polling
      }

      let emailRedirectTo = `${APP}/auth/finish?next=${encodeURIComponent(callbackNext)}`;
      if (stateId) {
        emailRedirectTo += `&verify_state=${encodeURIComponent(stateId)}`;
      }

      const targetUrl =
        `${APP}/signup?returnTo=${encodeURIComponent(resumeUrl)}` +
        `&persona=${encodeURIComponent(persona)}`;

      try {
        localStorage.setItem(
          "fractpath_signup_prefill",
          JSON.stringify({ email: trimEmail, persona }),
        );
      } catch {
        // localStorage unavailable
      }

      setSignupDone(true);
      setSubmitting(false);

      if (stateId) {
        setVerificationStateId(stateId);
        startPolling(stateId, callbackNext);
      }

      window.location.assign(targetUrl);
      return;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(msg);
      setSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    stopPolling();
    setSignupDone(false);
    setVerificationStateId(null);
    setVerificationExpired(false);
    setError(null);
    setEmail("");
    setPassword("");
  };

  const selectedPersona = VALID_PERSONAS.includes(persona as Persona)
    ? (persona as Persona)
    : null;

  const isDisabled = submitting || minting || false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center">
          <Image
            src="/brand/FractPath_Logo_Black.svg"
            alt="FractPath"
            width={140}
            height={32}
            className="mb-2"
          />
<<<<<<< HEAD
          {signupDone ? (
            <>
              <DialogTitle className="text-xl">Verify your email</DialogTitle>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email.trim()}</strong>.
                Open that link to finish creating your account and continue to
                your draft in FractPath.
              </p>
            </>
          ) : (
            <>
              <DialogTitle className="text-xl">Create your account</DialogTitle>
              <p className="text-sm text-muted-foreground">{helperText}</p>
            </>
          )}
        </DialogHeader>

        {signupDone && !verificationExpired && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950">
              <p className="text-sm text-green-800 dark:text-green-200">
                Your scenario has been saved. After confirming your email,
                you&apos;ll be taken directly to your draft in the app.
              </p>
            </div>

            {verificationStateId && (
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-xs text-muted-foreground">
                  This window will update automatically after verification.
                </p>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={handleTryAgain}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                use a different email
              </button>
              .
            </p>
          </div>
        )}

        {signupDone && verificationExpired && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your verification link has expired. Please try signing up again.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleTryAgain}
            >
              Try again
            </Button>
          </div>
        )}

        {!signupDone && tokenError && (
=======
          <DialogTitle className="text-xl">Create your account</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {helperText}
          </p>
        </DialogHeader>

        {tokenError && (
>>>>>>> 7290508 (Update calculator to mint draft tokens before user registration)
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
            <p className="text-sm text-destructive">{tokenError}</p>
          </div>
        )}

<<<<<<< HEAD
        {!signupDone && error && (
=======
        {error && (
>>>>>>> 7290508 (Update calculator to mint draft tokens before user registration)
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

<<<<<<< HEAD
        {!signupDone && minting && (
=======
        {minting && (
>>>>>>> 7290508 (Update calculator to mint draft tokens before user registration)
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Preparing your scenario...
            </p>
          </div>
        )}

<<<<<<< HEAD
        {!signupDone && !minting && (
=======
        {!minting && (
>>>>>>> 7290508 (Update calculator to mint draft tokens before user registration)
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                ref={emailRef}
                id="reg-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                name="password"
                type="password"
                placeholder="........"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-persona">I am a...</Label>
              <select
                id="reg-persona"
                name="persona"
                required
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                disabled={isDisabled}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Select your role
                </option>
                {VALID_PERSONAS.map((p) => (
                  <option key={p} value={p}>
                    {PERSONA_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>

            {selectedPersona && (
              <p className="text-xs italic text-muted-foreground">
                {PERSONA_DESCRIPTIONS[selectedPersona]}
              </p>
            )}
<<<<<<< HEAD
=======

            <Button
              type="submit"
              className="w-full"
              disabled={isDisabled || !resumeUrl}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Redirecting...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        )}
>>>>>>> 7290508 (Update calculator to mint draft tokens before user registration)

            <Button
              type="submit"
              className="w-full"
              disabled={isDisabled || !resumeUrl}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        )}

        {!signupDone && (
          <div className="space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <a
                href={`${APP}/login?returnTo=${encodeURIComponent(resumeUrl || "/")}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Log in
              </a>
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              Your data is secure. We use industry-standard encryption.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
