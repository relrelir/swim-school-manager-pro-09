import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'viewer';
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<boolean>;
  user: User | null;
  isAdmin: () => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  changePassword: async () => false,
  user: null,
  isAdmin: () => false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

async function fetchUserRole(firebaseUser: FirebaseUser): Promise<'admin' | 'viewer'> {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      return (userDoc.data().role as 'admin' | 'viewer') || 'viewer';
    }
  } catch {
    // ignore – default to viewer
  }
  return 'viewer';
}

function buildUser(firebaseUser: FirebaseUser, role: 'admin' | 'viewer'): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: role === 'admin' ? 'מנהל' : 'צופה',
    role,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const role = await fetchUserRole(firebaseUser);
        setUser(buildUser(firebaseUser, role));
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const role = await fetchUserRole(credential.user);
      setUser(buildUser(credential.user, role));
      return true;
    } catch {
      toast({
        title: 'שגיאת התחברות',
        description: 'כתובת מייל או סיסמה שגויים',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const isAdmin = (): boolean => user?.role === 'admin';

  const changePassword = async (newPassword: string): Promise<boolean> => {
    if (!auth.currentUser) {
      toast({
        title: 'שגיאה',
        description: 'יש להתחבר מחדש לפני שינוי הסיסמה',
        variant: 'destructive',
      });
      return false;
    }

    try {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      toast({ title: 'סיסמה עודכנה', description: 'הסיסמה החדשה נשמרה בהצלחה' });
      return true;
    } catch {
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון הסיסמה. ייתכן שתצטרך להתחבר מחדש',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, login, logout, changePassword, user, isAdmin, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
