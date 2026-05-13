import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import ZoomableImage from '@/components/ZoomableImage';
import {
  Upload,
  Server,
  Download,
  Layers,
  X,
  ChevronRight,
  ChevronLeft,
  Database,
  FileText,
  HardDrive,
  Copy,
  Users,
  ArrowRight,
  Key,
  GitBranch,
  Zap,
  BookOpen,
  Hash,
  CheckCircle2,
  Circle,
  RotateCcw,
  RefreshCw,
  Clock,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ───────────── Data ───────────── */

const lifecycleSteps = [
  {
    num: 1,
    title: 'Capture Transaction Events',
    icon: Database,
    color: '#00f5ff',
    desc: 'Database transaction events are captured by low-impact Change Data Capture (CDC). CDC monitors the transaction log without adding query load on the source database.',
  },
  {
    num: 2,
    title: 'Serialize into Kafka Record',
    icon: FileText,
    color: '#00f5ff',
    desc: 'The Producer converts the captured event into a Kafka record. This involves serialization (e.g., Avro, JSON, Protobuf) so the data can be transmitted and stored efficiently.',
  },
  {
    num: 3,
    title: 'Write to Topic Log',
    icon: HardDrive,
    color: '#ffaa00',
    desc: 'The record is written to a topic — an immutable, append-only log. Once written, records cannot be modified or deleted (until retention expires), providing a durable audit trail.',
  },
  {
    num: 4,
    title: 'Persist with Retention',
    icon: HardDrive,
    color: '#ffaa00',
    desc: 'Records persist on disk with configurable retention policies (time-based or size-based). This lets consumers re-read historical data or catch up after downtime.',
  },
  {
    num: 5,
    title: 'Replicate Partitions',
    icon: Copy,
    color: '#ffaa00',
    desc: 'Each partition is replicated across multiple brokers. If one broker fails, another replica can take over as leader, ensuring fault tolerance and high availability.',
  },
  {
    num: 6,
    title: 'Consumer Reads Record',
    icon: Download,
    color: '#ff00aa',
    desc: 'A Consumer pulls the record from the partition and deserializes it back into a usable format. Each consumer group stores its offsets in Kafka\'s internal `__consumer_offsets` topic (since Kafka 0.10; earlier versions used ZooKeeper), tracking read progress per partition.',
  },
  {
    num: 7,
    title: 'Consumer Group Parallelism',
    icon: Users,
    color: '#ff00aa',
    desc: 'Consumer groups read records in parallel across multiple partitions. Each partition is assigned to one consumer in the group, enabling scalable throughput for transaction streams.',
  },
];

const architectureComponents = [
  {
    id: 'producer',
    icon: Upload,
    color: '#00f5ff',
    title: 'Producer',
    short: 'Writes data to topics',
    detail:
      'The producer is code or a process that writes data to Kafka. It serializes data into records and sends them to a topic. Components: Data, Record, Serializer, and Key for partitioning.',
    deepDive: [
      'Data is serialized into a binary format (Avro, JSON, Protobuf).',
      'The record contains a key, value, and optional headers.',
      'The key determines the target partition via hashing.',
      'Producers can be synchronous or asynchronous and include retry logic.',
    ],
    codeSnippet: `producer.send({
  topic: 'transactions',
  key: 'account-42',     // hashed to pick partition
  value: { amount: 250 },
  headers: { source: 'api-v2' }
});`,
  },
  {
    id: 'cluster',
    icon: Server,
    color: '#ffaa00',
    title: 'Kafka Cluster',
    short: 'Collection of brokers',
    detail:
      'A Kafka cluster is a collection of brokers. Brokers are the basic functional unit — they run the Kafka process and respond to requests. Topics are the organizational unit for records. Partitions provide parallelism.',
    deepDive: [
      'Each broker runs the Kafka process and stores partitions on disk.',
      'Topics are logical categories; partitions are the physical split.',
      'Replication factor determines how many copies of each partition exist.',
      'One broker acts as controller, managing partition leadership.',
    ],
    codeSnippet: `Topic: orders
  ├── Partition 0 (Leader: Broker 1)
  ├── Partition 1 (Leader: Broker 2)
  └── Partition 2 (Leader: Broker 3)`,
  },
  {
    id: 'consumer',
    icon: Download,
    color: '#ff00aa',
    title: 'Consumer',
    short: 'Reads data from topics',
    detail:
      'The consumer is an application that reads records from a topic. Consumer groups enable parallel reads from multiple partitions for faster throughput and lower latency. Offsets track reading progress.',
    deepDive: [
      'Consumers deserialize records back into application objects.',
      'Each consumer tracks an offset per partition (its reading position).',
      'Consumer groups allow multiple consumers to share the workload.',
      'Rebalancing redistributes partitions when consumers join or leave.',
    ],
    codeSnippet: `consumer.subscribe(['transactions']);
// Each consumer in the group gets
// an exclusive subset of partitions`,
  },
  {
    id: 'zookeeper',
    icon: Layers,
    color: '#8a8a9a',
    title: 'Zookeeper / KRaft',
    short: 'Cluster coordination',
    detail:
      'Zookeeper manages distributed consensus, keeps track of cluster metadata, and helps elect lead partition replicas. Note: KRaft mode (Kafka Raft) is replacing Zookeeper in newer versions for simplified architecture.',
    deepDive: [
      'Zookeeper stores broker registrations, topic configs, and ACLs.',
      'It orchestrates leader election when a broker fails.',
      'KRaft (Kafka Raft) removes the Zookeeper dependency entirely.',
      'KRaft uses an internal Raft quorum for metadata consensus.',
    ],
    codeSnippet: `Kafka 3.x+ supports KRaft mode:
  process.roles=broker,controller
  node.id=1`,
  },
];

const keyConcepts = [
  {
    title: 'Key → Partition Ordering Guarantee',
    icon: Hash,
    color: '#00f5ff',
    text: 'Records with the same key are always routed to the same partition. Because Kafka guarantees order within a partition, this ensures strict ordering for related events (e.g., all events for account-42 arrive in order).',
  },
  {
    title: 'Strict vs. Relaxed Ordering',
    icon: GitBranch,
    color: '#ffaa00',
    text: 'Strict ordering requires all related events to share the same key (same partition). Relaxed ordering allows events to spread across partitions for higher throughput, but order is only guaranteed per partition.',
  },
  {
    title: 'Transaction Consistency in Groups',
    icon: Zap,
    color: '#ff00aa',
    text: 'When consumer groups process transactions in parallel, each partition is consumed by exactly one group member. This preserves per-account ordering while scaling throughput across many consumers.',
  },
];

const consumerGroupDetails = [
  {
    title: 'What is a Consumer Group?',
    icon: Users,
    content:
      'A consumer group is a set of consumers that cooperate to consume data from one or more topics. Kafka distributes partitions across group members so each partition is consumed by exactly one consumer at a time — enabling parallel processing without duplicating work.',
  },
  {
    title: 'Partition Assignment',
    icon: GitBranch,
    content:
      'Kafka uses an assignor strategy to distribute partitions among group members. Three built-in strategies: RoundRobin (spreads partitions evenly), Range (assigns contiguous ranges per topic), and Sticky (minimises partition movement during rebalances). The group coordinator broker orchestrates assignment.',
  },
  {
    title: 'Offset Management',
    icon: Layers,
    content:
      'Each consumer tracks its read position (offset) per partition independently. Offsets are committed back to the internal __consumer_offsets topic. This allows consumers to resume exactly where they left off after a restart or failure, providing at-least-once delivery guarantees by default.',
  },
  {
    title: 'Rebalancing Process',
    icon: RefreshCw,
    content:
      'A rebalance is triggered when a consumer joins or leaves the group, or a new partition is added. Steps: (1) the group coordinator notifies all members, (2) consumers revoke their current partitions, (3) the group leader runs the assignor algorithm, (4) new assignments are distributed, (5) consumers resume from their last committed offsets.',
  },
  {
    title: 'Consumer Lag',
    icon: Clock,
    content:
      'Consumer lag is the difference between the latest offset produced to a partition and the last offset committed by the consumer. High lag indicates the consumer is falling behind. Monitoring lag (via Kafka\'s consumer-groups CLI or tools like Burrow/Confluent Control Center) is essential for detecting processing bottlenecks.',
  },
];

/* ───────────── Component ───────────── */

export default function Chapter2Section() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [lifecycleStep, setLifecycleStep] = useState(0);
  const [routingKey, setRoutingKey] = useState('user-123');
  const [offsetDemoActive, setOffsetDemoActive] = useState(false);
  const [offsets, setOffsets] = useState([3, 7, 5]);

  const activeStep = lifecycleSteps[lifecycleStep];
  const isLastStep = lifecycleStep === lifecycleSteps.length - 1;
  const isFirstStep = lifecycleStep === 0;

  const hashPartition = (key: string, partitions = 3) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % partitions;
  };

  const targetPartition = hashPartition(routingKey);

  /* GSAP animations */
  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const selectors = [
        '.arch-diagram',
        '.feature-grid',
        '.lifecycle-panel',
        '.deep-dive-grid',
        '.key-concepts-panel',
        '.offset-demo',
        '.key-routing-demo',
        '.image-panel',
        '.tip-panel',
      ];

      selectors.forEach((sel) => {
        const el = sectionRef.current!.querySelector(sel);
        if (!el) return;
        gsap.fromTo(el,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
        );
      });

      gsap.fromTo(sectionRef.current.querySelectorAll('.feature-card'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current.querySelector('.feature-grid'),
            start: 'top 85%',
            once: true,
          } }
      );

      gsap.fromTo(sectionRef.current.querySelectorAll('.deep-dive-card'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current.querySelector('.deep-dive-grid'),
            start: 'top 85%',
            once: true,
          } }
      );

      gsap.fromTo(sectionRef.current.querySelectorAll('.concept-card'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current.querySelector('.key-concepts-panel'),
            start: 'top 85%',
            once: true,
          } }
      );
    },
    { scope: sectionRef }
  );

  /* Lifecycle step transition */
  useEffect(() => {
    if (!sectionRef.current) return;
    const stepContent = sectionRef.current.querySelector('.step-content');
    if (!stepContent) return;
    gsap.fromTo(
      stepContent,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [lifecycleStep]);

  /* Offset simulation */
  useEffect(() => {
    if (!offsetDemoActive) return;
    const interval = setInterval(() => {
      setOffsets((prev) =>
        prev.map((o) => {
          if (o >= 9) return o; // stop at max
          return o + 1;
        })
      );
    }, 800);
    return () => clearInterval(interval);
  }, [offsetDemoActive]);

  return (
    <section id="chapter-2" ref={sectionRef} className="section-padding bg-[#0a0a0f]">
      <div className="container-main">
        <SectionHeader chapter="02" title="Looking Deeper into Apache Kafka" />

        {/* Intro */}
        <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed max-w-3xl mb-12">
          Apache Kafka is a streaming platform. It ingests, persists, and presents streams of data for consumption. The smallest unit of data is a{' '}
          <span className="text-[#00f5ff] font-medium">record</span> — and understanding how records flow through Kafka's architecture is key to mastering the platform.
        </p>

        {/* ─── Interactive Architecture Diagram ─── */}
        <div className="arch-diagram bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-10 mb-16">
          <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-8 text-center">
            Kafka Core Components
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {architectureComponents.map((comp) => (
              <button
                key={comp.id}
                onClick={() =>
                  setExpandedComponent(expandedComponent === comp.id ? null : comp.id)
                }
                className={`p-4 md:p-6 rounded-2xl border transition-all duration-300 text-center ${
                  expandedComponent === comp.id
                    ? 'bg-[#1a1a25] border-[rgba(0,245,255,0.3)] shadow-[0_4px_16px_rgba(0,245,255,0.08)]'
                    : 'bg-[#0a0a0f] border-[#1a1a25] hover:border-[rgba(0,245,255,0.2)] hover:-translate-y-1'
                }`}
              >
                <div
                  className="p-3 rounded-xl inline-flex mb-3"
                  style={{ backgroundColor: `${comp.color}15`, color: comp.color }}
                >
                  <comp.icon className="w-6 h-6" />
                </div>
                <p className="font-['Syne'] font-semibold text-sm text-[#f0f0ff]">
                  {comp.title}
                </p>
                <p className="text-xs text-[#8a8a9a] mt-1">{comp.short}</p>
              </button>
            ))}
          </div>

          {/* Flow arrows */}
          <div className="flex items-center justify-center gap-2 mb-6 text-[#00f5ff]/40">
            <span className="text-xs font-['JetBrains_Mono']">Producer</span>
            <div className="h-0.5 w-16 bg-gradient-to-r from-[#00f5ff]/40 to-[#ffaa00]/40" />
            <div className="w-2 h-2 rounded-full bg-[#ffaa00]/60" />
            <div className="h-0.5 w-16 bg-gradient-to-r from-[#ffaa00]/40 to-[#ff00aa]/40" />
            <span className="text-xs font-['JetBrains_Mono']">Consumer</span>
          </div>

          {/* Expanded detail panel */}
          {expandedComponent && (
            <div className="relative bg-[#0a0a0f] rounded-2xl border border-[#1a1a25] p-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                onClick={() => setExpandedComponent(null)}
                className="absolute top-4 right-4 text-[#8a8a9a] hover:text-[#f0f0ff] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {(() => {
                const comp = architectureComponents.find((c) => c.id === expandedComponent);
                if (!comp) return null;
                return (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${comp.color}15`, color: comp.color }}
                      >
                        <comp.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">
                        {comp.title}
                      </h4>
                    </div>
                    <p className="text-[#c8c8d8] leading-relaxed mb-4">{comp.detail}</p>
                    <ul className="space-y-2 mb-4">
                      {comp.deepDive.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#c8c8d8]">
                          <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: comp.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="bg-[#12121a] rounded-xl border border-[#1a1a25] p-4 overflow-x-auto">
                      <pre className="font-['JetBrains_Mono'] text-xs text-[#8a8a9a]">
                        <code>{comp.codeSnippet}</code>
                      </pre>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* ─── Feature Cards ─── */}
        <div className="feature-grid grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Upload,
              color: '#00f5ff',
              title: 'Producers',
              desc: 'Writes data to Kafka topics. Serializes data into records. Uses keys to determine partition assignment.',
            },
            {
              icon: Server,
              color: '#ffaa00',
              title: 'The Cluster',
              desc: 'A collection of brokers managing topics and partitions. Provides scalability, fault tolerance, and redundancy through replication.',
            },
            {
              icon: Download,
              color: '#ff00aa',
              title: 'Consumers',
              desc: 'Reads records from topics. Consumer groups enable parallel processing. Offsets track reading progress per partition.',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="feature-card bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 transition-all duration-350 hover:-translate-y-2 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_8px_32px_rgba(0,245,255,0.08)]"
            >
              <div
                className="p-3 rounded-xl inline-flex mb-4"
                style={{ backgroundColor: `${card.color}15`, color: card.color }}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff] mb-3">
                {card.title}
              </h3>
              <p className="text-[#c8c8d8] text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── Transaction Data Lifecycle Stepper ─── */}
        <div className="lifecycle-panel bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-10 mb-16">
          <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-2">
            Transaction Data Lifecycle
          </h3>
          <p className="text-sm text-[#8a8a9a] mb-8 max-w-2xl">
            Follow how a database transaction becomes a Kafka record, survives failures, and reaches consumers.
          </p>

          {/* Stepper progress bar */}
          <div className="flex items-center gap-1 mb-8 overflow-x-auto">
            {lifecycleSteps.map((step, idx) => {
              const active = idx === lifecycleStep;
              const completed = idx < lifecycleStep;
              return (
                <div key={step.num} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setLifecycleStep(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-['JetBrains_Mono'] transition-all duration-300 ${
                      active
                        ? 'bg-[#1a1a25] border-[#00f5ff]/40 text-[#00f5ff]'
                        : completed
                        ? 'bg-[#0a0a0f] border-[#00f5ff]/20 text-[#8a8a9a]'
                        : 'bg-[#0a0a0f] border-[#1a1a25] text-[#8a8a9a]'
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00f5ff]" />
                    ) : active ? (
                      <Circle className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px]">{step.num}</span>
                    )}
                    <span className="hidden sm:inline">{step.title.split(' ').slice(0, 2).join(' ')}</span>
                  </button>
                  {idx < lifecycleSteps.length - 1 && (
                    <div
                      className={`h-[2px] w-4 shrink-0 transition-colors duration-300 ${
                        completed ? 'bg-[#00f5ff]/40' : 'bg-[#1a1a25]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Active step content */}
          <div className="step-content bg-[#0a0a0f] rounded-2xl border border-[#1a1a25] p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div
                className="p-4 rounded-2xl shrink-0"
                style={{ backgroundColor: `${activeStep.color}15`, color: activeStep.color }}
              >
                <activeStep.icon className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">
                    Step {activeStep.num} / {lifecycleSteps.length}
                  </span>
                  <div className="h-[1px] w-8 bg-[#1a1a25]" />
                  <span className="text-xs font-['JetBrains_Mono']" style={{ color: activeStep.color }}>
                    {activeStep.title}
                  </span>
                </div>
                <p className="text-[#c8c8d8] leading-relaxed text-[1.05rem]">{activeStep.desc}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setLifecycleStep((s) => Math.max(0, s - 1))}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                isFirstStep
                  ? 'border-[#1a1a25] text-[#8a8a9a] cursor-not-allowed'
                  : 'border-[#1a1a25] text-[#f0f0ff] hover:border-[#00f5ff]/30 hover:bg-[#1a1a25]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex gap-1.5">
              {lifecycleSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setLifecycleStep(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === lifecycleStep ? 'bg-[#00f5ff] w-5' : 'bg-[#1a1a25] hover:bg-[#8a8a9a]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setLifecycleStep((s) => Math.min(lifecycleSteps.length - 1, s + 1))}
              disabled={isLastStep}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                isLastStep
                  ? 'border-[#1a1a25] text-[#8a8a9a] cursor-not-allowed'
                  : 'border-[#1a1a25] text-[#f0f0ff] hover:border-[#00f5ff]/30 hover:bg-[#1a1a25]'
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── Deep-dive Component Cards ─── */}
        <div className="mb-16">
          <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-8">
            Architecture Deep Dive
          </h3>
          <div className="deep-dive-grid grid md:grid-cols-2 gap-6">
            {architectureComponents.map((comp) => (
              <div
                key={comp.id}
                className="deep-dive-card bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-8 transition-all duration-300 hover:border-[rgba(0,245,255,0.2)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ backgroundColor: `${comp.color}15`, color: comp.color }}
                  >
                    <comp.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">
                    {comp.title}
                  </h4>
                </div>
                <p className="text-[#c8c8d8] text-sm leading-relaxed mb-4">{comp.detail}</p>
                <ul className="space-y-2 mb-5">
                  {comp.deepDive.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#c8c8d8]">
                      <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: comp.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-4 overflow-x-auto">
                  <pre className="font-['JetBrains_Mono'] text-[11px] text-[#8a8a9a] leading-relaxed">
                    <code>{comp.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Key Concepts Panel ─── */}
        <div className="key-concepts-panel bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-10 mb-16">
          <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-2">
            Key Concepts
          </h3>
          <p className="text-sm text-[#8a8a9a] mb-8">
            Understanding these core ideas will help you design robust Kafka pipelines.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {keyConcepts.map((concept, i) => (
              <div
                key={i}
                className="concept-card bg-[#0a0a0f] rounded-2xl border border-[#1a1a25] p-6 transition-all duration-300 hover:border-[rgba(0,245,255,0.2)]"
              >
                <div
                  className="p-2.5 rounded-xl inline-flex mb-4"
                  style={{ backgroundColor: `${concept.color}15`, color: concept.color }}
                >
                  <concept.icon className="w-5 h-5" />
                </div>
                <h4 className="font-['Syne'] font-semibold text-base text-[#f0f0ff] mb-3">
                  {concept.title}
                </h4>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">{concept.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Offset Tracker Visualization ─── */}
        <div className="offset-demo bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-10 mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-1">
                Offset Tracker
              </h3>
              <p className="text-sm text-[#8a8a9a]">
                See how consumers in a group track their read position per partition.
              </p>
            </div>
            <button
              onClick={() => setOffsetDemoActive((a) => !a)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                offsetDemoActive
                  ? 'border-[#ff00aa]/30 text-[#ff00aa] bg-[#ff00aa]/10'
                  : 'border-[#1a1a25] text-[#f0f0ff] hover:border-[#00f5ff]/30 hover:bg-[#1a1a25]'
              }`}
            >
              {offsetDemoActive ? 'Pause Simulation' : 'Start Simulation'}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((partitionIdx) => {
              const maxRecords = 10;
              const active = offsetDemoActive;
              return (
                <div key={partitionIdx} className="bg-[#0a0a0f] rounded-2xl border border-[#1a1a25] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">
                      Partition {partitionIdx}
                    </span>
                    <span className="text-xs font-['JetBrains_Mono'] text-[#ff00aa]">
                      offset: {offsets[partitionIdx]}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: maxRecords }).map((_, rIdx) => {
                      const isRead = rIdx < offsets[partitionIdx];
                      const isNext = rIdx === offsets[partitionIdx];
                      return (
                        <div key={rIdx} className="flex items-center gap-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${
                              isRead
                                ? 'w-full bg-[#ff00aa]/40'
                                : isNext && active
                                ? 'w-3/4 bg-[#ff00aa] animate-pulse'
                                : 'w-full bg-[#1a1a25]'
                            }`}
                          />
                          <span className="text-[10px] font-['JetBrains_Mono'] text-[#8a8a9a] w-6 text-right">
                            {rIdx}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-[#8a8a9a]">
                    <Users className="w-3.5 h-3.5" />
                    Consumer {partitionIdx + 1} assigned
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Key Routing Demonstration ─── */}
        <div className="key-routing-demo bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-10 mb-16">
          <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-2">
            Key Routing Demo
          </h3>
          <p className="text-sm text-[#8a8a9a] mb-8">
            Type a record key to see which partition it routes to. Same key → same partition.
          </p>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2 space-y-5">
              <div>
                <label className="block text-xs font-['JetBrains_Mono'] text-[#8a8a9a] mb-2">
                  Record Key
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={routingKey}
                    onChange={(e) => setRoutingKey(e.target.value)}
                    className="flex-1 bg-[#0a0a0f] border border-[#1a1a25] rounded-xl px-4 py-3 text-sm text-[#f0f0ff] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00f5ff]/40 transition-colors"
                    placeholder="Enter a key..."
                  />
                  <button
                    onClick={() => setRoutingKey('user-123')}
                    className="px-3 rounded-xl border border-[#1a1a25] text-[#8a8a9a] hover:text-[#f0f0ff] hover:border-[#00f5ff]/30 transition-all"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-4">
                <p className="text-xs font-['JetBrains_Mono'] text-[#8a8a9a] mb-2">
                  Hash calculation
                </p>
                <p className="text-sm font-['JetBrains_Mono'] text-[#c8c8d8]">
                  simplified hash("<span className="text-[#00f5ff]">{routingKey}</span>") % 3 ={' '}
                  <span className="text-[#ffaa00] font-bold">{targetPartition}</span>
                </p>
                <p className="text-[10px] font-['JetBrains_Mono'] text-[#8a8a9a] mt-1">
                  (Kafka uses murmur2)
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <div className="flex items-center justify-center gap-4">
                <div className="bg-[#0a0a0f] rounded-2xl border border-[#1a1a25] p-5 text-center min-w-[120px]">
                  <Key className="w-6 h-6 mx-auto mb-2 text-[#00f5ff]" />
                  <p className="text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">Key</p>
                  <p className="text-sm font-['JetBrains_Mono'] text-[#f0f0ff] mt-1 truncate max-w-[100px] mx-auto">
                    {routingKey || '—'}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#8a8a9a]" />
                <div className="flex gap-2">
                  {[0, 1, 2].map((p) => (
                    <div
                      key={p}
                      className={`rounded-2xl border p-4 text-center min-w-[72px] transition-all duration-500 ${
                        p === targetPartition
                          ? 'bg-[#00f5ff]/10 border-[#00f5ff]/40 scale-110 shadow-[0_0_16px_rgba(0,245,255,0.15)]'
                          : 'bg-[#0a0a0f] border-[#1a1a25] opacity-50'
                      }`}
                    >
                      <HardDrive
                        className={`w-5 h-5 mx-auto mb-2 ${
                          p === targetPartition ? 'text-[#00f5ff]' : 'text-[#8a8a9a]'
                        }`}
                      />
                      <p className="text-[10px] font-['JetBrains_Mono'] text-[#8a8a9a]">P{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Architecture Images ─── */}
        <div className="image-panel grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-4 md:p-6">
            <div className="rounded-2xl overflow-hidden border border-[#1a1a25] bg-[#0a0a0f] mb-4">
              <ZoomableImage
                src="/images/kafka-architecture.png"
                alt="Apache Kafka Architecture Diagram"
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="text-xs text-[#8a8a9a] text-center font-['JetBrains_Mono']">
              Figure 1 — Apache Kafka high-level architecture showing producers, cluster, and consumers.
            </p>
          </div>
          <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-4 md:p-6">
            <div className="rounded-2xl overflow-hidden border border-[#1a1a25] bg-[#0a0a0f] mb-4">
              <ZoomableImage
                src="/images/topic-partitions.png"
                alt="Kafka Topics and Partitions"
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="text-xs text-[#8a8a9a] text-center font-['JetBrains_Mono']">
              Figure 2 — Topics split into partitions for parallelism and replication for fault tolerance.
            </p>
          </div>
        </div>

        {/* ─── Consumer Groups & Rebalancing ─── */}
        <div className="pt-10 border-t border-slate-700 mb-16">
          <div className="flex items-center gap-3 mb-3">
            <Users size={28} color="#ff00aa" />
            <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff]">
              Consumer Groups &amp; Rebalancing
            </h3>
          </div>
          <p className="text-sm text-[#8a8a9a] mb-8 max-w-2xl">
            Consumer groups are the mechanism that lets Kafka scale reads horizontally. Understanding how groups assign partitions, track offsets, and rebalance is critical for building reliable, high-throughput consumers.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {consumerGroupDetails.map((detail, i) => (
              <div
                key={i}
                className="bg-slate-800/40 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <detail.icon className="w-5 h-5 text-cyan-400 shrink-0" />
                  <h4 className="font-semibold text-white">{detail.title}</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{detail.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Tip ─── */}
        <div className="tip-panel relative bg-[#12121a] rounded-3xl border border-[#ffaa00]/20 p-8 md:p-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffaa00]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#00f5ff]/5 rounded-full blur-3xl" />

          <div className="relative flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#ffaa00]/10 shrink-0">
              <BookOpen className="w-6 h-6 text-[#ffaa00]" />
            </div>
            <div>
              <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff] mb-2">
                Tip
              </h4>
              <p className="text-[#c8c8d8] leading-relaxed italic">
                "Kafka supports both <span className="text-[#ffaa00] font-medium not-italic">events</span> (triggers or signals) and{' '}
                <span className="text-[#00f5ff] font-medium not-italic">data</span> (movement of data between processes). You can use Kafka to notify systems that something happened, or to reliably move large volumes of data between services."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
