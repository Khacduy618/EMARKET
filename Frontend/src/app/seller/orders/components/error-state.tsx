"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ErrorStateProps {
    error: string
    onRetry: () => void
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
    return (
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
            <Card className="p-6 text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="text-red-500 h-8 w-8" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={onRetry} className="bg-orange-500 hover:bg-orange-600">
                    Thử lại
                </Button>
            </Card>
        </div>
    )
}
