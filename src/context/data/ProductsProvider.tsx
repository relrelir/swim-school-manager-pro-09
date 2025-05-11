
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, mapProductFromDB, mapProductToDB } from './utils';
import { ProductsContextType } from './types';

// Create a context for products data
const ProductsContext = createContext<ProductsContextType | null>(null);

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) {
          handleSupabaseError(error, 'fetching products');
        }

        if (data) {
          // Transform data to match our Product type with proper casing
          const transformedProducts = data.map(product => {
            // Map DB fields to our model properties (handle casing differences)
            const mappedProduct = mapProductFromDB(product);
            // Ensure the active field is set
            return {
              ...mappedProduct,
              active: true, // Set default value directly instead of using non-existent p.active
              poolId: product.poolid, // Include the poolId field
              type: mappedProduct.type || 'קורס' // Use mappedProduct.type if it exists, otherwise use default
            };
          });
          
          setProducts(transformedProducts);
        }
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

    fetchProducts();
  }, []);

  // Add a product
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Ensure product has active field and type field
      const fullProduct = {
        ...product,
        active: true, // Set default value directly
        type: product.type || 'קורס' // Ensure type has a default value
      };

      // Convert to DB field names format (lowercase)
      const dbProduct = mapProductToDB(fullProduct);
      
      // Add the poolId field if it exists
      if (product.poolId) {
        dbProduct.poolid = product.poolId;
      }
      
      // Remove any fields that don't exist in the database schema
      delete (dbProduct as any).instructor; // Remove instructor field if it exists
      
      console.log("Adding product with data:", dbProduct);
      
      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adding product');
      }

      if (data) {
        // Convert back to our TypeScript model format (camelCase)
        const newProduct = {
          ...mapProductFromDB(data),
          active: true, // Set default value directly
          poolId: data.poolid, // Include the poolId field
          type: product.type || 'קורס' // Use product.type or default value since data might not have type
        };
        setProducts([...products, newProduct]);
        return newProduct;
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

  // Update a product
  const updateProduct = async (product: Product) => {
    try {
      // Convert to DB field names format (lowercase)
      const { id, poolId, ...productData } = product;
      const dbProduct = mapProductToDB(productData);
      
      // Add poolId to the database update if it exists
      if (poolId !== undefined) {
        dbProduct.poolid = poolId;
      }
      
      // Remove any fields that don't exist in the database schema
      delete (dbProduct as any).instructor; // Remove instructor field if it exists
      
      console.log("Updating product with data:", dbProduct);
      
      const { error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'updating product');
      }

      setProducts(products.map(p => p.id === id ? product : p));
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון מוצר",
        variant: "destructive",
      });
    }
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    try {
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

  // Get products by season
  const getProductsBySeason = (seasonId: string) => {
    return products.filter(product => product.seasonId === seasonId);
  };
  
  // Get products by pool
  const getProductsByPool = (poolId: string) => {
    return products.filter(product => product.poolId === poolId);
  };

  const contextValue: ProductsContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeason,
    getProductsByPool,
    loading
  };

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
};
