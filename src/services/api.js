import { supabase } from '../supabaseClient';

/**
 * This service mimics the behavior of the previous JSON-server API
 * but uses Supabase as the backend.
 */

export const apiService = {
  // Fetch all categories and their products
  // Formats data to match the old { category_slug: [products] } structure
  getCategories: async () => {
    // We'll fetch all products and their associated category slugs
    // Assumes a table 'products' and 'product_categories' exists
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(category_slug)');

    if (error) throw error;

    // Transform data into the structure expected by the frontend
    const categoryMap = {};
    
    // Initialize empty arrays for each known category to avoid undefined issues
    const knownSlugs = [
      'sach_mam_non', 'sach_thieu_nhi', 'sach_ki_nang', 'sach_kinh_doanh', 
      'sach_me_va_be', 'sach_van_hoc', 'sach_tham_khao', 'notebook', 
      'top_best_seller', 'sach_moi', 'sach_sap_phat_hanh'
    ];
    knownSlugs.forEach(slug => categoryMap[slug] = []);

    data.forEach(product => {
      const { product_categories, ...productData } = product;
      if (product_categories && Array.isArray(product_categories)) {
        product_categories.forEach(pc => {
          if (!categoryMap[pc.category_slug]) {
            categoryMap[pc.category_slug] = [];
          }
          categoryMap[pc.category_slug].push(productData);
        });
      }
    });

    return categoryMap;
  },

  // Update categories (In Supabase, we handle this by updating products and their relations)
  // This is a bit complex because the old code sent the whole object.
  // We'll try to handle the individual product update/add/delete logic in components later
  // or provide a helper that simulates the 'save all' behavior.
  updateCategories: async (categoryObj) => {
    // Note: In Supabase, it's better to update individual items.
    // For compatibility, we'll need to be careful here.
    // The current Admin.jsx uses PUT /category which is not how Supabase works.
    console.warn("Direct update of whole category object is not recommended in Supabase.");
    return categoryObj;
  },

  // User management
  getUsers: async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data;
  },

  // Order management
  getOrders: async () => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    return data;
  },

  createOrder: async (orderData) => {
    const { data, error } = await supabase.from('orders').insert([orderData]);
    if (error) throw error;
    return data;
  },

  // Product CRUD (New methods for Supabase)
  upsertProduct: async (productData, targetCategories) => {
    // 1. Upsert product
    const { data: product, error: pError } = await supabase
      .from('products')
      .upsert(productData)
      .select()
      .single();

    if (pError) throw pError;

    // 2. Update categories (delete old, insert new)
    const { error: dError } = await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', product.id);

    if (dError) throw dError;

    const categoryInserts = targetCategories.map(slug => ({
      product_id: product.id,
      category_slug: slug
    }));

    const { error: iError } = await supabase
      .from('product_categories')
      .insert(categoryInserts);

    if (iError) throw iError;

    return product;
  },

  deleteProduct: async (productId) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
  }
};
