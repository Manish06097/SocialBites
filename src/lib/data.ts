import type { Stall, TrendingItem, FoodCourt } from './types';

export const foodCourts: FoodCourt[] = [
  { id: 'fc1', name: 'Vesu Food Plaza' },
  { id: 'fc2', name: 'Piplod Food Fest' },
  { id: 'fc3', name: 'Adajan Eateria' },
];

export const stalls: Stall[] = [
  // Food Court 1: Vesu Food Plaza
  {
    id: 's1',
    name: "Gopal Locho",
    logoUrl: "https://images.unsplash.com/photo-1707330069618-0dff8e80a6e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8Y29tcGFueSUyMGxvZ298ZW58MHx8fHwxNzUyODk2OTI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    bannerUrl: "https://images.unsplash.com/photo-1713699860139-1fa847f155b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxmb29kJTIwc3RhbGx8ZW58MHx8fHwxNzUyODk2OTI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    tags: ["Gujarati", "Snacks", "Street Food"],
    foodCourtId: "fc1",
    menu: [
      {
        title: "Locho Varieties",
        items: [
          { id: "m1-1", name: "Butter Locho", description: "Classic steamed gram flour cake with a dollop of butter.", price: 80, imageUrl: "https://placehold.co/400x300.png", rating: 4.9, orders: 500, customizations: [ { title: 'Spice Level', type: 'radio', options: [{ label: 'Mild', price_modifier: 0 }, { label: 'Medium', price_modifier: 0 }, { label: 'Spicy', price_modifier: 10 }] }, { title: 'Add-ons', type: 'checkbox', options: [{ label: 'Extra Cheese', price_modifier: 20 }, { label: 'Garlic Chutney', price_modifier: 15 }] } ] },
          { id: "m1-2", name: "Cheese Roll Locho", description: "Locho rolled with generous cheese filling.", price: 120, imageUrl: "https://placehold.co/400x300.png", rating: 4.7, orders: 350, customizations: [] },
        ],
      },
      {
        title: "Other Delicacies",
        items: [
          { id: "m1-3", name: "Khaman", description: "Soft and spongy steamed gram flour snack.", price: 60, imageUrl: "https://placehold.co/400x300.png", rating: 4.6, orders: 400, customizations: [] },
        ],
      }
    ],
  },
  {
    id: 's2',
    name: "La Pino'z Pizza",
    logoUrl: "https://placehold.co/100x100.png",
    bannerUrl: "https://placehold.co/600x300.png",
    rating: 4.5,
    tags: ["Pizza", "Italian", "Fast Food"],
    foodCourtId: "fc1",
    menu: [
        {
            title: "Signature Pizzas",
            items: [
                { id: "m2-1", name: "Margherita Pizza", description: "The classic with fresh mozzarella and basil.", price: 250, imageUrl: "https://placehold.co/400x300.png", rating: 4.6, orders: 800, customizations: [ { title: 'Crust Type', type: 'radio', options: [{ label: 'Classic Hand-Tossed', price_modifier: 0 }, { label: 'Cheese Burst', price_modifier: 80 }, { label: 'Thin Crust', price_modifier: 20 }] }, { title: 'Extra Toppings', type: 'checkbox', options: [{ label: 'Olives', price_modifier: 40 }, { label: 'Mushrooms', price_modifier: 40 }] } ] },
                { id: "m2-2", name: "Farmhouse Pizza", description: "Loaded with fresh veggies like onions, capsicum, tomatoes.", price: 350, imageUrl: "https://placehold.co/400x300.png", rating: 4.8, orders: 950, customizations: [] },
            ],
        },
        {
            title: "Sides",
            items: [
                { id: "m2-3", name: "Garlic Breadsticks", description: "Warm, soft breadsticks with a garlic butter glaze.", price: 150, imageUrl: "https://placehold.co/400x300.png", rating: 4.7, orders: 1200, customizations: [] },
                { id: "m2-4", name: "Choco Lava Cake", description: "A decadent chocolate cake with a molten center.", price: 100, imageUrl: "https://placehold.co/400x300.png", rating: 4.9, orders: 1500, customizations: [] },
            ],
        },
    ]
  },
  // Food Court 2: Piplod Food Fest
  {
    id: 's3',
    name: "Wok on Fire",
    logoUrl: "https://placehold.co/100x100.png",
    bannerUrl: "https://placehold.co/600x300.png",
    rating: 4.6,
    tags: ["Chinese", "Asian", "Noodles"],
    foodCourtId: "fc2",
    menu: [
        {
            title: "Starters",
            items: [
                { id: "m3-1", name: "Manchurian Dry", description: "Crispy vegetable balls tossed in a tangy sauce.", price: 180, imageUrl: "https://placehold.co/400x300.png", rating: 4.7, orders: 600, customizations: [] },
            ],
        },
        {
            title: "Main Course",
            items: [
                { id: "m3-2", name: "Hakka Noodles", description: "Stir-fried noodles with mixed vegetables.", price: 220, imageUrl: "https://placehold.co/400x300.png", rating: 4.5, orders: 700, customizations: [ { title: 'Variant', type: 'radio', options: [{ label: 'Veg', price_modifier: 0 }, { label: 'Egg', price_modifier: 30 }, { label: 'Chicken', price_modifier: 60 }] } ] },
                { id: "m3-3", name: "Schezwan Fried Rice", description: "Spicy fried rice with a bold Schezwan flavor.", price: 240, imageUrl: "https://placehold.co/400x300.png", rating: 4.6, orders: 650, customizations: [] },
            ],
        }
    ]
  },
  {
    id: 's4',
    name: "Dangee Dums",
    logoUrl: "https://placehold.co/100x100.png",
    bannerUrl: "https://placehold.co/600x300.png",
    rating: 4.9,
    tags: ["Dessert", "Cakes", "Bakery"],
    foodCourtId: "fc2",
    menu: [
        {
            title: "Pastries & Cakes",
            items: [
                { id: "m4-1", name: "Dutch Truffle Pastry", description: "Rich, dense, and gooey chocolate truffle pastry.", price: 150, imageUrl: "https://placehold.co/400x300.png", rating: 4.9, orders: 2000, customizations: [] },
                { id: "m4-2", name: "Red Velvet Cake (500g)", description: "Classic red velvet cake with cream cheese frosting.", price: 600, imageUrl: "https://placehold.co/400x300.png", rating: 4.8, orders: 400, customizations: [] },
            ],
        },
        {
            title: "Beverages",
            items: [
                { id: "m4-3", name: "Cold Coffee", description: "Thick and creamy cold coffee shake.", price: 180, imageUrl: "https://placehold.co/400x300.png", rating: 4.7, orders: 800, customizations: [] },
            ],
        }
    ]
  },
  // Food Court 3: Adajan Eateria
  {
    id: 's5',
    name: "Sizzling Salsa",
    logoUrl: "https://placehold.co/100x100.png",
    bannerUrl: "https://placehold.co/600x300.png",
    rating: 4.7,
    tags: ["Mexican", "Sizzlers", "Tex-Mex"],
    foodCourtId: "fc3",
    menu: [
        {
            title: "Sizzlers",
            items: [
                { id: "m5-1", name: "Veg Sizzler", description: "Assorted veggies, patty, and noodles on a hot plate.", price: 450, imageUrl: "https://placehold.co/400x300.png", rating: 4.8, orders: 500, customizations: [] },
                { id: "m5-2", name: "Paneer Shashlik Sizzler", description: "Marinated paneer skewers with sizzling veggies.", price: 550, imageUrl: "https://placehold.co/400x300.png", rating: 4.7, orders: 350, customizations: [] },
            ],
        },
        {
            title: "Mexican",
            items: [
                { id: "m5-3", name: "Cheesy Nachos", description: "Crispy nachos topped with cheese sauce and salsa.", price: 220, imageUrl: "https://placehold.co/400x300.png", rating: 4.6, orders: 800, customizations: [] },
            ],
        }
    ]
  },
  {
    id: 's6',
    name: "Juice Junction",
    logoUrl: "https://placehold.co/100x100.png",
    bannerUrl: "https://placehold.co/600x300.png",
    rating: 4.8,
    tags: ["Juices", "Shakes", "Healthy"],
    foodCourtId: "fc3",
    menu: [
        {
            title: "Fresh Juices",
            items: [
                { id: "m6-1", name: "Watermelon Juice", description: "Refreshing and hydrating freshly squeezed juice.", price: 100, imageUrl: "https://placehold.co/400x300.png", rating: 4.9, orders: 1200, customizations: [] },
                { id: "m6-2", name: "Mixed Fruit Juice", description: "A blend of seasonal fruits for a vitamin boost.", price: 140, imageUrl: "https://placehold.co/400x300.png", rating: 4.8, orders: 900, customizations: [] },
            ],
        },
        {
            title: "Milkshakes",
            items: [
                { id: "m6-3", name: "Oreo Shake", description: "A classic blend of Oreo cookies and ice cream.", price: 180, imageUrl: "https://placehold.co/400x300.png", rating: 4.7, orders: 1500, customizations: [] },
            ],
        }
    ]
  },
];


export const getStallById = (id: string): Stall | undefined => {
    return stalls.find(stall => stall.id === id);
}

export const getMenuItem = (stallId: string, itemId: string) => {
    const stall = getStallById(stallId);
    if (!stall) return { stall: undefined, item: undefined };
    
    for (const category of stall.menu) {
        const item = category.items.find(item => item.id === itemId);
        if (item) {
            return { stall, item };
        }
    }
    return { stall, item: undefined };
}


export const trendingItems: TrendingItem[] = [
    {id: "t1", name: "Garlic Breadsticks", stallName: "La Pino'z Pizza", imageUrl: "https://placehold.co/400x300.png", price: 150 },
    {id: "t2", name: "Dutch Truffle Pastry", stallName: "Dangee Dums", imageUrl: "https://placehold.co/400x300.png", price: 150 },
    {id: "t3", name: "Butter Locho", stallName: "Gopal Locho", imageUrl: "https://placehold.co/400x300.png", price: 80 },
    {id: "t4", name: "Farmhouse Pizza", stallName: "La Pino'z Pizza", imageUrl: "https://placehold.co/400x300.png", price: 350 },
    {id: "t5", name: "Hakka Noodles", stallName: "Wok on Fire", imageUrl: "https://placehold.co/400x300.png", price: 220 },
];
