import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CinematicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "accent" | "outline";
  href?: string;
}

export function CinematicButton({ 
  children, 
  variant = "primary", 
  href,
  className = "",
  ...props 
}: CinematicButtonProps) {
  
  const baseStyles = "relative inline-flex items-center justify-center px-8 py-3.5 font-display font-semibold tracking-wider rounded-lg overflow-hidden transition-all duration-300 z-10 group";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 box-glow-primary",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 box-glow-accent",
    outline: "bg-transparent border-2 border-primary/50 text-foreground hover:border-primary hover:bg-primary/10"
  };

  const Content = () => (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {/* Hover Light Effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
    </>
  );

  if (href) {
    return (
      <motion.a 
        href={href}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Content />
      </motion.a>
    );
  }

  return (
    <motion.button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <Content />
    </motion.button>
  );
}
