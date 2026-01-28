'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

export default function OpportunityScroll() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const cards = [
    {
      title: "Support whenever you get stuck",
      subtitle: "24/7 Support",
      description: "Get personalized help whenever you encounter challenges in your learning journey",
      tag: "Always available"
    },
    {
      title: "Learn by building not watching",
      subtitle: "Hands On Learning",
      description: "Practice with real projects instead of just consuming content passively",
      tag: "Project-based"
    },
    {
      title: "Build games from idea to playable",
      subtitle: "Learn how to make games",
      description: "Step-by-step guidance to create complete, functional games",
      tag: "Game dev"
    },
    {
      title: "Create websites and real projects",
      subtitle: "Learn how to make websites and more",
      description: "Build professional-grade websites and digital products",
      tag: "Web dev"
    },
    {
      title: "Build a portfolio fast",
      subtitle: "Portfolio Building",
      description: "Create impressive projects that showcase your skills to employers",
      tag: "Career ready"
    },
    {
      title: "Turn skills into opportunities",
      subtitle: "Jobs & Freelancing",
      description: "Convert your newly acquired skills into career opportunities",
      tag: "Job ready"
    }
  ];

  const progress = useTransform(scrollYProgress, [0, 1], [0, cards.length]);

  // Track active index based on scroll progress
  useEffect(() => {
    progress.onChange((value) => {
      const index = Math.min(Math.floor(value), cards.length - 1);
      if (index >= 0 && index < cards.length) {
        setActiveIndex(index);
      }
    });
  }, [progress]);

  return (
    <section id="opportunity" ref={containerRef} className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left sticky column */}
          <div className="lg:sticky lg:top-24 h-[calc(100vh-8rem)] flex flex-col justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-sm text-[#00f3ff] mb-2"
              >
                The opportunity
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Stop consuming, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">
                  start building
                </span>
              </motion.h2>
              
              <motion.p
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl text-gray-300 mb-8"
              >
                {cards[activeIndex].description}
              </motion.p>
            </div>
            
            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full h-2 bg-gray-800 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-[#00f3ff] to-[#b36cff]"
                style={{ width: `${(activeIndex + 1) / cards.length * 100}%` }}
              />
            </motion.div>
          </div>
          
          {/* Right scrollable column */}
          <div className="space-y-8">
            {cards.map((card, index) => (
              <ScrollCard
                key={index}
                card={card}
                index={index}
                activeIndex={activeIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScrollCard({ card, index, activeIndex }: { 
  card: { 
    title: string; 
    subtitle: string; 
    description: string; 
    tag: string 
  }; 
  index: number; 
  activeIndex: number; 
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-50%" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.3, y: 50 }}
      animate={{
        opacity: isInView ? 1 : 0.3,
        y: isInView ? 0 : 50,
        scale: index === activeIndex ? 1.02 : 1,
      }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-800/30 backdrop-blur-lg border rounded-3xl p-6 transition-all duration-300 ${
        index === activeIndex
          ? 'border-[#00f3ff]/50 shadow-lg shadow-[#00f3ff]/10'
          : 'border-gray-700'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-sm text-[#00f3ff] mb-2"
      >
        {card.subtitle}
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold mb-3 text-white"
      >
        {card.title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 mb-3"
      >
        {card.description}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-xs inline-block px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] rounded-full"
      >
        {card.tag}
      </motion.div>
    </motion.div>
  );
}