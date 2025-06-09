import Image from "next/image";
import CategorySlider from "./components/home/CategorySlider";
import FlashSaleSection from "./components/home/FlashSales";
import BestSellingProducts from "./components/home/BestSellingProducts";
import HeroBannerSlider from "./components/home/banner";
import ProductsCart from "./components/home/ProductCard";
import NewArrivalsSection from "./components/home/NewArrivalSection";


export default function Home() {
  return (
    <>
      <CategorySlider />
      <FlashSaleSection />
      <BestSellingProducts />
      <HeroBannerSlider />
      <ProductsCart />
      <NewArrivalsSection />
    </>
  );
}
