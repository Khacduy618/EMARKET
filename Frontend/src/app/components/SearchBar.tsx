import { FiSearch, FiHeart, FiShoppingCart } from 'react-icons/fi'

export default function SearchBar() {
    return (
        <div className="flex justify-between items-center p-4 ">
            {/* <img src="/images/z6604382653639_89e49c0234f1e1785d1a7aedf8977295.jpg" alt="" className=" w-20 h-20 font-bold" /> */}
            <h1 className='text-xl font-bold'>DUY LEARDER </h1>
            <input
                type="text"
                placeholder="What are you looking for?"
                className="border px-4 py-2 rounded-md w-1/2"
            />
            <div className="flex space-x-4 text-xl">
                <FiSearch />
                <FiHeart />
                <a href="/cart"><FiShoppingCart /></a>
            </div>
        </div>
    )
}
