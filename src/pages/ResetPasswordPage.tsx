import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { BarChart3, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 15;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabel = passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Medium' : 'Strong';
  const strengthColor = passwordStrength < 40 ? 'bg-destructive' : passwordStrength < 70 ? 'bg-yellow-500' : 'bg-green-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast({
          title: 'Update failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setSuccess(true);
        toast({
          title: 'Password updated',
          description: 'Your password has been successfully changed.',
        });
        setTimeout(() => navigate('/'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Password Updated!</h2>
          <p className="text-muted-foreground">
            Your password has been successfully changed. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">StaffTrack</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Set new password</h2>
          <p className="text-muted-foreground mt-2">
            Choose a strong password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={`font-medium ${passwordStrength < 40 ? 'text-destructive' : passwordStrength < 70 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {strengthLabel}
                  </span>
                </div>
                <Progress value={passwordStrength} className={`h-2 ${strengthColor}`} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || password !== confirmPassword || password.length < 8}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Password requirements:</p>
          <ul className="space-y-0.5">
            <li className={password.length >= 8 ? 'text-primary' : ''}>• At least 8 characters</li>
            <li className={/[A-Z]/.test(password) ? 'text-primary' : ''}>• One uppercase letter</li>
            <li className={/[0-9]/.test(password) ? 'text-primary' : ''}>• One number</li>
            <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-primary' : ''}>• One special character</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
