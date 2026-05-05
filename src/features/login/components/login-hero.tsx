"use client";

import { PawPrint } from "lucide-react";
import { motion } from "motion/react";

export function LoginHero() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-12 flex flex-col items-center"
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[#14B8A6] shadow-xl">
        <PawPrint className="h-11 w-11 text-white" strokeWidth={2.5} />
      </div>
      <h1 className="mb-2 text-3xl font-bold">Wofie</h1>
      <p className="text-center text-muted-foreground">
        Sign in to help reunite pets with their families
      </p>
    </motion.div>
  );
}
