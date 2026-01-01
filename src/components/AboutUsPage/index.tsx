"use client";
import { AboutUs } from "./AboutUs";
import Footer from "../Common/Footer";
import NavigationBar from "../HomePage/NavigationBar";
export const AboutUsPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <NavigationBar />
      <AboutUs />
      <Footer />
    </main>
  );
};

export default AboutUsPage;
