export default function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
        </div>
    )
}
