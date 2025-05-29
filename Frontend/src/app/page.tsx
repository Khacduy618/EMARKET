import Image from "next/image";
import Layout from "./components/Layout";
import FlashSales from "./pages/components/FlashSales";
import CategorySlider from "./pages/components/CategorySlider";
import BestSellingProducts from "./pages/components/BestSellingProducts";
import HeroBanner from "./pages/components/banner";
import ProductsCart from "./pages/components/ProductCard";
import NewArrivalSection from "./pages/components/NewArrivalSection";
import BannerSlider from "./components/BannerSlider";
// Footer is included in Layout, no need to import here
// import Footer from "./components/Footer";


export default function Home() {
  return (
    <Layout>
      <BannerSlider />
      <CategorySlider />
      <FlashSales />
      <BestSellingProducts />
      <HeroBanner />
      <ProductsCart />
      <NewArrivalSection />
    </Layout> 
  );
}
