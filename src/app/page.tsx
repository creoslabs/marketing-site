import styles from "@/components/home/home.module.css";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeLoop } from "@/components/home/HomeLoop";
import { HomeOutlierSection } from "@/components/home/HomeOutlierSection";
import { HomeSignalSection } from "@/components/home/HomeSignalSection";
import { HomePricing } from "@/components/home/HomePricing";
import { HomeCustomSection } from "@/components/home/HomeCustomSection";
import { HomeClose } from "@/components/home/HomeClose";
import { HomeFooter } from "@/components/home/HomeFooter";

export default function Home() {
  return (
    <div className={styles.creosHome}>
      <HomeHeader />
      <main>
        <HomeHero />
        <HomeLoop />
        <HomeOutlierSection />
        <HomeSignalSection />
        <HomePricing />
        <HomeCustomSection />
        <HomeClose />
      </main>
      <HomeFooter />
    </div>
  );
}
