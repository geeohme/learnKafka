import { useRef, useState, useCallback, type ComponentType, type CSSProperties } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import ZoomableImage from '@/components/ZoomableImage';
import {
  Shuffle,
  Key,
  Settings,
  FileJson,
  GitBranch,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  CheckCircle,
  Layers,
  Table,
  Hash,
  BarChart3,
  RefreshCw,
  Code2,
  Lock,
  Unlock,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Types ─── */

interface PartitionStrategy {
  id: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  title: string;
  desc: string;
  pros: string[];
  cons: string[];
  color: string;
}

interface SchemaVersion {
  version: number;
  label: string;
  fields: { name: string; type: string; status: 'same' | 'added' | 'removed' | 'changed' }[];
  compatible: 'backward' | 'forward' | 'full' | 'breaking';
}

/* ─── Data ─── */

const partitionStrategies: PartitionStrategy[] = [
  {
    id: 'random',
    icon: Shuffle,
    title: 'Random',
    desc: 'Records distributed evenly with no key consideration.',
    pros: ['Maximum parallelism', 'Even load distribution', 'Simple to implement'],
    cons: ['No ordering guarantee', 'May need repartition logic for consistency', 'Related records scattered'],
    color: '#00f5ff',
  },
  {
    id: 'key',
    icon: Key,
    title: 'Key-based',
    desc: 'Same key routes to the same partition every time.',
    pros: ['Maintains record ordering per key', 'Predictable routing', 'Good for entity-centric processing'],
    cons: ['May create hot partitions', 'Uneven distribution possible', 'Key choice is critical'],
    color: '#ffaa00',
  },
  {
    id: 'transaction',
    icon: Hash,
    title: 'Transaction ID',
    desc: 'All records for a transaction go to one partition.',
    pros: ['Ensures transaction consistency', 'No cross-partition coordination', 'Simpler consumer logic'],
    cons: ['Limits parallelism per transaction', 'Large transactions create hot spots', 'Consumers read from one partition'],
    color: '#ff00aa',
  },
  {
    id: 'dbtable',
    icon: Table,
    title: 'Table-name as record key',
    desc: 'Using the table name as the record key routes all records from one table to the same partition, creating a hot partition.',
    pros: ['Clear data lineage', 'Easy to reason about', 'Aligns with source structure'],
    cons: ['Uneven table sizes create hot partitions', 'May not reflect access patterns', 'Less granular than key-based'],
    color: '#00f5ff',
  },
];

const schemaVersions: SchemaVersion[] = [
  {
    version: 1,
    label: 'Initial Schema',
    fields: [
      { name: 'transaction_id', type: 'string', status: 'same' },
      { name: 'amount', type: 'double', status: 'same' },
      { name: 'timestamp', type: 'long', status: 'same' },
    ],
    compatible: 'full',
  },
  {
    version: 2,
    label: 'Add currency field',
    fields: [
      { name: 'transaction_id', type: 'string', status: 'same' },
      { name: 'amount', type: 'double', status: 'same' },
      { name: 'timestamp', type: 'long', status: 'same' },
      { name: 'currency', type: 'string', status: 'added' },
    ],
    compatible: 'backward',
  },
  {
    version: 3,
    label: 'Add optional metadata',
    fields: [
      { name: 'transaction_id', type: 'string', status: 'same' },
      { name: 'amount', type: 'double', status: 'same' },
      { name: 'timestamp', type: 'long', status: 'same' },
      { name: 'currency', type: 'string', status: 'same' },
      { name: 'metadata', type: 'map<string>', status: 'added' },
    ],
    compatible: 'forward',
  },
];

const topicConfigs = [
  {
    id: 'per-table',
    title: 'One Topic per Database Table',
    bestFor: 'Relational databases with clear table boundaries',
    pros: ['Clear data lineage and ownership', 'Easy to map source → destination', 'Table-level retention policies', 'Simple consumer targeting'],
    cons: ['Can become large and unwieldy', 'Many topics to manage', 'Cross-table joins require extra work'],
  },
  {
    id: 'per-app',
    title: 'One Topic per Application',
    bestFor: 'Microservices with grouped functionality',
    pros: ['Simplified topic management', 'Fewer ACLs and configs', 'Application-centric thinking'],
    cons: ['Mixed table types complicate downstream', 'Consumers must filter unwanted data', 'Harder to reason about data lineage'],
  },
];

const avroSchemaExample = `{
  "type": "record",
  "name": "Transaction",
  "fields": [
    { "name": "transaction_id", "type": "string" },
    { "name": "amount",       "type": "double" },
    { "name": "currency",     "type": "string" },
    { "name": "timestamp",    "type": "long" }
  ]
}`;

const takeaways = [
  'Any CDC method can create a stream of records written to Kafka, enabling real-time data pipelines.',
  'Schema design is critical for optimized pipelines — Kafka moves bytes, so consumers must understand structure.',
  'Topic schemas and partition usage should align with transactional requirements and access patterns.',
  'Two primary goals: optimize throughput via parallelism and ensure consistency via ordering guarantees.',
  'Choose a partition strategy that balances throughput, ordering, and latency for your specific use case.',
];

/* ─── Component ─── */

export default function Chapter4Section() {
  const sectionRef = useRef<HTMLDivElement>(null);

  /* Partition Simulator */
  const [mode, setMode] = useState<'random' | 'key' | 'transaction'>('random');
  const [partitionKey, setPartitionKey] = useState('user-123');
  const [partitions, setPartitions] = useState<number[][]>([[], [], []]);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [recordCount, setRecordCount] = useState(0);

  /* Schema Evolution */
  const [activeSchemaVersion, setActiveSchemaVersion] = useState(0);

  /* Topic Config */
  const [activeTopicConfig, setActiveTopicConfig] = useState<'per-table' | 'per-app'>('per-table');

  /* Ordering Visualizer */
  const [orderingMode, setOrderingMode] = useState<'single' | 'multi'>('single');

  const hashKey = useCallback((key: string) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 3;
  }, []);

  const sendRecord = useCallback(() => {
    let targetIndex: number;
    if (mode === 'random') {
      targetIndex = Math.floor(Math.random() * 3);
    } else if (mode === 'key') {
      targetIndex = hashKey(partitionKey);
    } else {
      targetIndex = hashKey(`txn-${partitionKey}`);
    }

    const nextId = recordCount + 1;
    setRecordCount(nextId);
    setAnimatingIndex(targetIndex);

    setTimeout(() => {
      setPartitions((prev) => {
        const next = prev.map((p) => [...p]);
        next[targetIndex] = [...next[targetIndex], nextId];
        return next;
      });
      setAnimatingIndex(null);
    }, 300);
  }, [mode, partitionKey, hashKey, recordCount]);

  const resetPartitions = useCallback(() => {
    setPartitions([[], [], []]);
    setRecordCount(0);
    setAnimatingIndex(null);
  }, []);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const triggers: ScrollTrigger[] = [];

    const fromTo = (
      selector: string,
      fromVars: gsap.TweenVars,
      toVars: gsap.TweenVars,
      scrollVars?: Partial<ScrollTrigger.Vars>
    ) => {
      const el = sectionRef.current!.querySelector(selector);
      if (!el) return;
      const tween = gsap.fromTo(el, fromVars, {
        ...toVars,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
          ...scrollVars,
        },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    };

    fromTo('.cdc-overview', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    fromTo('.schema-section', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    fromTo('.topic-config-section', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    fromTo('.partition-section', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    fromTo('.ordering-section', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    fromTo('.callouts-grid', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
    fromTo('.strategies-grid', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
    fromTo('.takeaways-panel', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, { scope: sectionRef });

  const currentSchema = schemaVersions[activeSchemaVersion];

  const getCompatibilityBadge = (compatible: SchemaVersion['compatible']) => {
    switch (compatible) {
      case 'backward':
        return { label: 'Backward Compatible', color: '#00f5ff', bg: 'bg-[#00f5ff]/10', border: 'border-[#00f5ff]/30', text: 'text-[#00f5ff]' };
      case 'forward':
        return { label: 'Forward Compatible', color: '#ffaa00', bg: 'bg-[#ffaa00]/10', border: 'border-[#ffaa00]/30', text: 'text-[#ffaa00]' };
      case 'full':
        return { label: 'Full Compatible', color: '#00ff88', bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/30', text: 'text-[#00ff88]' };
      case 'breaking':
        return { label: 'Breaking Change', color: '#ff4444', bg: 'bg-[#ff4444]/10', border: 'border-[#ff4444]/30', text: 'text-[#ff4444]' };
    }
  };

  const getStatusStyle = (status: SchemaVersion['fields'][number]['status']) => {
    switch (status) {
      case 'added':
        return 'text-[#00ff88]';
      case 'removed':
        return 'text-[#ff4444] line-through';
      case 'changed':
        return 'text-[#ffaa00]';
      default:
        return 'text-[#c8c8d8]';
    }
  };

  return (
    <section id="chapter-4" ref={sectionRef} className="section-padding bg-[#0a0a0f]">
      <div className="container-main">
        <SectionHeader chapter="04" title="Applying CDC to Apache Kafka" />

        {/* ── Intro ── */}
        <p className="text-[1.15rem] text-[#c8c8d8] leading-relaxed max-w-3xl mb-16">
          The complete CDC process has two functions:{' '}
          <span className="text-[#00f5ff] font-medium">capturing</span> changed data and{' '}
          <span className="text-[#00f5ff] font-medium">enabling replication</span> of that data.
          CDC captures and presents data changes to Kafka, which becomes the persistence and transit
          layer for replication and delivery.
        </p>

        {/* ── CDC Process Overview ── */}
        <div className="cdc-overview mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-6">
            CDC Process Overview
          </h3>

          <div className="grid lg:grid-cols-2 gap-10 mb-10">
            <div>
              <p className="text-[1.05rem] text-[#c8c8d8] leading-relaxed mb-6">
                Change Data Capture (CDC) is a two-step process. First, it{' '}
                <span className="text-[#f0f0ff] font-medium">captures changed data</span> from source
                systems — typically by reading database transaction logs, using triggers, or polling
                for changes. Second, it{' '}
                <span className="text-[#f0f0ff] font-medium">enables replication</span> of that
                changed data to target systems.
              </p>
              <p className="text-[1.05rem] text-[#c8c8d8] leading-relaxed mb-6">
                CDC systems act as <span className="text-[#00f5ff] font-medium">Kafka producers</span>.
                They read changes from the source database and publish each change as a record to a
                Kafka topic. From there, Kafka handles persistence, replication across brokers, and
                delivery to consumers.
              </p>
              <p className="text-[1.05rem] text-[#c8c8d8] leading-relaxed">
                Tools like <span className="text-[#ffaa00] font-medium">Attunity Replicate</span>{' '}
                (now part of Qlik) automate much of this process, including schema creation and
                mapping between source and target systems. This reduces manual configuration and
                ensures consistency across the pipeline.
              </p>
            </div>

            <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6">
              <ZoomableImage
                src="/images/cdc-replication.jpg"
                alt="CDC replication diagram showing capture and replication flow"
                className="w-full rounded-2xl mb-4 border border-[#1a1a25]"
              />
              <p className="text-xs text-[#8a8a9a] text-center font-['JetBrains_Mono']">
                Figure: CDC captures changes and enables replication through Kafka
              </p>
            </div>
          </div>

          {/* CDC Flow Steps */}
          <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8">
            <h4 className="font-['Syne'] font-semibold text-sm text-[#f0f0ff] mb-6 text-center">
              CDC + Kafka Replication Flow
            </h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '1', label: 'Change occurs in source database', color: '#00f5ff' },
                { step: '2', label: 'CDC agent captures the change', color: '#ffaa00' },
                { step: '3', label: 'Record published to Kafka topic', color: '#ff00aa' },
                { step: '4', label: 'Consumers replicate / process', color: '#8a8a9a' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-5 text-center"
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-['JetBrains_Mono'] font-bold mb-3"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    {item.step}
                  </span>
                  <p className="text-sm text-[#c8c8d8]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Schema Management ── */}
        <div className="schema-section mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Schema Management
          </h3>
          <p className="text-[#8a8a9a] max-w-3xl mb-10">
            Schemas define the structure of your data. Proper schema design is critical because
            Kafka treats records as opaque bytes — it does not inspect or validate internal data.
          </p>

          <div className="grid lg:grid-cols-2 gap-10 mb-12">
            {/* Schema Concepts */}
            <div className="space-y-6">
              <div className="bg-[#12121a] rounded-2xl border border-[#1a1a25] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#00f5ff]/10">
                    <FileJson className="w-5 h-5 text-[#00f5ff]" />
                  </div>
                  <h4 className="font-['Syne'] font-semibold text-[#f0f0ff]">What is a Schema?</h4>
                </div>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">
                  A schema defines the structure, types, and constraints of data. It tells producers
                  and consumers what fields to expect, their data types, and which are required vs.
                  optional. Without schemas, consumers must guess the structure or risk deserialization errors.
                </p>
              </div>

              <div className="bg-[#12121a] rounded-2xl border border-[#1a1a25] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#ffaa00]/10">
                    <Code2 className="w-5 h-5 text-[#ffaa00]" />
                  </div>
                  <h4 className="font-['Syne'] font-semibold text-[#f0f0ff]">Apache Avro</h4>
                </div>
                <p className="text-sm text-[#c8c8d8] leading-relaxed mb-4">
                  Apache Avro is a compact, fast, binary data format. When paired with a Schema
                  Registry, Avro records include a compact schema ID reference instead of the full
                  schema, keeping payloads small while enabling schema evolution.
                </p>
                <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-4 overflow-x-auto">
                  <pre className="text-xs font-['JetBrains_Mono'] text-[#c8c8d8] leading-relaxed">
                    <code>{avroSchemaExample}</code>
                  </pre>
                </div>
              </div>

              <div className="bg-[#12121a] rounded-2xl border border-[#1a1a25] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#ff00aa]/10">
                    <GitBranch className="w-5 h-5 text-[#ff00aa]" />
                  </div>
                  <h4 className="font-['Syne'] font-semibold text-[#f0f0ff]">Schema Registry</h4>
                </div>
                <p className="text-sm text-[#c8c8d8] leading-relaxed">
                  A Schema Registry provides version control for schemas. It stores schema versions,
                  validates compatibility, and ensures producers and consumers agree on data structure.
                  Many organizations leverage centralized Schema Registries for consistency across teams.
                </p>
              </div>
            </div>

            {/* Interactive Schema Evolution */}
            <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-['Syne'] font-semibold text-[#f0f0ff] flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#00f5ff]" />
                  Schema Evolution Demo
                </h4>
                <span className="text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">
                  v{currentSchema.version}
                </span>
              </div>

              {/* Version toggles */}
              <div className="flex gap-2 mb-6">
                {schemaVersions.map((sv, i) => {
                  const badge = getCompatibilityBadge(sv.compatible);
                  return (
                    <button
                      key={sv.version}
                      onClick={() => setActiveSchemaVersion(i)}
                      className={`flex-1 py-2 rounded-xl text-xs font-['Syne'] font-semibold transition-all border ${
                        activeSchemaVersion === i
                          ? `${badge.bg} ${badge.border} ${badge.text}`
                          : 'bg-[#0a0a0f] border-[#1a1a25] text-[#8a8a9a] hover:text-[#c8c8d8]'
                      }`}
                    >
                      V{sv.version}
                    </button>
                  );
                })}
              </div>

              <div className="mb-4">
                <p className="text-sm text-[#f0f0ff] font-medium mb-1">{currentSchema.label}</p>
                {(() => {
                  const badge = getCompatibilityBadge(currentSchema.compatible);
                  return (
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-['Syne'] font-semibold border ${badge.bg} ${badge.border} ${badge.text}`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Fields */}
              <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-4 space-y-2">
                {currentSchema.fields.map((field) => (
                  <div
                    key={field.name}
                    className="flex items-center justify-between py-2 border-b border-[#1a1a25] last:border-0"
                  >
                    <span className={`text-sm font-['JetBrains_Mono'] ${getStatusStyle(field.status)}`}>
                      {field.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {field.status === 'added' && (
                        <span className="text-[10px] font-['JetBrains_Mono'] text-[#00ff88] bg-[#00ff88]/10 px-1.5 py-0.5 rounded">
                          +new
                        </span>
                      )}
                      {field.status === 'removed' && (
                        <span className="text-[10px] font-['JetBrains_Mono'] text-[#ff4444] bg-[#ff4444]/10 px-1.5 py-0.5 rounded">
                          removed
                        </span>
                      )}
                      <span className="text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">
                        {field.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#8a8a9a] mt-4 leading-relaxed">
                {currentSchema.compatible === 'backward' &&
                  'Backward compatible: New readers can read old data. Old readers may ignore new fields.'}
                {currentSchema.compatible === 'forward' &&
                  'Forward compatible: Old readers can read new data. New fields should have default values.'}
                {currentSchema.compatible === 'full' &&
                  'Full compatible: Both old and new readers can read all versions.'}
                {currentSchema.compatible === 'breaking' &&
                  'Breaking change: Old readers cannot read new data. Requires consumer updates.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Topic Configuration ── */}
        <div className="topic-config-section mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Topic Configuration Strategies
          </h3>
          <p className="text-[#8a8a9a] max-w-3xl mb-10">
            How you map database tables to Kafka topics has significant implications for management,
            lineage, and downstream processing.
          </p>

          <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-8">
            {/* Selector */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {topicConfigs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setActiveTopicConfig(config.id as 'per-table' | 'per-app')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-['Syne'] font-semibold transition-all border text-left ${
                    activeTopicConfig === config.id
                      ? 'bg-[#00f5ff]/10 border-[#00f5ff]/30 text-[#00f5ff]'
                      : 'bg-[#0a0a0f] border-[#1a1a25] text-[#8a8a9a] hover:text-[#c8c8d8]'
                  }`}
                >
                  {config.title}
                </button>
              ))}
            </div>

            {topicConfigs.map((config) => {
              if (config.id !== activeTopicConfig) return null;
              return (
                <div key={config.id} className="animate-in fade-in duration-300">
                  <p className="text-sm text-[#8a8a9a] mb-6 font-['JetBrains_Mono']">
                    Best for: <span className="text-[#c8c8d8]">{config.bestFor}</span>
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-4 h-4 text-[#00f5ff]" />
                        <span className="font-['Syne'] font-semibold text-sm text-[#f0f0ff]">
                          Pros
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {config.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#c8c8d8]">
                            <span className="w-1 h-1 rounded-full bg-[#00f5ff] mt-2 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-[#ffaa00]" />
                        <span className="font-['Syne'] font-semibold text-sm text-[#f0f0ff]">
                          Cons
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {config.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#c8c8d8]">
                            <span className="w-1 h-1 rounded-full bg-[#ffaa00] mt-2 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Partition Configuration ── */}
        <div className="partition-section mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Partition Configuration
          </h3>
          <p className="text-[#8a8a9a] max-w-3xl mb-10">
            Partitions enable Kafka&apos;s parallelism. The partitioning strategy determines how records
            are distributed and whether ordering guarantees can be maintained.
          </p>

          <div className="grid lg:grid-cols-2 gap-10 mb-12">
            {/* Left — Simulator */}
            <div className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-['Syne'] font-semibold text-sm text-[#f0f0ff]">
                  Partitioning Simulator
                </h4>
                <button
                  onClick={resetPartitions}
                  className="text-xs font-['JetBrains_Mono'] text-[#8a8a9a] hover:text-[#c8c8d8] transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Mode selector */}
              <div className="flex bg-[#0a0a0f] rounded-xl p-1 mb-4">
                {(['random', 'key', 'transaction'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-['Syne'] font-semibold transition-all ${
                      mode === m
                        ? 'bg-[#00f5ff]/15 text-[#00f5ff]'
                        : 'text-[#8a8a9a] hover:text-[#c8c8d8]'
                    }`}
                  >
                    {m === 'random' && 'Random'}
                    {m === 'key' && 'Key-based'}
                    {m === 'transaction' && 'Transaction ID'}
                  </button>
                ))}
              </div>

              {/* Key input */}
              {(mode === 'key' || mode === 'transaction') && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={partitionKey}
                      onChange={(e) => setPartitionKey(e.target.value)}
                      placeholder={mode === 'key' ? 'Enter record key...' : 'Enter transaction ID...'}
                      className="flex-1 bg-[#0a0a0f] border border-[#1a1a25] rounded-xl px-4 py-2 text-sm text-[#f0f0ff] placeholder:text-[#8a8a9a] focus:outline-none focus:border-[#00f5ff]/50 font-['JetBrains_Mono']"
                    />
                  </div>
                  <p className="text-xs text-[#8a8a9a] mt-2 font-['JetBrains_Mono']">
                    {mode === 'key'
                      ? `Key "${partitionKey}" → Partition ${hashKey(partitionKey)}`
                      : `Transaction "txn-${partitionKey}" → Partition ${hashKey(`txn-${partitionKey}`)}`}
                  </p>
                </div>
              )}

              <button
                onClick={sendRecord}
                className="w-full py-2.5 bg-gradient-to-r from-[#00f5ff] to-[#00c8cc] text-[#0a0a0f] rounded-xl font-['Syne'] font-semibold text-sm hover:brightness-110 transition-all mb-6"
              >
                Send Record
              </button>

              {/* Partitions */}
              <div className="grid grid-cols-3 gap-3">
                {partitions.map((records, i) => (
                  <div
                    key={i}
                    className={`relative bg-[#0a0a0f] rounded-xl border p-3 min-h-[140px] transition-all duration-300 ${
                      animatingIndex === i
                        ? 'border-[#00f5ff] shadow-[0_0_16px_rgba(0,245,255,0.15)]'
                        : 'border-[#1a1a25]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-['JetBrains_Mono'] text-[#8a8a9a]">
                        Partition {i}
                      </p>
                      <p className="text-xs font-['JetBrains_Mono'] text-[#8a8a9a]">
                        {records.length}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {records.map((r) => (
                        <div
                          key={r}
                          className="w-5 h-5 rounded-md bg-[#00f5ff]/30 flex items-center justify-center text-[8px] font-['JetBrains_Mono'] text-[#00f5ff] animate-in zoom-in duration-200"
                        >
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-[#8a8a9a] mt-4">
                {mode === 'random'
                  ? 'Records are distributed randomly across partitions'
                  : mode === 'key'
                    ? `Key "${partitionKey}" consistently maps to Partition ${hashKey(partitionKey)}`
                    : `Transaction ID consistently maps to Partition ${hashKey(`txn-${partitionKey}`)}`}
              </p>
            </div>

            {/* Right — Strategy Details */}
            <div className="space-y-4">
              {partitionStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="bg-[#12121a] rounded-2xl border border-[#1a1a25] p-5 transition-all duration-300 hover:border-[rgba(0,245,255,0.2)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <strategy.icon className="w-5 h-5" style={{ color: strategy.color }} />
                    <h4 className="font-['Syne'] font-semibold text-[#f0f0ff]">{strategy.title}</h4>
                  </div>
                  <p className="text-sm text-[#c8c8d8] leading-relaxed mb-3">{strategy.desc}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-['Syne'] font-semibold text-[#00f5ff] uppercase tracking-wider mb-1.5">
                        Pros
                      </p>
                      <ul className="space-y-1">
                        {strategy.pros.map((p, i) => (
                          <li key={i} className="text-xs text-[#c8c8d8] flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#00f5ff] mt-1.5 flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-['Syne'] font-semibold text-[#ffaa00] uppercase tracking-wider mb-1.5">
                        Cons
                      </p>
                      <ul className="space-y-1">
                        {strategy.cons.map((c, i) => (
                          <li key={i} className="text-xs text-[#c8c8d8] flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#ffaa00] mt-1.5 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#12121a] rounded-2xl border border-[#1a1a25] p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#ffaa00] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#f0f0ff] font-medium mb-1">Partition Operations</p>
              <p className="text-sm text-[#c8c8d8] leading-relaxed">Kafka topics can have partitions <span className="text-[#00f5ff] font-medium">added</span> but <span className="text-[#ff4444] font-medium">never removed</span>. Plan your partition count carefully upfront, as reducing partitions later requires creating a new topic.</p>
            </div>
          </div>
        </div>

        {/* ── Ordering Guarantees ── */}
        <div className="ordering-section mb-24">
          <h3 className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] mb-4">
            Ordering Guarantees
          </h3>
          <p className="text-[#8a8a9a] max-w-3xl mb-10">
            Understanding ordering guarantees is essential when designing Kafka pipelines for
            transactional data. The choice between global and partition-level ordering involves
            trade-offs between consistency and parallelism.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Global Order */}
            <div
              className={`bg-[#12121a] rounded-3xl border p-6 md:p-8 transition-all cursor-pointer ${
                orderingMode === 'single'
                  ? 'border-[#00f5ff]/30 shadow-[0_0_24px_rgba(0,245,255,0.06)]'
                  : 'border-[#1a1a25] hover:border-[rgba(0,245,255,0.2)]'
              }`}
              onClick={() => setOrderingMode('single')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#00f5ff]/10">
                  <Lock className="w-5 h-5 text-[#00f5ff]" />
                </div>
                <h4 className="font-['Syne'] font-semibold text-[#f0f0ff]">Global Message Order</h4>
              </div>
              <p className="text-sm text-[#c8c8d8] leading-relaxed mb-6">
                Guaranteed when <span className="text-[#f0f0ff] font-medium">all transactions</span>{' '}
                go to a single partition. Every consumer sees records in the exact order they were
                produced.
              </p>

              {/* Visual */}
              <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-4">
                <p className="text-[10px] font-['JetBrains_Mono'] text-[#8a8a9a] mb-3 text-center">
                  Single Partition — Strict Order
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <div className="w-full max-w-[200px] bg-[#1a1a25] rounded-lg p-3 space-y-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="flex items-center gap-2 bg-[#00f5ff]/10 border border-[#00f5ff]/20 rounded-md px-3 py-1.5"
                      >
                        <span className="text-[10px] font-['JetBrains_Mono'] text-[#00f5ff]">
                          {n}
                        </span>
                        <div className="flex-1 h-1.5 bg-[#00f5ff]/20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#ffaa00]" />
                <span className="text-xs text-[#8a8a9a]">Limits parallelism</span>
              </div>
            </div>

            {/* Partition-Level Order */}
            <div
              className={`bg-[#12121a] rounded-3xl border p-6 md:p-8 transition-all cursor-pointer ${
                orderingMode === 'multi'
                  ? 'border-[#ffaa00]/30 shadow-[0_0_24px_rgba(255,170,0,0.06)]'
                  : 'border-[#1a1a25] hover:border-[rgba(255,170,0,0.2)]'
              }`}
              onClick={() => setOrderingMode('multi')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#ffaa00]/10">
                  <Unlock className="w-5 h-5 text-[#ffaa00]" />
                </div>
                <h4 className="font-['Syne'] font-semibold text-[#f0f0ff]">
                  Partition-Level Order
                </h4>
              </div>
              <p className="text-sm text-[#c8c8d8] leading-relaxed mb-6">
                Each partition guarantees order{' '}
                <span className="text-[#f0f0ff] font-medium">within itself</span>, but parallel
                reads across partitions may improve performance at the expense of global ordering.
              </p>

              {/* Visual */}
              <div className="bg-[#0a0a0f] rounded-xl border border-[#1a1a25] p-4">
                <p className="text-[10px] font-['JetBrains_Mono'] text-[#8a8a9a] mb-3 text-center">
                  Multiple Partitions — Parallel Processing
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((p) => (
                    <div key={p} className="bg-[#1a1a25] rounded-lg p-2 space-y-1.5">
                      <p className="text-[9px] font-['JetBrains_Mono'] text-[#8a8a9a] text-center">
                        P{p}
                      </p>
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="bg-[#ffaa00]/10 border border-[#ffaa00]/20 rounded px-2 py-1 text-center"
                        >
                          <span className="text-[9px] font-['JetBrains_Mono'] text-[#ffaa00]">
                            {p * 3 + n}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00f5ff]" />
                <span className="text-xs text-[#8a8a9a]">Higher throughput, no global ordering guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Callouts ── */}
        <div className="callouts-grid grid md:grid-cols-3 gap-6 mb-24">
          <div className="bg-[#00f5ff]/5 border border-[#00f5ff]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="w-5 h-5 text-[#00f5ff]" />
              <span className="font-['Syne'] font-semibold text-[#00f5ff]">Tip</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              Using CDC to publish database changes as a record stream to Kafka is increasingly
              considered a best practice for building real-time data pipelines.
            </p>
          </div>

          <div className="bg-[#ffaa00]/5 border border-[#ffaa00]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#ffaa00]" />
              <span className="font-['Syne'] font-semibold text-[#ffaa00]">Warning</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              Global message order is guaranteed when all transactions go to a single partition,
              but this limits parallelism and may become a bottleneck.
            </p>
          </div>

          <div className="bg-[#ff00aa]/5 border border-[#ff00aa]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-[#ff00aa]" />
              <span className="font-['Syne'] font-semibold text-[#ff00aa]">Remember</span>
            </div>
            <p className="text-[#c8c8d8] text-sm leading-relaxed">
              Many organizations leverage centralized Schema Registries for version control and
              consistency. Schema design is critical because Kafka doesn&apos;t see internal data —
              it&apos;s just moving bytes.
            </p>
          </div>
        </div>

        {/* ── Partitioning Strategies Summary Cards ── */}
        <div className="strategies-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {[
            { icon: Shuffle, title: 'Random', desc: 'Even distribution. Best for load balancing. No ordering.', color: '#00f5ff' },
            { icon: Key, title: 'Key-based', desc: 'Same key → same partition. Maintains per-key ordering.', color: '#ffaa00' },
            { icon: Settings, title: 'Custom', desc: 'User-defined Partitioner class for complete control over routing logic. Maximum flexibility.', color: '#ff00aa' },
            { icon: Layers, title: 'Hybrid', desc: 'Combine key-based for ordering with custom logic for load balancing across partitions.', color: '#00f5ff' },
          ].map((strategy, i) => (
            <div
              key={i}
              className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-6 transition-all duration-350 hover:-translate-y-2 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_8px_32px_rgba(0,245,255,0.08)]"
            >
              <strategy.icon className="w-6 h-6 mb-3" style={{ color: strategy.color }} />
              <h4 className="font-['Syne'] font-semibold text-[#f0f0ff] mb-2">{strategy.title}</h4>
              <p className="text-sm text-[#c8c8d8] leading-relaxed">{strategy.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Key Takeaways ── */}
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
