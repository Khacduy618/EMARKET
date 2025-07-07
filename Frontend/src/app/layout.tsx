// app/layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";

import Header from "./(main)/(auth)/components/Header"; // 1. Import Header

export const metadata = {
    title: "My E-commerce Store",
    description: "Welcome to our store",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className="bg-gray-50" suppressHydrationWarning>
                <AuthProvider>
                    <ToastContainer position="top-center" autoClose={3000} />
                    <Header />
                    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </AuthProvider>
            </body>
        </html>
    );
}
