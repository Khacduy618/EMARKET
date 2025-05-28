// 'use client'
// import useSWR from 'swr'
// import axios from 'axios'

// const fetcher = (url: string) => axios.get(url).then(res => res.data)

// export default function NavMenu() {
//     const { data, error } = useSWR('http://localhost:8001/api/category', fetcher)

//     if (error) return <div>Error loading categories</div>
//     if (!data) return <div>Loading...</div>
//     console.log("hiện dữ liệu lên cho anh", data)
//     return (
//         <div className="w-1/5 border-r p-4">
//             <ul className="space-y-3 text-sm font-medium">
//                 {data.map((cat: any) => (
//                     <li key={cat.CategoryID} className="hover:text-red-500 cursor-pointer">
//                         {cat.Name}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     )
// }
'use client'
import useSWR from 'swr'
import axios from 'axios'
import { useState, useEffect } from 'react'
const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function NavMenu() {
    const { data, error } = useSWR('http://localhost:8001/api/category', fetcher)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (error) return <div className="text-red-500 text-center py-2">Error loading categories</div>
    if (!data) return <div className="text-center py-2">Loading categories...</div>

    return (
        <div className={`sticky top-0 z-10 pl-50 ${isScrolled ? 'bg-white shadow-md' : 'bg-blue-500'} transition-all duration-300`}>
            <div className="container mx-auto px-4">
                <nav className="flex overflow-x-auto py-3 hide-scrollbar">
                    <div className="flex space-x-6 items-center">
                        {data.map((cat: any) => (
                            <a
                                key={cat.CategoryID}
                                href={`#${cat.Name}`}
                                className={`whitespace-nowrap px-3 py-1 rounded-full font-medium ${isScrolled ? 'text-blue-600 hover:bg-blue-50' : 'text-white hover:bg-blue-400'}`}
                            >
                                {cat.Name}
                            </a>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    )
}
