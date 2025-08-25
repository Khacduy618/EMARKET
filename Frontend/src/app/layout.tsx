// app/layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";
import Script from "next/script"

export const metadata = {
    title: "My E-commerce Store",
    description: "Welcome to our store",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            

            <body className="bg-[#f8f4f4] m-0 font-sans text-base antialiased font-normal dark:bg-slate-900 leading-default text-slate-500" suppressHydrationWarning>
                <AuthProvider>
                    {children}
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />

                </AuthProvider>
                <Script id="chatling-config" strategy="afterInteractive">
                    {`window.chtlConfig = { chatbotId: "4264611121" }`}
                </Script>

                {/* Chatling script */}
                <Script
                    id="chatling-script"
                    src="https://chatling.ai/js/embed.js"
                    data-id="4264611121"
                    async
                    strategy="afterInteractive"
                />
                <div id="modal-portal-root"></div>
            </body>
        </html>
    );
}
