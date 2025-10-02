import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "small" | "medium" | "large";
  variant?: "full" | "icon-only";
  className?: string;
  onClick?: () => void;
}

export const Logo = ({ 
  size = "medium", 
  variant = "full",
  className,
  onClick 
}: LogoProps) => {
  const sizeClasses = {
    small: "h-6",
    medium: "h-8",
    large: "h-10"
  };

  const textSizeClasses = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl"
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      {/* Logo Icon */}
      <svg 
        className={cn(
          sizeClasses[size],
          "transition-transform duration-300 group-hover:scale-110"
        )}
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(262, 83%, 65%)", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "hsl(270, 75%, 70%)", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Camera Shutter + Fashion Hanger Combined Icon */}
        <circle cx="20" cy="20" r="18" stroke="url(#logoGradient)" strokeWidth="2" fill="none" />
        
        {/* Shutter Blades */}
        <path d="M20 8 L28 14 L24 20 L20 8Z" fill="url(#logoGradient)" opacity="0.8" />
        <path d="M28 14 L32 20 L24 20 L28 14Z" fill="url(#logoGradient)" opacity="0.6" />
        <path d="M32 20 L28 26 L24 20 L32 20Z" fill="url(#logoGradient)" opacity="0.8" />
        <path d="M28 26 L20 32 L24 20 L28 26Z" fill="url(#logoGradient)" opacity="0.6" />
        <path d="M20 32 L12 26 L16 20 L20 32Z" fill="url(#logoGradient)" opacity="0.8" />
        <path d="M12 26 L8 20 L16 20 L12 26Z" fill="url(#logoGradient)" opacity="0.6" />
        <path d="M8 20 L12 14 L16 20 L8 20Z" fill="url(#logoGradient)" opacity="0.8" />
        <path d="M12 14 L20 8 L16 20 L12 14Z" fill="url(#logoGradient)" opacity="0.6" />
        
        {/* Center Circle */}
        <circle cx="20" cy="20" r="4" fill="url(#logoGradient)" />
      </svg>

      {/* Logo Text */}
      {variant === "full" && (
        <span className={cn(
          textSizeClasses[size],
          "font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
          "transition-all duration-300 group-hover:tracking-wide"
        )}>
          Look&Post
        </span>
      )}
    </div>
  );
};
