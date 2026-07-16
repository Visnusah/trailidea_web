import HeroSection from "./_components/HeroSection";
import TrailCategories from "./_components/TrailCategories";
import PopularTrails from "./_components/PopularTrails";
import CommunityStats from "./_components/CommunityStats";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrailCategories />
      <PopularTrails />
      <CommunityStats />
    </>
  );
}
