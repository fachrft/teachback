"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import React from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAuthUser } from "@/lib/auth/get-user";
import { useEffect, useState } from "react";

interface DashboardNavbarProps {
  role: "teacher" | "student";
}

export function DashboardNavbar({ role }: DashboardNavbarProps) {
  const { items } = useBreadcrumb();
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const getUser = async () => {
    const data = await getAuthUser();
    setUser(data);
  };

  useEffect(() => {
    getUser();
  }, []);

  const signOut = () => {
    supabase.auth.signOut();
    toast.success("Anda berhasil keluar");
    router.push("/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur backdrop-filter:bg-background/60 sticky top-0 z-10 transition-all">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem className="hidden md:block">
                  {isLast ? (
                    <BreadcrumbPage className="font-semibold text-primary">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-7">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              role="button"
              className="flex items-center gap-2 p-2 rounded-full md:rounded-lg hover:bg-transparent cursor-pointer outline-none"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-sm">
                <span className="font-semibold">
                  {user?.user_metadata?.display_name ?? user?.user_metadata?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {role === "teacher" ? "Guru" : "Siswa"}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem
              onClick={signOut}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
