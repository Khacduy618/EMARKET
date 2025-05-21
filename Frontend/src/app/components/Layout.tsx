import Header from './Header'
import SearchBar from './SearchBar'
import NavMenu from './NavMenu'
import BannerSlider from './BannerSlider'

export default function Layout() {
    return (
        <div>
            <Header />
            <SearchBar />
            <div className="flex">
                <NavMenu />
                <BannerSlider />
            </div>
        </div>
    )
}
