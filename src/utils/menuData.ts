export type MenuItemType = {
  id: string;
  name: string;
  price: number;
  item_name?: string;
  category: string;
  description?: string;
  veg?: boolean;
  recommended?: boolean;
  image?: string;
  prices?: {
    S?: number;
    R?: number;
    L?: number;
  };
};

export type MenuCategoryType = {
  id: string;
  name: string;
  items: MenuItemType[];
  description?: string;
  image?: string;
};

// Helper function to extract recommended items from menu data
export const getRecommendedItems = (menuItems: MenuCategoryType[] = []): MenuItemType[] => {
  const recommended: MenuItemType[] = [];
  
  menuItems.forEach(category => {
    category.items.forEach(item => {
      if (item.recommended) {
        recommended.push(item);
      }
    });
  });
  
  return recommended;
};
