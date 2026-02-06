"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "./container";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Realtor Beta", href: "#realtor-beta" },
];

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <Button asChild size="sm">
              <a href="https://app.fractpath.com/signup">Sign In</a>
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
              <Button asChild size="sm" className="w-fit">
                <a href="https://app.fractpath.com/signup">Sign In</a>
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
