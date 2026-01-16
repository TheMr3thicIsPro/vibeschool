import Link from 'next/link';
import { FallingText } from '@/components/ui/FallingText';
import Galaxy from '@/components/ui/Galaxy';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans">
      <Galaxy 
        density={1.5}
        glowIntensity={0.5}
        saturation={0.8}
        hueShift={240}
        className="absolute inset-0 z-0"
      />
      <div className="flex min-h-screen items-center justify-center relative z-10">
        <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center p-8 bg-background/80 text-foreground">
          <div className="text-center max-w-2xl">
            <FallingText delay={0.2} className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#b36cff]">
              Vibe School
            </FallingText>
            <FallingText delay={0.4} className="text-2xl text-gray-300 mb-8">
              Learn how to build with AI, not just talk about it.
            </FallingText>
            
            <FallingText delay={0.6} className="text-lg text-gray-300 mb-12 max-w-xl mx-auto p-6 rounded-xl border border-[#00f3ff]/30 backdrop-blur-sm bg-background/30">
              Vibe Coding School is a modern learning platform where you master prompt engineering and AI-powered coding through
              real projects, guided lessons, and an active builder community.
            </FallingText>
            
            <FallingText delay={0.8} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/login"
                className="px-8 py-4 bg-[#00f3ff] text-black font-bold rounded-lg hover:bg-[#00c0cc] transition-colors text-lg hover-lift"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="px-8 py-4 bg-transparent border-2 border-[#00f3ff] text-[#00f3ff] font-bold rounded-lg hover:bg-[#00f3ff]/10 transition-colors text-lg hover-lift"
              >
                Sign Up
              </Link>
            </FallingText>
            
            <FallingText delay={1} className="mt-16 pt-8 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                First 2 lessons are free • $1.99 AUD/month or $7.99 AUD lifetime access
              </p>
            </FallingText>
          </div>
        </main>
      </div>
    </div>
  );
}
