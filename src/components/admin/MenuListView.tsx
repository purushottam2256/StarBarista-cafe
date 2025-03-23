import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Info, Filter, ChevronDown, ChevronUp, Leaf, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MenuListView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoryExpanded, setCategoryExpanded] = useState<Record<string, boolean>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredMenu, setFilteredMenu] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch menu items from Supabase
  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('menu')
          .select('*')
          .order('item_name');

        if (error) {
          console.error('Error fetching menu items:', error);
          toast.error('Failed to load menu items');
          return;
        }

        if (data) {
          // Transform data to match the expected menu structure
          const menuData = data.reduce((acc: any[], item) => {
            const categoryIndex = acc.findIndex(cat => cat.id === item.category);
            
            if (categoryIndex === -1) {
              acc.push({
                id: item.category,
                name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
                items: [item]
              });
            } else {
              acc[categoryIndex].items.push(item);
            }
            
            return acc;
          }, []);

          setAllItems(menuData);
          setFilteredMenu(menuData);
          
          // Set initial active category
          if (menuData.length > 0) {
            setSelectedCategory(menuData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        toast.error('Failed to load menu items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Filter menu items based on search query
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMenu(allItems);
      return;
    }
    
    const query = searchTerm.toLowerCase();
    const filtered = allItems
      .map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.item_name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.items.length > 0);
    
    setFilteredMenu(filtered);
  }, [searchTerm, allItems]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setCategoryExpanded(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Get menu items by category
  const getItemsByCategory = (categoryId: string): any[] => {
    return filteredMenu.find(category => category.id === categoryId)?.items || [];
  };

  // Generate a link to the menu item detail page
  const handleItemClick = (item: any) => {
    toast.info(`Selected ${item.item_name}`);
  };

  // Format prices to display either single price or range
  const formatPrice = (item: any): string => {
    return `₹${item.price}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cafe"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-cafe-dark">Complete Menu List</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <Filter size={16} />
          Filters
          {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
      </div>
      
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CollapsibleContent>
          <div className="rounded-md border p-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {filteredMenu.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <Info className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No items found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredMenu.reduce((acc, curr) => acc + curr.items.length, 0)} items
          </p>
          
          {selectedCategory === 'all' ? (
            // Group by category when "all" is selected
            filteredMenu.map((category) => {
              const categoryItems = getItemsByCategory(category.id);
              if (categoryItems.length === 0) return null;
              
              return (
                <Collapsible
                  key={category.id}
                  open={categoryExpanded[category.id]}
                  onOpenChange={() => toggleCategory(category.id)}
                  className="border rounded-md overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between bg-muted/30 p-4 cursor-pointer hover:bg-muted/50">
                      <h3 className="text-lg font-semibold">
                        {category.name} ({categoryItems.length})
                      </h3>
                      <Button variant="ghost" size="sm">
                        {categoryExpanded[category.id] ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryItems.map((item) => (
                          <TableRow 
                            key={item.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleItemClick(item)}
                          >
                            <TableCell className="font-medium">{item.item_name}</TableCell>
                            <TableCell>{formatPrice(item)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {item.is_available ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                                    Available
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
                                    Unavailable
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          ) : (
            // Show a simple list when a specific category is selected
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenu.map((category) => {
                  return category.items.map((item) => (
                    <TableRow 
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleItemClick(item)}
                    >
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell>{formatPrice(item)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.is_available ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuListView;