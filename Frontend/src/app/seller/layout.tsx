"use client"

import { useState } from "react"
import  Sidebar  from "./components/Sidebar";
import  Header  from "./components/Header";

import { Sheet, SheetContent } from "@/components/ui/sheet"


export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
