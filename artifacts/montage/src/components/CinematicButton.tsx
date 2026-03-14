import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CinematicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "accent" | "outline";
  href?: string;
  target?: string;
  rel?: string;
}

export function CinematicButton({
  children,
  variant = "primary",
  href,
  className = "",
  ...props
}: CinematicButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center px-8 py-3.5 font-display font-semibold tracking-wider rounded-lg overflow-hidden transition-all duration-300 z-10 group";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 box-glow-primary",
    accent:
      "bg-accent text-accent-foreground hover:bg-accent/90 box-glow-accent",
    outline:
      "bg-transparent border-2 border-primary/50 text-foreground hover:border-primary hover:bg-primary/10",
  };

  const glowVariants = {
    primary: "0 0 28px 6px rgba(99,102,241,0.65)",
    accent: "0 0 28px 6px rgba(139,92,246,0.65)",
    outline: "0 0 22px 4px rgba(99,102,241,0.45)",
  };

  const Content = () => (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {/* Hover light sweep */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
    </>
  );

  const hoverAnim = {
    scale: 1.07,
    rotateX: 4,
    rotateY: -6,
    boxShadow: glowVariants[variant],
  };

  if (href) {
    return (
      <motion.a
        href={href}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        style={{ transformPerspective: 700 }}
        whileHover={hoverAnim}
        whileTap={{ scale: 0.94 }}
        {...(props as Record<string, unknown>)}
      >
        <Content />
      </motion.a>
    );
  }

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{ transformPerspective: 700 }}
      whileHover={hoverAnim}
      whileTap={{ scale: 0.94 }}
      {...props}
    >
      <Content />
    </motion.button>
  );
}
