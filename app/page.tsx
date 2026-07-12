import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">AssetFlow</h1>
        <p className="text-xl text-slate-600 mb-8">Enterprise Asset & Resource Management System</p>
        <Link href="/login" className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Get Started
        </Link>
      </div>
    </div>
  );
}
