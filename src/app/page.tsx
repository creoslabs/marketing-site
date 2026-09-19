import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WhatWereBuilding from "@/components/WhatWereBuilding";
import Philosophy from "@/components/Philosophy";
import BigMoments from "@/components/BigMoments";
import BloatStory from "@/components/BloatStory";
import WhoItsFor from "@/components/WhoItsFor";
import Pricing from "@/components/Pricing";
import TheLab from "@/components/TheLab";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <WhatWereBuilding />
        <Philosophy />
        <BigMoments />
        <BloatStory />
        <WhoItsFor />
        <Pricing />
        <TheLab />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
