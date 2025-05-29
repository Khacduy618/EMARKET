import Header from './Header'
import SearchBar from './SearchBar'
import NavMenu from './NavMenu'
import Footer from './Footer' // Assuming Footer should be part of the layout
import React, { ReactNode } from 'react';


interface LayoutProps {
    children?: ReactNode; // Make children optional
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div>
            <Header />
            <main> {/* Wrap main content in <main> tag */}
                <SearchBar />
                <div className="">
                    <NavMenu />
                    
                    {children} {/* Render the children prop here */}
                </div>
            </main>
            <Footer />
        </div>
    )
}
