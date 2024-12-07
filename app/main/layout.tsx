"use client"

import { AppSidebarLayout } from "@/components/biz/AppSidebarLayout"
import { mockData } from "@/components/biz/AppSidebarLayout/mock-data"
import useRoutes from "@/hooks/useRoutes"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const routes = useRoutes()
  return (
    <AppSidebarLayout navMain={routes} user={mockData.user}>
      {children}
    </AppSidebarLayout>
  )
}
