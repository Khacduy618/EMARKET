'use client';
import React from 'react';

export default function HeroBanner() {
    return (
        <div>
            <hr className="mt-10 mb-10 mx-auto w-[1500px] border-t-2 border-gray-400" />
            <section className="max-w-[1470px] h-[500px] mx-auto bg-black text-white rounded-xl overflow-hidden flex items-center px-10">
                {/* Bên trái - nội dung */}
                <div className="w-1/2 space-y-6">
                    <p className="text-green-500 font-semibold">Categories</p>
                    <h1 className="text-4xl font-bold leading-tight">
                        Enhance Your <br /> Music Experience
                    </h1>
                    <div className="flex space-x-4">
                        {[
                            { label: 'Hours', value: '23' },
                            { label: 'Days', value: '05' },
                            { label: 'Minutes', value: '59' },
                            { label: 'Seconds', value: '35' },
                        ].map((item) => (
                            <div key={item.label} className="bg-white text-black w-16 h-16 rounded-full flex flex-col items-center justify-center text-sm font-semibold">
                                <span className="text-lg">{item.value}</span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition">
                        Buy Now!
                    </button>
                </div>

                {/* Bên phải - ảnh */}
                <div className="w-1/2 flex justify-center items-center">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiy_NOR9tjDNB06yFWEKG0B_pUgt890dfY0ZAkFAuyI02cBWy2ZhBIAzAzhmJuuCPYawg&usqp=CAU"
                        alt="Speaker"
                        className="w-full h-full object-cover max-h-[500px]"
                    />
                </div>
            </section>
            <hr className="mt-10 mb-10 mx-auto w-[1500px] border-t-2 border-gray-400" />
        </div>
    );
}
