"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useEffect } from "react";

interface BreadcrumbUpdaterProps {
  items: { label: string; href: string }[];
}

export function BreadcrumbUpdater({ items }: BreadcrumbUpdaterProps) {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs(items);
  }, [items, setBreadcrumbs]);

  return null;
}
