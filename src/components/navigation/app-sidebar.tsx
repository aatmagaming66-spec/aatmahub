
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
  LogOut, 
  FileText, 
  ShieldCheck,
  Package
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  // Automatically close sidebar on mobile when navigating (fallback)
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-white/5">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-white/5">
        <Link href="/" className="font-headline font-bold text-lg text-primary" onClick={handleLinkClick}>
          AATMA HUB
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel>Marketplace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLinkClick}>
                  <Link href="/"><Gamepad2 /><span>Games</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLinkClick}>
                  <Link href="/"><Tv /><span>OTT Services</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLinkClick}>
                  <Link href="/"><Share2 /><span>Social Services</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLinkClick}>
                  <Link href="/orders"><Package /><span>My Orders</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLinkClick}>
                  <Link href="/account"><Settings /><span>Account Settings</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLinkClick}>
                  <Link href="/contact"><HelpCircle /><span>Support</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Legal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLinkClick}>
                  <Link href="/terms"><FileText /><span>Terms & Conditions</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleLinkClick}>
                  <Link href="/privacy"><ShieldCheck /><span>Privacy Policy</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-destructive" onClick={handleLinkClick}>
                  <LogOut /><span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
