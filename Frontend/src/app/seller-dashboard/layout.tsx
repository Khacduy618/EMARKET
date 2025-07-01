// src/app/(main)/seller-dashboard/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';

// Import component từ thư mục components cùng cấp
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata: Metadata = {
    title: 'Seller Dashboard - Nyke Admin',
    description: 'Dashboard for sellers on Nyke Admin platform.',
};

export default function SellerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* 
        Bạn có thể đặt link CSS và Script ở đây hoặc ở layout gốc (src/app/layout.tsx).
        Đặt ở đây nếu chúng chỉ dành riêng cho dashboard.
      */}
            <link rel="stylesheet" href="/assets/fonts/bootstrap/bootstrap-icons.css" />
            <link rel="stylesheet" href="/assets/css/main.min.css" />
            <link rel="stylesheet" href="/assets/vendor/overlay-scroll/OverlayScrollbars.min.css" />

            <div className="page-wrapper">
                <div className="main-container">
                    <Sidebar />
                    <div className="app-container">
                        <Header />
                        <main>{children}</main> {/* `children` ở đây chính là page.tsx */}
                        <Footer />
                    </div>
                </div>
            </div>

            <Script src="/assets/js/jquery.min.js" strategy="beforeInteractive" />
            <Script src="/assets/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
            <Script src="/assets/vendor/overlay-scroll/jquery.overlayScrollbars.min.js" strategy="lazyOnload" />
            <Script src="/assets/vendor/overlay-scroll/custom-scrollbar.js" strategy="lazyOnload" />
            <Script src="/assets/js/jquery.min.js"/>
            <Script src="/assets/js/bootstrap.bundle.min.js"/>
            <Script src="/assets/vendor/overlay-scroll/jquery.overlayScrollbars.min.js"/>
            <Script src="/assets/vendor/overlay-scroll/custom-scrollbar.js"/>
            <Script src="/assets/vendor/apex/apexcharts.min.js"/>
            <Script src="/assets/vendor/apex/custom/dash1/sparkline.js"/>
            <Script src="/assets/vendor/apex/custom/dash1/customers.js"/>
            <Script src="/assets/vendor/apex/custom/dash1/channel.js"/>
            <Script src="/assets/vendor/apex/custom/dash1/deals.js"/>
            <Script src="/assets/vendor/apex/custom/dash1/demography.js"/>
            <Script src="/assets/vendor/apex/custom/dash1/device.js"/>
            <Script src="/assets/vendor/apex/custom/dash1/weekly-sales.js"/>

           
            <Script src="/assets/vendor/jvectormap/jquery-jvectormap-2.0.5.min.js"/>
            <Script src="/assets/vendor/jvectormap/world-mill-en.js"/>
            <Script src="/assets/vendor/jvectormap/gdp-data.js"/>
            <Script src="/assets/vendor/jvectormap/continents-mill.js"/>
            <Script src="/assets/vendor/jvectormap/custom/world-map-markers2.js"/>

          
            <Script src="/assets/js/custom.js"/>
        </>
    );
}