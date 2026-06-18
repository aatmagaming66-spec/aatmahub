"use client"

import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  Gamepad2, 
  Tv, 
  Share2, 
  HelpCircle, 
  Settings, 
  FileText, 
  ShieldCheck,
  Package
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { useUser } from "@/firebase/auth/use-user";

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const { user, initialized } = useUser();

  // HIGH-PRIORITY PREFETCH: Ensure all critical page chunks are ready before first interaction
  useEffect(() => {
    const criticalRoutes = [
      '/',
      '/games',
      '/ott-services',
      '/social-services',
      '/orders',
      '/profile',
      '/login',
      '/wallet',
      '/cart',
      '/contact'
    ];
    
    // Use requestIdleCallback if available, otherwise setTimeout
    const prefetcher = () => {
      criticalRoutes.forEach(route => router.prefetch(route));
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(prefetcher);
    } else {
      setTimeout(prefetcher, 100);
    }
  }, [router]);

  const navigateTo = useCallback((href: string) => {
    setOpenMobile(false);
    router.push(href);
  }, [router, setOpenMobile]);

  return (
    <Sidebar className="border-r border-white/5">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-white/5">
        <button 
          className="font-headline font-bold text-lg text-primary text-left uppercase tracking-tighter"
          onClick={() => navigateTo('/')}
        >
          AATMA HUB
        </button>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Marketplace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigateTo('/games')}>
                  <Gamepad2 className="h-4 w-4" />
                  <span className="font-bold text-sm">Games</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigateTo('/ott-services')}>
                  <Tv className="h-4 w-4" />
                  <span className="font-bold text-sm">OTT Services</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigateTo('/social-services')}>
                  <Share2 className="h-4 w-4" />
                  <span className="font-bold text-sm">Social Services</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Quick Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigateTo('/orders')}>
                  <Package className="h-4 w-4" />
                  <span className="font-bold text-sm">My Orders</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigateTo(user ? '/profile' : '/login')}>
                  <Settings className="h-4 w-4" />
                  <span className="font-bold text-sm">Account Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigateTo('/contact')}>
                  <HelpCircle className="h-4 w-4" />
                  <span className="font-bold text-sm">Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Legal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigateTo('/terms')}>
                  <FileText className="h-4 w-4" />
                  <span className="font-bold text-sm">Terms & Conditions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigateTo('/privacy')}>
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-bold text-sm">Privacy Policy</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
