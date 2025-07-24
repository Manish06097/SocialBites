



export interface Stall {
  id: string;
  name: string;
  logo_url: string;
  banner_url: string;
  rating: number;
  tags: string[];
  menu: MenuCategory[];
  food_court_id: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string; // uuid from db
  stall_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string; // from image_url in db
  available: boolean;
  customizations: Customization[] | null;
  rating: number;
  orders: number; // from orders_count in db
  created_at?: string;
  updated_at?: string;
  isNew?: boolean; // client-side flag
}

export interface Customization {
  title: string;
  type: 'radio' | 'checkbox';
  options: CustomizationOption[];
}

export interface CustomizationOption {
  label: string; 
  price_modifier: number
}

export interface CartItem {
  id: string; // combination of menuItemId and customizations
  menuItem: MenuItem;
  stall: Pick<Stall, 'id' | 'name' | 'food_court_id'>;
  quantity: number;
  customizationChoices?: { [title: string]: string | string[] };
  specialInstructions?: string;
  totalPrice: number;
}

export interface TrendingItem {
  id: string;
  name: string;
  stallName: string;
  imageUrl: string;
  price: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready_for_pickup' | 'completed' | 'rejected';

export interface OrderItem {
    id: string;
    order_id: string;
    stall_id: string;
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    customizations: Customization[] | null;
    special_instructions: string | null;
    status: OrderStatus;
    menu_items: {
        name: string;
        image_url: string;
    };
    stalls: {
        name: string;
    };
}

export interface Order {
  id: string;
  display_id: string;
  user_id: string;
  food_court_id: string;
  table_id: string | null;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
}


export interface FoodCourt {
    id: string;
    name: string;
}
