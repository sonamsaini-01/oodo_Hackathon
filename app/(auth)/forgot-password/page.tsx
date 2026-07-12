
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to send reset link',
          description: error.message,
        });
      } else {
        setIsEmailSent(true);
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

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl p-8 shadow-premium-lg border border-[#E2E8F0] text-center"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-green-600">
              <path d="M20 7L12 13L4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Check your email</h2>
          <p className="text-[#64748B] mb-6">
            We&apos;ve sent you a password reset link.
          </p>
          <Link href="/login" className="text-[#2563EB] font-medium hover:underline">
            Back to login
          </Link>
        </motion.div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-[#0F172A]">Forgot password?</h2>
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-premium-gradient hover:opacity-90 text-white rounded-xl shadow-premium transition-all duration-200"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? 'Sending...' : 'Send reset link'}
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

