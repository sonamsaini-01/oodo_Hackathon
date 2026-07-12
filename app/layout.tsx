import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: "AssetFlow - Enterprise Asset Management",
  description: "Enterprise Asset & Resource Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
