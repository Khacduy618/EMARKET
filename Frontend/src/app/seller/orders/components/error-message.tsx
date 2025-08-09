import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ErrorMessageProps {
    error: string
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-4">
            <Card className="max-w-md w-full">
                <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-red-500 h-8 w-8" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">Có lỗi xảy ra</h2>
                    <p className="text-gray-600">{error}</p>
                </CardContent>
            </Card>
        </div>
    )
}
