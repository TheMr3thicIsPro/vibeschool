import Link from 'next/link';
import BlurText from '@/components/ui/BlurText';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center p-8 bg-background text-foreground">
        <div className="text-center max-w-2xl">
          <div className="mb-6">
            <BlurText 
              text="Vibe School"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#b36cff]"
            />
          </div>
          <p className="text-2xl text-gray-300 mb-8">
            Learn to prompt engineer and vibe code using AI
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
            A futuristic platform where you'll master the art of AI coding through
            interactive lessons, real-time community support, and hands-on projects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/login"
              className="px-8 py-4 bg-[#00f3ff] text-black font-bold rounded-lg hover:bg-[#00c0cc] transition-colors text-lg"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup"
              className="px-8 py-4 bg-transparent border-2 border-[#00f3ff] text-[#00f3ff] font-bold rounded-lg hover:bg-[#00f3ff]/10 transition-colors text-lg"
            >
              Sign Up
            </Link>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              First 2 lessons are free • $1.99 AUD/month or $7.99 AUD lifetime access
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
