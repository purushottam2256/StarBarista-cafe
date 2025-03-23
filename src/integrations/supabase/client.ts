import { createClient } from '@supabase/supabase-js';
import { generateOrderId } from '@/utils/formatUtils';

// Log Supabase connection parameters (without exposing full keys)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log connection parameters for debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing from environment variables!');
} else {
  console.log(`Supabase URL configured: ${supabaseUrl.slice(0, 12)}...`);
  console.log(`Supabase Anon Key configured: ${supabaseAnonKey.slice(0, 10)}...`);
}

// Create a supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args) => {
      // Add custom fetch with timeout
      const controller = new AbortController();
      const { signal } = controller;
      
      // Set a timeout of 10 seconds
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // @ts-ignore
      return fetch(...args, { signal })
        .then(response => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.error('Supabase fetch error:', error);
          throw error;
        });
    }
  }
});

// Mock database for development
interface MockDBResponse<T> {
  data: T | null;
  error: Error | null;
}

// Mock data store
const mockData = {
  'menu_items': [
    {
      id: '1',
      name: 'Cappuccino',
      price: 120,
      category: 'coffee',
      recommended: true,
      veg: true,
      unavailable: false,
      sizes: { S: 100, R: 120, L: 140 }
    },
    {
      id: '2',
      name: 'Espresso',
      price: 100,
      category: 'coffee',
      recommended: true,
      veg: true,
      unavailable: false,
      sizes: { S: 80, R: 100, L: 120 }
    },
    {
      id: '3',
      name: 'Latte',
      price: 130,
      category: 'coffee',
      recommended: false,
      veg: true,
      unavailable: false,
      sizes: { S: 110, R: 130, L: 150 }
    },
    {
      id: '4',
      name: 'Croissant',
      price: 80,
      category: 'food',
      recommended: true,
      veg: true,
      unavailable: false
    },
    {
      id: '5',
      name: 'Chocolate Brownie',
      price: 90,
      category: 'dessert',
      recommended: true,
      veg: true,
      unavailable: false
    },
    {
      id: '6',
      name: 'Green Tea',
      price: 110,
      category: 'tea',
      recommended: false,
      veg: true,
      unavailable: false,
      sizes: { S: 90, R: 110, L: 130 }
    },
    {
      id: '7',
      name: 'Fresh Orange Juice',
      price: 140,
      category: 'beverage',
      recommended: false,
      veg: true,
      unavailable: false,
      sizes: { S: 120, R: 140, L: 160 }
    },
    {
      id: '8',
      name: 'Sandwich',
      price: 150,
      category: 'food',
      recommended: false,
      veg: true,
      unavailable: false
    },
    {
      id: '9',
      name: 'Cheesecake',
      price: 120,
      category: 'dessert',
      recommended: true,
      veg: true,
      unavailable: false
    },
    {
      id: '10',
      name: 'Iced Coffee',
      price: 130,
      category: 'coffee',
      recommended: false,
      veg: true,
      unavailable: false,
      sizes: { S: 110, R: 130, L: 150 }
    }
  ],
  'orders': [
    {
      id: '1',
      order_number: 'ORD230401-1234',
      items: [
        { id: '1', name: 'Cappuccino', price: 120, quantity: 2, size: 'R' },
        { id: '2', name: 'Croissant', price: 80, quantity: 1 }
      ],
      subtotal: 320,
      taxes: 16,
      total: 336,
      status: 'completed',
      payment_method: 'cash',
      created_at: '2023-04-01T10:30:00Z',
      approved_at: '2023-04-01T10:35:00Z'
    },
    {
      id: '2',
      order_number: 'ORD230401-5678',
      items: [
        { id: '3', name: 'Latte', price: 130, quantity: 1, size: 'L' },
        { id: '5', name: 'Chocolate Brownie', price: 90, quantity: 2 }
      ],
      subtotal: 310,
      taxes: 15.5,
      total: 325.5,
      status: 'completed',
      payment_method: 'card',
      created_at: '2023-04-01T14:20:00Z',
      approved_at: '2023-04-01T14:25:00Z'
    },
    {
      id: '3',
      order_number: 'ORD230401-9012',
      items: [
        { id: '2', name: 'Espresso', price: 100, quantity: 1, size: 'R' },
        { id: '9', name: 'Cheesecake', price: 120, quantity: 1 }
      ],
      subtotal: 220,
      taxes: 11,
      total: 231,
      status: 'pending',
      payment_method: null,
      created_at: '2023-04-01T16:45:00Z',
      approved_at: null
    }
  ],
  'rating_sources': [
    {
      id: '1',
      name: 'Google',
      url: 'https://g.page/r/CZ6RuTYHzAQZEB0/review',
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
  ],
  'faqs': [
    {
      id: '1',
      question: 'What are your opening hours?',
      answer: 'We are open from 8:00 AM to 10:00 PM every day.'
    },
    {
      id: '2',
      question: 'Do you serve decaf coffee?',
      answer: 'Yes, we offer decaffeinated options for most of our coffee drinks.'
    },
    {
      id: '3',
      question: 'Is there WiFi available?',
      answer: 'Yes, we provide free WiFi. Please ask our staff for the password.'
    },
    {
      id: '4',
      question: 'Do you offer any vegan options?',
      answer: 'Yes, we have several vegan food and beverage options. Our staff can guide you through the menu.'
    },
    {
      id: '5',
      question: 'Can I book a table for a large group?',
      answer: 'Yes, we accept reservations for groups of 6 or more. Please call us in advance.'
    },
    {
      id: '6',
      question: 'Do you have outdoor seating?',
      answer: 'Yes, we have a lovely outdoor patio area that is open during good weather.'
    }
  ]
};

// Helper function to convert any JSON-like structure or string to a proper object
export function convertSupabaseJson(jsonValue: any): any {
  if (typeof jsonValue === 'string') {
    try {
      return JSON.parse(jsonValue);
    } catch (e) {
      return jsonValue;
    }
  }
  return jsonValue;
}

// A more robust mockDB implementation to handle Supabase-like query chains
export const mockDB = {
  from: (tableName: string) => {
    const tableData = [...(mockData[tableName as keyof typeof mockData] || [])];
    
    // This will track filters applied to this query
    const filters: {column: string, value: any, operator: string}[] = [];
    const orderByInfo: {column: string, ascending: boolean} = {column: '', ascending: true};
    
    return {
      select: (columns: string = '*') => {
        return {
          order: (columnName: string, { ascending = true } = {}) => {
            orderByInfo.column = columnName;
            orderByInfo.ascending = ascending;
            
            // Apply any filters
            let filteredData = [...tableData];
            filters.forEach(filter => {
              if (filter.operator === 'eq') {
                filteredData = filteredData.filter(item => item[filter.column] === filter.value);
              } else if (filter.operator === 'neq') {
                filteredData = filteredData.filter(item => item[filter.column] !== filter.value);
              } else if (filter.operator === 'gt') {
                filteredData = filteredData.filter(item => item[filter.column] > filter.value);
              } else if (filter.operator === 'lt') {
                filteredData = filteredData.filter(item => item[filter.column] < filter.value);
              }
            });
            
            // Sort the data
            const sortedData = [...filteredData].sort((a, b) => {
              const aValue = a[columnName as keyof typeof a];
              const bValue = b[columnName as keyof typeof b];
              return ascending ? 
                (aValue > bValue ? 1 : -1) : 
                (aValue < bValue ? 1 : -1);
            });
            
            return {
              data: sortedData,
              error: null
            };
          },
          data: tableData,
          error: null
        };
      },
      insert: (values: any) => {
        try {
          // Add the item to our mock data
          if (Array.isArray(values)) {
            values.forEach(value => {
              // Generate an ID if not provided
              if (!value.id) {
                value.id = Math.random().toString(36).substring(2, 10);
              }
              
              // Generate order_number for orders if not provided
              if (tableName === 'orders' && !value.order_number) {
                value.order_number = generateOrderId();
              }
              
              (mockData[tableName as keyof typeof mockData] as any[]).push(value);
            });
          } else {
            // Generate an ID if not provided
            if (!values.id) {
              values.id = Math.random().toString(36).substring(2, 10);
            }
            
            // Generate order_number for orders if not provided
            if (tableName === 'orders' && !values.order_number) {
              values.order_number = generateOrderId();
            }
            
            (mockData[tableName as keyof typeof mockData] as any[]).push(values);
          }
          
          return {
            data: { inserted: true, rows: Array.isArray(values) ? values : [values] },
            error: null
          };
        } catch (error) {
          return {
            data: null,
            error: new Error(`Error inserting into ${tableName}: ${error}`)
          };
        }
      },
      update: (values: any) => {
        return {
          eq: (column: string, value: any) => {
            try {
              // Find the item by the column value
              const itemIndex = (mockData[tableName as keyof typeof mockData] as any[])
                .findIndex(item => item[column] === value);
              
              if (itemIndex !== -1) {
                // Update the item with new values
                (mockData[tableName as keyof typeof mockData] as any[])[itemIndex] = {
                  ...(mockData[tableName as keyof typeof mockData] as any[])[itemIndex],
                  ...values
                };
                
                return {
                  data: { updated: true },
                  error: null
                };
              }
              
              return {
                data: null,
                error: new Error(`Item with ${column} = ${value} not found`)
              };
            } catch (error) {
              return {
                data: null,
                error: new Error(`Error updating ${tableName}: ${error}`)
              };
            }
          }
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            try {
              const initialLength = (mockData[tableName as keyof typeof mockData] as any[]).length;
              (mockData[tableName as keyof typeof mockData] as any[]) = 
                (mockData[tableName as keyof typeof mockData] as any[])
                  .filter(item => item[column] !== value);
              
              const deleted = initialLength > (mockData[tableName as keyof typeof mockData] as any[]).length;
              
              return {
                data: { deleted },
                error: null
              };
            } catch (error) {
              return {
                data: null,
                error: new Error(`Error deleting from ${tableName}: ${error}`)
              };
            }
          }
        };
      }
    };
  },
  auth: {
    getSession: async () => {
      return {
        data: {
          session: localStorage.getItem('isAdmin') === 'true' ? { user: { email: 'admin@example.com' } } : null
        }
      };
    }
  }
};
