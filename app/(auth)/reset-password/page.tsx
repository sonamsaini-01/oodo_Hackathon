
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

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

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
      const { error } = await updatePassword(password);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to reset password',
          description: error.message,
        });
      } else {
        toast({
          title: 'Password reset successful!',
          description: 'You can now sign in with your new password.',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl p-8 shadow-premium-lg border border-[#E2E8F0]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-premium-gradient rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
              <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="rgba(255,255,255,0.7)" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Reset your password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0F172A] font-medium">
              New password
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
              Confirm new password
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
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? 'Resetting...' : 'Reset password'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-[#64748B] hover:text-[#0F172A]">
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

