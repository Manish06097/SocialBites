
export interface Stall {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  rating: number;
  tags: string[];
  menu: MenuCategory[];
  foodCourtId: string;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  orders: number;
  available?: boolean;
  customizations?: Customization[];
  category?: string; // Added category to menu item
}

export interface Customization {
  title: string;
  type: 'radio' | 'checkbox';
  options?: CustomizationOption[];
}

export interface CustomizationOption {
  label: string; 
  price_modifier: number
}

export interface CartItem {
  id: string; // combination of menuItemId and customizations
  menuItem: MenuItem;
  stall: Pick<Stall, 'id' | 'name' | 'foodCourtId'>;
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

export interface Order {
  id: string;
  customerName: string;
  contactNumber: string;
  paymentMethod: 'UPI' | 'COD';
  itemsByStall: {
    [stallId: string]: {
      stallName: string;
      items: (CartItem & { status: 'Accepted' | 'Preparing' | 'On the Way' | 'Delivered' | 'Rejected' })[];
    }
  };
  totalAmount: number;
  orderDate: Date;
}

export interface FoodCourt {
    id: string;
    name: string;
}
