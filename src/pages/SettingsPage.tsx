import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Shield, Key, User, Camera, Sun, Moon, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SettingsPage() {
  const { user, resetPassword, signOut } = useAuth();
  const { role, departmentAccess, isAdmin } = useUserRole();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Sync profile data once
  if (profile && !profileLoaded) {
    setDisplayName(profile.display_name || '');
    setPhone(profile.phone || '');
    setProfileLoaded(true);
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      const { error } = await resetPassword(user.email);
      if (error) {
        toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Check your email', description: 'We sent you a password reset link.' });
      }
    } finally {
      setSendingReset(false);
    }
  };

  const handleSaveProfile = () => {
    updateProfile.mutate(
      { display_name: displayName, phone },
      { onSuccess: () => toast({ title: 'Profile updated' }) }
    );
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatar.mutate(file, {
      onSuccess: () => toast({ title: 'Avatar updated' }),
      onError: () => toast({ title: 'Upload failed', variant: 'destructive' }),
    });
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'default';
      case 'account_manager': case 'business_dev': case 'operations': return 'secondary';
      default: return 'outline';
    }
  };

  const formatRole = (role: string | null) => {
    if (!role) return 'No Role Assigned';
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-8">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account, profile, and preferences</p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-medium text-primary">{user?.email?.slice(0, 2).toUpperCase() || 'U'}</span>
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90"
                  >
                    <Camera className="h-3 w-3 text-primary-foreground" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Display Name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <Button size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Theme Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Appearance
              </CardTitle>
              <CardDescription>Customize how StaffTrack looks</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-1 cursor-pointer"><Sun className="h-4 w-4" /> Light</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-1 cursor-pointer"><Moon className="h-4 w-4" /> Dark</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-1 cursor-pointer"><Monitor className="h-4 w-4" /> System</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Role & Permissions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Role & Permissions</CardTitle>
              <CardDescription>Your access level and department permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant={getRoleBadgeVariant(role)}>{formatRole(role)}</Badge>
              </div>
              {departmentAccess.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Department Access</span>
                  <div className="flex flex-wrap gap-2">
                    {departmentAccess.map((dept) => <Badge key={dept} variant="outline">{dept}</Badge>)}
                  </div>
                </div>
              )}
              {isAdmin && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-primary font-medium">Administrator Access</p>
                  <p className="text-xs text-muted-foreground">You have full access to all features and settings.</p>
                </div>
              )}
              {!role && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">No Role Assigned</p>
                  <p className="text-xs text-muted-foreground">Contact your administrator to get access permissions.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">Change your password via email verification</p>
                </div>
                <Button variant="outline" onClick={handlePasswordReset} disabled={sendingReset}>
                  <Mail className="h-4 w-4 mr-2" />
                  {sendingReset ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Sign Out</CardTitle>
              <CardDescription>End your current session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={signOut}>Sign Out</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
