import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import WhyAnyRelay from '@/components/landing/WhyAnyRelay';
import UseCases from '@/components/landing/UseCases';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background gradient-bg">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <WhyAnyRelay />
      <UseCases />
      <FinalCTA />
      <Footer />
    </div>
  );
}
