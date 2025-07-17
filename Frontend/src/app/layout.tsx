// app/layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";
import Header from "./components/Header";

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
    <html lang="en">
      <body className="m-0 font-sans text-base antialiased font-normal dark:bg-slate-900 leading-default text-slate-500" style={{ backgroundColor: '#f8f4f4' }}>
          <AuthProvider>
{/* <body style={{ backgroundColor: '#f8f4f4' }}> */}
        {children}
       
        <ToastContainer
          position="top-right" // Vị trí hiển thị
          autoClose={3000} // Tự động đóng sau 5 giây
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light" // "light", "dark", "colored"
        />
           </AuthProvider>
        
      </body>
    </html>
  );
}
