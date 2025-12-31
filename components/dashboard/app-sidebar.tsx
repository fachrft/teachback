"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: "teacher" | "student";
}

export function AppSidebar({ role, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  const supabase = createClient();
  const router = useRouter();

  const signOut = () => {
    supabase.auth.signOut();
    toast.success("Anda berhasil keluar");
    router.push("/login");
  };

  const teacherLinks = [
    { title: "Dashboard", url: "/guru", icon: LayoutDashboard },
    { title: "Kelas Saya", url: "/guru/kelas", icon: Users },
    { title: "Bank Materi", url: "/guru/materi", icon: BookOpen },
    { title: "Hasil Siswa", url: "/guru/results", icon: GraduationCap },
  ];

  const studentLinks = [
    { title: "Dashboard", url: "/siswa", icon: LayoutDashboard },
    { title: "Kelas Saya", url: "/siswa/kelas", icon: Users },
  ];

  const links = role === "teacher" ? teacherLinks : studentLinks;

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="bg-slate-50 border-r border-slate-200"
    >
      <SidebarHeader className="h-16 border-b border-slate-100 flexitems-center justify-center p-4">
        <Link
          href="/"
          className="flex items-center gap-2 group overflow-hidden"
        >
          <div className="relative size-8 rounded-lg overflow-hidden shrink-0 shadow-sm">
            <img
              src="/logo.png"
              alt="TeachBack Logo"
              className="object-cover size-full"
            />
          </div>
          <span className="font-bold text-slate-800 truncate group-data-[collapsible=icon]:hidden">
            TeachBack
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2 gap-0">
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {links.map((link) => {
              const isActive =
                link.url === "/guru" || link.url === "/siswa"
                  ? pathname === link.url
                  : pathname.startsWith(link.url);

              return (
                <SidebarMenuItem key={link.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={link.title}
                    suppressContentEditableWarning={true}
                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-slate-100 transition-colors rounded-lg font-medium"
                  >
                    <Link href={link.url}>
                      <link.icon className="size-5" />
                      <span>{link.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-slate-100 rounded-lg"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="User"
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-semibold">
                      {role === "teacher" ? "Pak Budi" : "Budi Siswa"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {role === "teacher" ? "Guru TIK" : "Kelas X-A"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
