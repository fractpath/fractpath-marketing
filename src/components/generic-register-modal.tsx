"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAppBaseUrlClient } from "@/lib/appBaseUrl";

const FEATURES = [
  "View verified properties open to deal conversations",
  "Upload and verify your own property",
  "Model and save deal scenarios",
  "Create or respond to structured offers",
  "Track terms, documents, and milestones",
];

type GenericRegisterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GenericRegisterModal({
  open,
  onOpenChange,
}: GenericRegisterModalProps) {
  const APP = getAppBaseUrlClient();
  const signupHref = `${APP}/signup`;
  const loginHref = `${APP}/login`;

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
          <DialogTitle className="text-xl">
            Create a free FractPath account
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Access the tools that help homeowners and buyers explore structured
            home equity agreements before moving into the app.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="space-y-2 rounded-xl border bg-muted/40 px-4 py-4 text-sm text-foreground">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <a
              href={signupHref}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Create free account
            </a>

            <a
              href={loginHref}
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Log in
            </a>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground/70">
              No obligation. Scenario estimates are informational and not
              financial, legal, or investment advice.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type GenericRegisterButtonProps = {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function GenericRegisterButton({
  children,
  className,
}: GenericRegisterButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
        type="button"
      >
        {children}
      </button>
      <GenericRegisterModal open={open} onOpenChange={setOpen} />
    </>
  );
}
