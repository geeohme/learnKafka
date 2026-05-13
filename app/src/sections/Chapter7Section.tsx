import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import {
  Cloud,
  Server,
  Wrench,
  BarChart3,
  Code,
  Database,
  Cpu,
  Repeat,
  ShieldCheck,
  Eye,
  Workflow,
  BookOpen,
  Lightbulb,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Types ─── */

type DeploymentOption = 'platform' | 'cloud' | 'diy';

interface ComparisonRow {
  dimension: string;
  platform: string;
  cloud: string;
  diy: string;
}

interface TenThing {
  num: number;
  title: string;
  short: string;
  detail: string;
  icon: React.ElementType;
  color: string;
}

interface WizardQuestion {
  question: string;
  options: { label: string; value: 'a' | 'b' | 'c' }[];
}

/* ─── Data ─── */

const comparisonRows: ComparisonRow[] = [
  {
    dimension: 'Deployment Model',
    platform: 'Self-managed on-premise or private cloud',
    cloud: 'Fully managed on AWS / Azure / GCP',
    diy: 'Open source, anywhere you host it',
  },
  {
    dimension: 'Management Overhead',
    platform: 'Moderate — you control upgrades, patching, backups',
    cloud: 'Minimal — Confluent handles ops 24/7',
    diy: 'Highest — full responsibility for cluster ops',
  },
  {
    dimension: 'Scalability',
    platform: 'Horizontal scale across your own infrastructure',
    cloud: 'Auto-scaling with usage-based expansion',
    diy: 'Manual — you design and execute all scaling',
  },
  {
    dimension: 'Cost Structure',
    platform: 'Predictable licensing + infrastructure costs',
    cloud: 'Usage-based pricing — pay for what you stream',
    diy: 'Lowest license cost, highest hidden ops cost',
  },
  {
    dimension: 'Best For',
    platform: 'Regulated industries needing full control',
    cloud: 'Teams optimizing for agility & speed-to-market',
    diy: 'Learning, experimentation, or tight budget constraints',
  },
];

const tenThings: TenThing[] = [
  {
    num: 1,
    title: 'Event Streaming Platform',
    short: 'Confluent provides both Platform (self-managed) and Cloud (fully managed). Choose based on deployment needs.',
    detail: 'Confluent Platform gives you complete control over brokers, ZooKeeper (or KRaft), connectors, and security configurations on your own infrastructure. Confluent Cloud abstracts all of that away, offering serverless Kafka with elastic scaling, automated backups, and global replication. Evaluate your team size, SLAs, and compliance requirements before deciding.',
    icon: Workflow,
    color: '#00f5ff',
  },
  {
    num: 2,
    title: 'Development Flexibility',
    short: 'Rich ecosystem of connectors, tools, and APIs. Confluent Hub is a marketplace for connectors.',
    detail: 'Kafka Connect powers integrations with databases, cloud storage, and SaaS applications. Confluent Hub hosts 100+ pre-built connectors maintained by Confluent and the community. Beyond Connect, you have the Java Producer/Consumer APIs, REST Proxy, and client libraries in Python, Go, Node.js, and more.',
    icon: Code,
    color: '#ffaa00',
  },
  {
    num: 3,
    title: 'Management & Monitoring',
    short: 'GUI and CLI interfaces for operational control. Health monitoring, alerting, and cluster management.',
    detail: 'Confluent Control Center provides a web UI for topic management, consumer lag inspection, and stream processing monitoring. The Confluent CLI enables automated deployments and scripting. Integrate with Prometheus, Grafana, or Datadog for custom dashboards and proactive alerting on throughput, latency, and disk usage.',
    icon: BarChart3,
    color: '#ff00aa',
  },
  {
    num: 4,
    title: 'Scalability & Hybrid Cloud',
    short: 'Scale horizontally across environments. Public and private cloud options. Disaster recovery capabilities.',
    detail: 'Kafka partitions are the unit of parallelism — add brokers and partitions to scale throughput linearly. Confluent Replicator enables cross-region and cross-cloud replication for disaster recovery. Hybrid architectures let you run sensitive workloads on-premise while bursting analytics to the cloud.',
    icon: Server,
    color: '#00f5ff',
  },
  {
    num: 5,
    title: 'Metadata Integration',
    short: 'Schema Registry for versioned schema control. RESTful interface for consumers to query schemas.',
    detail: 'Confluent Schema Registry stores Avro, Protobuf, and JSON schemas with full version history. Producers register schemas; consumers retrieve them dynamically. Schema Evolution rules (BACKWARD, FORWARD, FULL) prevent breaking changes. The REST API lets any language query schemas without a native Schema Registry client.',
    icon: Database,
    color: '#ffaa00',
  },
  {
    num: 6,
    title: 'Stream Processing Intelligence',
    short: 'Built-in ksqlDB and Kafka Streams API. Process data without leaving the platform.',
    detail: 'ksqlDB gives you a SQL-like interface for stream processing — create streams, tables, aggregations, and joins with familiar syntax. Kafka Streams API offers a Java DSL and Processor API for stateful, exactly-once processing embedded directly in your applications. Both integrate natively with Kafka topics and Schema Registry.',
    icon: Cpu,
    color: '#ff00aa',
  },
  {
    num: 7,
    title: 'Change Data Capture Strategy',
    short: 'Evaluate log-based CDC solutions that minimize production impact and capture changes with low latency.',
    detail: 'Change Data Capture (CDC) is the foundation of real-time data streaming. Log-based CDC reads database transaction logs directly, adding negligible overhead while capturing every insert, update, and delete with sub-second latency. When evaluating CDC approaches, consider support for heterogeneous sources (Oracle, SQL Server, MySQL, PostgreSQL), schema evolution handling, and integration with Kafka topic mapping.',
    icon: Repeat,
    color: '#00f5ff',
  },
  {
    num: 8,
    title: 'Automation & Operational Efficiency',
    short: 'Automated replication, schema handling, and table creation reduce engineering overhead and operational toil.',
    detail: 'Modern CDC pipelines automate critical operational tasks: detecting source schema changes, creating corresponding Kafka topics, handling data-type mappings, and managing offset tracking. A well-automated solution reduces weeks of engineering work to hours of configuration, letting your team focus on building streaming applications rather than maintaining data plumbing.',
    icon: Cloud,
    color: '#ffaa00',
  },
  {
    num: 9,
    title: 'Production Impact Assessment',
    short: 'Compare log-based CDC against trigger-based or query-based approaches for source system overhead.',
    detail: 'Trigger-based CDC adds load to transaction processing by firing triggers on every data change. Query-based polling consumes CPU and risks missing changes between intervals. Log-based CDC reads the database transaction log directly, adding negligible overhead to the source database. When assessing production impact, measure latency, resource consumption, and change-capture completeness.',
    icon: Eye,
    color: '#ff00aa',
  },
  {
    num: 10,
    title: 'Security & Governance',
    short: 'Enterprise security features, data governance, compliance support.',
    detail: 'Confluent supports end-to-end encryption (TLS/SSL), SASL authentication, and ACL-based authorization. Role-Based Access Control (RBAC) integrates with LDAP and OAuth. For governance, data lineage tools track how data flows from source systems through Kafka to downstream consumers — critical for GDPR, HIPAA, and SOX compliance.',
    icon: ShieldCheck,
    color: '#00f5ff',
  },
];

const wizardQuestions: WizardQuestion[] = [
  {
    question: 'How do you prefer to manage infrastructure?',
    options: [
      { label: 'Fully managed — I want to focus on applications', value: 'a' },
      { label: 'Self-managed — I need control over every layer', value: 'b' },
      { label: 'Hybrid — some managed, some self-hosted', value: 'c' },
    ],
  },
  {
    question: 'What is your primary deployment environment?',
    options: [
      { label: 'Public cloud (AWS, Azure, GCP)', value: 'a' },
      { label: 'Private data center or on-premise', value: 'b' },
      { label: 'Both — multi-cloud or hybrid', value: 'c' },
    ],
  },
  {
    question: 'How important is operational control?',
    options: [
      { label: 'Critical — we need full access to logs and configs', value: 'a' },
      { label: 'Moderate — we want some visibility and tuning', value: 'b' },
      { label: 'Low — we trust the provider to handle ops', value: 'c' },
    ],
  },
  {
    question: 'What is your team\'s Kafka expertise?',
    options: [
      { label: 'Beginner — just getting started with streaming', value: 'a' },
      { label: 'Intermediate — some production experience', value: 'b' },
      { label: 'Expert — we run large clusters today', value: 'c' },
    ],
  },
];

const takeaways = [
  'Confluent offers both self-managed Platform and fully managed Cloud — choose based on control vs. convenience.',
  'A rich ecosystem of connectors, APIs, and tools (Confluent Hub) accelerates development and integration.',
  'Schema Registry, ksqlDB, and Kafka Streams provide metadata control and stream processing without external systems.',
  'Qlik Replicate delivers automated, log-based CDC with minimal source impact — ideal for Kafka ingestion.',
  'The right Kafka deployment depends on your organizational needs, expertise, compliance requirements, and growth strategy.',
];

/* ─── Helper: wizard scoring ─── */

function computeRecommendation(answers: ('a' | 'b' | 'c')[]) {
  let cloudScore = 0;
  let platformScore = 0;
  let diyScore = 0;

  // Q1: management preference
  if (answers[0] === 'a') cloudScore += 2;
  if (answers[0] === 'b') { diyScore += 2; platformScore += 1; }
  if (answers[0] === 'c') platformScore += 1;

  // Q2: deployment environment
  if (answers[1] === 'a') cloudScore += 2;
  if (answers[1] === 'b') { diyScore += 2; platformScore += 1; }
  if (answers[1] === 'c') platformScore += 1;

  // Q3: operational control
  if (answers[2] === 'a') { diyScore += 2; platformScore += 1; }
  if (answers[2] === 'b') platformScore += 1;
  if (answers[2] === 'c') cloudScore += 2;

  // Q4: expertise
  if (answers[3] === 'a') cloudScore += 2;
  if (answers[3] === 'b') platformScore += 1;
  if (answers[3] === 'c') { diyScore += 2; platformScore += 1; }

  const scores = [
    { key: 'cloud', label: 'Confluent Cloud', score: cloudScore, color: '#00f5ff' },
    { key: 'platform', label: 'Confluent Platform', score: platformScore, color: '#ffaa00' },
    { key: 'diy', label: 'DIY Apache Kafka', score: diyScore, color: '#ff00aa' },
  ];

  scores.sort((a, b) => b.score - a.score);
  return scores;
}

/* ─── Component ─── */

export default function Chapter7Section() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [compareTab, setCompareTab] = useState<DeploymentOption>('platform');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState<('a' | 'b' | 'c')[]>([]);
  const [wizardComplete, setWizardComplete] = useState(false);

  const handleWizardAnswer = (value: 'a' | 'b' | 'c') => {
    const next = [...wizardAnswers, value];
    setWizardAnswers(next);
    if (next.length === wizardQuestions.length) {
      setWizardComplete(true);
    } else {
      setWizardStep((s) => s + 1);
    }
  };

  const resetWizard = () => {
    setWizardStep(0);
    setWizardAnswers([]);
    setWizardComplete(false);
  };

  const goBack = () => {
    if (wizardStep > 0) {
      setWizardStep((s) => s - 1);
      setWizardAnswers((prev) => prev.slice(0, -1));
      setWizardComplete(false);
    }
  };

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(sectionRef.current.querySelector('.subtitle-block'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.subtitle-block'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelector('.comparison-section'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.comparison-section'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.ten-card'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.ten-grid'), start: 'top 80%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelector('.wizard-section'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.wizard-section'), start: 'top 85%', once: true } }
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
  }, { scope: sectionRef });

  const comparisonTabs: { key: DeploymentOption; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'platform', label: 'Confluent Platform', icon: Server, color: '#ffaa00' },
    { key: 'cloud', label: 'Confluent Cloud', icon: Cloud, color: '#00f5ff' },
    { key: 'diy', label: 'DIY Apache Kafka', icon: Wrench, color: '#ff00aa' },
  ];

  const currentQuestion = wizardQuestions[wizardStep];
  const results = wizardComplete ? computeRecommendation(wizardAnswers) : null;
  const topResult = results?.[0];

  return (
    <section id="chapter-7" ref={sectionRef} className="section-padding bg-[#0a0a0f]">
      <div className="container-main">
        <SectionHeader chapter="07" title="Ten Things to Consider" />

        <div className="subtitle-block mb-16">
          <p className="font-['Syne'] font-semibold text-xl text-[#00f5ff] mb-4">
            Choosing Your Kafka Platform & CDC Solution
          </p>
          <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed max-w-3xl">
            Selecting the right Kafka deployment model and Change Data Capture solution requires evaluating trade-offs across control, cost, scalability, and operational overhead. This chapter explores ten critical considerations to guide your decision.
          </p>
        </div>

        {/* ── Comparison Matrix ── */}
        <div className="comparison-section mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Confluent Platform vs Cloud vs DIY
          </h3>
          <p className="text-[#8a8a9a] max-w-2xl mb-10">
            Toggle between deployment options to see how each stacks up across the dimensions that matter most for your organization.
          </p>

          {/* Toggle Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {comparisonTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCompareTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-['Syne'] font-semibold text-sm transition-all duration-300 ${
                  compareTab === tab.key
                    ? 'border'
                    : 'text-[#8a8a9a] border border-transparent hover:text-[#c8c8d8]'
                }`}
                style={
                  compareTab === tab.key
                    ? {
                        backgroundColor: `${tab.color}10`,
                        color: tab.color,
                        borderColor: `${tab.color}30`,
                      }
                    : {}
                }
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-[#12121a] rounded-3xl border border-[#1a1a25] overflow-hidden">
            <div className="grid grid-cols-4 gap-0">
              <div className="p-5 border-b border-r border-[#1a1a25] font-['Syne'] font-semibold text-sm text-[#8a8a9a] uppercase tracking-wider">
                Dimension
              </div>
              <div className="p-5 border-b border-r border-[#1a1a25] font-['Syne'] font-semibold text-sm text-[#ffaa00]">
                Confluent Platform
              </div>
              <div className="p-5 border-b border-r border-[#1a1a25] font-['Syne'] font-semibold text-sm text-[#00f5ff]">
                Confluent Cloud
              </div>
              <div className="p-5 border-b border-[#1a1a25] font-['Syne'] font-semibold text-sm text-[#ff00aa]">
                DIY Apache Kafka
              </div>

              {comparisonRows.map((row, i) => (
                <div key={`row-${i}`} className="contents">
                  <div
                    key={`d-${i}`}
                    className="p-5 border-b border-r border-[#1a1a25] text-sm text-[#8a8a9a] font-medium flex items-center"
                  >
                    {row.dimension}
                  </div>
                  <div
                    key={`p-${i}`}
                    className={`p-5 border-b border-r border-[#1a1a25] text-sm text-[#c8c8d8] leading-relaxed transition-colors duration-300 ${
                      compareTab === 'platform' ? 'bg-[#ffaa00]/5' : ''
                    }`}
                  >
                    {row.platform}
                  </div>
                  <div
                    key={`c-${i}`}
                    className={`p-5 border-b border-r border-[#1a1a25] text-sm text-[#c8c8d8] leading-relaxed transition-colors duration-300 ${
                      compareTab === 'cloud' ? 'bg-[#00f5ff]/5' : ''
                    }`}
                  >
                    {row.cloud}
                  </div>
                  <div
                    key={`d2-${i}`}
                    className={`p-5 border-b border-[#1a1a25] text-sm text-[#c8c8d8] leading-relaxed transition-colors duration-300 ${
                      compareTab === 'diy' ? 'bg-[#ff00aa]/5' : ''
                    }`}
                  >
                    {row.diy}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {comparisonRows.map((row, i) => (
              <div key={i} className="bg-[#12121a] rounded-2xl border border-[#1a1a25] p-5">
                <p className="text-xs font-['Syne'] font-semibold uppercase tracking-wider text-[#8a8a9a] mb-3">
                  {row.dimension}
                </p>
                <div className="space-y-3">
                  <div className={`p-3 rounded-xl text-sm transition-colors ${compareTab === 'platform' ? 'bg-[#ffaa00]/5 border border-[#ffaa00]/20' : 'bg-[#0a0a0f]'}`}>
                    <span className="text-[#ffaa00] font-semibold text-xs block mb-1">Platform</span>
                    <span className="text-[#c8c8d8]">{row.platform}</span>
                  </div>
                  <div className={`p-3 rounded-xl text-sm transition-colors ${compareTab === 'cloud' ? 'bg-[#00f5ff]/5 border border-[#00f5ff]/20' : 'bg-[#0a0a0f]'}`}>
                    <span className="text-[#00f5ff] font-semibold text-xs block mb-1">Cloud</span>
                    <span className="text-[#c8c8d8]">{row.cloud}</span>
                  </div>
                  <div className={`p-3 rounded-xl text-sm transition-colors ${compareTab === 'diy' ? 'bg-[#ff00aa]/5 border border-[#ff00aa]/20' : 'bg-[#0a0a0f]'}`}>
                    <span className="text-[#ff00aa] font-semibold text-xs block mb-1">DIY</span>
                    <span className="text-[#c8c8d8]">{row.diy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── The Ten Things ── */}
        <div className="mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            The Ten Things to Consider
          </h3>
          <p className="text-[#8a8a9a] max-w-2xl mb-10">
            Each card below represents a key factor when evaluating Confluent, Kafka, and Qlik Replicate for your data streaming architecture. Click to expand for deeper detail.
          </p>

          <div className="ten-grid grid md:grid-cols-2 gap-6">
            {tenThings.map((thing) => {
              const isExpanded = expandedCard === thing.num;
              return (
                <div
                  key={thing.num}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedCard(isExpanded ? null : thing.num)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedCard(isExpanded ? null : thing.num);
                    }
                  }}
                  className={`ten-card text-left rounded-3xl border transition-all duration-350 p-7 ${
                    isExpanded
                      ? 'bg-[#1a1a25] border-[rgba(0,245,255,0.3)] shadow-[0_8px_32px_rgba(0,245,255,0.08)]'
                      : 'bg-[#12121a] border-[#1a1a25] hover:-translate-y-2 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_8px_32px_rgba(0,245,255,0.08)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-['JetBrains_Mono'] font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: `${thing.color}15`, color: thing.color }}
                      >
                        {thing.num}
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded-lg inline-flex"
                          style={{ backgroundColor: `${thing.color}15`, color: thing.color }}
                        >
                          <thing.icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-['Syne'] font-semibold text-base text-[#f0f0ff]">
                          {thing.title}
                        </h4>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#8a8a9a] flex-shrink-0 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <p className="text-sm text-[#c8c8d8] leading-relaxed mt-4 pl-14">
                    {thing.short}
                  </p>
                  {isExpanded && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="mt-4 pt-4 border-t border-[#1a1a25] pl-14">
                        <p className="text-sm text-[#c8c8d8] leading-relaxed">{thing.detail}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Deployment Advisor Wizard ── */}
        <div className="wizard-section mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Deployment Advisor
          </h3>
          <p className="text-[#8a8a9a] max-w-2xl mb-10">
            Answer a few questions about your infrastructure preferences, environment, and team expertise. We will recommend the Kafka deployment model that fits you best.
          </p>

          <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 md:p-10 max-w-3xl mx-auto">
            {!wizardComplete ? (
              <>
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[#8a8a9a] font-['JetBrains_Mono']">
                      Question {wizardStep + 1} of {wizardQuestions.length}
                    </span>
                    <span className="text-[#00f5ff] font-['JetBrains_Mono']">
                      {Math.round(((wizardStep) / wizardQuestions.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00f5ff] to-[#ffaa00] transition-all duration-500"
                      style={{ width: `${((wizardStep) / wizardQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff] mb-6">
                    {currentQuestion.question}
                  </h4>
                  <div className="space-y-3">
                    {currentQuestion.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleWizardAnswer(opt.value)}
                        className="w-full flex items-center gap-3 text-left p-4 rounded-xl bg-[#0a0a0f] border border-[#1a1a25] hover:border-[#8a8a9a]/30 transition-all duration-200 group"
                      >
                        <Circle className="w-5 h-5 text-[#8a8a9a] group-hover:text-[#00f5ff] transition-colors flex-shrink-0" />
                        <span className="text-sm text-[#c8c8d8] group-hover:text-[#f0f0ff] transition-colors">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Back */}
                {wizardStep > 0 && (
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-2 text-sm text-[#8a8a9a] hover:text-[#c8c8d8] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
              </>
            ) : (
              /* Results */
              <div className="animate-in fade-in duration-500">
                <div className="text-center mb-8">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${topResult?.color}15`, color: topResult?.color }}
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff] mb-2">
                    Recommended: {topResult?.label}
                  </h4>
                  <p className="text-[#8a8a9a] text-sm max-w-md mx-auto">
                    Based on your answers, this deployment model aligns best with your infrastructure needs, environment, and team capabilities.
                  </p>
                </div>

                {/* Score breakdown */}
                <div className="bg-[#0a0a0f] rounded-2xl border border-[#1a1a25] p-6 mb-8">
                  <p className="text-xs font-['Syne'] font-semibold uppercase tracking-wider text-[#8a8a9a] mb-4">
                    Match Scores
                  </p>
                  <div className="space-y-4">
                    {results?.map((r) => (
                      <div key={r.key}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-[#c8c8d8]">{r.label}</span>
                          <span className="font-['JetBrains_Mono'] text-[#8a8a9a]">{r.score} pts</span>
                        </div>
                        <div className="h-2 bg-[#12121a] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min((r.score / 6) * 100, 100)}%`,
                              backgroundColor: r.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reasoning */}
                <div className="bg-[#0a0a0f] rounded-2xl border border-[#1a1a25] p-6 mb-8">
                  <p className="text-xs font-['Syne'] font-semibold uppercase tracking-wider text-[#8a8a9a] mb-3">
                    Why this recommendation?
                  </p>
                  <p className="text-sm text-[#c8c8d8] leading-relaxed">
                    {topResult?.key === 'cloud' &&
                      'You prioritize managed infrastructure, agility, and rapid deployment. Confluent Cloud eliminates operational overhead so your team can focus on building streaming applications rather than managing brokers.'}
                    {topResult?.key === 'platform' &&
                      'You need a balance of control and enterprise support. Confluent Platform gives you full configurability over security, networking, and hardware while providing professional support and verified connectors.'}
                    {topResult?.key === 'diy' &&
                      'Your team has deep Kafka expertise and wants maximum flexibility with minimal licensing cost. DIY Apache Kafka is ideal for learning, custom deployments, or environments with unique constraints.'}
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={resetWizard}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20 font-['Syne'] font-semibold text-sm hover:bg-[#00f5ff]/15 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Start Over
                  </button>
                </div>
              </div>
            )}
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
              Start with Confluent Cloud for prototyping and proof-of-concepts. You can always migrate to Platform or a hybrid model as your requirements mature.
            </p>
          </div>

          <div className="callout-card bg-[#ff4444]/5 border border-[#ff4444]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#ff4444]" />
              <span className="font-['Syne'] font-semibold text-[#ff4444]">Warning</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              DIY Kafka has the lowest license cost but the highest hidden cost in engineering time, operational risk, and incident response. Budget for 24/7 on-call coverage.
            </p>
          </div>

          <div className="callout-card bg-[#ffaa00]/5 border border-[#ffaa00]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-[#ffaa00]" />
              <span className="font-['Syne'] font-semibold text-[#ffaa00]">Remember</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              The right choice depends on your organization&apos;s needs, expertise, and strategy — not just the technology itself. Evaluate people and process alongside platforms.
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
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Section ── */}
        <div
          className="text-center py-20 px-6 rounded-3xl"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(255,0,170,0.05) 0%, transparent 70%)',
          }}
        >
          <h2 className="font-['Syne'] font-bold text-[clamp(2rem,4vw,3rem)] text-[#f0f0ff] mb-4">
            Ready to Choose Your Path?
          </h2>
          <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed max-w-xl mx-auto mb-8">
            You now have the framework to evaluate Confluent, Kafka, and CDC solutions. Apply these ten considerations to your next architecture decision.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f5ff]/10 to-[#ff00aa]/10 border border-[#00f5ff]/20 text-[#00f5ff] font-['Syne'] font-semibold text-sm hover:from-[#00f5ff]/15 hover:to-[#ff00aa]/15 transition-all"
          >
            Review All Chapters
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
