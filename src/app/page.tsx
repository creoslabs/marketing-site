import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WhatWereBuilding from "@/components/WhatWereBuilding";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <WhatWereBuilding />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
