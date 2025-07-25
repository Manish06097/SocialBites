import { createSupabaseBrowserClient } from './client';
import { Stall, MenuItem, FoodCourt } from '@/lib/types';

export async function getStalls(foodCourtId?: string): Promise<Stall[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase.from('stalls').select(`
    id,
    name,
    logo_url,
    banner_url,
    rating,
    tags,
    food_court_id,
    owner_id,
    created_at,
    updated_at
  `);

  if (foodCourtId) {
    query = query.eq('food_court_id', foodCourtId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching stalls:', error);
    return [];
  }

  return data as Stall[];
}

export async function getStallWithMenuItems(stallId: string): Promise<Stall | null> {
  const supabase = createSupabaseBrowserClient();
  const { data: stallData, error: stallError } = await supabase
    .from('stalls')
    .select(`
      id,
      name,
      logo_url,
      banner_url,
      rating,
      tags,
      food_court_id,
      owner_id,
      created_at,
      updated_at
    `)
    .eq('id', stallId)
    .maybeSingle();

  if (stallError) {
    console.error('Error fetching stall:', stallError);
    return null;
  }

  if (!stallData) {
    return null;
  }

  const { data: menuItemsData, error: menuItemsError } = await supabase
    .from('menu_items')
    .select(`
      id,
      stall_id,
      name,
      description,
      price,
      category,
      image_url,
      available,
      customizations,
      rating,
      orders_count,
      created_at,
      updated_at
    `)
    .eq('stall_id', stallId);

  if (menuItemsError) {
    console.error('Error fetching menu items:', menuItemsError);
    return { ...stallData, menu: [] } as Stall; // Return stall without menu if menu items fail
  }

  const menuCategories: { [key: string]: MenuItem[] } = {};
  menuItemsData.forEach((item: any) => {
    const menuItem: MenuItem = {
      id: item.id,
      stall_id: item.stall_id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.image_url,
      available: item.available,
      customizations: item.customizations,
      rating: item.rating,
      orders: item.orders_count,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
    if (!menuCategories[item.category]) {
      menuCategories[item.category] = [];
    }
    menuCategories[item.category].push(menuItem);
  });

  const menu = Object.keys(menuCategories).map(categoryTitle => ({
    title: categoryTitle,
    items: menuCategories[categoryTitle],
  }));

  return { ...stallData, menu } as Stall;
}

export async function getFoodCourts(): Promise<FoodCourt[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('food_courts').select('*');

  if (error) {
    console.error('Error fetching food courts:', error);
    return [];
  }

  return data as FoodCourt[];
}

export async function getFoodCourtById(foodCourtId: string): Promise<FoodCourt | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('food_courts')
    .select('*')
    .eq('id', foodCourtId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching food court by ID:', error);
    return null;
  }

  return data as FoodCourt;
}
