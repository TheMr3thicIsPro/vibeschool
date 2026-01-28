'use client';

import { motion } from 'framer-motion';

export default function LearningPath() {
  const steps = [
    {
      title: 'Start fundamentals',
      description: 'Learn the basics of programming, AI tools, and development workflows',
      side: 'left'
    },
    {
      title: 'Build projects',
      description: 'Apply your knowledge by creating real projects with guidance',
      side: 'right'
    },
    {
      title: 'Get feedback',
      description: 'Receive constructive feedback from mentors and peers',
      side: 'left'
    },
    {
      title: 'Ship and improve',
      description: 'Launch your projects and continuously refine your skills',
      side: 'right'
    }
  ];

  return (
    <section id="learn" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">learning path</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A structured approach to mastering real-world skills
          </p>
        </motion.div>

        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-[#00f3ff] to-[#b36cff] hidden md:block"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`mb-16 last:mb-0 relative ${step.side === 'right' ? 'md:pl-8 md:pr-0' : 'md:pr-8 md:pl-0'}`}
            >
              <div className={`md:w-5/12 ${step.side === 'right' ? 'md:ml-auto' : ''}`}>
                <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700 rounded-3xl p-6 hover-lift hover:border-[#00f3ff]/30 transition-all duration-300">
                  <div className="text-sm text-[#00f3ff] mb-2">Step {index + 1}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}