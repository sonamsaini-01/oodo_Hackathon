
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const organizationCode = formData.get('organizationCode') as string;

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, fullName, organizationCode);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Signup failed',
          description: error.message,
        });
      } else {
        toast({
          title: 'Account created!',
          description: 'Check your email for a verification link.',
        });
        router.push('/login');
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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Same as login for consistency */}
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

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-[#0F172A] leading-tight">
              Join your team
              <br />
              on <span className="text-premium-gradient">AssetFlow</span>
            </h1>
            <p className="text-lg text-[#64748B] mt-6 max-w-lg">
              Create your employee account and get started with enterprise-grade asset management.
            </p>
          </motion.div>
        </div>

        <div className="text-sm text-[#64748B]">
          Need to set up a new organization?{' '}
          <Link href="/setup-organization" className="text-[#2563EB] font-medium hover:underline">
            Contact our team
          </Link>
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
            <h2 className="text-3xl font-bold text-[#0F172A]">Create employee account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[#0F172A] font-medium">
                Full name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Smith"
                required
                className="h-12 border-[#E2E8F0] bg-[#F7F9FC] focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0F172A] font-medium">
                Company email
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
              <Label htmlFor="organizationCode" className="text-[#0F172A] font-medium">
                Organization code
              </Label>
              <Input
                id="organizationCode"
                name="organizationCode"
                placeholder="Enter your organization code"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#0F172A] font-medium">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="h-12 border-[#E2E8F0] bg-[#F7F9FC] focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-premium-gradient hover:opacity-90 text-white rounded-xl shadow-premium transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#64748B]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2563EB] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

