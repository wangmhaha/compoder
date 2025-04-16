"use client"
import { useEffect, Suspense } from "react"

import { useSidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

import { ComponentDetailContainer } from "./container"
import { LLMSelectorProvider } from "@/app/commons/LLMSelectorProvider"

export default function ComponentPage() {
  const { setOpen } = useSidebar()

  useEffect(() => {
    setOpen(false)
  }, [])

  return (
    <LLMSelectorProvider>
      <Suspense fallback={<InitialLoadingSkeleton />}>
        <ComponentDetailContainer />
      </Suspense>
    </LLMSelectorProvider>
  )
}

const InitialLoadingSkeleton = () => {
  return (
    <div className="h-screen">
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-1/6" />
        <Skeleton className="h-8 w-1/4" />
        <div className="flex gap-4">
          <Skeleton className="h-[calc(100vh-12rem)] w-1/2" />
          <Skeleton className="h-[calc(100vh-12rem)] w-1/2" />
          <Skeleton className="h-[calc(100vh-12rem)] w-1/2" />
        </div>
      </div>
    </div>
  )
}
