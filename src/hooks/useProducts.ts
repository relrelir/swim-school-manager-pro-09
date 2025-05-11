
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Product } from '@/types';
import { handleSupabaseError, mapProductFromDB, mapProductToDB } from '@/context/data/utils';
import { supabase } from '@/integrations/supabase/client';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select();

      if (error) {
        handleSupabaseError(error, 'fetching products');
      }

      // Transform data to match our Product type
      const transformedProducts: Product[] = data?.map(product => {
        const mappedProduct = mapProductFromDB(product);
        return {
          ...mappedProduct,
          active: true // Set default value directly instead of accessing non-existent property
        };
      }) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת מוצרים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Products functions
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Transform product to match our database schema
      const dbProduct = mapProductToDB(product);
      
      // Remove any fields that don't exist in the database schema
      delete (dbProduct as any).instructor; // Remove instructor field if it exists

      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding product');
      }

      if (data) {
        const mappedProduct = mapProductFromDB(data);
        const newProduct: Product = {
          ...mappedProduct,
          active: true // Set default value directly instead of accessing non-existent property
        };
        setProducts([...products, newProduct]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת מוצר חדש",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      // Transform product to match our database schema
      const { id, ...productData } = product;
      const dbProduct = mapProductToDB(productData);
      
      // Remove any fields that don't exist in the database schema
      delete (dbProduct as any).instructor; // Remove instructor field if it exists

      const { error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating product');
      }

      setProducts(products.map(p => p.id === product.id ? product : p));
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון מוצר",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Check if product has registrations
      const { data: registrationsData } = await supabase
        .from('registrations')
        .select('id')
        .eq('productid', id);

      if (registrationsData && registrationsData.length > 0) {
        toast({
          title: "שגיאה",
          description: "לא ניתן למחוק מוצר שיש לו רישומי משתתפים",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'deleting product');
      }

      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת מוצר",
        variant: "destructive",
      });
    }
  };

  const getProductsBySeason = (seasonId: string) => {
    return products.filter(product => product.seasonId === seasonId);
  };

  return {
    products,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeason,
    loading,
    setLoading
  };
}
