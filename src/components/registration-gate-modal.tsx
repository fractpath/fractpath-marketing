import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  homeowner: "Explore a new way to unlock equity without taking on a loan.",
  buyer: "Model a pathway to ownership through a shared appreciation structure.",
  realtor: "Continue as a referral partner and co-pilot scenarios for clients.",
};

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
  persona,
  pendingAction,
  resumeUrl,
  tokenError,
  minting,
}: RegistrationGateModalProps) {
  const APP = getAppBaseUrlClient();

  useEffect(() => {
    if (!open) return;
  }, [open]);

  const selectedPersona = VALID_PERSONAS.includes((persona || "") as Persona)
    ? (persona as Persona)
    : "homeowner";

  const helperText =
    pendingAction === "share"
      ? "Your scenario is ready. Create a free account to continue to your draft and share it securely in FractPath."
      : "Your scenario is ready. Create a free account to save it and continue in FractPath.";

  const createAccountHref = resumeUrl
    ? `${APP}/signup?returnTo=${encodeURIComponent(resumeUrl)}&persona=${encodeURIComponent(selectedPersona)}`
    : `${APP}/signup?persona=${encodeURIComponent(selectedPersona)}`;

  const loginHref = `${APP}/login?returnTo=${encodeURIComponent(resumeUrl || "/")}`;

  const handleCreateAccount = () => {
    if (!resumeUrl) return;
    try {
      localStorage.setItem(
        "fractpath_signup_prefill",
        JSON.stringify({ persona: selectedPersona }),
      );
    } catch {
      // ignore localStorage failures
    }
    window.location.assign(createAccountHref);
  };

  const handleLogin = () => {
    window.location.assign(loginHref);
  };

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
          <DialogTitle className="text-xl">Continue in FractPath</DialogTitle>
          <p className="text-sm text-muted-foreground">{helperText}</p>
        </DialogHeader>

        {tokenError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
            <p className="text-sm text-destructive">{tokenError}</p>
          </div>
        )}

        {minting ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Preparing your scenario...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/40 px-4 py-4">
              <p className="text-sm font-medium text-foreground">
                {PERSONA_LABELS[selectedPersona]}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {PERSONA_DESCRIPTIONS[selectedPersona]}
              </p>
            </div>

            <div className="rounded-xl border bg-background px-4 py-4">
              <p className="text-sm text-muted-foreground">
                In the app, you’ll be able to:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li>• Save this scenario to your account</li>
                <li>• Resume directly into your draft</li>
                <li>• Add a title and property details</li>
                <li>• Continue managing the scenario securely</li>
              </ul>
            </div>

            <Button
              asChild
              className="w-full"
              disabled={!resumeUrl}
            >
              <a
                href={createAccountHref}
                onClick={() => {
                  try {
                    localStorage.setItem(
                      "fractpath_signup_prefill",
                      JSON.stringify({ persona: selectedPersona }),
                    );
                  } catch {
                    // ignore localStorage failures
                  }
                }}
              >
                Create free account
              </a>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <a href={loginHref}>Log in</a>
            </Button>

            <p className="text-center text-[11px] text-muted-foreground/70">
              Your scenario is already prepared and will continue in the app.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}