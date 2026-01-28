'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Simple, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">transparent</span> pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start your journey with our affordable membership
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-lg border border-gray-700 rounded-3xl p-8 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f3ff]/5 to-[#b36cff]/5"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-2">VibeSchool Membership</h3>
              
              <div className="mt-8 mb-6">
                <div className="text-5xl font-bold text-white mb-2">$1.99</div>
                <div className="text-gray-400">first month</div>
              </div>
              
              <div className="mb-6">
                <div className="text-xl text-gray-300">$7.99 per month after</div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="text-sm text-green-400">✓ 3 day free trial</div>
                <div className="text-sm text-green-400">✓ No credit card needed</div>
              </div>
              
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
              
              <p className="text-sm text-gray-500 mb-8">
                Some videos may not be watchable during the trial
              </p>
              
              <div className="border-t border-gray-700 pt-8 max-w-md mx-auto">
                <details className="mb-4">
                  <summary className="text-left text-gray-300 cursor-pointer hover:text-white">
                    What happens after the free trial?
                  </summary>
                  <p className="text-gray-500 text-left mt-2">
                    After your 3-day free trial, you'll be charged $1.99 for the first month. Following that, your membership continues at $7.99 per month until canceled.
                  </p>
                </details>
                
                <details className="mb-4">
                  <summary className="text-left text-gray-300 cursor-pointer hover:text-white">
                    Do I need a credit card?
                  </summary>
                  <p className="text-gray-500 text-left mt-2">
                    No, you can start your 3-day free trial without providing payment information. You'll only need to add payment details if you continue after the trial.
                  </p>
                </details>
                
                <details className="mb-4">
                  <summary className="text-left text-gray-300 cursor-pointer hover:text-white">
                    Why are some videos not watchable during trial?
                  </summary>
                  <p className="text-gray-500 text-left mt-2">
                    During the trial period, access to certain premium content is restricted to give you a taste of the platform while reserving full access for members.
                  </p>
                </details>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}