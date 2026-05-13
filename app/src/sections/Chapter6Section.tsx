import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import PillButton from '@/components/PillButton';
import {
  GitBranch,
  ClipboardList,
  BarChart3,
  Activity,
  Shield,
  Lock,
  CheckCircle2,
  Circle,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Server,
  Monitor,
  TrendingUp,
  Layers,
  KeyRound,
  XCircle,
  CheckCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─── */

const checklistCategories = [
  {
    id: 'design',
    label: 'Design',
    icon: GitBranch,
    color: '#00f5ff',
    items: [
      'Publish transaction records (inserts, updates, deletes) to appropriate topics',
      'Publish schema changes to a dedicated topic',
      'Run data integrity checks with an update processor',
      'Identify and retry processing failures automatically',
    ],
  },
  {
    id: 'process',
    label: 'Process',
    icon: ClipboardList,
    color: '#ffaa00',
    items: [
      'Provide clear guidance on planning and architecture design',
      'Establish data quality standards and validation rules',
      'Define testing requirements before production deployment',
      'Document production runbooks and escalation procedures',
    ],
  },
  {
    id: 'technology',
    label: 'Technology',
    icon: Server,
    color: '#ff00aa',
    items: [
      'Evaluate cloud-based managed platforms vs. on-premise DIY',
      'Assess pooled resource utilization across teams',
      'Calculate total cost of ownership including operations overhead',
      'Plan for horizontal scaling as data volumes grow',
    ],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Monitor,
    color: '#00f5ff',
    items: [
      'Monitor broker state and cluster health',
      'Track memory utilization across nodes',
      'Measure throughput (records/sec) per topic',
      'Watch end-to-end latency and partition count',
      'Alert on consumer lag and topic lag metrics',
    ],
  },
];

const bestPractices = [
  {
    icon: GitBranch,
    color: '#00f5ff',
    title: 'Pipeline Design',
    short: 'Publish transaction records to topics with integrity checks and retry logic.',
    detail:
      'Design pipelines to publish all transaction records — inserts, updates, and deletes — plus schema changes to appropriate topics. Run data integrity checks with an update processor to catch anomalies early. Implement automatic identification and retry of processing failures so transient issues do not break the flow.',
    diagram: [
      { label: 'DB', highlight: true },
      { label: 'CDC', highlight: true },
      { label: 'Kafka', highlight: true },
      { label: 'Integrity', highlight: true },
      { label: 'Target', highlight: false },
    ],
  },
  {
    icon: ClipboardList,
    color: '#ffaa00',
    title: 'Standardized Processes',
    short: 'Clear guidance for data engineers and a common ontology for streaming analytics.',
    detail:
      'Data engineers need clear guidance and guardrails about how best to operate across planning, design, data quality, testing, and production. Establish a common ontology for streaming analytics algorithms so teams speak the same language and reuse patterns.',
  },
  {
    icon: BarChart3,
    color: '#ff00aa',
    title: 'Resource Planning',
    short: 'Assess use cases, requirements, and volumes. Cloud platforms are typically more economical.',
    detail:
      'Assess use cases, resource requirements, and anticipated data volumes up front. Supporting use cases with a common cloud-based platform and managed service is typically more economical than on-premise DIY infrastructure or project-based solutions.',
  },
  {
    icon: Activity,
    color: '#00f5ff',
    title: 'Monitoring',
    short: 'Monitor state, memory, throughput, latency, partition count, and topic lag.',
    detail:
      'Monitor state, memory utilization, throughput, latency, partition count, and topic lag. These metrics signal your ability to meet SLAs and maintain sustainable infrastructure loads. Set up proactive alerting before thresholds breach.',
  },
  {
    icon: Shield,
    color: '#ffaa00',
    title: 'Data Governance',
    short: 'Clear data ownership. The publisher is responsible for source data quality.',
    detail:
      'Establish clear data ownership. If Line of Business A publishes transactions for use by Line of Business B, A is responsible for source data quality. Address compliance requirements like GDPR with proper classification, retention policies, and access controls.',
  },
  {
    icon: Lock,
    color: '#ff00aa',
    title: 'Transaction Consistency',
    short: 'Committed transactions must relate in order. Use single topic or transaction ID per table.',
    detail:
      'Most analytics use cases require committed transactions to relate to one another in order. Send all changes from one table to a single topic, or use a single transaction ID per table. This guarantees consumers see related changes in the correct sequence.',
  },
];

const caseStudySteps = [
  {
    step: 1,
    title: 'Identify the Problem',
    icon: AlertTriangle,
    color: '#ff4444',
    narrative:
      'Generali, one of the world\'s leading insurers operating in 50+ countries, faced a critical challenge. Legacy processes replicating data from Oracle databases to customer-facing applications were disruptive and created data silos. Core systems were not integrated with new SaaS applications.',
    problem:
      'Data silos, inefficient data flows, and customer service issues stemming from stale or inconsistent information across channels.',
    choices: [
      'Continue with batch ETL overnight',
      'Build point-to-point integrations for each app',
      'Adopt a real-time streaming platform',
    ],
    correctIndex: 2,
    feedback:
      'A real-time streaming platform is the only approach that eliminates silos and delivers consistent, fresh data to all channels simultaneously.',
  },
  {
    step: 2,
    title: 'Evaluate Options',
    icon: Layers,
    color: '#ffaa00',
    narrative:
      'The team needed real-time synchronization across communication channels. They evaluated several integration approaches including traditional ETL, API-led connectivity, and event-driven architectures with CDC.',
    problem:
      'How do you replicate Oracle DB changes to downstream systems with minimal impact and near-zero latency?',
    choices: [
      'Query-based polling every 5 minutes',
      'Trigger-based CDC with shadow tables',
      'Log-based CDC with Kafka streaming',
    ],
    correctIndex: 2,
    feedback:
      'Log-based CDC reads transaction logs directly with minimal impact, while Kafka provides the scalable streaming backbone for real-time distribution.',
  },
  {
    step: 3,
    title: 'Choose CDC + Kafka',
    icon: CheckCircle2,
    color: '#00f5ff',
    narrative:
      'Generali built a "data integration platform" using Attunity Replicate for log-based CDC and Confluent Platform (Kafka) as the streaming backbone. This architecture captures database changes in real time and distributes them to all downstream consumers.',
    problem:
      'What are the key architectural benefits of this CDC + Kafka approach?',
    choices: [
      'Minimal source DB impact and decoupled consumers',
      'Simpler codebase than batch scripts',
      'No need for schema management',
    ],
    correctIndex: 0,
    feedback:
      'Minimal source impact preserves OLTP performance, and decoupled consumers mean each app can read at its own pace without interfering.',
  },
  {
    step: 4,
    title: 'Measure Results',
    icon: TrendingUp,
    color: '#ff00aa',
    narrative:
      'The results were transformative. Generali achieved real-time 360-degree customer views, improved operational efficiency, and reduced technical debt. Generali Switzerland\'s Connection Platform now delivers a 360-degree customer view across integrated digital channels.',
    problem:
      'Which outcome best demonstrates the business value of the streaming platform?',
    choices: [
      'Reduced Oracle licensing costs',
      '360+ touchpoints with real-time 360° customer views',
      'Elimination of all batch jobs',
    ],
    correctIndex: 1,
    feedback:
      'The 360+ touchpoints delivering real-time customer views is a concrete, measurable business outcome that directly improves customer experience.',
  },
];

const takeaways = [
  'Planning requires pipeline design, standardized processes, pooled resources, cloud economics, and monitoring.',
  'Three pipeline requirements: publish records, run integrity checks, retry processing failures.',
  'Two consistency methods: topic/partition optimization and producer idempotency with enable.idempotence=true.',
  'Real-world proof: Generali Group achieved 360° real-time customer views across 360+ touchpoints using CDC + Kafka.',
];

/* ─── Component ─── */

export default function Chapter6Section() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedPractice, setExpandedPractice] = useState<number | null>(null);
  const [simScenario, setSimScenario] = useState<'scattered' | 'single'>('scattered');
  const [activeCaseStep, setActiveCaseStep] = useState(0);
  const [caseChoice, setCaseChoice] = useState<number | null>(null);
  const [caseRevealed, setCaseRevealed] = useState(false);

  const toggleCheck = (catId: string, idx: number) => {
    const key = `${catId}-${idx}`;
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalChecklistItems = checklistCategories.reduce((sum, c) => sum + c.items.length, 0);
  const checkedCount = checkedItems.size;

  const handleCaseChoice = (idx: number) => {
    setCaseChoice(idx);
    setCaseRevealed(true);
  };

  const advanceCaseStep = () => {
    if (activeCaseStep < caseStudySteps.length - 1) {
      setActiveCaseStep((s) => s + 1);
      setCaseChoice(null);
      setCaseRevealed(false);
    }
  };

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(sectionRef.current.querySelector('.subtitle-block'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.subtitle-block'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.checklist-category'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.checklist-grid'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.practice-card'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.practice-grid'), start: 'top 80%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelector('.consistency-section'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.consistency-section'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelector('.case-study-section'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.case-study-section'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.callout-card'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.callouts-grid'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelector('.takeaways-panel'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.takeaways-panel'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelector('.cta-section'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.cta-section'), start: 'top 85%', once: true } }
    );
  }, { scope: sectionRef });

  return (
    <section id="chapter-6" ref={sectionRef} className="section-padding bg-[#0a0a0f]">
      <div className="container-main">
        <SectionHeader chapter="06" title="Starting Your Journey: Effective Planning" />

        <div className="subtitle-block mb-16">
          <p className="font-['Syne'] font-semibold text-xl text-[#00f5ff] mb-4">
            Enabling Transaction Data Streaming Systems
          </p>
          <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed max-w-3xl">
            Building a production-ready streaming architecture requires careful planning across people, process, and technology. This chapter covers the four pillars of effective planning and the patterns that make transaction data streaming reliable at scale.
          </p>
        </div>

        {/* ── Planning Framework + Checklist ── */}
        <div className="mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Planning Framework
          </h3>
          <p className="text-[#8a8a9a] max-w-2xl mb-10">
            The four pillars of a successful transaction data streaming initiative. Use the interactive checklist to track your readiness across design, process, technology, and monitoring.
          </p>

          <div className="checklist-grid grid md:grid-cols-2 gap-6 mb-8">
            {checklistCategories.map((cat) => (
              <div
                key={cat.id}
                className="checklist-category bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 transition-all duration-300 hover:border-[rgba(0,245,255,0.15)]"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">{cat.label}</h4>
                  <span className="ml-auto text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">
                    {cat.items.filter((_, i) => checkedItems.has(`${cat.id}-${i}`)).length}/{cat.items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {cat.items.map((item, i) => {
                    const isChecked = checkedItems.has(`${cat.id}-${i}`);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleCheck(cat.id, i)}
                        className={`w-full flex items-start gap-3 text-left p-3 rounded-xl transition-all duration-200 ${
                          isChecked
                            ? 'bg-[#00f5ff]/5 border border-[#00f5ff]/20'
                            : 'bg-[#0a0a0f] border border-[#1a1a25] hover:border-[#8a8a9a]/30'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-[#00f5ff]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#8a8a9a]" />
                          )}
                        </div>
                        <span className={`text-sm leading-relaxed ${isChecked ? 'text-[#f0f0ff]' : 'text-[#c8c8d8]'}`}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="bg-[#12121a] rounded-2xl border border-[#1a1a25] p-5 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#8a8a9a] font-['Syne'] font-semibold uppercase tracking-wider">
                  Planning Readiness
                </span>
                <span className="font-['JetBrains_Mono'] text-[#00f5ff]">
                  {checkedCount}/{totalChecklistItems}
                </span>
              </div>
              <div className="h-2.5 bg-[#0a0a0f] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00f5ff] to-[#ffaa00] transition-all duration-700"
                  style={{ width: `${(checkedCount / totalChecklistItems) * 100}%` }}
                />
              </div>
            </div>
            {checkedCount === totalChecklistItems && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00f5ff]/10 border border-[#00f5ff]/20 text-[#00f5ff] text-xs font-['Syne'] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Ready
              </div>
            )}
          </div>
        </div>

        {/* ── Enhanced Best Practices ── */}
        <div className="mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Best Practices
          </h3>
          <p className="text-[#8a8a9a] max-w-2xl mb-10">
            Six essential practices for a successful Kafka deployment. Click any card to expand deeper guidance.
          </p>

          <div className="practice-grid grid md:grid-cols-2 gap-6">
            {bestPractices.map((practice, i) => (
              <button
                key={i}
                onClick={() => setExpandedPractice(expandedPractice === i ? null : i)}
                className={`practice-card text-left rounded-3xl border transition-all duration-350 p-8 ${
                  expandedPractice === i
                    ? 'bg-[#1a1a25] border-[rgba(0,245,255,0.3)] shadow-[0_8px_32px_rgba(0,245,255,0.08)]'
                    : 'bg-[#12121a] border-[#1a1a25] hover:-translate-y-2 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_8px_32px_rgba(0,245,255,0.08)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-3 rounded-xl inline-flex"
                      style={{ backgroundColor: `${practice.color}15`, color: practice.color }}
                    >
                      <practice.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">
                      {practice.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8a8a9a] flex-shrink-0 transition-transform duration-300 ${
                      expandedPractice === i ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <p className="text-[#c8c8d8] text-sm leading-relaxed mb-3">
                  {practice.short}
                </p>

                {practice.diagram && (
                  <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#8a8a9a] bg-[#0a0a0f] rounded-xl p-3 overflow-x-auto mb-3">
                    {practice.diagram.map((node, idx) => (
                      <span key={idx} className="flex items-center gap-2 flex-shrink-0">
                        <span className={node.highlight ? 'text-[#00f5ff]' : ''}>{node.label}</span>
                        {idx < practice.diagram.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-[#8a8a9a] flex-shrink-0" />
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {expandedPractice === i && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="pt-3 border-t border-[#1a1a25]">
                      <p className="text-sm text-[#c8c8d8] leading-relaxed">{practice.detail}</p>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ordering & Consistency Deep-dive ── */}
        <div className="consistency-section mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Ordering & Consistency
          </h3>
          <p className="text-[#8a8a9a] max-w-2xl mb-10">
            Guarantee that committed transactions related to one another are processed in the correct order. Explore the two primary methods and see the Consistency Simulator in action. For true cross-topic atomic transactions, Kafka provides the Transactions API with <code className="text-[#00f5ff] font-['JetBrains_Mono'] text-xs">transactional.id</code>.
          </p>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Method 1 */}
            <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#00f5ff]/10 text-[#00f5ff]">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">
                  Method 1: Topic & Partition Optimization
                </h4>
              </div>
              <p className="text-sm text-[#c8c8d8] leading-relaxed mb-5">
                Send all records and rows for a given transaction to a <span className="text-[#00f5ff] font-medium">single topic and single partition</span>. Assign one message key to each transaction so the broker routes every related record to the same partition, preserving order.
              </p>
              <div className="flex flex-col gap-3 bg-[#0a0a0f] rounded-xl p-4">
                <div className="flex items-center gap-3 text-xs font-['JetBrains_Mono']">
                  <span className="px-2 py-1 rounded-md bg-[#00f5ff]/10 text-[#00f5ff]">TxID-42</span>
                  <ArrowRight className="w-3 h-3 text-[#8a8a9a]" />
                  <span className="px-2 py-1 rounded-md bg-[#00f5ff]/10 text-[#00f5ff]">orders-topic</span>
                  <ArrowRight className="w-3 h-3 text-[#8a8a9a]" />
                  <span className="px-2 py-1 rounded-md bg-[#00f5ff]/10 text-[#00f5ff]">Partition 0</span>
                </div>
                <p className="text-xs text-[#8a8a9a]">
                  All records with the same transaction ID land on the same partition → guaranteed order.
                </p>
              </div>
            </div>

            {/* Method 2 */}
            <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#ffaa00]/10 text-[#ffaa00]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">
                  Method 2: Idempotency
                </h4>
              </div>
              <p className="text-sm text-[#c8c8d8] leading-relaxed mb-5">
                Enable <span className="text-[#ffaa00] font-medium">enable.idempotence=true</span> on producers so retries use producer IDs and sequence numbers, preventing duplicate writes automatically.
              </p>
              <div className="flex flex-col gap-3 bg-[#0a0a0f] rounded-xl p-4">
                <div className="flex items-center gap-3 text-xs font-['JetBrains_Mono']">
                  <span className="px-2 py-1 rounded-md bg-[#ffaa00]/10 text-[#ffaa00]">Producer ID</span>
                  <ArrowRight className="w-3 h-3 text-[#8a8a9a]" />
                  <span className="px-2 py-1 rounded-md bg-[#ffaa00]/10 text-[#ffaa00]">Sequence #</span>
                  <CheckCircle2 className="w-3 h-3 text-[#00f5ff]" />
                  <span className="text-[#00f5ff]">No duplicates</span>
                </div>
                <p className="text-xs text-[#8a8a9a]">
                  The broker deduplicates retried sends using producer ID + sequence number.
                </p>
              </div>
              <p className="text-xs text-[#8a8a9a] mt-4 pt-4 border-t border-[#1a1a25]">
                <span className="text-[#ffaa00] font-medium">Consumer-side deduplication:</span> As a secondary pattern, consumers can track seen message keys to skip duplicates when exactly-once semantics are required end-to-end.
              </p>
            </div>
          </div>

          {/* Consistency Simulator */}
          <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8">
            <div className="flex items-center gap-3 mb-2">
              <Monitor className="w-5 h-5 text-[#ff00aa]" />
              <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">
                Consistency Simulator
              </h4>
            </div>
            <p className="text-sm text-[#8a8a9a] mb-6">
              Toggle between scenarios to see why partition assignment matters for transaction ordering.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setSimScenario('scattered')}
                className={`px-5 py-2.5 rounded-xl font-['Syne'] font-semibold text-sm transition-all duration-300 ${
                  simScenario === 'scattered'
                    ? 'bg-[#ff4444]/10 text-[#ff4444] border border-[#ff4444]/30'
                    : 'text-[#8a8a9a] border border-transparent hover:text-[#c8c8d8]'
                }`}
              >
                Scenario A: Scattered
              </button>
              <button
                onClick={() => setSimScenario('single')}
                className={`px-5 py-2.5 rounded-xl font-['Syne'] font-semibold text-sm transition-all duration-300 ${
                  simScenario === 'single'
                    ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30'
                    : 'text-[#8a8a9a] border border-transparent hover:text-[#c8c8d8]'
                }`}
              >
                Scenario B: Single Partition
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Source records */}
              <div>
                <p className="text-xs font-['Syne'] font-semibold uppercase tracking-wider text-[#8a8a9a] mb-4">
                  Transaction Records
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { id: 'TX-101', op: 'INSERT', row: 'order #101', order: 1 },
                    { id: 'TX-101', op: 'UPDATE', row: 'order #101', order: 2 },
                    { id: 'TX-101', op: 'UPDATE', row: 'order #101', order: 3 },
                  ].map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#0a0a0f] rounded-xl p-3 border border-[#1a1a25]"
                    >
                      <span className="px-2 py-0.5 rounded-md bg-[#ff00aa]/10 text-[#ff00aa] text-[10px] font-['JetBrains_Mono'] font-bold">
                        {rec.id}
                      </span>
                      <span className="text-xs text-[#8a8a9a] font-['JetBrains_Mono']">{rec.op}</span>
                      <span className="text-sm text-[#c8c8d8]">{rec.row}</span>
                      <span className="ml-auto text-[10px] text-[#8a8a9a] font-['JetBrains_Mono']">
                        #{rec.order}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partitions */}
              <div>
                <p className="text-xs font-['Syne'] font-semibold uppercase tracking-wider text-[#8a8a9a] mb-4">
                  Kafka Partitions
                </p>
                {simScenario === 'scattered' ? (
                  <div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'P0', records: [{ op: 'UPDATE', order: 2 }] },
                        { label: 'P1', records: [{ op: 'INSERT', order: 1 }] },
                        { label: 'P2', records: [{ op: 'UPDATE', order: 3 }] },
                      ].map((p, i) => (
                        <div key={i} className="bg-[#0a0a0f] rounded-xl border border-[#ff4444]/30 p-3">
                          <span className="text-[10px] font-['JetBrains_Mono'] text-[#ff4444] font-bold block mb-2">
                            {p.label}
                          </span>
                          {p.records.map((r, j) => (
                            <div
                              key={j}
                              className="text-xs text-[#c8c8d8] bg-[#1a1a25] rounded-md px-2 py-1.5 mb-1"
                            >
                              {r.op} #{r.order}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-[#8a8a9a]">
                      <span className="text-[#ff4444] font-medium">Caused by:</span> inconsistent message keys or routing to multiple topics without transaction coordination.
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#0a0a0f] rounded-xl border border-[#00f5ff]/30 p-4">
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#00f5ff] font-bold block mb-3">
                      P0 — Single Partition
                    </span>
                    <div className="flex flex-col gap-2">
                      {[
                        { op: 'INSERT', order: 1 },
                        { op: 'UPDATE', order: 2 },
                        { op: 'UPDATE', order: 3 },
                      ].map((r, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 text-xs text-[#c8c8d8] bg-[#1a1a25] rounded-md px-3 py-2"
                        >
                          <span className="font-['JetBrains_Mono'] text-[#00f5ff]">#{r.order}</span>
                          <span>{r.op}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl border ${
                    simScenario === 'scattered'
                      ? 'bg-[#ff4444]/5 border-[#ff4444]/20'
                      : 'bg-[#00f5ff]/5 border-[#00f5ff]/20'
                  }`}
                >
                  {simScenario === 'scattered' ? (
                    <>
                      <XCircle className="w-5 h-5 text-[#ff4444] flex-shrink-0" />
                      <span className="text-sm text-[#c8c8d8]">
                        <span className="text-[#ff4444] font-medium">OUT OF ORDER</span> — records scattered across partitions may be consumed in any sequence.
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-[#00f5ff] flex-shrink-0" />
                      <span className="text-sm text-[#c8c8d8]">
                        <span className="text-[#00f5ff] font-medium">IN ORDER</span> — all records on one partition are consumed in the exact sequence produced.
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Generali Case Study ── */}
        <div className="case-study-section mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Case Study: Generali Group
          </h3>
          <p className="text-[#8a8a9a] max-w-2xl mb-10">
            One of the world&apos;s leading insurers transformed their data architecture with CDC and Kafka. Walk through their journey step by step.
          </p>

          <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 md:p-10">
            {/* Stepper */}
            <div className="flex items-center justify-between mb-10 overflow-x-auto gap-2">
              {caseStudySteps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveCaseStep(i);
                    setCaseChoice(null);
                    setCaseRevealed(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-['Syne'] font-semibold whitespace-nowrap transition-all duration-300 ${
                    i === activeCaseStep
                      ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30'
                      : i < activeCaseStep
                      ? 'text-[#8a8a9a] opacity-60'
                      : 'text-[#8a8a9a] border border-transparent hover:text-[#c8c8d8]'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: i <= activeCaseStep ? `${s.color}20` : '#1a1a25',
                      color: i <= activeCaseStep ? s.color : '#8a8a9a',
                    }}
                  >
                    {s.step}
                  </span>
                  {s.title}
                </button>
              ))}
            </div>

            {/* Active step content */}
            <div className="animate-in fade-in duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="p-3 rounded-xl flex-shrink-0"
                  style={{
                    backgroundColor: `${caseStudySteps[activeCaseStep].color}15`,
                    color: caseStudySteps[activeCaseStep].color,
                  }}
                >
                  {(() => {
                    const Icon = caseStudySteps[activeCaseStep].icon;
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <h4 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-2">
                    {caseStudySteps[activeCaseStep].title}
                  </h4>
                  <p className="text-[1.05rem] text-[#c8c8d8] leading-relaxed">
                    {caseStudySteps[activeCaseStep].narrative}
                  </p>
                </div>
              </div>

              {/* Decision point */}
              <div className="bg-[#0a0a0f] rounded-2xl border border-[#1a1a25] p-6 mb-6">
                <p className="text-sm font-['Syne'] font-semibold text-[#f0f0ff] mb-4">
                  What would you choose?
                </p>
                <p className="text-sm text-[#8a8a9a] mb-4">{caseStudySteps[activeCaseStep].problem}</p>
                <div className="space-y-2">
                  {caseStudySteps[activeCaseStep].choices.map((choice, idx) => (
                    <button
                      key={idx}
                      disabled={caseRevealed}
                      onClick={() => handleCaseChoice(idx)}
                      className={`w-full flex items-center gap-3 text-left p-4 rounded-xl transition-all duration-200 ${
                        caseRevealed
                          ? idx === caseStudySteps[activeCaseStep].correctIndex
                            ? 'bg-[#00f5ff]/5 border border-[#00f5ff]/30'
                            : idx === caseChoice
                            ? 'bg-[#ff4444]/5 border border-[#ff4444]/20'
                            : 'bg-[#12121a] border border-[#1a1a25] opacity-50'
                          : 'bg-[#12121a] border border-[#1a1a25] hover:border-[#8a8a9a]/30'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {caseRevealed ? (
                          idx === caseStudySteps[activeCaseStep].correctIndex ? (
                            <CheckCircle2 className="w-5 h-5 text-[#00f5ff]" />
                          ) : idx === caseChoice ? (
                            <XCircle className="w-5 h-5 text-[#ff4444]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#8a8a9a]" />
                          )
                        ) : (
                          <Circle className="w-5 h-5 text-[#8a8a9a]" />
                        )}
                      </div>
                      <span className="text-sm text-[#c8c8d8]">{choice}</span>
                    </button>
                  ))}
                </div>

                {caseRevealed && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
                        caseChoice === caseStudySteps[activeCaseStep].correctIndex
                          ? 'bg-[#00f5ff]/5 border-[#00f5ff]/20'
                          : 'bg-[#ffaa00]/5 border-[#ffaa00]/20'
                      }`}
                    >
                      {caseChoice === caseStudySteps[activeCaseStep].correctIndex ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00f5ff] flex-shrink-0 mt-0.5" />
                      ) : (
                        <Lightbulb className="w-5 h-5 text-[#ffaa00] flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-[#c8c8d8] leading-relaxed">
                        {caseStudySteps[activeCaseStep].feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {caseRevealed && activeCaseStep < caseStudySteps.length - 1 && (
                <div className="flex justify-end">
                  <button
                    onClick={advanceCaseStep}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20 font-['Syne'] font-semibold text-sm hover:bg-[#00f5ff]/15 transition-colors"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Callouts ── */}
        <div className="callouts-grid grid md:grid-cols-3 gap-6 mb-24">
          <div className="callout-card bg-[#00f5ff]/5 border border-[#00f5ff]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="w-5 h-5 text-[#00f5ff]" />
              <span className="font-['Syne'] font-semibold text-[#00f5ff]">Tip</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              Data engineers need clear guidance and guardrails about how best to operate. Invest in runbooks, templates, and peer review processes early.
            </p>
          </div>

          <div className="callout-card bg-[#ff4444]/5 border border-[#ff4444]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#ff4444]" />
              <span className="font-['Syne'] font-semibold text-[#ff4444]">Warning</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              Data quality issues arise when source data quality is poor. In a streaming pipeline, the publisher (not the consumer) is responsible for source data quality.
            </p>
          </div>

          <div className="callout-card bg-[#ffaa00]/5 border border-[#ffaa00]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-[#ffaa00]" />
              <span className="font-['Syne'] font-semibold text-[#ffaa00]">Remember</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              Supporting use cases with a common cloud-based platform and managed service is typically more economical than on-premise DIY infrastructure.
            </p>
          </div>
        </div>

        {/* ── Key Takeaways ── */}
        <div className="takeaways-panel bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 md:p-10 mb-24">
          <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-6 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-[#ffaa00]" />
            Key Takeaways
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {takeaways.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-[#0a0a0f] rounded-xl border border-[#1a1a25] hover:border-[rgba(0,245,255,0.2)] transition-colors"
              >
                <div className="p-1 rounded-md bg-[#00f5ff]/10 text-[#00f5ff] mt-0.5 flex-shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Section ── */}
        <div
          className="cta-section text-center py-20 px-6 rounded-3xl"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,245,255,0.05) 0%, transparent 70%)',
          }}
        >
          <h2 className="font-['Syne'] font-bold text-[clamp(2rem,4vw,3rem)] text-[#f0f0ff] mb-4">
            Ready to Build Real-Time Data Pipelines?
          </h2>
          <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed max-w-xl mx-auto mb-8">
            Apply what you&apos;ve learned. Start designing your Kafka streaming architecture today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PillButton variant="primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Review All Chapters
            </PillButton>
            <a
              href="https://kafka.apache.org/downloads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00f5ff] hover:underline font-medium text-sm"
            >
              Download Kafka →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
