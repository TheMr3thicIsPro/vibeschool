'use client';

import { motion } from 'framer-motion';

export default function Community() {
  const communityItems = [
    {
      title: 'Builders community',
      description: 'Connect with fellow learners and experienced developers',
      avatars: ['JD', 'AS', 'MR', 'TK', 'LW'],
      color: 'from-[#00f3ff] to-[#b36cff]'
    },
    {
      title: 'Challenges',
      description: 'Participate in monthly challenges and competitions',
      avatars: ['SP', 'MJ', 'DR', 'EG', 'NT'],
      color: 'from-[#b36cff] to-[#00f3ff]'
    },
    {
      title: 'Feedback and support',
      description: 'Get constructive feedback on your projects',
      avatars: ['AB', 'CD', 'EF', 'GH', 'IJ'],
      color: 'from-[#00f3ff] to-[#00f3ff]'
    }
  ];

  return (
    <section id="community" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Join our vibrant <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">community</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect, collaborate, and grow with like-minded creators
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communityItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-800/30 backdrop-blur-lg border border-gray-700 rounded-3xl p-6 hover-lift hover:border-[#00f3ff]/30 transition-all duration-300 group"
            >
              <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
              <p className="text-gray-400 mb-6">{item.description}</p>
              
              <div className="flex -space-x-2 mb-4">
                {item.avatars.map((initials, idx) => (
                  <motion.div
                    key={idx}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-xs font-bold text-black group-hover:scale-110 transition-transform`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {initials}
                  </motion.div>
                ))}
              </div>
              
              <button className="text-[#00f3ff] hover:text-[#b36cff] transition-colors font-medium">
                Join now →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}