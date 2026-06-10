import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video/hooks';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = { open: 4000, features: 4500, tech: 4000, tagline: 4000, close: 4000 };

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505]">
      {/* Persistent Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #444, transparent)' }}
          animate={{ 
            x: ['-20%', '40%', '10%'], 
            y: ['10%', '60%', '20%'], 
            scale: [1, 1.2, 0.9],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} 
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-10 blur-[100px] right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #fff, transparent)' }}
          animate={{ x: ['10%', '-30%', '5%'], y: ['-10%', '-40%', '-15%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Persistent Midground Elements */}
      <motion.div
        className="absolute h-[1px] bg-white/40 z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        animate={{
          left: ['0%', '20%', '40%', '10%', '30%'][currentScene],
          width: ['100%', '60%', '20%', '80%', '40%'][currentScene],
          top: ['50%', '80%', '20%', '90%', '50%'][currentScene],
          opacity: [0.5, 0.2, 0.6, 0.2, 0.8][currentScene],
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      
      {/* Framing borders */}
      <div className="absolute inset-8 border border-white/5 pointer-events-none z-10 hidden md:block" />
      <div className="absolute top-12 left-12 w-4 h-[1px] bg-white/20 z-10" />
      <div className="absolute top-12 left-12 w-[1px] h-4 bg-white/20 z-10" />
      <div className="absolute bottom-12 right-12 w-4 h-[1px] bg-white/20 z-10" />
      <div className="absolute bottom-12 right-12 w-[1px] h-4 bg-white/20 z-10" />

      {/* Foreground Scenes */}
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="open" />}
        {currentScene === 1 && <Scene2 key="features" />}
        {currentScene === 2 && <Scene3 key="tech" />}
        {currentScene === 3 && <Scene4 key="tagline" />}
        {currentScene === 4 && <Scene5 key="close" />}
      </AnimatePresence>
    </div>
  );
}