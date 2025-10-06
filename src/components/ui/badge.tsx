import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Variante para badges sobre imagens com glassmorphism
        overlay: "border-white/20 bg-slate-900/80 text-white backdrop-blur-sm hover:bg-slate-900/90 shadow-lg",
        // Variante para badges de atenção com melhor contraste
        attention: "border-red-500/30 bg-red-500/90 text-white backdrop-blur-sm hover:bg-red-500 shadow-lg font-medium",
        // Variante para badges de qualidade com melhor legibilidade
        quality: "border-orange-500/30 bg-orange-500/90 text-white backdrop-blur-sm hover:bg-orange-500 shadow-md font-medium text-[10px] px-2 py-0.5",
        // Variante para badges aprovados com fundo verde sólido
        approved: "border-green-600/20 bg-green-600 text-white hover:bg-green-700 shadow-md font-medium",
        // Variante para badges adequados com fundo amarelo/laranja sólido
        adequate: "border-yellow-600/20 bg-yellow-600 text-white hover:bg-yellow-700 shadow-md font-medium",
        // Variante para badges agendados com cor azul água
        scheduled: "border-cyan-600/20 bg-cyan-500 text-white hover:bg-cyan-600 shadow-md font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
