'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { scrollToSection } from '@/lib/scroll';

interface NavbarProps {
  activeSection: string;
}

export default function Navbar({ activeSection }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-900/80 backdrop-blur-md border-b border-gray-800' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">
          VibeSchool
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          {['Features', 'Opportunity', 'Learn', 'Pricing'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.toLowerCase());
              }}
              className={`transition-colors hover:text-[#00f3ff] ${
                activeSection === item.toLowerCase() ? 'text-[#00f3ff]' : 'text-gray-300'
              }`}
            >
              {item}
            </a>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/auth/signup"
            className="px-6 py-2 bg-transparent border border-[#00f3ff] text-[#00f3ff] rounded-full hover:bg-[#00f3ff]/10 transition-colors"
          >
            View Curriculum
          </Link>
          <Link 
            href="/auth/signup"
            className="px-6 py-2 bg-gradient-to-r from-[#00f3ff] to-[#b36cff] text-black rounded-full hover:opacity-90 transition-opacity"
          >
            Start Learning
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}