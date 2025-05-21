'use client'
import useSWR from 'swr'
import axios from 'axios'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function NavMenu() {
    const { data, error } = useSWR('http://localhost:8001/api/category', fetcher)

    if (error) return <div>Error loading categories</div>
    if (!data) return <div>Loading...</div>
    console.log("hiện dữ liệu lên cho anh", data)
    return (
        <div className="w-1/5 border-r p-4">
            <ul className="space-y-3 text-sm font-medium">
                {data.map((cat: any) => (
                    <li key={cat.CategoryID} className="hover:text-red-500 cursor-pointer">
                        {cat.Name}
                    </li>
                ))}
            </ul>
        </div>
    )
}
