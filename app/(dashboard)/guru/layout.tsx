"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { BreadcrumbProvider } from "@/components/providers/breadcrumb-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BreadcrumbProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar role="teacher" />
        <SidebarInset>
          <DashboardNavbar role="teacher" />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbProvider>
  );
}
