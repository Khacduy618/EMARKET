import { FiSearch, FiHeart, FiShoppingCart } from 'react-icons/fi'

export default function SearchBar() {
    return (
        <div className="flex justify-between items-center p-4 border-b">
            <h1 className="text-xl font-bold">Exclusive</h1>
            <input
                type="text"
                placeholder="What are you looking for?"
                className="border px-4 py-2 rounded-md w-1/2"
            />
            <div className="flex space-x-4 text-xl">
                <FiSearch />
                <FiHeart />
                <FiShoppingCart />
            </div>
        </div>
    )
}
