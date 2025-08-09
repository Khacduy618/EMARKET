import { Card } from "@/components/ui/card"

export default function LoadingState() {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    {[...Array(5)].map((_, i) => (
                        <Card key={i} className="p-6">
                            <div className="animate-pulse">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    {[...Array(4)].map((_, j) => (
                                        <div key={j} className="bg-gray-50 p-3 rounded-lg">
                                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                                            <div className="h-5 bg-gray-200 rounded w-24"></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                                    <div className="h-10 bg-gray-200 rounded w-28"></div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
