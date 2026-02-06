import { Container } from "./container";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-muted/50 py-12">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h4 className="mb-3 text-sm font-semibold">FractPath</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Debt-free equity access and paths to homeownership through
              fractional ownership modeling.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Contact</h4>
            <p className="text-sm text-muted-foreground">
              support@fractpath.com
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Questions? We&apos;re here to help.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <div className="flex flex-col gap-1">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FractPath, Inc. All rights
            reserved. All scenarios are estimates for informational purposes
            only. FractPath does not provide financial, legal, or investment
            advice. Past performance is not indicative of future results.
          </p>
        </div>
      </Container>
    </footer>
  );
}
