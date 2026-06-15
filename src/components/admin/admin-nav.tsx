
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/use-user';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Globe, 
  Settings,
  CreditCard,
  Zap,
  Cpu,
  Activity,
  Megaphone,
  Database,
  ArrowLeft,
  BarChart3,
  FileText,
  ShieldCheck,
  Palette,
  Key
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, superOnly: false },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, superOnly: false },
  { href: '/admin/reports', label: 'Reports', icon: FileText, superOnly: false },
];

const SUPER_ADMIN_LINKS = [
  { href: '/admin/analytics', label: 'Intel Analytics', icon: BarChart3 },
  { href: '/admin/users', label: 'User Registry', icon: Users },
  { href: '/admin/products', label: 'Product Catalog', icon: Package },
  { href: '/admin/regions', label: 'Regional Grid', icon: Globe },
  { href: '/admin/settings/website', label: 'Web Branding', icon: Palette },
  { href: '/admin/settings/payments', label: 'Payment Hub', icon: CreditCard },
  { href: '/admin/settings/telegram', label: 'Bot Settings', icon: Key },
  { href: '/admin/settings/smileone', label: 'Smile.one API', icon: Zap },
  { href: '/admin/settings/unipin', label: 'UniPin API', icon: Cpu },
  { href: '/admin/announcements', label: 'Broadcasts', icon: Megaphone },
  { href: '/admin/system', label: 'System Health', icon: Activity },
  { href: '/admin/backups', label: 'Data Archives', icon: Database },
];

export function AdminNav() {
  const pathname = usePathname();
  const { profile } = useUser();
  const isSuper = profile?.role === 'super_admin';

  return (
    <nav className="flex flex-col gap-2 p-4 overflow-y-auto no-scrollbar pb-10">
      <Link href="/" className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-4">
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </Link>
      
      <div className="space-y-1">
        <p className="px-4 mb-2 text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">Core Operations</p>
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
      )}
    </nav>
  );
}
