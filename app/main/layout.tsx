"use client"

import React, { useCallback } from "react"
import { Loading } from "@/components/biz/Loading"
import { mockData } from "@/components/biz/AppSidebarLayout/mock-data"
import useRoutes from "@/hooks/use-routes"
import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { AppSidebarLayout } from "@/components/biz/AppSidebarLayout"
import {
  useProviderModelModal,
  ProviderModelModalProvider,
} from "@/app/commons/ProviderModelModal"
import { type NavMainItem } from "@/components/biz/AppSidebarLayout/interface"

// create a internal component to use context
function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const routes = useRoutes()
  const { openModal } = useProviderModelModal() // now it's safe to call

  // handle nav item click
  const handleNavItemClick = useCallback(
    (url: string) => {
      // if click is settings item
      if (url === "/main/settings") {
        openModal() // call method to open modal
        return true // return true means handled, no need to navigate
      }

      // return false means not handled, need to navigate normally
      return false
    },
    [openModal],
  )

  return (
    <AppSidebarLayout
      navMain={routes as NavMainItem[]}
      user={mockData.user}
      onLogout={signOut}
      onNavItemClick={handleNavItemClick}
    >
      {children}
    </AppSidebarLayout>
  )
}

// main layout
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // Show loading state while checking authentication status
  if (status === "loading") {
    return <Loading fullscreen />
  }

  return (
    <ProviderModelModalProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </ProviderModelModalProvider>
  )
}
