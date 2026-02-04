import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Shield, Key, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SettingsPage() {
  const { user, resetPassword, signOut } = useAuth();
  const { role, departmentAccess, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [sendingReset, setSendingReset] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setSendingReset(true);
    try {
      const { error } = await resetPassword(user.email);
      if (error) {
        toast({
          title: 'Reset failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a password reset link.',
        });
      }
    } finally {
      setSendingReset(false);
    }
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'default';
      case 'account_manager': return 'secondary';
      case 'recruiter': return 'outline';
      case 'business_dev': return 'secondary';
      case 'finance': return 'outline';
      case 'operations': return 'secondary';
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
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account and security settings</p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {user?.email?.slice(0, 2).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role & Permissions
              </CardTitle>
              <CardDescription>Your access level and department permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant={getRoleBadgeVariant(role)}>
                  {formatRole(role)}
                </Badge>
              </div>
              
              {departmentAccess.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Department Access</span>
                  <div className="flex flex-wrap gap-2">
                    {departmentAccess.map((dept) => (
                      <Badge key={dept} variant="outline">{dept}</Badge>
                    ))}
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
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Change your password via email verification
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handlePasswordReset}
                  disabled={sendingReset}
                >
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
              <Button variant="destructive" onClick={signOut}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
