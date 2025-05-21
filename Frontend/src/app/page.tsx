import Image from "next/image";
import Layout from "./components/Layout";
import FlashSales from "./pages/components/FlashSales";
import CategorySlider from "./pages/components/CategorySlider";
import BestSellingProducts from "./pages/components/BestSellingProducts";
import HeroBanner from "./pages/components/banner";
import ProductsCart from "./pages/components/ProductCard";


export default function Home() {
  return (
    <div>
      <Layout />
      <FlashSales />
      <CategorySlider />
      <BestSellingProducts />
      <HeroBanner />
      <ProductsCart />
    </div>
  );
}
