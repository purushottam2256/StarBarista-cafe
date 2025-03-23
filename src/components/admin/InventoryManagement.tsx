import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, RotateCcw, Search, PlusCircle, Edit, Trash2, Loader2, Menu, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Define types
type MenuItemType = {
  id: number;
  item_name: string;
  description?: string;
  is_available: boolean;
  price: number;
  category: string;
  created_at: string;
};

const InventoryManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'menu'>('all');
  
  // New/Edit item form state
  const [itemForm, setItemForm] = useState({
    item_name: '',
    description: '',
    is_available: true,
    price: 0,
    category: 'coffee'
  });

  // Categories for items
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'burger', label: 'Burger' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'hot', label: 'Hot Drinks' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'tea', label: 'Tea' },
    { value: 'ice-tea', label: 'Ice Tea' },
    { value: 'ice-coffee', label: 'Ice Coffee' },
    { value: 'smoothies', label: 'Smoothies' }
  ];

  // Fetch menu items from Supabase
  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      console.log("Attempting to fetch menu items from Supabase...");
      
      // Check connection to Supabase
      try {
        // Using a different approach to check connection - just get the first row
        await supabase.from('menu').select('id').limit(1);
      } catch (connError) {
        console.error("Supabase connection error:", connError);
        toast.error("Could not connect to the database. Please check your internet connection.");
        setIsLoading(false);
        return;
      }
      
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu')
        .select('*')
        .order('item_name');
        
      if (menuItemsError) {
        console.error("Error fetching menu data:", menuItemsError);
        throw menuItemsError;
      }
      
      console.log("Successfully fetched menu items:", menuItemsData ? menuItemsData.length : 0, "items");
      
      setMenuItems(menuItemsData || []);
      setFilteredItems(menuItemsData || []);
    } catch (error: any) {
      console.error("Error fetching menu items:", error);
      
      // Provide more detailed error messages
      if (error.code === 'PGRST116' || error.message?.includes('Failed to fetch')) {
        toast.error("Network error: Unable to reach the database server. Please check your connection.");
      } else if (error.code === '42P01') {
        toast.error("Database error: The menu table doesn't exist.");
      } else {
        toast.error(`Failed to load menu items: ${error.message || 'Unknown error'}`);
      }
      
      // Set empty arrays to prevent undefined errors
      setMenuItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Filter menu items based on search and category
  useEffect(() => {
    let filtered = [...menuItems];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by active view (all or only available items)
    if (activeView === 'menu') {
      filtered = filtered.filter(item => item.is_available);
    }
    
    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, menuItems, activeView]);

  // Toggle item availability
  const toggleItemAvailability = async (itemId: number) => {
    try {
      setProcessing(true);
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;
      
      // Toggle availability from true to false or vice versa
      const newAvailability = !item.is_available;
      
      console.log(`Updating item ${item.item_name} (${itemId}) availability to ${newAvailability ? 'available' : 'unavailable'}`);
      
      const { data, error } = await supabase
        .from('menu')
        .update({ is_available: newAvailability })
        .eq('id', itemId)
        .select();
        
      if (error) throw error;
      
      console.log("Update response:", data);
      
      // Update local state
      setMenuItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, is_available: newAvailability } 
            : item
        )
      );
      
      setFilteredItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, is_available: newAvailability } 
            : item
        )
      );
      
      toast.success(`Item ${newAvailability ? 'available' : 'unavailable'} now. Menu will update automatically.`);
    } catch (error: any) {
      console.error("Error updating item availability:", error);
      toast.error(`Failed to update item availability: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Reset all items to available
  const resetAllItems = async () => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('menu')
        .update({ is_available: true })
        .in('id', menuItems.map(item => item.id));
      
      if (error) throw error;
      
      // Update local state
      setMenuItems(prev => prev.map(item => ({ ...item, is_available: true })));
      setFilteredItems(prev => prev.map(item => ({ ...item, is_available: true })));
      
      toast.success('All items are now available. Menu will update automatically.');
    } catch (error: any) {
      console.error("Error resetting item availability:", error);
      toast.error(`Failed to reset item availability: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Add new item
  const addItem = async () => {
    // Validate form
    if (!itemForm.item_name.trim()) {
      toast.error("Item name is required");
      return;
    }
    
    if (itemForm.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setProcessing(true);
      
      // Log attempt to add item
      console.log("Attempting to add new item:", itemForm);
      
      // Check Supabase connectivity
      try {
        // Changed to a simpler approach that works with Supabase
        const { error: healthError } = await supabase.from('menu').select('id').limit(1);
        
        if (healthError) {
          console.error("Supabase connectivity issue:", healthError);
          throw new Error(`Database connectivity issue: ${healthError.message}`);
        }
      } catch (connErr) {
        console.error("Failed to connect to database:", connErr);
        toast.error("Failed to connect to database. Please check your internet connection.");
        setProcessing(false);
        return;
      }
      
      // Proceed with item insertion
      const { data, error } = await supabase
        .from('menu')
        .insert([{
          item_name: itemForm.item_name.trim(),
          description: itemForm.description.trim(),
          is_available: itemForm.is_available,
          price: Number(itemForm.price),
          category: itemForm.category
        }])
        .select();

      if (error) {
        console.error("Supabase error adding item:", error);
        throw error;
      }

      console.log("Successfully added item, response:", data);
      toast.success(`${itemForm.item_name} added to menu.`);
      
      // Reset form
      setItemForm({
        item_name: '',
        description: '',
        is_available: true,
        price: 0,
        category: 'coffee'
      });
      
      setIsAddDialogOpen(false);
      fetchMenuItems(); // Refresh the list
    } catch (error: any) {
      console.error("Error adding item:", error);
      
      if (error.code === 'PGRST116' || error.message?.includes('Failed to fetch')) {
        toast.error("Network error: Unable to reach the database server");
      } else if (error.code === '23505') {
        toast.error("An item with this name already exists");
      } else {
        toast.error(`Failed to add item: ${error.message}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Handle opening the edit dialog
  const handleEditItem = (item: MenuItemType) => {
    setSelectedItem(item);
    setItemForm({
      item_name: item.item_name,
      description: item.description || '',
      is_available: item.is_available,
      price: item.price,
      category: item.category
    });
    setIsEditDialogOpen(true);
  };

  // Edit existing item
  const updateItem = async () => {
    if (!selectedItem) return;
    
    // Validate form
    if (!itemForm.item_name.trim()) {
      toast.error("Item name is required");
      return;
    }
    
    if (itemForm.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setProcessing(true);
      
      const { error } = await supabase
        .from('menu')
        .update({
          item_name: itemForm.item_name.trim(),
          description: itemForm.description.trim(),
          is_available: itemForm.is_available,
          price: Number(itemForm.price),
          category: itemForm.category
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success(`${itemForm.item_name} updated successfully.`);
      setIsEditDialogOpen(false);
      fetchMenuItems(); // Refresh the list
    } catch (error: any) {
      console.error("Error updating item:", error);
      toast.error(`Failed to update item: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle opening the delete dialog
  const handleDeleteItem = (item: MenuItemType) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const deleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('menu')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success(`${selectedItem.item_name} deleted from menu`);
      setIsDeleteDialogOpen(false);
      fetchMenuItems(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error(`Failed to delete item: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setItemForm({ 
      ...itemForm, 
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value 
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (checked: boolean) => {
    setItemForm({ ...itemForm, is_available: checked });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-cafe-dark">Inventory & Menu Management</h1>
        <Badge className="ml-2">Total: {menuItems.length} items</Badge>
      </div>

      <Tabs 
        defaultValue="all" 
        onValueChange={(value) => setActiveView(value as 'all' | 'menu')}
        className="mb-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="flex items-center gap-1.5">
            <Tag size={16} />
            All Items
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-1.5">
            <Menu size={16} />
            Available Items
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={resetAllItems}
          className="text-cafe hover:bg-cafe/10"
          title="Reset all items to available"
          disabled={processing || isLoading}
        >
          <RotateCcw size={16} />
        </Button>
        
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-cafe hover:bg-cafe-dark whitespace-nowrap"
          disabled={processing}
        >
          <PlusCircle size={16} className="mr-2" />
          Add Item
        </Button>
      </div>
      
      {isLoading ? (
        <div className="cafe-card p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-cafe" />
            <p className="text-muted-foreground">Loading menu items...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filteredItems.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-cafe/10 bg-white shadow-sm">
                <div className="border-b border-cafe/10 bg-cafe/5 px-4 py-3">
                  <h2 className="text-lg font-semibold text-cafe-dark">
                    {activeView === 'all' ? 'All Menu Items' : 'Available Menu Items'}
                  </h2>
                </div>
                
                <div className="divide-y divide-cafe/10">
                  {filteredItems.map(item => (
                    <motion.div
                      key={item.id}
                      className="flex items-center justify-between px-4 py-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-medium text-cafe-text">{item.item_name}</h3>
                          {!item.is_available && (
                            <Badge className="bg-red-100 text-red-600 hover:bg-red-200">Unavailable</Badge>
                          )}
                          {item.description && (
                            <span className="text-xs text-cafe-text/60">
                              {item.description}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-cafe-text/60">
                          <span className="capitalize">{item.category}</span> - 
                          ₹{item.price}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="mr-2 text-sm text-cafe-text/60">Available</span>
                          <Switch
                            checked={item.is_available}
                            onCheckedChange={() => toggleItemAvailability(item.id)}
                            disabled={processing}
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-cafe-text/60 hover:text-cafe"
                          disabled={processing}
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit size={16} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-500 hover:bg-red-50"
                          disabled={processing}
                          onClick={() => handleDeleteItem(item)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="cafe-card p-6 text-center">
                <Ban size={24} className="mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium text-cafe-text">No items found</h3>
                <p className="text-sm text-cafe-text/60 mt-1">
                  {searchQuery 
                    ? "Try a different search term or clear the filters" 
                    : activeView === 'menu'
                      ? "No available menu items found. Set items to available using the toggle."
                      : "No menu items yet. Add some to get started."}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                name="item_name"
                value={itemForm.item_name}
                onChange={handleInputChange}
                placeholder="e.g. Espresso"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={itemForm.description}
                onChange={handleInputChange}
                placeholder="Short description of the item"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.price}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    if (e.target.value === '' || parseFloat(e.target.value) < 0) {
                      setItemForm({...itemForm, price: 0});
                    }
                  }}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={itemForm.category}
                onValueChange={(value) => setItemForm({...itemForm, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.value !== 'all').map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id="is_available" 
                checked={itemForm.is_available}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="is_available" className="cursor-pointer">
                Item is available
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={addItem}
              disabled={processing}
              className="bg-cafe hover:bg-cafe-dark"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_item_name">Item Name *</Label>
              <Input
                id="edit_item_name"
                name="item_name"
                value={itemForm.item_name}
                onChange={handleInputChange}
                placeholder="e.g. Espresso"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                name="description"
                value={itemForm.description}
                onChange={handleInputChange}
                placeholder="Short description of the item"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_price">Price (₹) *</Label>
                <Input
                  id="edit_price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.price}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    if (e.target.value === '' || parseFloat(e.target.value) < 0) {
                      setItemForm({...itemForm, price: 0});
                    }
                  }}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit_category">Category *</Label>
              <Select
                value={itemForm.category}
                onValueChange={(value) => setItemForm({...itemForm, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.value !== 'all').map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id="edit_is_available" 
                checked={itemForm.is_available}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="edit_is_available" className="cursor-pointer">
                Item is available
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={updateItem}
              disabled={processing}
              className="bg-cafe hover:bg-cafe-dark"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Item Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold">{selectedItem?.item_name}</span>? 
              This action cannot be undone.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={deleteItem}
              disabled={processing}
              variant="destructive"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement; 