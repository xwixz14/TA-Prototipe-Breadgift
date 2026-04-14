
import Hero from "@/component/pages/home/Hero";

export default function Home() {
  return (
    <main className="relative min-h-screen font-sans">
      <Hero />
      {/* Home page now only contains the Hero, other sections are on their own pages */}
    </main>
  );
}
