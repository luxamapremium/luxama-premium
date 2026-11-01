import CallToAction from "@/components/Home/CallToAction";
import HeroSection from "@/components/Home/HeroSection";
import HowItWork from "@/components/Home/How-It-Work";
import OurServices from "@/components/Home/OurServices";
import WhyChooseUs from "@/components/Home/Why-Choose-Us";

export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <HeroSection />
      <WhyChooseUs />
      <OurServices />
      <HowItWork />
      <CallToAction />
    </div>
  );
}
