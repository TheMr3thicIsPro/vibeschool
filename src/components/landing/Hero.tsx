'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { scrollToSection } from '@/lib/scroll';

interface FloatingCardProps {
  index: number;
  zIndex: number;
}

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center pt-20 pb-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">
                Learn real skills
              </span>{' '}
              with AI
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 max-w-2xl">
              Vibe Coding School is a modern learning platform where you master prompt engineering and AI-powered coding through real projects, guided lessons, and an active builder community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Link 
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-[#00f3ff] to-[#b36cff] text-black font-bold rounded-3xl hover:opacity-90 transition-opacity text-lg"
              >
                Start Learning
              </Link>
              <Link 
                href="/auth/signup"
                className="px-8 py-4 bg-transparent border border-[#00f3ff] text-[#00f3ff] font-bold rounded-3xl hover:bg-[#00f3ff]/10 transition-colors text-lg"
              >
                View Curriculum
              </Link>
            </div>
            
            <p className="text-sm text-gray-500">
              3 day free trial • no credit card needed<br/>
              Some videos may not be watchable during trial
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="mt-24 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <button 
                onClick={() => {
                  console.log("scroll click -> features", !!document.getElementById("features"));
                  scrollToSection("features");
                }}
                className="w-12 h-12 rounded-full bg-gray-800/50 backdrop-blur-lg border border-gray-700 flex items-center justify-center hover:bg-gray-700/50 transition-colors"
              >
                <ArrowDown className="text-[#00f3ff]" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
