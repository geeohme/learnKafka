import { useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import ConceptCard from '@/components/ConceptCard';
import ZoomableImage from '@/components/ZoomableImage';
import {
  Code,
  Terminal,
  Clock,
  CheckCircle,
  ToggleLeft,
  Database,
  Zap,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Layers,
  Table2,
  GitBranch,
  Play,
  BarChart3,
  Puzzle,
  Search,
  ArrowLeftRight,
  ChevronRight,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Types ─── */

interface TableRow {
  key: string;
  value: string;
}

interface StreamRecord {
  op: 'INSERT' | 'UPDATE' | 'DELETE';
  key: string;
  value: string;
}

interface ClickRecord {
  user_id: string;
  page: string;
  ts: string;
}

type WindowType = 'Tumbling' | 'Hopping' | 'Session';

/* ─── Data ─── */

const windowTypes: WindowType[] = ['Tumbling', 'Hopping', 'Session'];

const windowDescriptions: Record<WindowType, string> = {
  Tumbling: 'Fixed-size, non-overlapping, gap-less windows that tile the time axis. Every record belongs to exactly one window.',
  Hopping: 'Fixed-size windows that overlap. An advance interval controls how much each window slides forward, creating repeated coverage.',
  Session: 'Dynamically sized, data-driven windows. A gap (timeout) between records defines window boundaries. Ideal for user behavior.',
};

const sampleClicks: ClickRecord[] = [
  { user_id: 'user-42', page: '/products', ts: '10:00:01' },
  { user_id: 'user-7', page: '/home', ts: '10:00:03' },
  { user_id: 'user-42', page: '/cart', ts: '10:00:08' },
  { user_id: 'user-19', page: '/blog', ts: '10:00:12' },
  { user_id: 'user-7', page: '/pricing', ts: '10:00:15' },
  { user_id: 'user-42', page: '/checkout', ts: '10:00:19' },
  { user_id: 'user-55', page: '/home', ts: '10:00:25' },
  { user_id: 'user-19', page: '/about', ts: '10:00:31' },
];

const ksqlQueries = [
  {
    label: 'CREATE STREAM',
    sql: "CREATE STREAM user_clicks (\n  user_id VARCHAR,\n  page VARCHAR,\n  ts VARCHAR\n) WITH (\n  kafka_topic='clicks',\n  value_format='JSON',\n  partitions=3\n);",
    result: [{ status: 'Stream created successfully' }],
  },
  {
    label: 'CREATE TABLE',
    sql: "CREATE TABLE page_views AS\nSELECT page, COUNT(*) AS view_count\nFROM user_clicks\nGROUP BY page\nEMIT CHANGES;",
    result: [
      { page: '/products', view_count: '1' },
      { page: '/home', view_count: '2' },
      { page: '/cart', view_count: '1' },
      { page: '/blog', view_count: '1' },
      { page: '/pricing', view_count: '1' },
      { page: '/checkout', view_count: '1' },
    ],
  },
  {
    label: 'SELECT EMIT',
    sql: "SELECT user_id, page, ts\nFROM user_clicks\nWHERE page = '/checkout'\nEMIT CHANGES;",
    result: [
      { user_id: 'user-42', page: '/checkout', ts: '10:00:19' },
    ],
  },
];

const useCases = [
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    desc: 'Run ksqlDB or Streams API against live data to compute aggregates, counts, and metrics as events happen — no batch jobs required.',
    color: '#00f5ff',
  },
  {
    icon: Puzzle,
    title: 'Microservices Integration',
    desc: 'Embed Kafka Streams directly into microservices. Each service consumes, transforms, and produces streams to communicate asynchronously.',
    color: '#ffaa00',
  },
  {
    icon: Search,
    title: 'Log Analysis',
    desc: 'Use ksqlDB queries to detect anomalies, filter errors, and correlate events across distributed logs in real time.',
    color: '#ff00aa',
  },
  {
    icon: ArrowLeftRight,
    title: 'Data Integration',
    desc: 'Move data between systems with SQL-like commands. Stream processing handles basic transforms and complex enrichment pipelines.',
    color: '#00f5ff',
  },
];

const benefits = [
  {
    icon: CheckCircle,
    title: 'Exactly-once',
    desc: 'Kafka\'s transaction API ensures messages are processed exactly once, even if duplicates are delivered due to retries or rebalances.',
    color: '#00f5ff',
  },
  {
    icon: Database,
    title: 'Stateful',
    desc: 'Stateful programs aggregate data based on history — sums, counts, joins — maintaining local state stores that are durable and replicated.',
    color: '#ffaa00',
  },
  {
    icon: ToggleLeft,
    title: 'Stateless',
    desc: 'Stateless processing handles individual messages independently, without regard for previous events — perfect for filtering and mapping.',
    color: '#ff00aa',
  },
  {
    icon: Clock,
    title: 'Time',
    desc: 'Event-time and processing-time semantics power windowing and time-based joins, ensuring correct results even with out-of-order data.',
    color: '#00f5ff',
  },
  {
    icon: GitBranch,
    title: 'CDC',
    desc: 'Log-based CDC extracts database changes and builds new Kafka streams, enabling downstream systems to react to every row mutation.',
    color: '#ffaa00',
  },
  {
    icon: Zap,
    title: 'Real-time',
    desc: 'Process one record at a time as it arrives — not in batches — delivering sub-second latency for analytics, alerts, and integrations.',
    color: '#ff00aa',
  },
];

/* ─── Windowing Visualizer Data ─── */

// Records positioned on a 0-100% timeline
const vizRecords = [
  { id: 1, pos: 8, label: 'A' },
  { id: 2, pos: 18, label: 'B' },
  { id: 3, pos: 22, label: 'C' },
  { id: 4, pos: 35, label: 'D' },
  { id: 5, pos: 42, label: 'E' },
  { id: 6, pos: 48, label: 'F' },
  { id: 7, pos: 65, label: 'G' },
  { id: 8, pos: 72, label: 'H' },
  { id: 9, pos: 88, label: 'I' },
];

interface WindowRange {
  start: number;
  end: number;
  color: string;
}

const windowRanges: Record<WindowType, WindowRange[]> = {
  Tumbling: [
    { start: 0, end: 25, color: 'rgba(0,245,255,0.18)' },
    { start: 25, end: 50, color: 'rgba(255,170,0,0.18)' },
    { start: 50, end: 75, color: 'rgba(0,245,255,0.18)' },
    { start: 75, end: 100, color: 'rgba(255,170,0,0.18)' },
  ],
  Hopping: [
    { start: 0, end: 30, color: 'rgba(0,245,255,0.15)' },
    { start: 15, end: 45, color: 'rgba(255,170,0,0.15)' },
    { start: 30, end: 60, color: 'rgba(0,245,255,0.15)' },
    { start: 45, end: 75, color: 'rgba(255,170,0,0.15)' },
    { start: 60, end: 90, color: 'rgba(0,245,255,0.15)' },
    { start: 75, end: 100, color: 'rgba(255,170,0,0.15)' },
  ],
  Session: [
    { start: 8, end: 22, color: 'rgba(0,245,255,0.18)' },
    { start: 35, end: 48, color: 'rgba(255,170,0,0.18)' },
    { start: 65, end: 72, color: 'rgba(0,245,255,0.18)' },
    { start: 88, end: 95, color: 'rgba(255,170,0,0.18)' },
  ],
};

/* ─── Sub-components ─── */

function WindowingVisualizer() {
  const [activeWindow, setActiveWindow] = useState<WindowType>('Tumbling');
  const ranges = windowRanges[activeWindow];

  return (
    <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">
          Windowing Visualizer
        </h3>
        <div className="flex flex-wrap gap-2">
          {windowTypes.map((w) => (
            <button
              key={w}
              onClick={() => setActiveWindow(w)}
              className={`px-3 py-1.5 rounded-full text-xs font-['JetBrains_Mono'] font-medium border transition-all ${
                activeWindow === w
                  ? 'bg-[#00f5ff]/15 text-[#00f5ff] border-[#00f5ff]/40'
                  : 'bg-transparent text-[#8a8a9a] border-[#1a1a25] hover:border-[#8a8a9a]/30'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-[#c8c8d8] mb-6 leading-relaxed">
        {windowDescriptions[activeWindow]}
      </p>

      {/* Timeline */}
      <div className="relative h-40 mb-4 select-none">
        {/* Time axis */}
        <div className="absolute top-[60%] left-0 right-0 h-px bg-[#1a1a25]" />
        <div className="absolute top-[60%] left-0 w-1.5 h-1.5 rounded-full bg-[#8a8a9a] -translate-y-1/2" />
        <div className="absolute top-[60%] right-0 w-1.5 h-1.5 rounded-full bg-[#8a8a9a] -translate-y-1/2" />
        <span className="absolute top-[68%] left-0 text-[10px] text-[#8a8a9a] font-['JetBrains_Mono']">T0</span>
        <span className="absolute top-[68%] right-0 text-[10px] text-[#8a8a9a] font-['JetBrains_Mono']">T+</span>

        {/* Window brackets */}
        {ranges.map((range, i) => (
          <div
            key={i}
            className="absolute rounded-md border border-dashed transition-all duration-500"
            style={{
              left: `${range.start}%`,
              width: `${range.end - range.start}%`,
              top: '10%',
              height: '40%',
              backgroundColor: range.color,
              borderColor: range.color.replace(/[\d.]+\)$/, '0.4)'),
            }}
          >
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-['JetBrains_Mono'] text-[#8a8a9a]">
              W{i + 1}
            </span>
          </div>
        ))}

        {/* Record dots */}
        {vizRecords.map((rec) => (
          <div
            key={rec.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${rec.pos}%`, top: '52%' }}
          >
            <div className="w-3 h-3 rounded-full bg-[#ff00aa] shadow-[0_0_8px_rgba(255,0,170,0.5)]" />
            <span className="mt-2 text-[10px] font-['JetBrains_Mono'] text-[#c8c8d8]">{rec.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-[#8a8a9a]">
        <span className="inline-block w-3 h-3 rounded-full bg-[#ff00aa]" />
        <span>Record</span>
        <span className="mx-2">|</span>
        <span className="inline-block w-4 h-2 rounded-sm bg-[#00f5ff]/20 border border-dashed border-[#00f5ff]/40" />
        <span>Window boundary</span>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-[#ffaa00]/5 border border-[#ffaa00]/20">
        <p className="text-xs text-[#8a8a9a] leading-relaxed">
          <span className="text-[#ffaa00] font-medium">Grace Period:</span> In event-time processing, a grace period allows late-arriving records to be included in a window after its nominal end. This is crucial for handling out-of-order data in real-world streams.
        </p>
      </div>
    </div>
  );
}

function KsqlPlayground() {
  const [activeQuery, setActiveQuery] = useState(0);
  const query = ksqlQueries[activeQuery];

  return (
    <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[#ffaa00]/10">
          <Terminal className="w-5 h-5 text-[#ffaa00]" />
        </div>
        <div>
          <h3 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff]">ksqlDB Query Playground</h3>
          <p className="text-xs text-[#8a8a9a]">Click a query to run it against sample data</p>
        </div>
      </div>

      {/* Query buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ksqlQueries.map((q, i) => (
          <button
            key={i}
            onClick={() => setActiveQuery(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-['JetBrains_Mono'] border transition-all ${
              activeQuery === i
                ? 'bg-[#ffaa00]/10 text-[#ffaa00] border-[#ffaa00]/30'
                : 'bg-transparent text-[#8a8a9a] border-[#1a1a25] hover:border-[#8a8a9a]/30'
            }`}
          >
            <Play className="w-3 h-3" />
            {q.label}
          </button>
        ))}
      </div>

      {/* SQL display */}
      <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-4 mb-4 overflow-x-auto">
        <pre className="text-xs font-['JetBrains_Mono'] text-[#c8c8d8]">
          <code>{query.sql}</code>
        </pre>
      </div>

      {/* Results */}
      <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] overflow-hidden">
        <div className="px-4 py-2 bg-[#12121a] border-b border-[#1a1a25] flex items-center justify-between">
          <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#8a8a9a]">Result</span>
          <span className="text-[10px] font-['JetBrains_Mono'] text-[#00f5ff]">{query.result.length} row(s)</span>
        </div>
        <div className="p-3 max-h-[180px] overflow-y-auto">
          <table className="w-full text-xs font-['JetBrains_Mono']">
            <thead>
              <tr className="text-left text-[#8a8a9a]">
                {Object.keys(query.result[0]).map((k) => (
                  <th key={k} className="pb-2 pr-4 font-medium">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.result.map((row, i) => (
                <tr key={i} className="border-t border-[#1a1a25]">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="py-2 pr-4 text-[#c8c8d8]">{v as string}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-[#8a8a9a] mt-4 leading-relaxed">
        <code className="text-[#ffaa00]">EMIT CHANGES</code> produces a continuous stream of results as new events arrive.
      </p>
    </div>
  );
}

/* ─── Main Component ─── */

export default function Chapter5Section() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [tableRows, setTableRows] = useState<TableRow[]>([
    { key: 'K1', value: 'V1' },
    { key: 'K2', value: 'V2' },
  ]);
  const [streamRecords, setStreamRecords] = useState<StreamRecord[]>([]);

  const handleInsert = useCallback(() => {
    const newKey = `K${tableRows.length + 1}`;
    const newValue = `V${tableRows.length + 1}`;
    setTableRows((prev) => [...prev, { key: newKey, value: newValue }]);
    setStreamRecords((prev) => [...prev, { op: 'INSERT', key: newKey, value: newValue }]);
  }, [tableRows.length]);

  const handleUpdate = useCallback(() => {
    setTableRows((prev) => {
      if (prev.length === 0) return prev;
      const idx = 0;
      const updatedValue = `${prev[idx].value}'`;
      setStreamRecords((sPrev) => [...sPrev, { op: 'UPDATE', key: prev[idx].key, value: updatedValue }]);
      return prev.map((r, i) => (i === idx ? { ...r, value: updatedValue } : r));
    });
  }, []);

  const handleDelete = useCallback(() => {
    setTableRows((prev) => {
      if (prev.length === 0) return prev;
      const removed = prev[0];
      setStreamRecords((sPrev) => [...sPrev, { op: 'DELETE', key: removed.key, value: '' }]);
      return prev.slice(1);
    });
  }, []);

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(sectionRef.current.querySelectorAll('.ch5-card'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.ch5-cards'), start: 'top 80%', once: true } },
    );

    gsap.fromTo(sectionRef.current.querySelector('.duality-visual'),
      { x: 60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.duality-visual'), start: 'top 80%', once: true } },
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.key-element'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.key-elements'), start: 'top 85%', once: true } },
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.use-case-card'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.use-cases-grid'), start: 'top 85%', once: true } },
    );

    gsap.fromTo(sectionRef.current.querySelectorAll('.callout-card'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.callouts-grid'), start: 'top 85%', once: true } },
    );

    gsap.fromTo(sectionRef.current.querySelector('.takeaways-panel'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.takeaways-panel'), start: 'top 85%', once: true } },
    );

    gsap.fromTo(sectionRef.current.querySelector('.streams-deep'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.streams-deep'), start: 'top 80%', once: true } },
    );

    gsap.fromTo(sectionRef.current.querySelector('.ksql-deep'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current.querySelector('.ksql-deep'), start: 'top 80%', once: true } },
    );
  }, { scope: sectionRef });

  return (
    <section id="chapter-5" ref={sectionRef} className="section-padding bg-[#0a0a0f]">
      <div className="container-main">
        <SectionHeader chapter="05" title="Stream Processing with Kafka" />

        {/* ─── Intro ─── */}
        <div className="max-w-3xl mb-16">
          <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed mb-6">
            Stream processing performs transformations and generates analytics on continuous data streams{' '}
            <span className="gradient-text font-medium">inside the stream</span>. Unlike traditional ETL where data is
            processed in batches inside a database or warehouse, streaming platforms enable both{' '}
            <span className="text-[#00f5ff] font-medium">integration</span> and{' '}
            <span className="text-[#00f5ff] font-medium">in-stream analytics</span> as data moves through the pipeline.
          </p>
          <p className="text-[1.05rem] text-[#c8c8d8] leading-relaxed mb-6">
            CDC is the optimal mechanism for capturing and delivering transactional data into Kafka. Once inside,
            stream processing creates new streams, generates real-time analytics, and powers event-driven applications —
            all without landing data in a traditional warehouse first.
          </p>
        </div>

        {/* ─── Learning Diagrams ─── */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="ch5-card bg-[#12121a] rounded-3xl border border-[#1a1a25] overflow-hidden">
            <div className="aspect-video bg-[#0a0a0f] flex items-center justify-center p-6">
              <ZoomableImage
                src="/images/stream-processing.jpg"
                alt="Stream processing overview"
                className="max-h-full max-w-full rounded-xl object-contain"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <p className="text-xs text-[#8a8a9a] leading-relaxed">
                Stream processing enables both data integration and in-stream analytics as data moves. Source systems
                feed Kafka topics, where processors transform streams and produce new derived topics for sinks.
              </p>
            </div>
          </div>
          <div className="ch5-card bg-[#12121a] rounded-3xl border border-[#1a1a25] overflow-hidden">
            <div className="aspect-video bg-[#0a0a0f] flex items-center justify-center p-6">
              <ZoomableImage
                src="/images/stream-table-duality.jpg"
                alt="Stream-Table Duality"
                className="max-h-full max-w-full rounded-xl object-contain"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <p className="text-xs text-[#8a8a9a] leading-relaxed">
                Stream-table duality: a changelog (stream) of every INSERT, UPDATE, and DELETE can be materialized into
                a table. Conversely, a table can be turned into a stream by emitting its changes as a changelog.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Concept Cards ─── */}
        <div className="grid lg:grid-cols-2 gap-10 mb-20">
          <div className="ch5-cards space-y-6">
            <ConceptCard
              icon={<Code className="w-8 h-8" />}
              iconColor="#00f5ff"
              title="Kafka Streams API"
              className="ch5-card"
            >
              <p className="mb-3">
                A <strong>client library</strong> for building applications and microservices that lives{' '}
                <span className="text-[#00f5ff] font-medium">outside the broker/cluster</span>. Source data is read from
                Kafka topics, processed, and written back to Kafka topics — keeping data in motion.
              </p>
              <p className="text-sm text-[#8a8a9a] mb-2">
                <span className="text-[#ffaa00]">KStream:</span> A lightweight abstraction on top of a topic where each
                event is an independent record — ideal for stateless transformations.
              </p>
              <p className="text-sm text-[#8a8a9a] mb-2">
                <span className="text-[#ffaa00]">KTable:</span> A durable, replicated materialized view backed by a local state store (RocksDB by default). It represents the latest value per key — ideal for stateful aggregations.
              </p>
              <p className="text-sm text-[#8a8a9a]">
                <span className="text-[#ffaa00]">GlobalKTable:</span> A fully replicated copy of an entire topic on
                every Streams instance, enabling broadcast joins without shuffling.
              </p>
            </ConceptCard>

            <ConceptCard
              icon={<Terminal className="w-8 h-8" />}
              iconColor="#ffaa00"
              title="ksqlDB"
              className="ch5-card"
            >
              <p className="mb-3">
                A <strong>SQL-like language</strong> for describing stream processing operations on Kafka data. Uses the
                same KStream and KTable abstractions as the Streams API — but with the familiarity of SQL syntax.
              </p>
              <p className="text-sm text-[#8a8a9a]">
                Write <code className="text-[#ffaa00]">CREATE STREAM</code>,{' '}
                <code className="text-[#ffaa00]">CREATE TABLE</code>, and{' '}
                <code className="text-[#ffaa00]">SELECT ... EMIT CHANGES</code> queries to build real-time pipelines
                without writing Java code.
              </p>
            </ConceptCard>

            <ConceptCard
              icon={<Clock className="w-8 h-8" />}
              iconColor="#ff00aa"
              title="Windowing"
              className="ch5-card"
            >
              <p className="mb-3">
                Uses time-based constraints to determine what subset of records is being viewed. Essential because
                streaming data is <span className="text-[#ff00aa] font-medium">unbounded</span> — windowing defines the
                finite subset you are referencing for aggregations and joins.
              </p>
              <div className="flex flex-wrap gap-2">
                {windowTypes.map((b) => (
                  <span
                    key={b}
                    className="px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] bg-[#ff00aa]/10 text-[#ff00aa] border border-[#ff00aa]/20"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </ConceptCard>
          </div>

          {/* Right — Stream-Table Duality Demo */}
          <div className="duality-visual bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-8 h-fit">
            <h3 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff] mb-2 text-center">
              Stream-Table Duality
            </h3>
            <p className="text-xs text-[#8a8a9a] text-center mb-6">
              Every table change generates a changelog stream — and every changelog can reconstruct the table
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Table */}
              <div>
                <p className="text-xs font-['Syne'] font-semibold uppercase tracking-wider text-[#00f5ff] mb-3">
                  TABLE (State)
                </p>
                <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] overflow-hidden">
                  <div className="grid grid-cols-2 gap-px bg-[#1a1a25]">
                    <div className="bg-[#12121a] px-3 py-2 text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">Key</div>
                    <div className="bg-[#12121a] px-3 py-2 text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">Value</div>
                  </div>
                  {tableRows.map((row, i) => (
                    <div
                      key={`${row.key}-${i}`}
                      className="grid grid-cols-2 gap-px bg-[#1a1a25] animate-in fade-in duration-300"
                    >
                      <div className="bg-[#0a0a0f] px-3 py-2 text-xs font-['JetBrains_Mono'] text-[#c8c8d8]">
                        {row.key}
                      </div>
                      <div className="bg-[#0a0a0f] px-3 py-2 text-xs font-['JetBrains_Mono'] text-[#c8c8d8]">
                        {row.value}
                      </div>
                    </div>
                  ))}
                  {tableRows.length === 0 && (
                    <div className="px-3 py-4 text-xs text-[#8a8a9a] text-center">Empty</div>
                  )}
                </div>
              </div>

              {/* Stream */}
              <div>
                <p className="text-xs font-['Syne'] font-semibold uppercase tracking-wider text-[#ffaa00] mb-3">
                  STREAM (Changelog)
                </p>
                <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-3 min-h-[120px] max-h-[200px] overflow-y-auto">
                  {streamRecords.length === 0 && (
                    <p className="text-xs text-[#8a8a9a] text-center py-4">No records yet</p>
                  )}
                  <div className="space-y-1.5">
                    {streamRecords.slice(-8).map((rec, i) => (
                      <div
                        key={i}
                        className={`text-xs font-['JetBrains_Mono'] px-2 py-1 rounded animate-in fade-in slide-in-from-left-2 duration-300 ${
                          rec.op === 'INSERT'
                            ? 'text-[#00f5ff] bg-[#00f5ff]/5'
                            : rec.op === 'UPDATE'
                            ? 'text-[#ffaa00] bg-[#ffaa00]/5'
                            : 'text-[#ff4444] bg-[#ff4444]/5'
                        }`}
                      >
                        {rec.op === 'DELETE' ? `-${rec.key}` : `+${rec.key}, ${rec.value}`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleInsert}
                className="flex-1 py-2.5 bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] rounded-xl font-['Syne'] font-semibold text-xs hover:bg-[#00f5ff]/20 transition-all"
              >
                INSERT
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 py-2.5 bg-[#ffaa00]/10 border border-[#ffaa00]/30 text-[#ffaa00] rounded-xl font-['Syne'] font-semibold text-xs hover:bg-[#ffaa00]/20 transition-all"
              >
                UPDATE
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff4444] rounded-xl font-['Syne'] font-semibold text-xs hover:bg-[#ff4444]/20 transition-all"
              >
                DELETE
              </button>
            </div>

            <p className="text-xs text-[#8a8a9a] mt-4 text-center">
              Click operations to see how table changes generate stream records
            </p>
          </div>
        </div>

        {/* ─── Deep-dive: Kafka Streams API ─── */}
        <div className="streams-deep mb-20">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-6">
            Deep-dive: Kafka Streams API
          </h3>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Topology Diagram */}
            <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-8">
              <h4 className="font-['Syne'] font-semibold text-base text-[#f0f0ff] mb-6">
                Topology: Source → Process → Sink
              </h4>

              <div className="flex flex-col items-center gap-4">
                {/* Source */}
                <div className="w-full max-w-xs bg-[#0a0a0f] rounded-xl border border-[#00f5ff]/30 p-4 text-center">
                  <Layers className="w-5 h-5 text-[#00f5ff] mx-auto mb-2" />
                  <p className="text-xs font-['JetBrains_Mono'] text-[#00f5ff]">Source Topic</p>
                  <p className="text-[10px] text-[#8a8a9a] mt-1">Raw events from producers</p>
                </div>

                <ArrowRight className="w-5 h-5 text-[#8a8a9a] rotate-90" />

                {/* Processors */}
                <div className="flex gap-3 w-full max-w-xs">
                  <div className="flex-1 bg-[#0a0a0f] rounded-xl border border-[#ffaa00]/30 p-3 text-center">
                    <p className="text-[10px] font-['JetBrains_Mono'] text-[#ffaa00]">Filter</p>
                  </div>
                  <div className="flex-1 bg-[#0a0a0f] rounded-xl border border-[#ffaa00]/30 p-3 text-center">
                    <p className="text-[10px] font-['JetBrains_Mono'] text-[#ffaa00]">Map</p>
                  </div>
                  <div className="flex-1 bg-[#0a0a0f] rounded-xl border border-[#ffaa00]/30 p-3 text-center">
                    <p className="text-[10px] font-['JetBrains_Mono'] text-[#ffaa00]">Join</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-[#8a8a9a] rotate-90" />

                {/* Sink */}
                <div className="w-full max-w-xs bg-[#0a0a0f] rounded-xl border border-[#ff00aa]/30 p-4 text-center">
                  <Table2 className="w-5 h-5 text-[#ff00aa] mx-auto mb-2" />
                  <p className="text-xs font-['JetBrains_Mono'] text-[#ff00aa]">Sink Topic</p>
                  <p className="text-[10px] text-[#8a8a9a] mt-1">Derived stream for consumers</p>
                </div>
              </div>

              <div className="mt-6 text-xs text-[#8a8a9a] leading-relaxed">
                A <span className="text-[#f0f0ff]">topology</span> is a graph of stream processors (nodes) connected by
                streams (edges). The Streams API builds this graph automatically from your DSL calls.
              </div>
            </div>

            {/* Code Snippet */}
            <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-8">
              <h4 className="font-['Syne'] font-semibold text-base text-[#f0f0ff] mb-4">
                Stream Operations
              </h4>
              <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-4 overflow-x-auto">
                <pre className="text-xs font-['JetBrains_Mono'] leading-relaxed">
                  <code>
                    <span className="text-[#8a8a9a]">{'//'} Build a stream processing topology</span>
                    {'\n'}
                    <span className="text-[#ffaa00]">KStream</span>
                    <span className="text-[#f0f0ff]">&lt;String, String&gt; source = builder</span>
                    {'\n'}
                    <span className="text-[#f0f0ff]">  .stream(</span>
                    <span className="text-[#00f5ff]">&quot;orders-topic&quot;</span>
                    <span className="text-[#f0f0ff]">);</span>
                    {'\n\n'}
                    <span className="text-[#f0f0ff]">source</span>
                    {'\n'}
                    <span className="text-[#f0f0ff]">  </span>
                    <span className="text-[#8a8a9a]">{'//'} 1. Filter high-value orders</span>
                    {'\n'}
                    <span className="text-[#f0f0ff]">  .filter((k, v) -&gt; v.getAmount() &gt; </span>
                    <span className="text-[#ff00aa]">1000</span>
                    <span className="text-[#f0f0ff]">)</span>
                    {'\n'}
                    <span className="text-[#f0f0ff]">  </span>
                    <span className="text-[#8a8a9a]">{'//'} 2. Enrich with customer data</span>
                    {'\n'}
                    <span className="text-[#f0f0ff]">  .join(customersTable,</span>
                    {'\n'}
                    <span className="text-[#f0f0ff]">    Order::withCustomer)</span>
                    {'\n'}
                    <span className="text-[#f0f0ff]">  </span>
                    <span className="text-[#8a8a9a]">{'//'} 3. Write to derived topic</span>
                    {'\n'}
                    <span className="text-[#f0f0ff]">  .to(</span>
                    <span className="text-[#00f5ff]">&quot;premium-orders&quot;</span>
                    <span className="text-[#f0f0ff]">);</span>
                  </code>
                </pre>
              </div>
              <p className="text-xs text-[#8a8a9a] mt-4 leading-relaxed">
                The DSL chains operations like <code className="text-[#ffaa00]">filter</code>,{' '}
                <code className="text-[#ffaa00]">map</code>, <code className="text-[#ffaa00]">join</code>, and{' '}
                <code className="text-[#ffaa00]">groupByKey</code> into a declarative pipeline. Under the hood, the
                library manages consumer groups, state stores, and failover.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Deep-dive: ksqlDB ─── */}
        <div className="ksql-deep mb-20">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-6">
            Deep-dive: ksqlDB
          </h3>

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <p className="text-[#c8c8d8] leading-relaxed">
                ksqlDB provides a <span className="text-[#ffaa00] font-medium">SQL-like language</span> for stream
                processing. It compiles queries down to Kafka Streams topologies, so you get the same semantics with a
                fraction of the code.
              </p>
              <p className="text-[#c8c8d8] leading-relaxed">
                Under the hood, ksqlDB uses the same abstractions:{' '}
                <span className="text-[#00f5ff]">streams</span> (append-only, unbounded) and{' '}
                <span className="text-[#00f5ff]">tables</span> (updatable, keyed). A{' '}
                <code className="text-[#ffaa00]">CREATE STREAM</code> statement maps to a KStream; a{' '}
                <code className="text-[#ffaa00]">CREATE TABLE</code> maps to a KTable.
              </p>
              <div className="bg-[#12121a] rounded-2xl border border-[#1a1a25] p-5">
                <h5 className="font-['Syne'] font-semibold text-sm text-[#f0f0ff] mb-3">Sample Data</h5>
                <p className="text-xs text-[#8a8a9a] mb-3">Stream: user_clicks</p>
                <div className="space-y-1.5">
                  {sampleClicks.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-['JetBrains_Mono']">
                      <span className="text-[#00f5ff] w-16 truncate">{c.user_id}</span>
                      <ChevronRight className="w-3 h-3 text-[#8a8a9a]" />
                      <span className="text-[#c8c8d8] flex-1 truncate">{c.page}</span>
                      <span className="text-[#8a8a9a]">{c.ts}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <KsqlPlayground />
            </div>
          </div>
        </div>

        {/* ─── Windowing Visualizer ─── */}
        <div className="mb-20">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-6">
            Windowing in Action
          </h3>
          <WindowingVisualizer />
        </div>

        {/* ─── Use Cases ─── */}
        <div className="mb-20">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-6">
            Stream Processing Use Cases
          </h3>
          <div className="use-cases-grid grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((uc, i) => (
              <div
                key={i}
                className="use-case-card bg-[#12121a] rounded-2xl border border-[#1a1a25] p-6 transition-all duration-350 hover:-translate-y-2 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_8px_32px_rgba(0,245,255,0.08)]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${uc.color}15` }}
                >
                  <uc.icon className="w-5 h-5" style={{ color: uc.color }} />
                </div>
                <h4 className="font-['Syne'] font-semibold text-base text-[#f0f0ff] mb-2">{uc.title}</h4>
                <p className="text-xs text-[#8a8a9a] leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Benefits Deep-dive ─── */}
        <div className="mb-20">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-6">
            Key Elements of Stream Processing
          </h3>
          <div className="key-elements grid grid-cols-2 md:grid-cols-3 gap-4">
            {benefits.map((el, i) => (
              <div
                key={i}
                className="key-element bg-[#12121a] rounded-2xl border border-[#1a1a25] p-5 transition-all duration-350 hover:-translate-y-1 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_8px_32px_rgba(0,245,255,0.08)]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${el.color}15` }}
                >
                  <el.icon className="w-4 h-4" style={{ color: el.color }} />
                </div>
                <h4 className="font-['Syne'] font-semibold text-sm text-[#f0f0ff] mb-2">{el.title}</h4>
                <p className="text-xs text-[#8a8a9a] leading-relaxed">{el.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Callouts ─── */}
        <div className="callouts-grid grid md:grid-cols-3 gap-6 mb-20">
          <div className="callout-card bg-[#ffaa00]/5 border border-[#ffaa00]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-[#ffaa00]" />
              <span className="font-['Syne'] font-semibold text-[#ffaa00]">Tip</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              A simple table is a collection of key-value pairs. A Kafka topic is also a collection of key-value pairs.
              That symmetry is what makes stream-table duality possible.
            </p>
          </div>

          <div className="callout-card bg-[#00f5ff]/5 border border-[#00f5ff]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="w-5 h-5 text-[#00f5ff]" />
              <span className="font-['Syne'] font-semibold text-[#00f5ff]">Remember</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              Streaming data is unbounded, so windowing is essential for grouping records for processing. Without
              windows, aggregates like SUM or COUNT would grow forever.
            </p>
          </div>

          <div className="callout-card bg-[#ff4444]/5 border border-[#ff4444]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#ff4444]" />
              <span className="font-['Syne'] font-semibold text-[#ff4444]">Warning</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              Stream processing is done in real-time windows on real-time data, one record at a time, rather than
              storing messages in batches. Design your logic accordingly.
            </p>
          </div>
        </div>

        {/* ─── Key Takeaways ─── */}
        <div className="takeaways-panel bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00f5ff]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ffaa00]/5 rounded-full blur-3xl" />

          <div className="relative">
            <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-6">
              Key Takeaways
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00f5ff]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#00f5ff]">1</span>
                </div>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">
                  <span className="text-[#f0f0ff] font-medium">Traditional ETL</span> processes data in batches inside
                  databases or warehouses. Streaming platforms process data in motion.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00f5ff]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#00f5ff]">2</span>
                </div>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">
                  <span className="text-[#f0f0ff] font-medium">Streaming = integration + in-stream analytics</span> as
                  data moves. CDC captures transactional changes and feeds them into Kafka for processing.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ffaa00]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#ffaa00]">3</span>
                </div>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">
                  Three core components: <span className="text-[#f0f0ff] font-medium">Streams API</span> (Java library),
                  <span className="text-[#f0f0ff] font-medium"> ksqlDB</span> (SQL interface), and{' '}
                  <span className="text-[#f0f0ff] font-medium">windowing</span> (time-bounded operations).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ffaa00]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#ffaa00]">4</span>
                </div>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">
                  Key elements: <span className="text-[#f0f0ff] font-medium">exactly-once</span> semantics,{' '}
                  <span className="text-[#f0f0ff] font-medium">stateful/stateless</span> processing,{' '}
                  <span className="text-[#f0f0ff] font-medium">time</span> semantics, CDC, and real-time delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
