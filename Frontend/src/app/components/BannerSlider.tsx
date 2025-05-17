export default function BannerSlider() {
    return (
        <div className="w-4/5 p-4">
            <div className="bg-black text-white p-10 rounded-md flex items-center justify-between">
                <div>
                    <p className="text-sm">iPhone 14 Series</p>
                    <h2 className="text-3xl font-bold my-2">Up to 10% off Voucher</h2>
                    <button className="bg-white text-black px-4 py-2 rounded-md mt-2">Shop Now →</button>
                </div>
                <img src="https://genk.mediacdn.vn/139269124445442048/2020/6/6/2bf7d2554d50bdd42b91542ca59f0289-159145072518074589995.jpg"
                    alt="iPhone" className="w-84 hover:w-96" />
            </div>
        </div>
    )
}
