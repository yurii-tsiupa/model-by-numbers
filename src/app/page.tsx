import { FeaturesSection } from '@/features/landing/components/FeaturesSection';
import { FinalCtaSection } from '@/features/landing/components/FinalCtaSection';
import { GuidePreviewSection } from '@/features/landing/components/GuidePreviewSection';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { HowItWorksSection } from '@/features/landing/components/HowItWorksSection';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { LandingHeader } from '@/features/landing/components/LandingHeader';

export default function HomePage() {
  return (
    <>
      <LandingHeader />

      <main>
        <HeroSection />
        <GuidePreviewSection />
        <HowItWorksSection />
        <FeaturesSection />
        <FinalCtaSection />
      </main>

      <LandingFooter />
    </>
  );
}