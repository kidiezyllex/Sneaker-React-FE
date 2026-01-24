"use client";
import { HeroBanner } from "./components/HeroBanner";
import { BrandLogos } from "./components/BrandLogos";
import { Categories } from "./components/Categories";
import { Testimonials } from "./components/Testimonials";
import { NewArrivals } from "./components/NewArrivals";
import BestSeller from "./components/BestSeller";

export const HomePage = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroBanner />
      <BrandLogos />
      <Categories />
      <NewArrivals />
      <BestSeller />
      <Testimonials />
    </main>
  );
};

export default HomePage;
