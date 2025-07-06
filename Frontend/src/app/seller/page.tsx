// src/app/sellerDashboard/page.tsx (hoặc tên file page của bạn)
'use client';

import { useEffect } from 'react';
import PageHeader from './components/PageHeader'; // Giả sử đường dẫn đúng

// Khai báo các thư viện trên window để TypeScript không báo lỗi
declare global {
    interface Window {
        ApexCharts: any;
        jvm: any;
        jQuery: any;
    }
}

export default function SellerDashboardPage() {
    useEffect(() => {
        // Chỉ thực thi khi code chạy ở phía client
        if (typeof window === 'undefined') {
            return;
        }

        // ===================================================
        // KHỞI TẠO APEX CHARTS
        // ===================================================
        if (window.ApexCharts) {
            const ApexCharts = window.ApexCharts;

            // Hàm khởi tạo sparkline
            const createSparkline = (selector: string, data: number[], color: string) => {
                const element = document.querySelector(selector);
                if (!element) return; // Bỏ qua nếu không tìm thấy element

                const options = {
                    chart: { type: 'line', height: 80, sparkline: { enabled: true } },
                    series: [{ data }],
                    stroke: { curve: 'smooth', width: 2 },
                    colors: [color],
                    tooltip: { enabled: false },
                };
                const chart = new ApexCharts(element, options);
                chart.render();
            };

            // Hàm khởi tạo các chart lớn hơn (ví dụ)
            const createBarChart = (selector: string, seriesData: any, categories: string[]) => {
                const element = document.querySelector(selector);
                if (!element) return;

                const options = {
                    series: [{ data: seriesData }],
                    chart: { type: 'bar', height: 250, sparkline: { enabled: true } },
                    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
                    dataLabels: { enabled: false },
                    xaxis: { categories },
                };
                const chart = new ApexCharts(element, options);
                chart.render();
            }

            // Gọi các hàm khởi tạo
            createSparkline('#sparkline1', [10, 20, 15, 25, 20, 30], '#5c60f5');
            createSparkline('#sparkline2', [30, 25, 20, 15, 10, 5], '#ff4d4d');
            createSparkline('#sparkline3', [5, 15, 10, 20, 15, 25], '#28a745');

            // Bạn có thể thêm các hàm khởi tạo cho các chart khác ở đây
            // Ví dụ cho #weekly-sales
            // createBarChart('#weekly-sales', [400, 430, 448, 470, 540, 580, 690], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        }

        // ===================================================
        // KHỞI TẠO JVECTORMAP
        // ===================================================
        if (window.jQuery && (window.jQuery.fn as any).vectorMap) {
            const mapElement = window.jQuery('#world-map-markers3');
            if (mapElement.length > 0) {
                mapElement.vectorMap({
                    map: "world_mill_en",
                    // ... các cấu hình khác của jVectorMap từ file custom JS gốc ...
                    backgroundColor: "transparent",
                    regionStyle: {
                        initial: {
                            fill: "#e9ecef"
                        }
                    },
                });
            }
        }

    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần sau khi component mount

    return (
        <>
            <PageHeader
                title="Analytics"
                welcomeText="Welcome Bradford,"
                breadcrumb="Seller Dashboard"
            />

            <div className="app-body">
                {/* Sparkline Cards */}
                <div className="row">
                    <div className="col-lg-4 col-sm-6 col-12">
                        <div className="card shadow mb-4 p-3 rounded-2 justify-content-between flex-row">
                            <div className="mt-3">
                                <h5 className="text-secondary fw-light">Sales</h5>
                                <h1 className="text-primary">3700</h1>
                                <span className="badge border border-primary text-primary me-3">Today</span>
                            </div>
                            <div id="sparkline1"></div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-12">
                        <div className="card shadow mb-4 p-3 rounded-2 justify-content-between flex-row">
                            <div className="mt-3">
                                <h5 className="text-secondary fw-light">Expenses</h5>
                                <h1 className="text-primary">2500</h1>
                                <span className="badge border border-primary text-primary me-3">Last week</span>
                            </div>
                            <div id="sparkline2"></div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-12">
                        <div className="card shadow mb-4 p-3 rounded-2 justify-content-between flex-row">
                            <div className="mt-3">
                                <h5 className="text-secondary fw-light">Income</h5>
                                <h1 className="text-primary">450K</h1>
                                <span className="badge border border-primary text-primary me-3">Year 2022</span>
                            </div>
                            <div id="sparkline3"></div>
                        </div>
                    </div>
                </div>

                {/* Sales by Location Map */}
                <div className="row">
                    <div className="col-xxl-12">
                        <div className="card shadow mb-4">
                            <div className="card-header">
                                <h5 className="card-title">Sales by Location</h5>
                            </div>
                            <div className="card-body">
                                <div className="row align-items-center">
                                    {/* ... Các cột bên trái và phải ... */}
                                    <div className="col-xxl-8 col-sm-6 col-12">
                                        <div id="world-map-markers3" className="chart-height-xxl position-relative"></div>
                                    </div>
                                    {/* ... */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Các card thống kê khác */}
                <div className="row">
                    {/* Weekly Sales */}
                    <div className="col-xxl-4 col-sm-6 col-12">
                        <div className="card shadow mb-4">
                            <div className="card-header">
                                <h5 className="card-title">Weekly Sales</h5>
                            </div>
                            <div className="card-body">
                                <div id="weekly-sales"></div>
                                <div className="text-center my-4">
                                    <h2>6400 <i className="bi bi-arrow-up-right-circle-fill text-primary"></i></h2>
                                    <p className="text-truncate m-0">15% higher than last month</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ... Các card còn lại (Deals, By Channel, ...) ... */}
                </div>
            </div>
        </>
    );
}