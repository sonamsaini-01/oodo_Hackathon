
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Box, Users, Zap, Calendar, Wrench, ClipboardList, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: error.message,
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You are now signed in.',
        });
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Box, title: 'Real-time Tracking', desc: 'Monitor assets in real-time' },
    { icon: Users, title: 'Smart Allocation', desc: 'Optimize resource utilization' },
    { icon: Zap, title: 'AI Insights', desc: 'Predictive maintenance analytics' },
    { icon: Calendar, title: 'Resource Booking', desc: 'Streamline scheduling' },
    { icon: Wrench, title: 'Maintenance Flow', desc: 'Automate work orders' },
    { icon: ClipboardList, title: 'Audit & Reports', desc: 'Comprehensive reporting' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex-col justify-between p-12 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-premium-gradient rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
              <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="rgba(255,255,255,0.7)" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-[#0F172A]">AssetFlow</span>
        </div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-[#0F172A] leading-tight">
              Smart Assets.
              <br />
              Smarter Business.
              <br />
              <span className="text-premium-gradient">Stronger Future.</span>
            </h1>
            <p className="text-lg text-[#64748B] mt-6 max-w-lg">
              Streamline your asset management with intelligent tracking, smart allocations, and AI-powered insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-premium border border-[#E2E8F0]"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A]">{feature.title}</h3>
                  <p className="text-sm text-[#64748B] mt-1">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#64748B]">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm">Enterprise-grade security and compliance</span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#2563EB] rounded-full text-sm font-medium mb-4">
              Welcome Back
            </div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Sign in to AssetFlow</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0F172A] font-medium">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                className="h-12 border-[#E2E8F0] bg-[#F7F9FC] focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0F172A] font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="h-12 border-[#E2E8F0] bg-[#F7F9FC] focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-[#64748B] cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-[#2563EB] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-premium-gradient hover:opacity-90 text-white rounded-xl shadow-premium transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#64748B]">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#2563EB] font-medium hover:underline">
                Create employee account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

