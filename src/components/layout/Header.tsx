
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Key, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { logout, changePassword, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePasswords = () => {
    if (newPassword.length < 4) {
      setPasswordError("הסיסמה חייבת להכיל לפחות 4 תווים");
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("הסיסמאות אינן תואמות");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await changePassword(newPassword);
      
      if (success) {
        setIsPasswordDialogOpen(false);
        setNewPassword("");
        setConfirmPassword("");
        toast({
          title: "סיסמה עודכנה",
          description: "הסיסמה החדשה נשמרה בהצלחה",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הסיסמה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    if (!isLoading) {
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    }
  };

  return (
    <header className="bg-primary text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-reverse space-x-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 15c6.667-6 13.333 0 20-6M9 22c0-4.418-1.791-8-4-8s-4 3.582-4 8M15 22c0-4.418 1.791-8 4-8s4 3.582 4 8"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-alef font-bold">בית ספר לשחייה - ניהול</h1>
            {user && <p className="text-xs text-white/80">שלום, {user.displayName}</p>}
          </div>
        </div>
        
        <div className="flex gap-2">
          {isAdmin() && (
            <Button variant="outline" size="sm" onClick={() => setIsPasswordDialogOpen(true)} aria-label="החלפת סיסמה" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Key aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">החלפת סיסמה</span>
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={logout} aria-label="התנתקות מהמערכת" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">התנתקות</span>
          </Button>
        </div>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md animate-enter">
          <DialogHeader>
            <DialogTitle className="font-alef">שינוי סיסמה</DialogTitle>
            <DialogDescription>
              אנא הזן את הסיסמה החדשה (לפחות 4 תווים)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">סיסמה חדשה</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rtl"
                  placeholder="הזן סיסמה חדשה"
                  minLength={4}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">אימות סיסמה</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rtl"
                  placeholder="הזן את הסיסמה שנית"
                  minLength={4}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {passwordError && (
                <div className="text-destructive text-sm">{passwordError}</div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button 
                type="submit" 
                disabled={isLoading || newPassword.length < 4}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    מעדכן סיסמה...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 ml-2" />
                    שמור סיסמה חדשה
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
