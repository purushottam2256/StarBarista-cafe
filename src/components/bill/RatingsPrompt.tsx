
import React, { useState, useEffect } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { mockDB } from '@/integrations/supabase/client';

type RatingSource = {
  id: string;
  name: string;
  url: string;
  icon?: string;
  display_order?: number;
};

// Mock rating sources data for fallback
const mockRatingSources: RatingSource[] = [
  {
    id: '1',
    name: 'Google',
    url: 'https://www.google.com/search?client=ms-android-oppo-rvo3&sca_esv=25cf531ee370dd12&sxsrf=AHTn8zoAXy-GZHL2wLGbTyyaQWLZajYPGQ:1741592921985&kgmid=/g/11lc_ncn94&q=Barista+@+Star+Hospital&shndl=30&source=sh/x/loc/act/m1/2&kgs=bb61644ffc337f4c#lrd=0x3bcb95003e738b05:0xb7f75bfc49f6b975,1,,,,',
    display_order: 1
  },
  {
    id: '2',
    name: 'Zomato',
    url: 'https://www.zomato.com/review',
    display_order: 2
  },
  {
    id: '3',
    name: 'Swiggy',
    url: 'https://www.swiggy.com/review',
    display_order: 3
  }
];

const RatingsPrompt: React.FC = () => {
  const [ratingSources, setRatingSources] = useState<RatingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRatingSources = async () => {
      try {
        // Try to get data from mockDB, explicitly specifying we want rating_sources
        const result = await mockDB.from('rating_sources').select('*').order('display_order');
        
        if (result.data && Array.isArray(result.data)) {
          // Verify and type-check each item to ensure it has the required properties
          const validSources = result.data.filter((item: any) => 
            typeof item.id === 'string' && 
            typeof item.name === 'string' && 
            typeof item.url === 'string'
          ) as RatingSource[];
          
          if (validSources.length > 0) {
            setRatingSources(validSources);
          } else {
            // Fallback to mock data if no valid items found
            console.warn("No valid rating sources found, using mock data");
            setRatingSources(mockRatingSources);
          }
        } else {
          // Fallback to mock data if no data returned
          console.warn("No rating sources data returned, using mock data");
          setRatingSources(mockRatingSources);
        }
      } catch (error) {
        console.error("Error fetching rating sources:", error);
        // Fallback to mock data on error
        setRatingSources(mockRatingSources);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRatingSources();
  }, []);
  
  if (isLoading || ratingSources.length === 0) return null;
  
  return (
    <motion.div
      className="cafe-card mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div className="text-center p-4">
        <div className="flex justify-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={24}
              className="text-yellow-400 fill-yellow-400 mx-0.5"
            />
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-1">Enjoyed your visit?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please rate us on your favorite platform
        </p>
        
        <div className="flex flex-wrap justify-center gap-2">
          {ratingSources.map((source) => (
            <Button
              key={source.id}
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() => window.open(source.url, '_blank')}
            >
              {source.name}
              <ExternalLink size={14} className="ml-1" />
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RatingsPrompt;
