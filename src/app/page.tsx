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
    <div className={styles.creosHome} data-creos-home data-theme="dark" suppressHydrationWarning>
      {/* Applies a saved theme choice before paint so there's no flash. This
          div is server-rendered and never re-diffed by React, so mutating
          the attribute imperatively here is safe. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=localStorage.getItem('home-theme');if(t==='light'||t==='dark')document.currentScript.parentElement.setAttribute('data-theme',t);}catch(e){}",
        }}
      />
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
