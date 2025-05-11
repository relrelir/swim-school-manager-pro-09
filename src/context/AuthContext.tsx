
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Simple User interface for the application
interface User {
  id: string;
  displayName: string;
  role: 'admin' | 'viewer'; // Added role field
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<boolean>;
  user: User | null;
  isAdmin: () => boolean; // Helper function to check if user is admin
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  changePassword: async () => false,
  user: null,
  isAdmin: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  // Check if there's a saved auth state
  useEffect(() => {
    const savedAuth = localStorage.getItem('swimSchoolAuth');
    const savedRole = localStorage.getItem('swimSchoolUserRole');
    
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      // Create a default user when authenticated
      setUser({
        id: '1',
        displayName: savedRole === 'viewer' ? 'צופה' : 'מנהל',
        role: (savedRole === 'viewer' ? 'viewer' : 'admin') as 'admin' | 'viewer'
      });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { username, password });
      
      // Modified to use public schema, which doesn't require RLS
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('*')  // Select all columns to get role information
        .eq('username', username)
        .maybeSingle();  // Use maybeSingle instead of single to avoid errors when no rows are found
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "שגיאת התחברות",
          description: "אירעה שגיאה בהתחברות, אנא נסה שנית",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('Login data received:', data);
      
      if (data && data.password === password) {
        setIsAuthenticated(true);
        
        // Save auth state with role
        localStorage.setItem('swimSchoolAuth', 'true');
        localStorage.setItem('swimSchoolUserRole', data.role || 'admin');
        
        // Set user data when logging in
        setUser({
          id: data.id,
          displayName: data.role === 'viewer' ? 'צופה' : 'מנהל',
          role: (data.role || 'admin') as 'admin' | 'viewer'
        });
        
        return true;
      } else {
        console.error('Password mismatch or no data');
        toast({
          title: "שגיאת התחברות",
          description: "שם משתמש או סיסמה שגויים",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "שגיאת התחברות",
        description: "אירעה שגיאה בהתחברות, אנא נסה שנית",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('swimSchoolAuth');
    localStorage.removeItem('swimSchoolUserRole');
  };

  // Helper function to check if user is admin
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    // Only admins can change passwords
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לשנות סיסמה",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('admin_credentials')
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('username', 'ענבר במדבר 2014');
      
      if (error) {
        console.error('Error updating password:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעדכון הסיסמה",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "סיסמה עודכנה",
        description: "הסיסמה החדשה נשמרה בהצלחה",
      });
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הסיסמה",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword, user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
