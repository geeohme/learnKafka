import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Code2,
  DatabaseZap,
  GitBranch,
  Layers3,
  LockKeyhole,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type ChapterSummary = {
  chapter: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const foundationChapters: ChapterSummary[] = [
  {
    chapter: '01',
    title: 'Understanding Transaction Streaming',
    description: 'Introduces real-time data streams, transaction events, CDC, and why streaming changes how modern systems move data.',
    href: '#chapter-1',
    icon: DatabaseZap,
  },
  {
    chapter: '02',
    title: 'Looking Deeper into Apache Kafka',
    description: 'Explains Kafka architecture at a high level: brokers, topics, partitions, producers, consumers, offsets, and replay.',
    href: '#chapter-2',
    icon: Layers3,
  },
  {
    chapter: '03',
    title: 'Ingesting Data with Apache Kafka',
    description: 'Shows how data enters Kafka from databases, applications, connectors, CDC pipelines, and event-producing systems.',
    href: '#chapter-3',
    icon: GitBranch,
  },
  {
    chapter: '04',
    title: 'Applying CDC to Apache Kafka',
    description: 'Connects change data capture patterns to Kafka topics, schemas, downstream consumers, and operational data movement.',
    href: '#chapter-4',
    icon: Workflow,
  },
  {
    chapter: '05',
    title: 'Stream Processing with Kafka',
    description: 'Covers processing streams as they arrive, including Kafka Streams, ksqlDB, windowing, stateful logic, and stream-table thinking.',
    href: '#chapter-5',
    icon: Zap,
  },
  {
    chapter: '06',
    title: 'Starting Your Journey: Effective Planning',
    description: 'Frames the planning work behind successful Kafka adoption: use cases, teams, architecture choices, risk, and rollout strategy.',
    href: '#chapter-6',
    icon: Route,
  },
  {
    chapter: '07',
    title: 'Ten Things to Consider',
    description: 'Summarizes practical decision points for platform selection, cost, governance, scaling, deployment, and long-term ownership.',
    href: '#chapter-7',
    icon: Target,
  },
];

const advancedChapters: ChapterSummary[] = [
  {
    chapter: '08',
    title: 'Code Examples',
    description: 'Moves from concepts to implementation with producer and consumer examples that show how Kafka records are sent and read.',
    href: '#chapter-8',
    icon: Code2,
  },
  {
    chapter: '09',
    title: 'Failure Scenarios & Recovery',
    description: 'Explores what happens when brokers fail, consumers lag, producers time out, or groups rebalance, and how Kafka recovers.',
    href: '#chapter-9',
    icon: Wrench,
  },
  {
    chapter: '10',
    title: 'Serialization & Schema Evolution',
    description: 'Compares JSON, Avro, and Protobuf, then introduces schema compatibility rules for changing event contracts safely.',
    href: '#chapter-10',
    icon: BadgeCheck,
  },
  {
    chapter: '11',
    title: 'Security Considerations',
    description: 'Introduces the production security baseline: authentication, encryption in transit, authorization, and data protection.',
    href: '#chapter-11',
    icon: LockKeyhole,
  },
  {
    chapter: '12',
    title: 'Operational Tuning & Configuration',
    description: 'Highlights the configuration levers that affect throughput, latency, durability, consumer lag, and broker performance.',
    href: '#chapter-12',
    icon: SlidersHorizontal,
  },
  {
    chapter: '13',
    title: 'Advanced: Exactly-Once Semantics',
    description: 'Explains when exactly-once matters, how idempotent producers and transactions work, and the trade-offs they introduce.',
    href: '#chapter-13',
    icon: ShieldCheck,
  },
];

function scrollToSection(href: string) {
  const target = document.querySelector(href);
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ChapterGrid({ chapters }: { chapters: ChapterSummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {chapters.map((chapter) => {
        const Icon = chapter.icon;

        return (
          <button
            key={chapter.chapter}
            type="button"
            onClick={() => scrollToSection(chapter.href)}
            className="overview-card group flex min-h-[220px] flex-col rounded-lg border border-[#1a1a25] bg-[#12121a] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-[#00f5ff]/40 hover:shadow-[0_18px_44px_rgba(0,245,255,0.08)]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <span className="font-['Syne'] text-5xl font-extrabold leading-none text-[#ffaa00]/35">
                {chapter.chapter}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#00f5ff]/20 bg-[#00f5ff]/10">
                <Icon className="h-5 w-5 text-[#00f5ff]" />
              </span>
            </div>

            <h3 className="font-['Syne'] text-xl font-bold leading-snug text-[#f0f0ff]">
              {chapter.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-[#c8c8d8]">
              {chapter.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 font-['Syne'] text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8a9a] transition group-hover:text-[#00f5ff]">
              Open chapter
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function CourseOverviewSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        '.overview-reveal',
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section id="course-overview" ref={sectionRef} className="section-padding bg-[#0a0a0f]">
      <div className="container-main">
        <div className="overview-reveal mb-16 max-w-3xl">
          <span className="font-['Syne'] text-sm font-semibold uppercase tracking-[0.2em] text-[#ffaa00]">
            Course Overview
          </span>
          <h2 className="mt-4 font-['Syne'] text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-tight text-[#f0f0ff]">
            From Kafka fundamentals to implementation insight.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#c8c8d8]">
            This course originally covered seven foundation chapters. It has since been expanded with an
            implementation insights section, giving you a path from core concepts to the operational details that shape real
            Kafka systems.
          </p>
        </div>

        <div className="overview-reveal mb-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#ffaa00]/25 bg-[#ffaa00]/10">
            <BookOpenCheck className="h-6 w-6 text-[#ffaa00]" />
          </div>
          <div>
            <p className="font-['Syne'] text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8a9a]">
              Chapters 1-7
            </p>
            <h3 className="font-['Syne'] text-2xl font-bold text-[#f0f0ff]">
              Foundations
            </h3>
          </div>
        </div>
        <div className="overview-reveal">
          <ChapterGrid chapters={foundationChapters} />
        </div>

        <div className="overview-reveal my-16 rounded-lg border border-[#00f5ff]/25 bg-[#00f5ff]/[0.06] p-6 md:flex md:items-center md:justify-between md:gap-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#00f5ff]/30 bg-[#00f5ff]/10">
              <Sparkles className="h-6 w-6 text-[#00f5ff]" />
            </div>
            <div>
              <p className="font-['Syne'] text-xs font-semibold uppercase tracking-[0.18em] text-[#ffaa00]">
                Knowledge Check
              </p>
              <h3 className="mt-1 font-['Syne'] text-2xl font-bold text-[#f0f0ff]">
                Pause after the foundation chapters.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c8c8d8]">
                The course separates the original seven chapters from the newer next steps material for implementation with a knowledge
                check, so learners can confirm the fundamentals before moving into implementation behavior.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('#knowledge-check')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#00f5ff]/30 px-4 py-3 font-['Syne'] text-xs font-semibold uppercase tracking-[0.14em] text-[#00f5ff] transition hover:bg-[#00f5ff]/10 md:mt-0"
          >
            Go to check
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overview-reveal mb-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#ff00aa]/25 bg-[#ff00aa]/10">
            <Code2 className="h-6 w-6 text-[#ff00aa]" />
          </div>
          <div>
            <p className="font-['Syne'] text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8a9a]">
              Chapters 8-13
            </p>
            <h3 className="font-['Syne'] text-2xl font-bold text-[#f0f0ff]">
              Advanced Implementation
            </h3>
          </div>
        </div>
        <div className="overview-reveal">
          <ChapterGrid chapters={advancedChapters} />
        </div>
      </div>
    </section>
  );
}
