import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  body,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("rounded-2xl border shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardContent className="p-6 sm:p-8">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 ring-1 ring-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
