"use client";
import { HeroBanner } from "./HeroBanner";
import { BrandLogos } from "./BrandLogos";
import { Categories } from "./Categories";
import { Testimonials } from "./Testimonials";
import { Newsletter } from "./Newsletter";
import { Collections } from "./Collections";
import { NewArrivals } from "./NewArrivals";
import { BestSeller } from "./BestSeller";
import { BestSeller } from "./BestSeller";

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
