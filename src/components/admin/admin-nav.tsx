'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/use-user';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  CreditCard,
  Database,
  ArrowLeft,
  BarChart3,
  FileText,
  ShieldCheck,
  Gamepad2,
  Home as HomeIcon,
  Settings,
  Zap,
  Image as ImageIcon,
  Ticket,
  Lock
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Manage Orders', icon: ShoppingCart },
  { href: '/admin/reports', label: 'Generate Reports', icon: FileText },
];

const SUPER_ADMIN_LINKS = [
  { href: '/admin/banners', label: 'Homepage Banners', icon: ImageIcon },
  { href: '/admin/games', label: 'Games & Regions', icon: Gamepad2 },
  { href: '/admin/products', label: 'Products & SKUs', icon: Ticket },
  { href: '/admin/users', label: 'User Accounts', icon: Users },
  { href: '/admin/wallet', label: 'User Wallets', icon: CreditCard },
  { href: '/admin/settings/smileone', label: 'API Integrations', icon: Zap },
  { href: '/admin/homepage', label: 'Homepage Settings', icon: HomeIcon },
  { href: '/admin/system', label: 'General Settings', icon: Settings },
  { href: '/admin/backups', label: 'Data Backups', icon: Database },
];

export const AdminNav = memo(function AdminNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { profile } = useUser();
  const isSuper = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <nav className="flex flex-col gap-2 p-4 overflow-y-auto no-scrollbar pb-10 flex-1 bg-background">
      <Link href="/" prefetch={false} onClick={onItemClick} className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-4 group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Exit Admin
      </Link>
      
      <div className="space-y-1">
        <p className="px-4 mb-2 text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Main Menu</p>
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-none transition-all",
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
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">Full Access</p>
          </div>
          {SUPER_ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-none transition-all",
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
