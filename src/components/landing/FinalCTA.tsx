'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FinalCTA() {
  return (
    <section id="cta" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f3ff]/5 to-[#b36cff]/5"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to start <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">building</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of students who have transformed their careers with our hands-on learning approach
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}