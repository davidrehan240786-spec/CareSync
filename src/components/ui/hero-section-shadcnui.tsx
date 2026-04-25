import { Button } from "@/src/components/ui/button";
import { motion, type Variants } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onStart?: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">
          <Sparkles className="h-4 w-4 text-black" />
          CareSync Hackathon 2026
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="mb-6 text-5xl font-bold tracking-tight md:text-7xl text-black"
      >
        Scan. Access.
        <br />
        <span className="bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent">
          Care.
        </span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mb-8 max-w-2xl text-lg text-gray-500"
      >
        A QR-based portable health system with AI summaries and smart 
        medication tracking. Built for fast, reliable, and secure patient care.
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="mt-12 flex items-center gap-8 text-sm text-gray-400"
      >
        <div>
          <div className="text-2xl font-bold text-black">
            1k+
          </div>
          <div>Patients</div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <div className="text-2xl font-bold text-black">24/7</div>
          <div>Access</div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <div className="text-2xl font-bold text-black">
            100%
          </div>
          <div>Secure</div>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="pt-24 flex flex-col items-center gap-4"
      >
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          Scroll down to reveal
        </p>
        <div className="w-[1px] h-16 bg-gradient-to-b from-gray-300 to-transparent" />
      </motion.div>
    </motion.div>
  );
}
