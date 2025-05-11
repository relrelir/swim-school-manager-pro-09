import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { User, Key, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugInfo(null);
    
    if (!username) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס שם משתמש",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס סיסמה",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    console.log('Login attempt with:', { username, password });
    
    try {
      // Check if the user exists first
      const { data: userCheck } = await supabase
        .from('admin_credentials')
        .select('username')
        .eq('username', username);
      
      if (!userCheck || userCheck.length === 0) {
        setDebugInfo(`משתמש "${username}" לא נמצא במערכת.`);
        toast({
          title: "שגיאת התחברות",
          description: "שם משתמש לא קיים",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setDebugInfo(`נמצא משתמש "${username}" במערכת. בודק ��יסמה...`);
      
      // Attempt to login
      const success = await login(username, password);
      
      if (success) {
        setDebugInfo("התחברות מוצלחת! מעביר אותך למערכת...");
      } else {
        setDebugInfo("סיסמה שגויה.");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "שגיאת התחברות",
        description: "אירעה שגיאה בהתחברות, אנא נסה שנית",
        variant: "destructive",
      });
      
      if (error instanceof Error) {
        setDebugInfo(`שגיאה: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">בית ספר לשחייה - כניסה למערכת</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                שם משתמש
              </Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="הכנס שם משתמש"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                סיסמה
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="הכנס סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {debugInfo && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription className="text-sm">{debugInfo}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  מתחבר...
                </>
              ) : (
                'התחבר'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
