import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Coffee, CupSoda } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import PageTransition from '@/components/PageTransition';
import FAQButton from '@/components/FAQButton'; 

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Welcome = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  
  // Remove cursor tracking for cup rotation
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hide splash screen after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleStart = () => {
    navigate('/menu');
  };

  return (
    <PageTransition className="relative min-h-screen w-full overflow-hidden bg-cafe-bg">
      {/* Animated splash screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-cafe"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Logo size="lg" className="text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Coffee beans floating in background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.div 
          className="absolute -left-10 top-20 h-12 w-12 rounded-full bg-cafe/10"
          animate={{ 
            y: [0, -30, 0, -15, 0],
            x: [0, 15, 30, 45, 60],
            rotate: [0, 45, 90, 135, 180]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute right-20 top-40 h-8 w-8 rounded-full bg-cafe/10"
          animate={{ 
            y: [0, 40, 10, 30, 0],
            x: [0, -20, -40, -20, 0],
            rotate: [180, 135, 90, 45, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute bottom-40 left-1/4 h-16 w-16 rounded-full bg-cafe/10"
          animate={{ 
            y: [0, -20, -40, -20, 0],
            rotate: [0, 180, 360, 180, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute bottom-20 right-1/4 h-10 w-10 rounded-full bg-cafe/10"
          animate={{ 
            y: [0, 30, 10, 40, 0],
            x: [0, -10, -20, -10, 0],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 17, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
      
      {/* Parallax depth layers */}
      <div className="fixed inset-0 z-1 overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{ 
            x: [0, 10, 0, -10, 0], 
            y: [0, -10, 0, 10, 0] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl"/>
          <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-amber-800/10 blur-3xl"/>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-10 coffee-pattern opacity-20"></div>
      
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center p-6" ref={containerRef}>
        <div className="w-full max-w-md">
          <div className="text-center">
            <motion.div
              className="mx-auto mb-6 inline-block"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Logo size="lg" />
            </motion.div>
            
            <motion.h1 
              className="mb-2 text-4xl font-bold text-cafe-dark overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Welcome to{" "}
                <motion.span 
                  className="bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text px-2 text-transparent inline-block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 1, 
                    type: "spring", 
                    stiffness: 100
                  }}
                >
                  Barista@star
                </motion.span>
              </motion.div>
            </motion.h1>
            
            <motion.p
              className="mb-8 text-cafe-text/80"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Crafting perfect moments, one cup at a time
            </motion.p>
            
            {/* COFFEE FALLING FROM SKY ANIMATION */}
            <motion.div
              className="mb-12 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <div className="relative h-72 w-72">
                {/* Circle light background */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-50 to-amber-100/0"
                  animate={{ 
                    opacity: [0.5, 0.7, 0.5]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Wooden table surface */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-full bg-gradient-to-t from-amber-900/30 to-amber-800/10" />
                
                {/* Main coffee cup with shadow */}
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2">
                  {/* Cup shadow */}
                  <motion.div
                    className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 h-4 w-24 rounded-full bg-black/20 blur-md"
                    animate={{ width: ["5.5rem", "6rem", "5.5rem"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Cup and saucer */}
                  <div className="relative">
                    {/* Saucer */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-3 w-36 rounded-full bg-gradient-to-r from-white via-gray-100 to-white border border-amber-200/50" />
                    
                    {/* Cup body */}
                    <motion.div
                      className="relative h-24 w-32 rounded-b-[3rem] rounded-t-xl overflow-hidden bg-white border border-amber-200/80"
                      animate={{ 
                        y: [0, -1, 0],
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Coffee inside cup */}
                      <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-b from-amber-700 to-amber-900">
                        {/* Coffee surface */}
                        <motion.div
                          className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600/40 via-amber-700/60 to-amber-600/40"
                          animate={{ 
                            x: ["-5%", "5%", "-5%"]
                          }}
                          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        />
                        
                        {/* Subtle coffee ripples */}
                        <motion.div
                          className="absolute top-6 left-1/4 h-1 w-8 rounded-full bg-amber-600/20"
                          animate={{ 
                            opacity: [0, 0.5, 0],
                            width: ["1rem", "2rem", "1rem"],
                            x: ["-50%", "50%", "-50%"]
                          }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                    
                    {/* Cup handle */}
                    <div className="absolute right-[-14px] top-6 h-12 w-8 border-r-[6px] border-t-[6px] border-b-[6px] rounded-r-full border-white/90" />
                  </div>
                </div>
                
                {/* Enhanced coffee steam/smoke */}
                <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 w-20">
                  {/* Main steam columns */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full bg-white/80"
                      style={{
                        width: 8 - Math.min(i, 4),
                        height: 30 + i * 8,
                        left: `${10 + (i % 3) * 15}px`,
                        filter: "blur(4px)",
                        opacity: 0
                      }}
                      animate={{
                        y: [0, -60 - i * 15],
                        x: [0, ((i % 3) - 1) * 20],
                        opacity: [0, 0.4, 0],
                        scale: [0.8, 1, 0.2]
                      }}
                      transition={{
                        duration: 5 + i * 0.8,
                        repeat: Infinity,
                        delay: i * 1.2,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                  
                  {/* Wider, diffuse steam */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`wide-${i}`}
                      className="absolute rounded-full bg-white/60"
                      style={{
                        width: 12,
                        height: 12,
                        left: `${5 + i * 12}px`,
                        filter: "blur(8px)",
                        opacity: 0
                      }}
                      animate={{
                        y: [0, -80 - i * 20],
                        x: [0, ((i % 2) * 2 - 1) * 30],
                        opacity: [0, 0.3, 0],
                        scale: [1, 3, 0.5]
                      }}
                      transition={{
                        duration: 8 + i,
                        repeat: Infinity,
                        delay: i * 2 + 1,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                  
                  {/* Swirling smoke particles */}
                  {[...Array(8)].map((_, i) => {
                    const startX = -10 + Math.random() * 20;
                    const direction = i % 2 === 0 ? 1 : -1;
                    return (
                      <motion.div
                        key={`particle-${i}`}
                        className="absolute rounded-full bg-white/50"
                        style={{
                          width: 4 + Math.random() * 6,
                          height: 4 + Math.random() * 6,
                          left: `${10 + Math.random() * 30}px`,
                          filter: "blur(3px)",
                          opacity: 0
                        }}
                        animate={{
                          y: [0, -100 - i * 10],
                          x: [startX, startX + direction * (20 + Math.random() * 30)],
                          opacity: [0, 0.2, 0],
                          scale: [0.5, 1.5, 0.2],
                          rotate: [0, direction * 180]
                        }}
                        transition={{
                          duration: 6 + Math.random() * 4,
                          repeat: Infinity,
                          delay: i * 0.7,
                          ease: "easeOut"
                        }}
                      />
                    );
                  })}
                </div>
                
                {/* Relaxing book/pastry on side */}
                <motion.div
                  className="absolute bottom-[20%] right-[15%] h-8 w-14 rounded bg-amber-200"
                  animate={{ rotate: [0, 2, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Book/pastry details */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-300 rounded-t" />
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-amber-100/50 rounded-b" />
                </motion.div>
                
                {/* Small spoon */}
                <motion.div
                  className="absolute bottom-[22%] left-[22%] h-2 w-10 bg-gray-200 rounded-full"
                  style={{ transformOrigin: "left center" }}
                  animate={{ rotate: [10, 5, 10] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute top-[-4px] left-0 h-4 w-4 rounded-full bg-gray-200" />
                </motion.div>
                
                {/* Chill vibes text */}
                <motion.div
                  className="absolute top-[15%] left-1/2 -translate-x-1/2 text-xs text-amber-700/30 font-serif tracking-wider"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    y: [0, -5, 0] 
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  coffee time
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="mx-auto max-w-xs"
            >
              <Button 
                onClick={handleStart} 
                className="group relative w-full overflow-hidden rounded-lg bg-cafe px-6 py-7 text-lg hover:bg-cafe-dark"
              >
                <motion.span 
                  className="relative z-10 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Start Ordering 
                  <motion.div
                    className="ml-2 inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight />
                  </motion.div>
                </motion.span>
                
                {/* Enhanced hover effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
                />
                
                {/* Button light effect */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-30"
                  style={{ 
                    background: "radial-gradient(circle at center, white 0%, transparent 70%)" 
                  }}
                  animate={{ 
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0, 0.3, 0],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </Button>
              
              <motion.p
                className="mt-3 text-center text-sm text-cafe-text/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                Tap to explore our menu
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Move admin panel button to bottom-right corner */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <Button 
          onClick={() => navigate('/admin')} 
          variant="ghost" 
          className="text-sm text-cafe-text/60 hover:text-cafe"
        >
          <ShieldAlert className="mr-2 h-4 w-4" />
          Admin Panel
        </Button>
      </motion.div>
      
      {/* Add FAQ Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        <FAQButton variant="default" size="default" />
      </motion.div>
      
      {/* Coffee beans decoration */}
      <motion.div 
        className="absolute -right-12 bottom-1/3 h-36 w-36 rotate-12 rounded-full border-8 border-dashed border-cafe/10"
        animate={{ rotate: [12, -12, 12] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -left-16 top-1/3 h-28 w-28 -rotate-12 rounded-full border-8 border-dashed border-cafe/10"
        animate={{ rotate: [-12, 12, -12] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Golden grain decorations */}
      <motion.div 
        className="absolute right-10 top-1/3 w-20 h-px bg-amber-600/50"
        animate={{ 
          width: [0, 80, 0], 
          opacity: [0, 0.8, 0],
          y: [0, 10, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating coffee beans with blur */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-cafe/20 backdrop-blur-sm"
          style={{
            height: `${10 + Math.random() * 20}px`,
            width: `${10 + Math.random() * 20}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: `blur(${Math.random() * 2}px)`
          }}
          animate={{ 
            y: [0, -(20 + Math.random() * 40), 0],
            x: [0, (Math.random() - 0.5) * 30, 0],
            rotate: [0, 360, 0],
            opacity: [0, 0.7, 0]
          }}
          transition={{ 
            duration: 8 + Math.random() * 12, 
            repeat: Infinity, 
            delay: i * 0.5
          }}
        />
      ))}
    </PageTransition>
  );
};

export default Welcome;