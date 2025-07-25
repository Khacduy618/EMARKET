"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import SellerRegisterHeader from "./components/register-header"
import SellerRegisterForm from "./components/register-form"
import SellerRegisterBenefits from "./components/register-benefits"

export default function SellerRegisterPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("authToken")
        if (!token) {
            router.push("/login")
            return
        }
        setIsAuthenticated(true)
        setLoading(false)
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            <div className="container mx-auto px-4 py-8">
                <SellerRegisterHeader />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <SellerRegisterForm />
                    </div>

                    {/* Benefits Sidebar */}
                    <div className="lg:col-span-1">
                        <SellerRegisterBenefits />
                    </div>
                </div>
            </div>
        </div>
    )
}
