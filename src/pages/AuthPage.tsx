import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { BarChart3, Users, Briefcase, DollarSign } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Check your email',
            description: 'We sent you a confirmation link. Please verify your email to continue.',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-accent/80 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StaffTrack</span>
          </div>
        </div>
        
        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Your Complete Staffing<br />Business Command Center
          </h1>
          <p className="text-white/80 text-lg">
            Track jobs, manage clients, monitor performance, and stay on top of receivables — all in one dashboard.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Users className="h-8 w-8 text-white mb-2" />
              <p className="text-white font-medium">Client Management</p>
              <p className="text-white/70 text-sm">Track all your staffing clients</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Briefcase className="h-8 w-8 text-white mb-2" />
              <p className="text-white font-medium">Job Tracking</p>
              <p className="text-white/70 text-sm">From open to placement</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <BarChart3 className="h-8 w-8 text-white mb-2" />
              <p className="text-white font-medium">Performance KPIs</p>
              <p className="text-white/70 text-sm">Real-time metrics</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <DollarSign className="h-8 w-8 text-white mb-2" />
              <p className="text-white font-medium">Receivables</p>
              <p className="text-white/70 text-sm">Never miss a payment</p>
            </div>
          </div>
        </div>
        
        <p className="text-white/60 text-sm">
          © 2025 StaffTrack. All rights reserved.
        </p>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">StaffTrack</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? 'Sign in to access your staffing dashboard' 
                : 'Start tracking your staffing business today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
