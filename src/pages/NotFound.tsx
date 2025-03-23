import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Coffee, HomeIcon, CupSoda, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition className="min-h-screen flex flex-col items-center justify-center bg-[#F8F3E9] overflow-hidden">
      {/* Background coffee stains */}
      <div className="fixed inset-0 z-0 opacity-30">
        <motion.div 
          className="absolute -right-20 top-20 w-40 h-40 rounded-full bg-amber-900/10 blur-2xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute left-10 bottom-40 w-60 h-60 rounded-full bg-amber-800/10 blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Coffee beans floating */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full bg-cafe/10"
          style={{
            height: `${20 + Math.random() * 30}px`,
            width: `${20 + Math.random() * 30}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
          animate={{
            y: [0, -(20 + Math.random() * 50), 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            rotate: [0, 360, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
        {/* Spilled coffee animation */}
        <div className="relative h-40 mb-8">
          <motion.div
            className="absolute left-1/2 top-0 -translate-x-1/2"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Cup */}
              <motion.div
                className="relative w-20 h-24 bg-white rounded-b-3xl rounded-t-lg mx-auto"
                style={{ transformOrigin: "bottom center" }}
                animate={{ rotate: [0, 25, 25, 25, 0] }}
                transition={{ 
                  duration: 3.5, 
                  times: [0, 0.2, 0.5, 0.8, 1],
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                {/* Cup details */}
                <div className="absolute top-0 h-4 w-full bg-[#f0f0f0] rounded-t-lg"></div>
                <motion.div 
                  className="absolute -right-6 top-1/3 h-10 w-6 rounded-r-full border-4 border-white"
                  animate={{ rotate: [0, 10, 10, 10, 0] }}
                  transition={{ 
                    duration: 3.5, 
                    times: [0, 0.2, 0.5, 0.8, 1],
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
                
                {/* Coffee inside cup */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-b-3xl bg-[#8B5D41]"
                  initial={{ height: "18px" }}
                  animate={{ 
                    height: ["18px", "18px", "10px", "10px", "18px"]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    times: [0, 0.2, 0.5, 0.8, 1],
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
              </motion.div>
              
              {/* Spilled coffee */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                <motion.div
                  className="w-4 h-4 rounded-full bg-[#8B5D41] opacity-0"
                  animate={{ 
                    opacity: [0, 0, 1, 0],
                    x: [0, 0, 5, 10],
                    y: [0, 0, 10, 20],
                    scale: [0.5, 0.5, 1, 1.5]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    times: [0, 0.2, 0.3, 0.5],
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
                <motion.div
                  className="w-5 h-5 rounded-full bg-[#8B5D41] opacity-0"
                  animate={{ 
                    opacity: [0, 0, 1, 0],
                    x: [0, 0, -8, -16],
                    y: [0, 0, 12, 24],
                    scale: [0.5, 0.5, 1, 1.5]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    times: [0, 0.2, 0.35, 0.55],
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
                <motion.div
                  className="w-6 h-6 rounded-full bg-[#8B5D41] opacity-0"
                  animate={{ 
                    opacity: [0, 0, 1, 0],
                    x: [0, 0, 12, 24],
                    y: [0, 0, 8, 16],
                    scale: [0.5, 0.5, 1, 1.2]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    times: [0, 0.2, 0.32, 0.52],
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
                
                {/* Coffee puddle */}
                <motion.div
                  className="absolute top-20 left-1/2 w-40 h-12 -translate-x-1/2 rounded-full bg-[#8B5D41]/60 blur-sm"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 0, 0.6, 0.6, 0],
                    scale: [0, 0, 1, 1.05, 0]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    times: [0, 0.2, 0.5, 0.8, 1],
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h1 
            className="text-7xl font-bold text-cafe mb-2"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            404
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 1 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-cafe/50 to-transparent mb-4"
          />
          <motion.h2 
            className="text-3xl font-semibold text-cafe-dark mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Oops! We spilled the beans
          </motion.h2>
          <motion.p
            className="text-lg text-cafe-text/80 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            The page you're looking for seems to have vanished like steam from a hot coffee
          </motion.p>
        </motion.div>
        
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Button 
            asChild
            className="group relative w-full overflow-hidden bg-cafe px-6 py-6 text-lg hover:bg-cafe-dark"
          >
            <Link to="/">
              <motion.span 
                className="relative z-10 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <HomeIcon size={18} />
                Return to Homepage
              </motion.span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
              />
            </Link>
          </Button>
          
          <motion.div 
            className="flex items-center justify-center gap-6 text-cafe/60 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <motion.div 
              whileHover={{ scale: 1.1, color: "#8B5D41" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link to="/menu" className="flex flex-col items-center gap-1">
                <CupSoda size={20} />
                <span className="text-xs">Menu</span>
              </Link>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.1, color: "#8B5D41" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link to="/contact" className="flex flex-col items-center gap-1">
                <Coffee size={20} />
                <span className="text-xs">Contact</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2 text-cafe-text/50 text-xs"
          >
            <Frown size={14} />
            <span>Sorry for the inconvenience</span>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default NotFound;