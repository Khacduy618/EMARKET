export default function BannerSlider() {
    return (
        <div className="w-full p-4">
            <div className="overflow-hidden rounded-lg">
                <img
                    src="https://cdnv2.tgdd.vn/mwg-static/dmx/Banner/87/d7/87d7154c9ecaecb718e79031bdf757f3.png"
                    alt="iPhone"
                    className="w-full h-auto object-cover"
                />
            </div>
        </div>
    );
}
// import useSWR from 'swr'
// import axios from 'axios'
// import { useState, useEffect } from 'react'
// import { ChevronLeft, ChevronRight } from 'lucide-react'
// export function BannerSlider() {
//     const banners = [
//         "https://cdnv2.tgdd.vn/mwg-static/dmx/Banner/87/d7/87d7154c9ecaecb718e79031bdf757f3.png",
//         "https://cdnv2.tgdd.vn/mwg-static/dmx/Banner/5e/1a/5e1a8c1b9c9e7d6c3e1d9b8c7e6d5f4.png",
//         "https://cdnv2.tgdd.vn/mwg-static/dmx/Banner/3f/2b/3f2b1c9d8e7f6g5h4i3j2k1l0m9n8.png"
//     ]

//     const [currentSlide, setCurrentSlide] = useState(0)
//     const [isAutoPlay, setIsAutoPlay] = useState(true)

//     useEffect(() => {
//         let interval: NodeJS.Timeout
//         if (isAutoPlay) {
//             interval = setInterval(() => {
//                 setCurrentSlide(prev => (prev + 1) % banners.length)
//             }, 5000)
//         }
//         return () => clearInterval(interval)
//     }, [isAutoPlay, banners.length])

//     const nextSlide = () => {
//         setCurrentSlide(prev => (prev + 1) % banners.length)
//         setIsAutoPlay(false)
//         setTimeout(() => setIsAutoPlay(true), 10000)
//     }

//     const prevSlide = () => {
//         setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length)
//         setIsAutoPlay(false)
//         setTimeout(() => setIsAutoPlay(true), 10000)
//     }

//     return (
//         <div className="relative w-full overflow-hidden group">
//             {/* Banner Slides */}
//             <div
//                 className="flex transition-transform duration-500 ease-in-out"
//                 style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//             >
//                 {banners.map((banner, index) => (
//                     <div key={index} className="w-full flex-shrink-0">
//                         <img
//                             src={banner}
//                             alt={`Banner ${index + 1}`}
//                             className="w-full h-auto object-cover"
//                         />
//                     </div>
//                 ))}
//             </div>

//             {/* Navigation Arrows */}
//             <button
//                 onClick={prevSlide}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                 aria-label="Previous banner"
//             >
//                 <ChevronLeft size={24} />
//             </button>
//             <button
//                 onClick={nextSlide}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                 aria-label="Next banner"
//             >
//                 <ChevronRight size={24} />
//             </button>

//             {/* Dots Indicator */}
//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
//                 {banners.map((_, index) => (
//                     <button
//                         key={index}
//                         onClick={() => {
//                             setCurrentSlide(index)
//                             setIsAutoPlay(false)
//                             setTimeout(() => setIsAutoPlay(true), 10000)
//                         }}
//                         className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
//                         aria-label={`Go to slide ${index + 1}`}
//                     />
//                 ))}
//             </div>
//         </div>
//     )
// }