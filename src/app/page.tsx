'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TrustStrip from '@/components/landing/TrustStrip';
import Features from '@/components/landing/Features';
import OpportunityScroll from '@/components/landing/OpportunityScroll';
import LearningPath from '@/components/landing/LearningPath';
import Pricing from '@/components/landing/Pricing';
import Community from '@/components/landing/Community';
import FinalCTA from '@/components/landing/FinalCTA';

import '@/styles/landing.css';

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    // Debug logs for scroll functionality
    if (process.env.NODE_ENV === 'development') {
      const root = document.documentElement;
      const body = document.body;
      
      console.log("=== SCROLL DEBUG STARTUP ===");
      console.log("HTML overflow:", getComputedStyle(root).overflow);
      console.log("Body overflow:", getComputedStyle(body).overflow);
      console.log("Body height:", body.scrollHeight, "vs", window.innerHeight);
      console.log("Window dimensions:", window.innerWidth, "x", window.innerHeight);
      
      // Check for features section
      const features = document.getElementById("features");
      console.log("Features element exists:", !!features);
      if (features) {
        console.log("Features position:", features.getBoundingClientRect());
        console.log("Features offsetTop:", features.offsetTop);
      }
      
      // Check for potential blockers
      const blockerTop = document.elementFromPoint(window.innerWidth/2, 10);
      const blockerBottom = document.elementFromPoint(window.innerWidth/2, window.innerHeight-10);
      console.log("Element at top center:", blockerTop?.tagName, blockerTop?.className);
      console.log("Element at bottom center:", blockerBottom?.tagName, blockerBottom?.className);
      
      // Check for any fixed/absolute elements
      const fixedElements = document.querySelectorAll('*[style*="position: fixed"], *[style*="position: absolute"]');
      console.log("Fixed/Absolute elements found:", fixedElements.length);
      
      console.log("=== SCROLL DEBUG END ===");
    }
    
    const handleScroll = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log("Scroll event fired, position:", window.scrollY);
      }
      
      const sections = ['hero', 'features', 'opportunity', 'learn', 'pricing', 'community', 'cta'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (process.env.NODE_ENV === 'development' && activeSection !== section) {
              console.log("Active section changed to:", section);
            }
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 noise-bg"></div>
      </div>
      
      <Navbar activeSection={activeSection} />
      <Hero />
      <TrustStrip />
      <Features />
      <OpportunityScroll />
      <LearningPath />
      <Pricing />
      <Community />
      <FinalCTA />
      
      {process.env.NODE_ENV === "development" && (
        <div style={{position:"fixed", bottom:8, right:8, zIndex:9999, fontSize:12, background:"#000", color:"#fff", padding:"6px 8px", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8}}>
          scrollY: {typeof window !== "undefined" ? Math.round(window.scrollY) : 0}
        </div>
      )}
    </div>
  );
}