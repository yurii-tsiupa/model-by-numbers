import { FeaturesSection } from '@/features/landing/components/FeaturesSection';
import { FinalCtaSection } from '@/features/landing/components/FinalCtaSection';
import { GuidePreviewSection } from '@/features/landing/components/GuidePreviewSection';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { HowItWorksSection } from '@/features/landing/components/HowItWorksSection';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { AppShell } from '@/components/layout/AppShell';

export default function HomePage() {
  return (
    <AppShell variant="public">
      <main>
        <HeroSection />
        <GuidePreviewSection />
        <HowItWorksSection />
        <FeaturesSection />
        <FinalCtaSection />
      </main>

      <LandingFooter />
    </AppShell>
  );
}
