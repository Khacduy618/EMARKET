// app/components/providers/ToastProvider.tsx
"use client"; // << DẤU HIỆU QUAN TRỌNG NHẤT

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ToastProvider = () => {
    return (
        <ToastContainer
            position="top-center"
            autoClose={3000} // Tự động đóng sau 3 giây
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
    );
};

export default ToastProvider;
