'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionWrapperProps {
  children: ReactNode;
}

const PageTransitionWrapper = ({ children }: PageTransitionWrapperProps) => {
  const pathname = usePathname();
  
  // For the home page specifically, we want to show the background content
  const isHomePage = pathname === '/';
  
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* Background content (login/signup pages) */}
      {!isHomePage && (
        <div className="absolute inset-0 w-full h-full">
          {/* Render the login/signup page background here */}
          <div className="w-full h-full bg-background">
            {/* This will be the content that gets revealed */}
            {/* Since we can't easily access the background page content, we'll use a placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black opacity-80"></div>
          </div>
        </div>
      )}
      
      {/* Foreground content (current page) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ y: 0 }}
          animate={{ 
            y: 0,
          }}
          exit={{ 
            y: isHomePage ? '100%' : 0,
          }}
          transition={{ 
            duration: 0.8, 
            ease: [0.22, 1, 0.36, 1] 
          }}
          className="w-full min-h-screen absolute top-0 left-0 z-10 bg-background"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageTransitionWrapper;