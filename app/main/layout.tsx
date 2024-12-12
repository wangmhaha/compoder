"use client"

import { AppSidebarLayout } from "@/components/biz/AppSidebarLayout"
import { Loading } from "@/components/biz/Loading"
import { mockData } from "@/components/biz/AppSidebarLayout/mock-data"
import useRoutes from "@/hooks/use-routes"
import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const routes = useRoutes()

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // 当正在检查登录状态时，可以返回一个加载状态
  if (status === "loading") {
    return <Loading fullscreen />
  }

  return (
    <AppSidebarLayout navMain={routes} user={mockData.user} onLogout={signOut}>
      {children}
    </AppSidebarLayout>
  )
}
