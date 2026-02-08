'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FallingTextProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FallingText = ({
  children,
  delay = 0,
  duration = 0.8,
  className = ''
}: FallingTextProps) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 10,
        delay,
        duration
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};