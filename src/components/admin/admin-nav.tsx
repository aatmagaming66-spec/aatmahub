
'use client';

import { useEffect, memo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/use-user';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Globe, 
  CreditCard,
  Activity,
  Database,
  ArrowLeft,
  BarChart3,
  FileText,
  ShieldCheck,
  Palette,
  Key,
  Gamepad2,
  Tv,
  Share2,
  ImageIcon,
  Home as HomeIcon,
  Layers,
  Wallet
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
];

const SUPER_ADMIN_LINKS = [
  { href: '/admin/analytics', label: 'Intelligence', icon: BarChart3 },
  { href: '/admin/media', label: 'Media Hub', icon: ImageIcon },
  { href: '/admin/homepage', label: 'Home Control', icon: HomeIcon },
  { href: '/admin/games', label: 'Games Manager', icon: Gamepad2 },
  { href: '/admin/products', label: 'Catalog Hub', icon: Package },
  { href: '/admin/tabs', label: 'Tab Manager', icon: Layers },
  { href: '/admin/regions', label: 'Global Grid', icon: Globe },
  { href: '/admin/ott', label: 'OTT Hub', icon: Tv },
  { href: '/admin/social', label: 'Social Hub', icon: Share2 },
  { href: '/admin/users', label: 'Identity Registry', icon: Users },
  { href: '/admin/wallet', label: 'Wallet Registry', icon: Wallet },
  { href: '/admin/settings/payments', label: 'Payment Hub', icon: CreditCard },
  { href: '/admin/settings/telegram', label: 'Bot Config', icon: Key },
  { href: '/admin/settings/website', label: 'Branding', icon: Palette },
  { href: '/admin/system', label: 'Kernel Stats', icon: Activity },
  { href: '/admin/backups', label: 'Data Vault', icon: Database },
];

export const AdminNav = memo(function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useUser();
  const isSuper = profile?.role === 'super_admin';

  // Instant Prefetch Logic for all admin routes
  useEffect(() => {
    ADMIN_LINKS.forEach(link => router.prefetch(link.href));
    if (isSuper) {
      SUPER_ADMIN_LINKS.forEach(link => router.prefetch(link.href));
    }
  }, [router, isSuper]);

  return (
    <nav className="flex flex-col gap-2 p-4 overflow-y-auto no-scrollbar pb-10">
      <Link href="/" className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-4 group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Store
      </Link>
      
      <div className="space-y-1">
        <p className="px-4 mb-2 text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Core Operations</p>
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {isSuper && (
        <div className="mt-8 space-y-1">
          <div className="flex items-center gap-2 px-4 mb-2">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">Super Admin Sector</p>
          </div>
          {SUPER_ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <link.icon className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
});
