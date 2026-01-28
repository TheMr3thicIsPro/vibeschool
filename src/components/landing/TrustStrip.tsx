'use client';

import { motion } from 'framer-motion';

export default function TrustStrip() {
  const trustItems = [
    '24/7 Support',
    'Hands On Learning',
    'Learn how to make games',
    'Learn how to make websites and more',
  ];

  return (
    <div className="py-4 overflow-hidden bg-gradient-to-r from-gray-900/50 to-gray-950/50">
      <div className="whitespace-nowrap animate-scroll">
        {[...trustItems, ...trustItems].map((item, index) => (
          <motion.span
            key={`${item}-${index}`}
            className="inline-block px-6 py-2 mx-2 text-sm bg-gray-800/50 rounded-full border border-gray-700"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </div>
  );
}