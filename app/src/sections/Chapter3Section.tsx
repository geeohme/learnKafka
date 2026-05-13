import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import CodeBlock from '@/components/CodeBlock';
import ZoomableImage from '@/components/ZoomableImage';
import {
  Database,
  FileText,
  Globe,
  HardDrive,
  BarChart3,
  Cloud,
  ChevronDown,
  Activity,
  Search,
  Server,
  AlertTriangle,
  Lightbulb,
  Zap,
  ArrowRight,
  CheckCircle,
  Gauge,
  ArrowLeftRight,
  Cpu,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─── */

const sourceConnectors = [
  { icon: Database, label: 'Databases' },
  { icon: FileText, label: 'File Systems' },
  { icon: Globe, label: 'APIs' },
  { icon: Activity, label: 'Metrics' },
  { icon: Server, label: 'Logs' },
];

const sinkConnectors = [
  { icon: BarChart3, label: 'Analytics' },
  { icon: Cloud, label: 'Data Lakes' },
  { icon: HardDrive, label: 'Data Warehouses' },
  { icon: Search, label: 'Search Indexes' },
  { icon: Cpu, label: 'Microservices' },
];

interface CdcMethod {
  method: string;
  how: string;
  impactLabel: string;
  impactColor: string;
  impactBarClass: string;
  impactWidth: string;
  latencyLabel: string;
  latencyColor: string;
  latencyBarClass: string;
  latencyWidth: string;
  bestFor: string;
  detail: string;
  recommended?: boolean;
}

const cdcMethods: CdcMethod[] = [
  {
    method: 'Trigger-based',
    how: 'Source database triggers write changes to a shadow table',
    impactLabel: 'High',
    impactColor: 'text-[#ff4444]',
    impactBarClass: 'bg-[#ff4444]',
    impactWidth: '80%',
    latencyLabel: 'Fast',
    latencyColor: 'text-[#ffaa00]',
    latencyBarClass: 'bg-[#ffaa00]',
    latencyWidth: '60%',
    bestFor: 'Small tables, simple schemas',
    detail: 'Database triggers fire on every INSERT, UPDATE, or DELETE, writing a copy of the change to a separate shadow table. This adds significant write overhead and can slow down transactions. Best suited for small datasets where simplicity outweighs performance concerns.',
  },
  {
    method: 'Query-based',
    how: 'Polling queries detect changes by comparing timestamps or version columns',
    impactLabel: 'Medium',
    impactColor: 'text-[#ffaa00]',
    impactBarClass: 'bg-[#ffaa00]',
    impactWidth: '50%',
    latencyLabel: 'Slow',
    latencyColor: 'text-[#ff4444]',
    latencyBarClass: 'bg-[#ff4444]',
    latencyWidth: '30%',
    bestFor: 'Systems without log access, batch workloads',
    detail: 'Queries run on a schedule (e.g., every 5 minutes) to find recently changed rows. Simple to implement but can miss changes between polls, puts load on the database, and introduces latency equal to the polling interval.',
  },
  {
    method: 'Log-based',
    how: 'Reads database transaction logs directly',
    impactLabel: 'Minimal',
    impactColor: 'text-[#00f5ff]',
    impactBarClass: 'bg-[#00f5ff]',
    impactWidth: '15%',
    latencyLabel: 'Real-time',
    latencyColor: 'text-[#00f5ff]',
    latencyBarClass: 'bg-[#00f5ff]',
    latencyWidth: '95%',
    bestFor: 'Production systems, real-time pipelines',
    detail: "Log-based CDC reads the database's own transaction/recovery logs. It captures all changes with minimal impact, provides near real-time delivery, and requires no schema modifications. This is the most advanced and production-ready CDC method.",
    recommended: true,
  },
];

interface PatternNode {
  label: string;
  highlight: boolean;
}

interface Pattern {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  short: string;
  diagram: PatternNode[];
  detail: string;
  useCases: string[];
}

const patterns: Pattern[] = [
  {
    id: 'data-lake',
    icon: Cloud,
    color: '#00f5ff',
    title: 'Data Lake Integration',
    short: 'Data moves from database into data lake using CDC + Kafka for analytics and transport.',
    diagram: [
      { label: 'DB', highlight: true },
      { label: 'CDC', highlight: true },
      { label: 'Kafka', highlight: true },
      { label: 'Data Lake', highlight: false },
    ],
    detail: 'In this pattern, CDC captures changes from operational databases and streams them through Kafka into a data lake. Kafka acts as both the transport layer and a buffer, decoupling source systems from the lake. This enables analytics teams to work with fresh data without impacting production databases.',
    useCases: [
      'Building centralized analytics repositories',
      'Feeding BI tools with near real-time data',
      'Supporting data science and ML pipelines',
    ],
  },
  {
    id: 'microservices',
    icon: Server,
    color: '#ffaa00',
    title: 'Microservices',
    short: 'Event-driven using lightweight services. CDC + Kafka act as orchestrator, distributor, and data pipe.',
    diagram: [
      { label: 'Svc A', highlight: true },
      { label: 'Kafka', highlight: true },
      { label: 'Svc B', highlight: true },
      { label: 'Svc C', highlight: true },
    ],
    detail: 'Microservices architectures use Kafka as an event bus. CDC captures database changes and publishes them as events that other services consume. Kafka enables event-driven choreography, data distribution, and acts as the pipe between decoupled services.',
    useCases: [
      'Event-driven order processing',
      'Decoupling inventory and payment services',
      'Async communication between bounded contexts',
    ],
  },
  {
    id: 'nosql',
    icon: Database,
    color: '#ff00aa',
    title: 'NoSQL Integration',
    short: 'Non-relational databases produce specialized data. Kafka supports integration across multi-model databases.',
    diagram: [
      { label: 'RDBMS', highlight: true },
      { label: 'Kafka', highlight: true },
      { label: 'NoSQL', highlight: true },
    ],
    detail: 'Modern architectures combine relational and non-relational databases. Kafka enables seamless integration between RDBMS systems and NoSQL stores like MongoDB, Cassandra, or Elasticsearch. CDC captures changes from the RDBMS while producers push NoSQL events into Kafka.',
    useCases: [
      'Syncing relational transactions to document stores',
      'Feeding graph databases from operational data',
      'Polyglot persistence architectures',
    ],
  },
  {
    id: 'streaming-first',
    icon: Zap,
    color: '#00f5ff',
    title: 'Streaming-First Integration',
    short: 'Data moved directly into streaming platforms via CDC and Kafka. Goal: view data in the stream FIRST.',
    diagram: [
      { label: 'DB', highlight: true },
      { label: 'CDC', highlight: true },
      { label: 'Kafka', highlight: true },
      { label: 'Consumers', highlight: false },
    ],
    detail: 'In streaming-first architecture, data lands in Kafka before (or instead of) traditional batch ETL zones. CDC pushes changes directly into Kafka topics, making the stream the primary system of record. Downstream consumers read from Kafka in real time, bypassing traditional landing zones.',
    useCases: [
      'Real-time fraud detection pipelines',
      'Live operational dashboards',
      'Immediate notification and alerting systems',
    ],
  },
];

const takeaways = [
  'Traditional data integration relies on ETL/ELT batch processes that introduce latency and complexity.',
  'Kafka Connect provides a scalable, reusable interface for moving data between Kafka and external systems.',
  'CDC enables database replication with little or no impact on source production systems.',
  'Three CDC methods exist: trigger-based, query-based, and log-based — with log-based being the preferred production approach.',
  'CDC + Kafka together form the primary streaming pipeline supporting data lakes, microservices, NoSQL, and streaming-first patterns.',
];

const connectExamples = [
  {
    name: 'PostgreSQL Source Connector',
    config: JSON.stringify(
      {
        name: 'postgres-source-connector',
        config: {
          'connector.class': 'io.debezium.connector.postgresql.PostgresConnector',
          'database.hostname': 'localhost',
          'database.port': '5432',
          'database.user': 'debezium',
          'database.password': 'dbz',
          'database.dbname': 'inventory',
          'database.server.name': 'dbserver1',
          'table.include.list': 'public.customers,public.orders',
          'plugin.name': 'pgoutput',
          'slot.name': 'debezium_slot',
          'publication.name': 'debezium_publication',
          'topic.prefix': 'cdc',
          'transforms': 'unwrap',
          'transforms.unwrap.type': 'io.debezium.transforms.ExtractNewRecordState',
          'transforms.unwrap.drop.tombstones': 'false',
          'transforms.unwrap.delete.handling.mode': 'rewrite',
        },
      },
      null,
      2
    ),
  },
  {
    name: 'Snowflake Sink Connector',
    config: JSON.stringify(
      {
        name: 'snowflake-sink-connector',
        config: {
          'connector.class': 'com.snowflake.kafka.connector.SnowflakeSinkConnector',
          'tasks.max': '8',
          'topics': 'cdc.public.customers,cdc.public.orders',
          'snowflake.url.name': 'myaccount.snowflakecomputing.com:443',
          'snowflake.user.name': 'kafka_user',
          'snowflake.private.key': '${file:/opt/kafka/secrets/snowflake.properties:private.key}',
          'snowflake.database.name': 'ANALYTICS_DB',
          'snowflake.schema.name': 'RAW_CDC',
          'key.converter': 'org.apache.kafka.connect.storage.StringConverter',
          'value.converter': 'com.snowflake.kafka.connector.records.SnowflakeJsonConverter',
          'snowflake.ingestion.method': 'SNOWPIPE_STREAMING',
          'buffer.flush.time': '10',
          'buffer.count.records': '10000',
          'buffer.size.bytes': '5242880',
        },
      },
      null,
      2
    ),
  },
];

/* ─── Component ─── */

export default function Chapter3Section() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(2);
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [activeConnectorTab, setActiveConnectorTab] = useState<'source' | 'sink'>('source');

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(sectionRef.current.querySelectorAll('.ch3-left > *'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.ch3-left'), start: 'top 80%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelector('.connect-visual'),
      { x: 60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.connect-visual'), start: 'top 80%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.cdc-row'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.cdc-table'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.callout-card'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.callouts-grid'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.pattern-card'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.patterns-grid'), start: 'top 85%', once: true } }
    );

    gsap.fromTo(sectionRef.current.querySelector('.takeaways-panel'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.takeaways-panel'), start: 'top 85%', once: true } }
    );
  }, { scope: sectionRef });

  return (
    <section id="chapter-3" ref={sectionRef} className="section-padding bg-[#0a0a0f]">
      <div className="container-main">
        <SectionHeader chapter="03" title="Ingesting Data with Apache Kafka" />

        {/* ── Subsection 1: Kafka Connect ── */}
        <div className="mb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
            <div className="ch3-left">
              <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-6">
                What is Kafka Connect?
              </h3>
              <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed mb-6">
                Kafka Connect is an open-source component that supports connections to common databases. It creates a common framework to develop, deploy, and manage connectors. Scenarios include database ingestion, collecting metrics, and aggregating data from application servers.
              </p>
              <p className="text-[1.05rem] text-[#c8c8d8] leading-relaxed mb-6">
                Connectors come in two flavors:{' '}
                <span className="text-[#00f5ff] font-medium">Source connectors</span> pull data into Kafka, and{' '}
                <span className="text-[#ffaa00] font-medium">Sink connectors</span> push data from Kafka to external systems.
              </p>
              <p className="text-[1.05rem] text-[#c8c8d8] leading-relaxed mb-6">
                Kafka Connect operates as a <span className="text-[#f0f0ff] font-medium">distributed cluster</span> of worker nodes. This architecture provides scalability and fault tolerance — if one worker fails, tasks are automatically rebalanced across remaining nodes. Connectors are broken into tasks that run in parallel across worker nodes for scalable data movement.
              </p>
              <p className="text-[1.05rem] text-[#c8c8d8] leading-relaxed">
                <span className="text-[#f0f0ff] font-medium">Managed services</span> simplify deployment by handling infrastructure, monitoring, and connector management, letting teams focus on data pipelines rather than cluster operations.
              </p>
            </div>

            <div className="connect-visual">
              <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6">
                <ZoomableImage
                  src="/images/kafka-connect.jpg"
                  alt="Kafka Connect diagram showing sources and sinks"
                  className="w-full rounded-2xl mb-4 border border-[#1a1a25]"
                />
                <p className="text-xs text-[#8a8a9a] text-center font-['JetBrains_Mono']">
                  Figure: Kafka Connect integrates sources and sinks through a common framework
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Connector Diagram */}
          <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 mb-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveConnectorTab('source')}
                aria-pressed={activeConnectorTab === 'source'}
                className={`px-5 py-2.5 rounded-xl font-['Syne'] font-semibold text-sm transition-all duration-300 ${
                  activeConnectorTab === 'source'
                    ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30'
                    : 'text-[#8a8a9a] border border-transparent hover:text-[#c8c8d8]'
                }`}
              >
                Source Connectors
              </button>
              <ArrowLeftRight className="w-4 h-4 text-[#8a8a9a]" />
              <button
                onClick={() => setActiveConnectorTab('sink')}
                aria-pressed={activeConnectorTab === 'sink'}
                className={`px-5 py-2.5 rounded-xl font-['Syne'] font-semibold text-sm transition-all duration-300 ${
                  activeConnectorTab === 'sink'
                    ? 'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/30'
                    : 'text-[#8a8a9a] border border-transparent hover:text-[#c8c8d8]'
                }`}
              >
                Sink Connectors
              </button>
            </div>

            <div className="relative">
              {activeConnectorTab === 'source' && (
                <div className="animate-in fade-in duration-500">
                  <p className="text-xs font-['Syne'] font-semibold uppercase tracking-wider text-[#00f5ff] text-center mb-4">
                    Pull data INTO Kafka
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {sourceConnectors.map((s, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-3 p-5 bg-[#0a0a0f] rounded-xl border border-[#1a1a25] hover:border-[#00f5ff]/20 transition-colors"
                      >
                        <s.icon className="w-7 h-7 text-[#00f5ff]" />
                        <span className="text-sm text-[#c8c8d8] text-center">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeConnectorTab === 'sink' && (
                <div className="animate-in fade-in duration-500">
                  <p className="text-xs font-['Syne'] font-semibold uppercase tracking-wider text-[#ffaa00] text-center mb-4">
                    Push data FROM Kafka
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {sinkConnectors.map((s, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-3 p-5 bg-[#0a0a0f] rounded-xl border border-[#1a1a25] hover:border-[#ffaa00]/20 transition-colors"
                      >
                        <s.icon className="w-7 h-7 text-[#ffaa00]" />
                        <span className="text-sm text-[#c8c8d8] text-center">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Center hub */}
            <div className="flex items-center justify-center my-8">
              <div className="relative px-6 py-3 bg-gradient-to-r from-[#00f5ff]/10 to-[#ffaa00]/10 rounded-xl border border-[#00f5ff]/20">
                <span className="font-['Syne'] font-semibold text-[#f0f0ff]">Kafka Connect Cluster</span>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#ffaa00] animate-pulse" />
              </div>
            </div>

            {/* Flow arrows */}
            <div className="hidden md:flex items-center justify-center gap-2 text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">
              <span className="text-[#00f5ff]">Sources</span>
              <div className="h-0.5 w-20 bg-gradient-to-r from-[#00f5ff]/40 to-[#ffaa00]/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffaa00]/60" />
              <div className="h-0.5 w-20 bg-gradient-to-r from-[#ffaa00]/40 to-[#ffaa00]/40" />
              <span className="text-[#ffaa00]">Sinks</span>
            </div>
          </div>

          {/* Callouts */}
          <div className="callouts-grid grid md:grid-cols-2 gap-6">
            <div className="callout-card bg-[#ffaa00]/5 border border-[#ffaa00]/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-[#ffaa00]" />
                <span className="font-['Syne'] font-semibold text-[#ffaa00]">Warning</span>
              </div>
              <p className="text-[#c8c8d8] text-sm leading-relaxed">
                A challenge of using Kafka Connect is creating the required connectors to external sources and targets. Each system may require specific configuration, schema mapping, and error handling.
              </p>
            </div>

            <div className="callout-card bg-[#00f5ff]/5 border border-[#00f5ff]/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb className="w-5 h-5 text-[#00f5ff]" />
                <span className="font-['Syne'] font-semibold text-[#00f5ff]">Remember</span>
              </div>
              <p className="text-[#c8c8d8] text-sm leading-relaxed">
                The actual data integration functions (transformations) are still completed by external functions unless in-stream processing is used. Connect moves data — processing happens elsewhere.
              </p>
            </div>
          </div>
        </div>

        {/* ── Subsection 2: CDC Methods ── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-24">
          <div className="cdc-table order-2 lg:order-1">
            <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-6">
              CDC Methods Comparison
            </h3>

            <div className="space-y-3">
              {cdcMethods.map((method, i) => (
                <div
                  key={i}
                  className={`cdc-row rounded-2xl border transition-all duration-300 overflow-hidden ${
                    method.recommended
                      ? 'border-l-4 border-l-[#00f5ff] bg-[#00f5ff]/5'
                      : 'border-[#1a1a25] bg-[#12121a]'
                  }`}
                >
                  <button
                    onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                    aria-expanded={expandedRow === i}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`font-['Syne'] font-semibold text-sm ${
                              method.recommended ? 'text-[#00f5ff]' : 'text-[#f0f0ff]'
                            }`}
                          >
                            {method.method}
                          </span>
                          {method.recommended && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-['Syne'] font-semibold bg-[#00f5ff]/15 text-[#00f5ff]">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#8a8a9a]">{method.how}</p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[#8a8a9a] flex-shrink-0 transition-transform duration-300 ${
                          expandedRow === i ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {/* Impact & Latency Meters */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[#8a8a9a] flex items-center gap-1">
                            <Gauge className="w-3 h-3" /> Impact
                          </span>
                          <span className={`font-['JetBrains_Mono'] font-medium ${method.impactColor}`}>
                            {method.impactLabel}
                          </span>
                        </div>
                        <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${method.impactBarClass} transition-all duration-1000`}
                            style={{ width: method.impactWidth }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[#8a8a9a] flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Latency
                          </span>
                          <span className={`font-['JetBrains_Mono'] font-medium ${method.latencyColor}`}>
                            {method.latencyLabel}
                          </span>
                        </div>
                        <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${method.latencyBarClass} transition-all duration-1000`}
                            style={{ width: method.latencyWidth }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>

                  {expandedRow === i && (
                    <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="pt-3 border-t border-[#1a1a25]">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-[#1a1a25] text-xs text-[#8a8a9a] font-['JetBrains_Mono']">
                            Best for: {method.bestFor}
                          </span>
                        </div>
                        <p className="text-sm text-[#c8c8d8] leading-relaxed">{method.detail}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed mb-6">
              CDC is a method for tracking, capturing, and delivering changes from source datasets. Implemented well, CDC enables data integration by replicating database changes with little or no impact on source systems.
            </p>
            <p className="text-[1.05rem] text-[#c8c8d8] leading-relaxed mb-6">
              When combined with Kafka, CDC creates a complete ecosystem for building real-time data pipelines — from capture to processing to delivery.
            </p>
            <div className="bg-[#12121a] rounded-2xl border border-[#1a1a25] p-6">
              <h4 className="font-['Syne'] font-semibold text-sm text-[#f0f0ff] mb-4">CDC + Kafka Flow</h4>
              <div className="flex flex-col gap-3">
                {[
                  { step: '1', label: 'Change occurs in source database', color: '#00f5ff' },
                  { step: '2', label: 'CDC agent reads transaction log', color: '#ffaa00' },
                  { step: '3', label: 'Events published to Kafka topic', color: '#ff00aa' },
                  { step: '4', label: 'Consumers process in real time', color: '#8a8a9a' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-['JetBrains_Mono'] font-bold flex-shrink-0"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      {item.step}
                    </span>
                    <span className="text-sm text-[#c8c8d8]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Subsection 2b: Kafka Connect Configuration Examples ── */}
        <div className="border-t border-slate-700 mt-16 pt-8 mb-24">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-cyan-400" style={{ width: 28, height: 28 }} />
            <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff]">
              Kafka Connect Configuration Examples
            </h3>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-8 max-w-3xl">
            Kafka Connect uses REST APIs and JSON configs to deploy and manage connectors. Below are production-grade examples for two common patterns: a PostgreSQL source connector using Debezium for log-based CDC, and a Snowflake sink connector for streaming data into a cloud data warehouse.
          </p>

          <CodeBlock
            title="Connector Configuration"
            examples={connectExamples.map(ex => ({ language: ex.name, code: ex.config }))}
          />

          <div className="mt-8 space-y-4">
            <div>
              <p className="text-sm text-slate-300 leading-relaxed mb-2">
                <span className="text-[#f0f0ff] font-medium">Deploying a connector</span> is done via a single HTTP POST to the Kafka Connect REST API. Connectors can be deployed, updated, paused, and deleted without restarting the cluster:
              </p>
              <pre className="bg-slate-900 p-3 rounded text-xs overflow-x-auto text-slate-100">
{`curl -X POST http://localhost:8083/connectors \\
  -H "Content-Type: application/json" \\
  -d @postgres-source-connector.json`}
              </pre>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="text-[#f0f0ff] font-medium">Monitoring connectors</span> is handled through the same REST API. Use{' '}
              <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">GET /connectors/&#123;name&#125;/status</code>{' '}
              to check connector state, task health, and error traces. Managed platforms like Confluent Cloud extend this with built-in dashboards, alerting, and lag metrics.
            </p>
          </div>
        </div>

        {/* ── Subsection 3: Architectural Patterns ── */}
        <div className="mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4 text-center">
            Common Data Integration Architectural Patterns
          </h3>
          <p className="text-[#8a8a9a] text-center max-w-2xl mx-auto mb-10">
            CDC and Kafka power four fundamental integration patterns. Click a card to explore the architecture, flow, and use cases.
          </p>

          <div className="patterns-grid grid md:grid-cols-2 gap-6">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)}
                aria-expanded={expandedPattern === pattern.id}
                className={`pattern-card text-left rounded-2xl border transition-all duration-300 ${
                  expandedPattern === pattern.id
                    ? 'bg-[#1a1a25] border-[rgba(0,245,255,0.3)] shadow-[0_4px_16px_rgba(0,245,255,0.08)]'
                    : 'bg-[#12121a] border-[#1a1a25] hover:border-[rgba(0,245,255,0.2)] hover:-translate-y-1'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${pattern.color}15`, color: pattern.color }}
                    >
                      <pattern.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">{pattern.title}</h4>
                  </div>
                  <p className="text-sm text-[#c8c8d8] leading-relaxed mb-4">{pattern.short}</p>

                  {/* Mini diagram */}
                  <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#8a8a9a] bg-[#0a0a0f] rounded-xl p-3 overflow-x-auto">
                    {pattern.diagram.map((node, idx) => (
                      <span key={idx} className="flex items-center gap-2 flex-shrink-0">
                        <span className={node.highlight ? 'text-[#00f5ff]' : ''}>{node.label}</span>
                        {idx < pattern.diagram.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-[#8a8a9a] flex-shrink-0" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {expandedPattern === pattern.id && (
                  <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-[#1a1a25] pt-4">
                      <p className="text-sm text-[#c8c8d8] leading-relaxed mb-5">{pattern.detail}</p>
                      <div className="space-y-2">
                        <p className="text-xs font-['Syne'] font-semibold text-[#8a8a9a] uppercase tracking-wider mb-2">
                          Use Cases
                        </p>
                        {pattern.useCases.map((uc, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-[#c8c8d8]">
                            <CheckCircle className="w-4 h-4 text-[#00f5ff] flex-shrink-0" />
                            <span>{uc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Subsection 4: Key Takeaways ── */}
        <div className="takeaways-panel bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 md:p-10">
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
      </div>
    </section>
  );
}
