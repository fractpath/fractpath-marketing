"use client";

import { useState } from "react";
import Image from "next/image";
import { Container } from "./container";
import { Menu, X } from "lucide-react";
import { trackCustomEvent } from "@/lib/analytics";
import { getAppBaseUrlClient } from "@/lib/appBaseUrl";
import { GenericRegisterButton } from "@/components/generic-register-modal";

const navLinks = [
  { label: "How It Works", href: "#product-section" },
  { label: "FAQ", href: "#faq" },
  { label: "Realtors", href: "#realtor-section" },
];

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const APP = getAppBaseUrlClient();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <Image
              src="/brand/FractPath_Logo_Black.svg"
              alt="FractPath"
              width={140}
              height={32}
              priority
            />
          </a>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}

            <a
              href={`${APP}/login`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </a>

            <GenericRegisterButton
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Register
            </GenericRegisterButton>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {mobileOpen && (
          <div className="border-t pb-4 md:hidden">
            <div className="flex flex-col gap-3 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}

              <a
                href={`${APP}/login`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </a>

              <GenericRegisterButton
                className="inline-flex w-fit items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Register
              </GenericRegisterButton>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
