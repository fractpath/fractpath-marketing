import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  className?: string;
}

export function StatCard({ label, value, subtext, className }: StatCardProps) {
  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        {subtext && (
          <p className="mt-1 text-sm text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
