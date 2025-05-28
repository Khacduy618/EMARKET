import Header from './Header'
import SearchBar from './SearchBar'
import NavMenu from './NavMenu'
import BannerSlider from './BannerSlider'
import Footer from './Footer'
import React, { ReactNode } from 'react';


interface LayoutProps {
    children?: ReactNode; // Make children optional
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div>
            <Header />
            <SearchBar />
            <div className="">
                <NavMenu />
                <BannerSlider />
            </div>
        </div>
    )
}
