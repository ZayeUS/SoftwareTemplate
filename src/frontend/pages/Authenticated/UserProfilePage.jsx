import React, { useState } from "react";
import { useUserStore } from "../../store/userStore";
import { putData, deleteData } from "../../utils/BackendRequestHelper";
import { updateUserPassword, reauthenticateUser, deleteFirebaseUser } from "../../../firebase";
import { Edit, Save, X, User, Lock, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast"; // CORRECTED IMPORT
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// Re-authentication Dialog for sensitive actions
const ReauthDialog = ({ open, onOpenChange, onConfirm, title, loading }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleConfirm = () => {
        onConfirm(password);
        setPassword(''); // Clear password after submission
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>For your security, please enter your password to continue.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                        <Input
                            id="current-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                         <Button type="button" variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={loading}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleConfirm} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// Change Password Dialog
const ChangePasswordDialog = ({ onSave, loading, apiError, setApiError }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false });
    const [error, setError] = useState('');
    
    const handleSave = () => {
        setError('');
        setApiError('');
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setError("All fields are required.");
            return;
        }
        if (passwords.new.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setError("New passwords do not match.");
            return;
        }
        onSave(passwords.current, passwords.new);
    };

    const toggleShowPassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {apiError && <Alert variant="destructive"><AlertDescription>{apiError}</AlertDescription></Alert>}
                <div className="space-y-2">
                    <Label htmlFor="change-pass-current">Current Password</Label>
                    <Input id="change-pass-current" type={showPasswords.current ? 'text' : 'password'} value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="change-pass-new">New Password</Label>
                    <Input id="change-pass-new" type={showPasswords.new ? 'text' : 'password'} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="change-pass-confirm">Confirm New Password</Label>
                    <Input id="change-pass-confirm" type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline" disabled={loading}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Password
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};


export function UserProfilePage() {
  const { profile, setProfile, clearUser, setLoading, loading } = useUserStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: profile?.first_name || "", last_name: profile?.last_name || "" });
  const [dialogOpen, setDialogOpen] = useState({ changePass: false, reauthDelete: false });
  const [apiError, setApiError] = useState('');

  const handleProfileSave = async () => {
    if (!formData.first_name || !formData.last_name) return;
    setLoading(true);
    try {
      const response = await putData('/profile', formData);
      setProfile(response.profile);
      toast({ title: "Success", description: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setApiError('');
    try {
        await reauthenticateUser(currentPassword);
        await updateUserPassword(newPassword);
        toast({ title: "Success", description: "Password updated successfully!" });
        setDialogOpen(prev => ({ ...prev, changePass: false }));
    } catch (error) {
        console.error("Change Password Error:", error);
        const message = error.code === 'auth/wrong-password' ? "The current password you entered is incorrect." : "An error occurred. Please try again.";
        setApiError(message);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteAccount = async (password) => {
      setLoading(true);
      try {
        await reauthenticateUser(password);
        await deleteData('/users/me');
        await deleteFirebaseUser();
        toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
        clearUser();
      } catch (error) {
        console.error("Account deletion failed:", error);
        let message = "An unexpected error occurred. Please try again later.";
        if (error.code === 'auth/wrong-password') {
            message = "The password you entered is incorrect. Account not deleted.";
        }
        toast({ variant: "destructive", title: "Deletion Failed", description: message });
      } finally {
        setLoading(false);
        setDialogOpen(prev => ({ ...prev, reauthDelete: false }));
      }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                    {profile ? profile.first_name.charAt(0) : <User />}
                </AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-2xl">{profile ? `${profile.first_name} ${profile.last_name}` : "User Profile"}</CardTitle>
                <CardDescription>{profile?.email || "Manage your account details."}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Separator className="my-4" />
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Personal Details</h3>
                {!isEditing && <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>}
            </div>
            {isEditing ? (
                 <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleProfileSave} disabled={loading}>
                             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-muted-foreground">First Name</p>
                        <p>{profile?.first_name}</p>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground">Last Name</p>
                        <p>{profile?.last_name}</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your password and account status.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-center py-3">
                <div>
                    <p className="font-semibold">Change Password</p>
                    <p className="text-sm text-muted-foreground">Keep your account secure by updating your password.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline"><Lock className="mr-2 h-4 w-4"/>Change</Button>
                    </DialogTrigger>
                    <ChangePasswordDialog onSave={handleChangePassword} loading={loading} apiError={apiError} setApiError={setApiError} />
                </Dialog>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-3">
                <div>
                    <p className="font-semibold text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all of your data.</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setDialogOpen(prev => ({...prev, reauthDelete: true}))}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardContent>
      </Card>

       <ReauthDialog 
          open={dialogOpen.reauthDelete} 
          onOpenChange={(isOpen) => setDialogOpen(prev => ({...prev, reauthDelete: isOpen}))} 
          onConfirm={handleDeleteAccount} 
          title="Confirm Account Deletion" 
          loading={loading} 
        />
    </div>
  );
}