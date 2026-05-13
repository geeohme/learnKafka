import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import ConceptCard from '@/components/ConceptCard';
import {
  Activity,
  Database,
  Zap,
  Layers,
  Users,
  HardDrive,
  Clock,
  BarChart3,
  Server,
  Radio,
  ShoppingCart,
  MapPin,
  Share2,
  Puzzle,
  Copy,
  FileText,
  Cpu,
  BrainCircuit,
  Boxes,
  MessageSquare,
  Archive,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Wifi,
  MonitorSmartphone,
  Truck,
  Wallet,
  Fingerprint,
  Globe,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data Constants ─── */

const pipelineComponents = [
  { id: 'source', icon: HardDrive, label: 'Source Database', desc: 'Oracle, PostgreSQL, MySQL, SQL Server, DB2 — the origin of transactional data.', color: '#00f5ff' },
  { id: 'cdc', icon: Zap, label: 'Change Data Capture', desc: 'Captures INSERT, UPDATE, DELETE, and DDL in real-time with minimal source impact.', color: '#ffaa00' },
  { id: 'kafka', icon: Layers, label: 'Kafka Topic', desc: 'The central nervous system — durable, scalable, fault-tolerant streaming backbone.', color: '#00f5ff' },
  { id: 'consumers', icon: Users, label: 'Consumers', desc: 'Analytics engines, warehouses, microservices, monitoring, and ML pipelines.', color: '#ff00aa' },
];

const batchVsStream = [
  { label: 'Latency', batch: 'Hours to days', stream: 'Milliseconds to seconds', batchIcon: Clock, streamIcon: Zap },
  { label: 'Data Volume', batch: 'Large bounded datasets', stream: 'Continuous, unbounded flow', batchIcon: Database, streamIcon: Wifi },
  { label: 'Processing Style', batch: 'Process then store', stream: 'Process as it arrives', batchIcon: Server, streamIcon: Cpu },
  { label: 'Use Cases', batch: 'Monthly reports, historical analysis', stream: 'Fraud detection, IoT, real-time alerts', batchIcon: BarChart3, streamIcon: Radio },
  { label: 'Resource Usage', batch: 'Bursty, high at intervals', stream: 'Steady, distributed load', batchIcon: TrendingUp, streamIcon: Layers },
  { label: 'Data Freshness', batch: 'Stale by definition', stream: 'Current, up-to-the-moment', batchIcon: Archive, streamIcon: MonitorSmartphone },
];

const dataCharacteristics = [
  { icon: Radio, title: 'Real-time Ingestion', desc: 'IoT sensors, video streams, and telemetry arrive continuously and require immediate processing.' },
  { icon: Share2, title: 'Social Media Feeds', desc: 'Near real-time event response for trending topics, sentiment analysis, and viral content.' },
  { icon: ShoppingCart, title: 'Online Shopping', desc: 'Real-time analytics for recommendations, inventory tracking, and cart abandonment.' },
  { icon: MapPin, title: 'Geolocation Analysis', desc: 'Asynchronous data transfer from mobile devices powering location-based services.' },
  { icon: Server, title: 'Data Distribution', desc: 'Many users and consumers reading from single or aggregated stream sources simultaneously.' },
  { icon: Puzzle, title: 'Service Modularity', desc: 'Microservices or decoupled users act as independent consumers of the same data streams.' },
  { icon: Copy, title: 'Data Extraction & Replication', desc: 'CDC propagates database changes to replicas and downstream systems in real time.' },
  { icon: FileText, title: 'Transactional Data', desc: 'Every INSERT, UPDATE, DELETE, and schema change is captured for audit and analytics.' },
];

const databaseTypes = [
  { type: 'RDBMS', examples: 'Oracle, SQL Server, DB2, MySQL, PostgreSQL', uses: 'Data warehouses, operational databases, OLTP systems', color: '#00f5ff', icon: Database },
  { type: 'Data Lakes & Distributed Storage', examples: 'Hadoop, Cloudera, Hortonworks', uses: 'Distributed processing frameworks, large-scale batch storage', color: '#ffaa00', icon: Boxes },
  { type: 'NoSQL', examples: 'MongoDB, Cassandra, DynamoDB, Neo4j', uses: 'Real-time apps, content management, social graphs, key-value caching', color: '#ff00aa', icon: Server },
];

const kafkaUseCases = [
  { icon: Cpu, title: 'Real-Time Event Processing', desc: 'Sub-second event delivery for fraud detection, anomaly monitoring, and instant alerts.' },
  { icon: Wifi, title: 'Streaming Ingestion', desc: 'High-volume ingestion from thousands of sources with natural consumer backpressure.' },
  { icon: BrainCircuit, title: 'ML / AI Analytics', desc: 'Stream processing pipelines feeding real-time machine learning and AI inference.' },
  { icon: Boxes, title: 'Microservices Enablement', desc: 'Decoupling producers and consumers for resilient, independently scalable architectures.' },
  { icon: MessageSquare, title: 'Record / Event Broker', desc: 'Pub-sub and point-to-point messaging semantics with persistent replay capability.' },
  { icon: Archive, title: 'Data Persistence', desc: 'Durable storage with default 7-day retention, configurable per topic or forever.' },
];

const opportunities = [
  { icon: Truck, title: 'Real-Time Event Processing', desc: 'React to transactions within milliseconds — detect fraud, trigger workflows, update dashboards instantly.' },
  { icon: Wallet, title: 'Streaming Ingestion at Scale', desc: 'Ingest millions of records per second from distributed sources without overwhelming downstream systems.' },
  { icon: Fingerprint, title: 'Machine Learning Analytics', desc: 'Feed live data directly into ML models for real-time scoring, recommendations, and predictions.' },
  { icon: Globe, title: 'Microservices Enablement', desc: 'Decouple services with event-driven architecture — one event stream, many independent consumers.' },
  { icon: ShieldCheck, title: 'Data Persistence & Replay', desc: 'Persist streams durably and replay from any point in time for recovery, testing, or reprocessing.' },
];

const keyTakeaways = [
  'A data stream is unbounded, sporadic, and varies in size — fundamentally different from bounded batch datasets.',
  'Transaction data includes INSERT, UPDATE, and DELETE operations (DML). CDC also captures DDL schema changes separately.',
  'Batch processing delivers stale results (hours/days); streaming delivers current insights in milliseconds.',
  'Modern sources — IoT, social media, e-commerce, geolocation — all demand real-time handling.',
  'Change Data Capture (CDC) is the bridge that turns database transactions into live event streams.',
  'Kafka serves as a durable, scalable central nervous system for streaming pipelines.',
];

/* ─── Component ─── */

export default function Chapter1Section() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.ch1-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.ch1-card', start: 'top 85%', once: true } }
      );
      gsap.fromTo('.pipeline-diagram',
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.pipeline-diagram', start: 'top 85%', once: true } }
      );
      gsap.fromTo('.batch-stream-section',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.batch-stream-section', start: 'top 85%', once: true } }
      );
      gsap.fromTo('.char-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.char-grid', start: 'top 85%', once: true } }
      );
      gsap.fromTo('.db-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.db-grid', start: 'top 85%', once: true } }
      );
      gsap.fromTo('.usecase-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.usecase-grid', start: 'top 85%', once: true } }
      );
      gsap.fromTo('.opp-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.opp-grid', start: 'top 85%', once: true } }
      );
      gsap.fromTo('.takeaway-item',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.takeaways-panel', start: 'top 85%', once: true } }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <section id="chapter-1" ref={sectionRef} className="section-padding bg-[#0a0a0f]">
      <div className="container-main">
        <SectionHeader chapter="01" title="Understanding Transaction Streaming" />

        {/* ─── Top Grid: Content + Pipeline ─── */}
        <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-16 mb-20">
          {/* Left Column */}
          <div className="space-y-6">
            <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed">
              Modern data requirements are real-time. Whether processing online transactions, capturing IoT sensor data, or generating instant analytics — rapid, incremental, high-volume changes require ultra-fast processing. Traditional batch processes simply can't keep up.
            </p>

            <ConceptCard
              icon={<Activity className="w-8 h-8" />}
              iconColor="#00f5ff"
              title="What is a Data Stream?"
              className="ch1-card"
            >
              A data stream consists of data with three key characteristics: it's{' '}
              <span className="text-[#00f5ff] font-medium">unbounded</span> (no defined end), arrives{' '}
              <span className="text-[#00f5ff] font-medium">sporadically</span> (thousands of records in sub-milliseconds or very few over hours), and comes in{' '}
              <span className="text-[#00f5ff] font-medium">varying sizes</span> (from KBs to GBs).
            </ConceptCard>

            <ConceptCard
              icon={<Database className="w-8 h-8" />}
              iconColor="#ffaa00"
              title="Transaction Data"
              className="ch1-card"
            >
              <p className="mb-4">
                Transaction data consists of changes to database data or metadata. Common transactions include{' '}
                <span className="text-[#00f5ff] font-medium">INSERTS</span> (adding rows),{' '}
                <span className="text-[#ffaa00] font-medium">UPDATES</span> (modifying records),{' '}
                <span className="text-[#ff00aa] font-medium">DELETES</span> (removing rows), and{' '}
                <span className="text-[#8a8a9a] font-medium">DDL operations</span> (altering table structure).
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20">INSERT</span>
                <span className="px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/20">UPDATE</span>
                <span className="px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] bg-[#ff00aa]/10 text-[#ff00aa] border border-[#ff00aa]/20">DELETE</span>
                <span className="px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] bg-[#8a8a9a]/10 text-[#8a8a9a] border border-[#8a8a9a]/20">DDL</span>
              </div>
            </ConceptCard>
          </div>

          {/* Right Column — Enhanced Pipeline Diagram */}
          <div className="pipeline-diagram">
            <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 lg:p-8 h-full relative overflow-hidden flex flex-col">
              <h3 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff] mb-6 text-center">
                The Streaming Pipeline
              </h3>

              <div className="flex-1 flex flex-col justify-center gap-3 relative">
                {/* Animated flowing connection line */}
                <div className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 hidden sm:block">
                  <div className="w-full h-full bg-gradient-to-b from-[#00f5ff]/20 via-[#ffaa00]/20 to-[#ff00aa]/20" />
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00f5ff] shadow-[0_0_12px_rgba(0,245,255,0.6)] animate-[flowDown_2.5s_linear_infinite]" />
                    <div className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#ffaa00] shadow-[0_0_12px_rgba(255,170,0,0.6)] animate-[flowDown_2.5s_linear_infinite_0.8s]" />
                    <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#ff00aa] shadow-[0_0_12px_rgba(255,0,170,0.6)] animate-[flowDown_2.5s_linear_infinite_1.6s]" />
                  </div>
                </div>

                {pipelineComponents.map((comp, i) => (
                  <div key={comp.id} className="relative z-10">
                    <div
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        hoveredComponent === comp.id
                          ? 'bg-[#1a1a25] border-[rgba(0,245,255,0.3)] shadow-[0_4px_16px_rgba(0,245,255,0.08)]'
                          : 'bg-[#0a0a0f] border-[#1a1a25] hover:border-[rgba(0,245,255,0.2)]'
                      }`}
                      onMouseEnter={() => setHoveredComponent(comp.id)}
                      onMouseLeave={() => setHoveredComponent(null)}
                    >
                      <div className="p-3 rounded-xl bg-[#00f5ff]/10 text-[#00f5ff] shrink-0" style={{ backgroundColor: `${comp.color}15`, color: comp.color }}>
                        <comp.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-['Syne'] font-semibold text-sm text-[#f0f0ff]">{comp.label}</p>
                        <p className="text-xs text-[#8a8a9a] mt-0.5 leading-relaxed">{comp.desc}</p>
                      </div>
                    </div>

                    {i < pipelineComponents.length - 1 && (
                      <div className="flex justify-center my-1">
                        <div className="w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#00f5ff]/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#ff00aa]/5 rounded-full blur-[80px] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ─── Batch vs. Streaming — Side by Side ─── */}
        <div className="batch-stream-section mb-20">
          <div className="flex items-center gap-4 mb-8">
            <ArrowRight className="w-7 h-7 text-[#00f5ff]" />
            <h3 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff]">Batch vs. Streaming Processing</h3>
          </div>

          <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 lg:p-8">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[1fr_1.2fr_1.2fr] gap-4 mb-4 px-4">
              <span className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#8a8a9a]">Dimension</span>
              <span className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#ffaa00]">Batch Processing</span>
              <span className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#00f5ff]">Stream Processing</span>
            </div>

            <div className="space-y-3">
              {batchVsStream.map((row) => (
                <div
                  key={row.label}
                  className="grid md:grid-cols-[1fr_1.2fr_1.2fr] gap-3 rounded-2xl border border-[#1a1a25] bg-[#0a0a0f] p-4 items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-['Syne'] font-semibold text-[#f0f0ff]">{row.label}</span>
                  </div>
                  <div className="flex items-start gap-3 bg-[#ffaa00]/5 rounded-xl p-3 border border-[#ffaa00]/10">
                    <row.batchIcon className="w-4 h-4 text-[#ffaa00] mt-0.5 shrink-0" />
                    <p className="text-sm text-[#c8c8d8]">{row.batch}</p>
                  </div>
                  <div className="flex items-start gap-3 bg-[#00f5ff]/5 rounded-xl p-3 border border-[#00f5ff]/10">
                    <row.streamIcon className="w-4 h-4 text-[#00f5ff] mt-0.5 shrink-0" />
                    <p className="text-sm text-[#c8c8d8]">{row.stream}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Modern Data Characteristics ─── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <Layers className="w-7 h-7 text-[#ff00aa]" />
            <h3 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff]">Modern Data Characteristics</h3>
          </div>

          <div className="char-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataCharacteristics.map((item) => (
              <div
                key={item.title}
                className="char-card group bg-[#12121a] rounded-2xl border border-[#1a1a25] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,0,170,0.3)] hover:shadow-[0_8px_32px_rgba(255,0,170,0.08)]"
              >
                <div className="p-3 rounded-xl bg-[#ff00aa]/10 text-[#ff00aa] w-fit mb-4 transition-transform duration-300 group-hover:scale-110">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="font-['Syne'] font-semibold text-[#f0f0ff] mb-2">{item.title}</h4>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Database Types ─── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <Database className="w-7 h-7 text-[#ffaa00]" />
            <h3 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff]">Database Types & Functions</h3>
          </div>

          <div className="db-grid grid md:grid-cols-3 gap-5">
            {databaseTypes.map((db) => (
              <div
                key={db.type}
                className="db-card bg-[#12121a] rounded-3xl border border-[#1a1a25] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(0,245,255,0.2)] hover:shadow-[0_8px_32px_rgba(0,245,255,0.06)]"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-[#1a1a25]" style={{ color: db.color }}>
                    <db.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-['Syne'] font-bold text-lg text-[#f0f0ff]">{db.type}</h4>
                </div>
                <div
                  className="w-full h-1 rounded-full mb-5"
                  style={{ backgroundColor: db.color, boxShadow: `0 0 12px ${db.color}40` }}
                />
                <p className="text-xs text-[#8a8a9a] mb-1 font-['JetBrains_Mono'] uppercase tracking-wider">Examples</p>
                <p className="text-[#c8c8d8] text-sm mb-4">{db.examples}</p>
                <p className="text-xs text-[#8a8a9a] mb-1 font-['JetBrains_Mono'] uppercase tracking-wider">Common Uses</p>
                <p className="text-[#c8c8d8] text-sm">{db.uses}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Kafka Use Cases ─── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <Zap className="w-7 h-7 text-[#00f5ff]" />
            <h3 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff]">Kafka Use Cases</h3>
          </div>

          <div className="usecase-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {kafkaUseCases.map((use) => (
              <div
                key={use.title}
                className="usecase-card bg-[#12121a] rounded-3xl border border-[#1a1a25] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_8px_32px_rgba(0,245,255,0.08)]"
              >
                <div className="p-3 rounded-xl bg-[#00f5ff]/10 text-[#00f5ff] w-fit mb-4">
                  <use.icon className="w-6 h-6" />
                </div>
                <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff] mb-2">{use.title}</h4>
                <p className="text-[#c8c8d8] text-sm leading-relaxed">{use.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Opportunities Created ─── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <TrendingUp className="w-7 h-7 text-[#ffaa00]" />
            <h3 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff]">Opportunities Created with Transaction Data Streaming</h3>
          </div>

          <div className="opp-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.map((opp) => (
              <div
                key={opp.title}
                className="opp-card bg-[#12121a] rounded-3xl border border-[#1a1a25] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(255,170,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,170,0,0.08)]"
              >
                <div className="p-3 rounded-xl bg-[#ffaa00]/10 text-[#ffaa00] w-fit mb-4">
                  <opp.icon className="w-6 h-6" />
                </div>
                <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff] mb-2">{opp.title}</h4>
                <p className="text-[#c8c8d8] text-sm leading-relaxed">{opp.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Key Takeaways ─── */}
        <div className="takeaways-panel bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#ffaa00]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex items-center gap-4 mb-8">
            <CheckCircle2 className="w-7 h-7 text-[#ffaa00]" />
            <h3 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff]">Key Takeaways</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 relative z-10">
            {keyTakeaways.map((text, i) => (
              <div key={i} className="takeaway-item flex items-start gap-4 group">
                <div className="mt-1 p-1 rounded-full bg-[#ffaa00]/10 text-[#ffaa00] shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <ChevronRight className="w-4 h-4" />
                </div>
                <p className="text-[#c8c8d8] leading-relaxed text-[1.05rem]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flowDown {
          0% { top: -4%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 96%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
