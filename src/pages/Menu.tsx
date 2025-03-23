import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, X, Coffee, CupSoda, Dessert, Soup, Fish, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import MenuCategory from '@/components/MenuCategory';
import RecommendedItems from '@/components/RecommendedItems';
import PageTransition from '@/components/PageTransition';
import { useCart } from '@/context/CartContext';
import { MenuItemType, MenuCategoryType } from '@/utils/menuData';
import FAQButton from '@/components/FAQButton'; 
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Menu: React.FC = () => {
  // References and state
  const { totalItems, items: cartItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenu, setFilteredMenu] = useState<MenuCategoryType[]>([]);
  const [menuItems, setMenuItems] = useState<MenuCategoryType[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<MenuItemType[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax effects based on scroll
  const backgroundY = useTransform(scrollY, [0, 500], [0, -50]);
  
  // Category references for scrolling
  const categoryRefs = useRef<{[key: string]: HTMLDivElement}>({});
  
  // Fetch menu data from menu table (only available items)
  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true);
      try {
        // Fetch all available menu items from menu table
        const { data: menuData, error } = await supabase
          .from('menu')
        .select('*')
          .eq('is_available', true) // Only available items
          .order('item_name');
          
        if (error) {
          throw error;
        }
        
        // Transform menu items into menu format
        const categorizedItems: { [category: string]: MenuItemType[] } = {};
        const recommended: MenuItemType[] = [];
        
        // Process menu items
        menuData?.forEach(item => {
          const category = item.category || 'other';
          
          // Create menu item from menu table data
          const menuItem: MenuItemType = {
            id: item.id.toString(),
            name: item.item_name,
            price: item.price,
            category: category,
            description: item.description,
            image: '' // Set a default empty string since image_url doesn't exist in the database
          };
          
          // Add to category array
          if (!categorizedItems[category]) {
            categorizedItems[category] = [];
          }
          categorizedItems[category].push(menuItem);
          
          // Add some items to recommended (randomly select a few)
          if (recommended.length < 5 && Math.random() > 0.7) {
            menuItem.recommended = true;
            recommended.push(menuItem);
          }
        });
        
        // Convert categorized items to menu categories
        const categoryNames: { [key: string]: string } = {
          'breakfast': 'ENGLISH BREAKFAST',
          'pizza': 'PIZZA\'S',
          'burger': 'BURGER\'S',
          'snacks': 'SNACK\'S',
          'hot': 'HOT',
          'coffee': 'COFFEE',
          'tea': 'TEA',
          'ice-tea': 'ICE TEA',
          'ice-coffee': 'ICE COFFEE',
          'smoothies': 'SMOOTHIES',
          'other': 'OTHER ITEMS'
        };
        
        const menuCategories: MenuCategoryType[] = Object.keys(categorizedItems).map(category => ({
          id: category,
          name: categoryNames[category] || category.toUpperCase(),
          items: categorizedItems[category]
        }));
        
        setMenuItems(menuCategories);
        setFilteredMenu(menuCategories);
        setRecommendedItems(recommended);
        
        // Set active category to first category if any exist
        if (menuCategories.length > 0 && !activeCategory) {
          setActiveCategory(menuCategories[0].id);
        }
      } catch (error: any) {
        console.error('Error fetching menu data:', error);
        toast.error('Failed to load menu. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuData();
  }, []);
  
  // Filter menu items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMenu(menuItems);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = menuItems
      .map(category => ({
        ...category,
        items: category.items.filter(item => 
          (item.item_name?.toLowerCase().includes(query) || item.name?.toLowerCase().includes(query)) || 
          (item.description?.toLowerCase().includes(query)) ||
          (item.category?.toLowerCase().includes(query))
        )
      }))
      .filter(category => category.items.length > 0);
    
    setFilteredMenu(filtered);
  }, [searchQuery, menuItems]);
  
  // Scroll to category function
  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      // Offset for header height
      const yOffset = -90; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
      
      setActiveCategory(categoryId);
      setShowCategoryDropdown(false);
    }
  };
  
  // Category icon map
  const categoryIcon = {
    coffee: <Coffee size={16} />,
    tea: <CupSoda size={16} />,
    desserts: <Dessert size={16} />,
    sandwiches: <Fish size={16} />,
    default: <Coffee size={16} />
  };
  
  // Get icon for category
  const getIconForCategory = (categoryId: string) => {
    return categoryIcon[categoryId as keyof typeof categoryIcon] || categoryIcon.default;
  };
  
  // Handle search focus
  const handleSearchFocus = (focused: boolean) => {
    setIsSearchFocused(focused);
    if (!focused && !searchQuery) {
      // Clear search when blurred and empty
      setSearchQuery('');
    }
  };
  
  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageTransition className="min-h-screen coffee-pattern">
        <div className="fixed top-0 left-0 right-0 h-screen flex items-center justify-center z-50 bg-white/80">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-cafe mx-auto mb-4" />
            <p className="text-cafe-text">Loading menu items...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen coffee-pattern">
      <motion.header 
        className={`sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm transition-all ${
          isSearchFocused ? 'pb-0' : 'pb-2'
        }`}
        style={{ 
          paddingBottom: isSearchFocused ? 0 : 8
        }}
      >
        <div className="container max-w-md mx-auto p-4">
          {/* Top navigation bar */}
          <div className="flex items-center justify-between">
            <Link to="/" className="text-cafe-text hover:text-cafe">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                <Logo />
              </motion.div>
              </Link>
            
            <div className="flex items-center gap-3">
              <FAQButton />
              
              <Link to="/cart" className="relative">
                <motion.div
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <ShoppingBag size={20} className="text-cafe" />
                  
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-cafe text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </motion.div>
                </Link>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search bar */}
            <div className="my-4 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search menu..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => handleSearchFocus(true)}
                onBlur={() => handleSearchFocus(false)}
              />
            {searchQuery && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={clearSearch}
              >
                <X size={16} />
                </button>
            )}
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-4 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-full flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {menuItems.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className={`px-3 py-2 rounded-full whitespace-nowrap text-sm font-medium flex items-center gap-1.5 ${
                    activeCategory === category.id 
                      ? 'bg-cafe text-white'
                      : 'bg-white/80 border border-cafe/10 text-cafe-dark hover:bg-cafe/5'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getIconForCategory(category.id)}
                  {category.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.header>
      
      <main className="container max-w-md mx-auto p-4 relative z-1 pb-24" ref={scrollRef}>
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecommendedItems items={recommendedItems} />
          </motion.div>
        )}
        
        <AnimatePresence mode="wait">
          {filteredMenu.length > 0 ? (
            <div>
              {filteredMenu.map((category, index) => (
                <motion.div 
                  key={category.id}
                  ref={el => {
                    if (el) categoryRefs.current[category.id] = el;
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <MenuCategory 
                    category={category} 
                    isActive={activeCategory === category.id}
                    onCategoryEnter={() => setActiveCategory(category.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="cafe-card mt-10 p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cafe/10">
                <Search size={20} className="text-cafe" />
              </div>
              <h3 className="text-xl font-semibold">No items found</h3>
              <p className="mt-2 text-muted-foreground mb-4">
                Try searching for a different term
              </p>
              <Button 
                variant="outline" 
                onClick={clearSearch}
                className="text-cafe border-cafe"
              >
                Clear search
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {menuItems.length === 0 && !isLoading && !searchQuery && (
          <motion.div 
            className="cafe-card mt-10 p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cafe/10">
              <Coffee size={20} className="text-cafe" />
            </div>
            <h3 className="text-xl font-semibold">No menu items available</h3>
            <p className="mt-2 text-muted-foreground">
              Please check back later or contact the staff
            </p>
          </motion.div>
        )}
      </main>
      
      {/* Floating Cart Button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div 
            className="fixed bottom-6 left-0 right-0 z-20 px-4 flex justify-center"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Link 
              to="/cart" 
              className="w-full max-w-md"
            >
              <motion.button 
                className="w-full py-3 px-5 bg-cafe hover:bg-cafe-dark text-white rounded-lg shadow-lg flex items-center justify-between"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} />
                  <span className="font-medium">View Cart</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                  <ChevronDown className="rotate-270" size={18} />
                </div>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Menu;