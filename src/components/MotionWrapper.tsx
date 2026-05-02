import { motion } from "framer-motion";
import { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className={className}>
      {children}
    </motion.div>
  );
}

export function FadeInUp({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay }} className={className}>
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div variants={scaleIn} initial="initial" animate="animate" transition={{ delay }} className={className}>
      {children}
    </motion.div>
  );
}

export function HoverCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className={className}>
      {children}
    </motion.div>
  );
}

export { motion, pageVariants, staggerContainer, fadeInUp, scaleIn };
