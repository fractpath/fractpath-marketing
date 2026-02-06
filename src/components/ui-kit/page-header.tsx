import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className,
  align = "center",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 sm:mb-12",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
