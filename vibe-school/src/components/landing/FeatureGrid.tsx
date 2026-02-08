'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function FeatureGrid() {
  const [debugMode, setDebugMode] = useState(false);
  
  useEffect(() => {
    // Enable debug mode in development
    if (process.env.NODE_ENV === 'development') {
      setDebugMode(true);
    }
  }, []);

  const features: Feature[] = [
    {
      title: "24/7 Support",
      description: "Get help whenever you get stuck with our round-the-clock support team",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.5 22h-1.5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-1.5"/>
          <path d="M10 17l-2 2v3"/>
          <path d="M14 17l2 2v3"/>
          <circle cx="12" cy="9" r="2"/>
        </svg>
      )
    },
    {
      title: "Hands On Learning",
      description: "Learn by building real projects instead of just watching videos",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 7V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1"/>
          <path d="M18 16V7H6v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2Z"/>
          <path d="M14 13H8"/>
          <path d="M14 11H8"/>
          <path d="M14 9H8"/>
          <path d="M10 18h.01"/>
        </svg>
      )
    },
    {
      title: "Learn how to make games",
      description: "Build games from idea to playable with step-by-step guidance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      )
    },
    {
      title: "Learn how to make websites",
      description: "Create professional websites and digital products from scratch",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <line x1="3" x2="21" y1="9" y2="9"/>
          <line x1="9" x2="9" y1="21" y2="9"/>
        </svg>
      )
    },
    {
      title: "and more",
      description: "Explore additional skills and technologies to expand your expertise",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12h8"/>
          <path d="M12 8v8"/>
        </svg>
      )
    }
  ];

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debugMode) return;

    // Log grid info
    setTimeout(() => {
      const gridElement = gridRef.current;
      if (gridElement) {
        const computedStyle = window.getComputedStyle(gridElement);
        console.log('Grid columns computed:', computedStyle.gridTemplateColumns);
        console.log('Grid gap computed:', computedStyle.gridGap);
      }

      // Check for overlaps
      const cards = document.querySelectorAll('[data-feature-card]');
      const boundingRects: { index: number; rect: DOMRect; title: string }[] = [];

      cards.forEach((card, index) => {
        const titleElement = card.querySelector('h3');
        const title = titleElement?.textContent || `Card ${index}`;
        const rect = card.getBoundingClientRect();
        boundingRects.push({ index, rect, title });
      });

      console.log(`Total feature cards: ${boundingRects.length}`);

      // Check for overlaps
      for (let i = 0; i < boundingRects.length; i++) {
        for (let j = i + 1; j < boundingRects.length; j++) {
          const rectA = boundingRects[i].rect;
          const rectB = boundingRects[j].rect;

          const overlap = !(
            rectA.right < rectB.left ||
            rectA.left > rectB.right ||
            rectA.bottom < rectB.top ||
            rectA.top > rectB.bottom
          );

          if (overlap) {
            console.warn(`Overlap detected: "${boundingRects[i].title}" and "${boundingRects[j].title}"`, {
              cardA: rectA,
              cardB: rectB
            });
          } else {
            console.log(`No overlap: "${boundingRects[i].title}" and "${boundingRects[j].title}"`);
          }
        }
      }

      // Log each card's bounding box
      boundingRects.forEach(({ index, rect, title }) => {
        console.log(`Card ${index} (${title}):`, {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right
        });
      });
    }, 100); // Small delay to ensure rendering is complete
  }, [debugMode]);

  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Why choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">VibeSchool</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Designed to help you learn real skills that matter in today's tech landscape
          </p>
        </motion.div>

        <div 
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-grid="true"
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              feature={feature} 
              index={index} 
              debugMode={debugMode}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  debugMode: boolean;
}

function FeatureCard({ feature, index, debugMode }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      data-feature-card={feature.title}
      initial={{ opacity: 0, y: 14 + (index * 5) }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 + (index * 5) }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.08,
        ease: "easeOut"
      }}

      className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover-lift hover:border-[#00f3ff]/30 transition-all duration-300 group"
      style={{
        animation: inView && !window.matchMedia('(prefers-reduced-motion: reduce)').matches 
          ? `float ${4 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 3}s` 
          : 'none'
      }}
    >
      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 shrink-0 rounded-xl bg-white/10 grid place-items-center group-hover:bg-[#00f3ff]/20 transition-colors">
          <div className="text-[#00f3ff] group-hover:text-[#b36cff] transition-colors">
            {feature.icon}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
          <p className="text-gray-400">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Add the CSS animation to the document
if (typeof document !== 'undefined') {
  if (!document.querySelector('#feature-card-floating-animation')) {
    const style = document.createElement('style');
    style.id = 'feature-card-floating-animation';
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}