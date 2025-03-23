import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  HelpCircle, 
  Coffee, 
  Clock, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Twitter, 
  ChevronRight,
  Send,
  Check,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import PageTransition from '@/components/PageTransition';
import Logo from '@/components/Logo';
import { toast } from 'sonner';

type FAQCategory = {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FAQItem[];
};

type FAQItem = {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  display_order?: number;
};

const faqData: FAQCategory[] = [
  {
    id: 'general',
    name: 'General Information',
    icon: <Coffee size={18} />,
    items: [
      {
        id: 'hours',
        question: 'What are your opening hours?',
        answer: (
          <>
            <p><strong>Monday-Friday:</strong> 7:00 AM - 9:00 PM</p>
            <p><strong>Saturday-Sunday:</strong> 8:00 AM - 10:00 PM</p>
            <p className="text-cafe font-medium mt-2">We open early, so you can start your day with the perfect cup!</p>
          </>
        )
      },
      {
        id: 'location',
        question: 'Where is Barista @ Star Hospital located?',
        answer: 'We are conveniently located inside Star Hospital main building, Ground Floor, East Wing. You can find us next to the hospital reception area.'
      },
      {
        id: 'seating',
        question: 'Do you have seating arrangements?',
        answer: 'Yes! We have comfortable seating for 30 guests. We offer cozy corners for those looking for privacy and larger tables for groups and meetings.'
      },
      {
        id: 'wifi',
        question: 'Do you offer free Wi-Fi?',
        answer: 'Absolutely! We provide complimentary high-speed Wi-Fi for all our customers. Just ask our staff for the password when you order.'
      }
    ]
  },
  {
    id: 'menu',
    name: 'Menu & Ordering',
    icon: <CreditCard size={18} />,
    items: [
      {
        id: 'specialties',
        question: 'What are your specialty coffees?',
        answer: 'Our signature drinks include the Caramel Macchiato Supreme, Single-Origin Pour-Over, and our special "Doctor\'s Energy Brew" - a rich espresso with a touch of caramel and cinnamon.'
      },
      {
        id: 'dietary',
        question: 'Do you accommodate dietary restrictions?',
        answer: 'Yes! We offer vegan, gluten-free, and dairy-free options. Our baristas can substitute milk for almond, oat, soy, or coconut milk at a small additional charge.'
      },
      {
        id: 'order-ahead',
        question: 'Can hospital staff order ahead for pickup?',
        answer: 'Yes! Hospital staff can use our mobile app or website to place an order for pickup. We have a special express lane for staff orders, especially during busy hospital shifts.'
      },
      {
        id: 'health',
        question: 'Do you have health-conscious menu options?',
        answer: 'Absolutely! We offer a range of health-conscious options including sugar-free syrups, low-calorie pastries, and fresh fruit smoothies boosted with nutritional supplements.'
      }
    ]
  },
  {
    id: 'policies',
    name: 'Policies & Services',
    icon: <Clock size={18} />,
    items: [
      {
        id: 'loyalty',
        question: 'Do you have a loyalty program for regulars?',
        answer: 'Yes! Our Barista Rewards program gives you points for every purchase. Hospital staff get additional loyalty points as part of our healthcare heroes appreciation program!'
      },
      {
        id: 'payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, mobile payments (Apple Pay, Google Pay), and cash. Hospital staff can also use their employee ID for a seamless payment experience linked to their payroll.'
      },
      {
        id: 'catering',
        question: 'Do you offer catering for hospital meetings?',
        answer: 'Yes! We offer catering services for hospital meetings, conferences, and events. Please contact us at least 24 hours in advance to discuss your requirements.'
      },
      {
        id: 'delivery',
        question: 'Do you deliver to patient rooms or hospital departments?',
        answer: 'Yes! We offer delivery service to all hospital departments and waiting areas. For patient room delivery, please check with the nursing staff first regarding any dietary restrictions.'
      }
    ]
  }
];

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(faqData[0].id);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const contactRef = useRef<HTMLDivElement>(null);
  // Adjust the InView parameters to be more lenient
  const contactInView = useInView(contactRef, { 
    once: true, 
    margin: "-100px 0px",  // Trigger earlier
    amount: 0.1  // Require less of the element to be visible
  });
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create message object
    const newMessage = {
      id: Date.now().toString(),
      name: contactName,
      email: contactEmail,
      message: contactMessage,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // Get existing messages from localStorage or initialize an empty array
    const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    // Add new message to the array
    const updatedMessages = [newMessage, ...existingMessages];
    
    // Save back to localStorage
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
    
    // Complete the form submission immediately
    setIsSubmitting(false);
    setFormSubmitted(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    
    toast.success("Your message has been sent successfully!");
  };
  
  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PageTransition className="min-h-screen bg-[#F8F3E9]">
      {/* Animated background elements */}
      <motion.div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Coffee bean pattern animation */}
        <svg width="100%" height="100%" className="absolute opacity-[0.03]">
          <pattern 
            id="coffee-pattern" 
            x="0" 
            y="0" 
            width="50" 
            height="50" 
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(10)"
          >
            <path 
              d="M25,3c12.15,0,22,9.85,22,22s-9.85,22-22,22S3,37.15,3,25S12.85,3,25,3z M18,12c-3.86,0-7,3.14-7,7s3.14,7,7,7 s7-3.14,7-7S21.86,12,18,12z M32,12c-3.86,0-7,3.14-7,7s3.14,7,7,7s7-3.14,7-7S35.86,12,32,12z"
              fill="currentColor" 
              className="text-cafe-dark"
            />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#coffee-pattern)" />
        </svg>
        
        {/* Floating coffee beans */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cafe/5"
            style={{
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 360, 0],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Subtle gradient orbs */}
        <motion.div 
          className="absolute -right-40 top-40 h-80 w-80 rounded-full bg-amber-800/5 blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -left-20 bottom-60 h-60 w-60 rounded-full bg-amber-700/5 blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.08, 0.12, 0.08]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      
      {/* Header with bounce animation */}
      <motion.header 
        className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container max-w-3xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Link to="/">
                <Logo />
              </Link>
            </motion.div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={scrollToContact}
                className="text-cafe-text/70 hover:text-cafe"
              >
                <Mail size={16} className="mr-2" />
                Contact
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/menu')}
                className="text-cafe-text/70 hover:text-cafe"
              >
                <Coffee size={16} className="mr-2" />
                Menu
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-cafe-text/70 hover:text-cafe"
              >
                <Home size={16} className="mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </motion.header>
      
      <main className="container max-w-3xl mx-auto px-4 sm:px-6 pb-20 relative z-1">
        {/* Hero section with staggered animation */}
        <motion.div 
          className="mb-8 sm:mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-full bg-cafe/10 text-cafe mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 0 0 8px rgba(146, 104, 69, 0.1)" 
            }}
          >
            <HelpCircle size={30} className="sm:hidden" />
            <HelpCircle size={36} className="hidden sm:block" />
          </motion.div>
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold text-cafe-dark"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            className="mt-2 text-sm sm:text-base text-cafe-text/60 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Find answers to common questions about Barista @ Star Hospital. Can't find what you're looking for?{' '}
            <button 
              onClick={scrollToContact}
              className="text-cafe underline hover:text-cafe-dark transition-colors"
            >
              Contact us
            </button>.
          </motion.p>
        </motion.div>
        
        {/* Category tabs - optimized for mobile */}
        <motion.div 
          className="mb-6 flex overflow-x-auto gap-2 pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {faqData.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 sm:px-4 py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeCategory === category.id 
                  ? 'bg-cafe text-white'
                  : 'bg-white border border-cafe/10 text-cafe-dark hover:bg-cafe/5'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="sm:mr-1">{category.icon}</span>
              <span>{category.name}</span>
            </motion.button>
          ))}
        </motion.div>
        
        {/* FAQ Accordion - responsive padding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {faqData.filter(category => category.id === activeCategory).map(category => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-amber-100 shadow-sm"
              >
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-cafe-dark flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    <span>{category.name}</span>
                  </h2>
                  <p className="text-sm text-cafe-text/70 mt-1">Find answers related to {category.name.toLowerCase()}</p>
                </div>
                
                <div className="space-y-3">
                  <Accordion 
                    type="single" 
                    collapsible 
                    value={expandedItem ?? undefined}
                    onValueChange={setExpandedItem}
                    className="space-y-3"
                  >
                    {category.items.map(item => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="bg-white rounded-lg border border-amber-100 overflow-hidden shadow-sm"
                      >
                        <AccordionTrigger className="px-3 sm:px-4 py-3 text-cafe-dark hover:text-cafe text-left font-medium text-sm sm:text-base">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-3 sm:px-4 pt-0 pb-3 sm:pb-4 text-cafe-text text-sm">
                          <div className="prose prose-sm max-w-none prose-p:text-cafe-text prose-headings:text-cafe-dark">
                            {item.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Contact section - mobile optimized */}
        <motion.div 
          ref={contactRef}
          className="mt-12 sm:mt-16 bg-white/90 rounded-lg shadow-md border border-amber-100 overflow-hidden"
          initial={{ opacity: 0.8, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl font-bold text-cafe-dark mb-1">Contact Us</h2>
            <p className="text-sm sm:text-base text-cafe-text/80 mb-6">
              Have a question that's not answered here? Send us a message and we'll get back to you as soon as possible.
            </p>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/5">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="mr-3 shrink-0 h-5 w-5 text-cafe" />
                    <div>
                      <h3 className="font-medium text-cafe-dark">Location</h3>
                      <p className="text-sm text-cafe-text/80">Star Hospital, Ground Floor, East Wing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="mr-3 shrink-0 h-5 w-5 text-cafe" />
                    <div>
                      <h3 className="font-medium text-cafe-dark">Phone</h3>
                      <p className="text-sm text-cafe-text/80">+91 9701441539</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="mr-3 shrink-0 h-5 w-5 text-cafe" />
                    <div>
                      <h3 className="font-medium text-cafe-dark">Email</h3>
                      <p className="text-sm text-cafe-text/80">starbarista950@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex items-center gap-4">
                    <a 
                      href="#" 
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-cafe/10 flex items-center justify-center text-cafe hover:bg-cafe hover:text-white transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram size={16} className="sm:hidden" />
                      <Instagram size={18} className="hidden sm:block" />
                    </a>
                    <a 
                      href="#" 
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-cafe/10 flex items-center justify-center text-cafe hover:bg-cafe hover:text-white transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook size={16} className="sm:hidden" />
                      <Facebook size={18} className="hidden sm:block" />
                    </a>
                    <a 
                      href="#" 
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-cafe/10 flex items-center justify-center text-cafe hover:bg-cafe hover:text-white transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter size={16} className="sm:hidden" />
                      <Twitter size={18} className="hidden sm:block" />
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Debug: Add fixed width and remove conditional animation */}
              <motion.div
                className="md:flex-1 w-full" // Add explicit width
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }} // Always animate in, remove the condition
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-cafe/10 p-6">
                  <h3 className="font-bold text-cafe-dark mb-4">Send us a Message</h3>
                  
                  <AnimatePresence mode="wait">
                    {formSubmitted ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center py-8"
                      >
                        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                          <Check size={24} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-medium text-cafe-dark">Thank You!</h3>
                        <p className="text-cafe-text/70 mt-2">Your message has been sent. We'll get back to you shortly!</p>
                      </motion.div>
                    ) : (
                      <motion.form 
                        key="form"
                        onSubmit={handleContactSubmit}
                        className="space-y-4"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div>
                          <Input
                            placeholder="Your Name"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            required
                            className="border-cafe/20 focus:border-cafe focus:ring-cafe/30"
                          />
                        </div>
                        <div>
                          <Input
                            type="email"
                            placeholder="Email Address"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            required
                            className="border-cafe/20 focus:border-cafe focus:ring-cafe/30"
                          />
                        </div>
                        <div>
                          <Textarea
                            placeholder="Your Message"
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            required
                            className="min-h-[120px] border-cafe/20 focus:border-cafe focus:ring-cafe/30"
                          />
                        </div>
                        <Button 
                          type="submit"
                          className="w-full bg-cafe hover:bg-cafe-dark"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              >
                                <ChevronRight size={16} />
                              </motion.div>
                              Sending...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send size={16} />
                              Send Message
                            </span>
                          )}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Map placeholder with parallax effect */}
        <motion.div 
          className="mt-16 h-64 rounded-2xl bg-cafe/10 overflow-hidden relative"
          initial={{ opacity: 0.8, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-[url('/images/hospital-map.jpg')] bg-cover bg-center opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <MapPin size={36} className="text-cafe mb-2" />
            <p className="font-medium text-cafe-dark text-lg">Visit Our Cafe</p>
            <p className="text-cafe-text/80 text-sm">Address: 1, Khajaguda - Nanakramguda Rd, Hyderabad, Makthakousarali, Telangana 500089</p>
            <Button 
              className="mt-4 bg-white text-cafe-dark hover:bg-cafe hover:text-white"
              onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=Star+Hospital+Barista+Cafe+1+Khajaguda+Nanakramguda+Rd+Hyderabad+Telangana+500089', '_blank')}
            >
              Get Directions
            </Button>
          </div>
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default FAQ;