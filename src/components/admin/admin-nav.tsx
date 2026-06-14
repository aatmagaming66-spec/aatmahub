
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Globe, 
  IndianRupee,
  ArrowLeft,
  Settings,
  CreditCard
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/regions', label: 'Regions', icon: Globe },
  { href: '/admin/settings/telegram', label: 'Telegram', icon: Settings },
  { href: '/admin/settings/payments', label: 'Payments', icon: CreditCard },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4">
      <Link href="/" className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </Link>
      <div className="space-y-1">
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
              <link.icon className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
