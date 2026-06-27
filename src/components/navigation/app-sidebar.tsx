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
  Share2, 
  HelpCircle, 
  Settings, 
  FileText, 
  ShieldCheck,
  Package
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useUser } from "@/firebase/auth/use-user";

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const { user } = useUser();

  const navigateTo = useCallback((href: string) => {
    setOpenMobile(false);
    // Explicitly disabling prefetch-on-navigation to speed up actual click
    router.push(href);
  }, [router, setOpenMobile]);

  return (
    <Sidebar className="border-r border-white/5">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-white/5">
        <button 
          className="font-headline font-bold text-lg text-primary text-left uppercase tracking-tighter active-press transition-transform"
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
                <SidebarMenuButton className="active-press" onClick={() => navigateTo('/games')}>
                  <Gamepad2 className="h-4 w-4" />
                  <span className="font-bold text-sm text-white">Games</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="active-press" onClick={() => navigateTo('/social-services')}>
                  <Share2 className="h-4 w-4" />
                  <span className="font-bold text-sm text-white">Social Services</span>
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
                <SidebarMenuButton className="active-press" onClick={() => navigateTo('/orders')}>
                  <Package className="h-4 w-4" />
                  <span className="font-bold text-sm text-white">My Orders</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="active-press" onClick={() => navigateTo(user ? '/profile' : '/login')}>
                  <Settings className="h-4 w-4" />
                  <span className="font-bold text-sm text-white">Account Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="active-press" onClick={() => navigateTo('/contact')}>
                  <HelpCircle className="h-4 w-4" />
                  <span className="font-bold text-sm text-white">Support</span>
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
                <SidebarMenuButton className="active-press" onClick={() => navigateTo('/terms')}>
                  <FileText className="h-4 w-4" />
                  <span className="font-bold text-sm text-white">Terms & Conditions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="active-press" onClick={() => navigateTo('/privacy')}>
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-bold text-sm text-white">Privacy Policy</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}