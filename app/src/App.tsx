import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSection from '@/sections/HeroSection';
import CourseOverviewSection from '@/sections/CourseOverviewSection';
import Chapter1Section from '@/sections/Chapter1Section';
import Chapter2Section from '@/sections/Chapter2Section';
import Chapter3Section from '@/sections/Chapter3Section';
import Chapter4Section from '@/sections/Chapter4Section';
import Chapter5Section from '@/sections/Chapter5Section';
import Chapter6Section from '@/sections/Chapter6Section';
import Chapter7Section from '@/sections/Chapter7Section';
import KnowledgeCheckSection from '@/sections/KnowledgeCheckSection';
import CodeExamplesSection from '@/sections/CodeExamplesSection';
import FailureScenariosSection from '@/sections/FailureScenariosSection';
import SerializationDeepDiveSection from '@/sections/SerializationDeepDiveSection';
import SecuritySection from '@/sections/SecuritySection';
import OperationalTuningSection from '@/sections/OperationalTuningSection';
import ExactlyOnceSection from '@/sections/ExactlyOnceSection';
import WelcomeNameModal from '@/components/WelcomeNameModal';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const learningProgress = useLearningProgress();

  const scrollToCourseOverview = () => {
    document.getElementById('course-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getFirstHeadingId = (href: string) => {
    const section = document.querySelector<HTMLElement>(href);
    const heading = section?.querySelector<HTMLElement>('h2, h3');

    if (heading && !heading.id) {
      heading.id = `${section?.id || 'section'}-heading-entry`;
    }

    return heading?.id || 'chapter-1-heading-1';
  };

  const handleProtectedNavigation = (href: string) => {
    if (href === '#course-overview') {
      scrollToCourseOverview();
      return;
    }

    learningProgress.requestProtectedHeading(getFirstHeadingId(href));
  };

  useEffect(() => {
    // Initialize Lenis smooth scroll
    let lenis: { destroy: () => void; on: (event: 'scroll', callback: () => void) => void; raf: (time: number) => void } | undefined;
    let raf: ((time: number) => void) | undefined;
    
    const initLenis = async () => {
      const Lenis = (await import('lenis')).default;
      lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
      });
      const currentLenis = lenis;

      // Integrate with GSAP ScrollTrigger
      currentLenis.on('scroll', ScrollTrigger.update);
      raf = (time) => currentLenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      return currentLenis;
    };

    initLenis();

    return () => {
      if (lenis) {
        lenis.destroy();
      }
      if (raf) {
        gsap.ticker.remove(raf);
      }
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="relative">
      <Navigation
        hasUserName={learningProgress.hasUserName}
        userName={learningProgress.userName}
        currentChapter={learningProgress.currentChapter}
        onStartLearning={learningProgress.startOrResumeLearning}
        onNavigate={handleProtectedNavigation}
        onGoHome={learningProgress.goToLanding}
      />
      <main>
        <HeroSection
          hasUserName={learningProgress.hasUserName}
          onBeginJourney={learningProgress.startOrResumeLearning}
          onExploreChapters={scrollToCourseOverview}
        />
        <CourseOverviewSection />
        <Chapter1Section />
        <Chapter2Section />
        <Chapter3Section />
        <Chapter4Section />
        <Chapter5Section />
        <Chapter6Section />
        <Chapter7Section />
        <KnowledgeCheckSection />
        <CodeExamplesSection />
        <FailureScenariosSection />
        <SerializationDeepDiveSection />
        <SecuritySection />
        <OperationalTuningSection />
        <ExactlyOnceSection />
      </main>
      <Footer />
      <WelcomeNameModal isOpen={learningProgress.isPromptOpen} onSave={learningProgress.saveUserName} />
    </div>
  );
}

export default App;
