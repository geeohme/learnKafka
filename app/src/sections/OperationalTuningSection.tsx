import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import { Zap, Download, Server, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Type Definitions ─── */

interface TuningParameter {
  name: string;
  default: string;
  impact: string;
  recommendation: string;
}

interface TuningCategory {
  title: string;
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties; className?: string }>;
  color: string;
  parameters: TuningParameter[];
}

/* ─── Data Constants ─── */

const tuningCategories: TuningCategory[] = [
  {
    title: 'Producer Performance',
    icon: Zap,
    color: '#00f5ff',
    parameters: [
      {
        name: 'batch.size',
        default: '16384 (16 KB)',
        impact:
          'Controls how many bytes of messages are batched together before sending. Larger batches improve throughput but increase latency per message.',
        recommendation:
          'For high-throughput pipelines, increase to 65536 (64 KB) or 131072 (128 KB). For low-latency use cases, keep at default or reduce.',
      },
      {
        name: 'linger.ms',
        default: '0',
        impact:
          'How long the producer waits to accumulate more messages into a batch. A value of 0 means send immediately; higher values let batches fill up.',
        recommendation:
          'Set to 5–20 ms for throughput-oriented workloads. Leave at 0 for real-time/interactive use cases where latency matters most.',
      },
      {
        name: 'compression.type',
        default: 'none',
        impact:
          'Compresses batches before sending. Reduces network and disk I/O at the cost of CPU. Options: none, gzip, snappy, lz4, zstd.',
        recommendation:
          'Use lz4 or snappy for a good balance of speed and compression. Use zstd for best compression ratio when bandwidth is the bottleneck.',
      },
      {
        name: 'acks',
        default: '1',
        impact:
          'How many broker acknowledgements the producer waits for. 0 = fire-and-forget, 1 = leader only, all (-1) = all in-sync replicas.',
        recommendation:
          'Use acks=all for durability (required for idempotent/transactional producers). Use acks=1 only when occasional data loss is acceptable.',
      },
    ],
  },
  {
    title: 'Consumer Performance',
    icon: Download,
    color: '#ff00aa',
    parameters: [
      {
        name: 'fetch.min.bytes',
        default: '1',
        impact:
          'Minimum data the broker must have before responding to a fetch request. Higher values reduce fetch calls but increase latency.',
        recommendation:
          'Increase to 1024–65536 for batch consumers. Keep at 1 for low-latency streaming where every message counts.',
      },
      {
        name: 'fetch.max.wait.ms',
        default: '500',
        impact:
          'Maximum time the broker waits to satisfy fetch.min.bytes before responding. Acts as a cap on latency caused by fetch.min.bytes.',
        recommendation:
          'Tune together with fetch.min.bytes. For low-latency consumers, reduce to 50–100 ms. For batch consumers, 500 ms is reasonable.',
      },
      {
        name: 'max.poll.records',
        default: '500',
        impact:
          'Maximum number of records returned in a single poll() call. Higher values increase throughput but may cause processing timeouts.',
        recommendation:
          'Reduce to 50–100 if your processing logic is slow. Increase to 1000+ for lightweight, fast-processing consumers.',
      },
      {
        name: 'session.timeout.ms',
        default: '45000 (45 s)',
        impact:
          'How long the broker waits before considering a consumer dead if no heartbeat is received. Shorter = faster failure detection, more rebalances.',
        recommendation:
          'Keep at default for most workloads. Increase if consumers do long processing and trigger false rebalances. Must be within group.min/max.session.timeout.ms broker limits.',
      },
    ],
  },
  {
    title: 'Broker Configuration',
    icon: Server,
    color: '#ffaa00',
    parameters: [
      {
        name: 'num.io.threads',
        default: '8',
        impact:
          'Number of threads the broker uses for I/O operations (disk reads/writes). More threads can increase throughput on high-core machines.',
        recommendation:
          'Increase to match or slightly exceed the number of physical disks. Typical range: 8–16 for production brokers with fast SSDs.',
      },
      {
        name: 'log.retention.ms',
        default: '604800000 (7 days)',
        impact:
          'How long Kafka retains log segments. Longer retention increases storage usage but allows consumers more time to catch up.',
        recommendation:
          'Match your SLA for replay and recovery. For event sourcing, increase significantly. For transient pipelines, reduce to 1–24 hours to save disk.',
      },
      {
        name: 'log.segment.bytes',
        default: '1073741824 (1 GB)',
        impact:
          'Maximum size of a single log segment file. Smaller segments allow more frequent compaction and retention checks but create more files.',
        recommendation:
          'Reduce to 256–512 MB on brokers with many partitions to improve retention granularity. Keep at default for brokers with fewer, larger topics.',
      },
      {
        name: 'min.insync.replicas',
        default: '1',
        impact:
          'Minimum number of replicas that must acknowledge a write when acks=all. Protects against silent data loss if replicas fall out of sync.',
        recommendation:
          'Set to 2 for a 3-broker cluster when using acks=all. This ensures at least 2 replicas persist every write, tolerating 1 broker failure.',
      },
    ],
  },
];

/* ─── Component ─── */

export default function OperationalTuningSection() {
  const sectionRef = useRef(null);
  const [expandedParam, setExpandedParam] = useState<string | null>(null);

  useGSAP(
    () => {
      gsap.from(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
      });
    },
    { scope: sectionRef }
  );

  const toggleParam = (id: string) => {
    setExpandedParam((prev) => (prev === id ? null : id));
  };

  return (
    <section id="chapter-12" ref={sectionRef} className="py-20 px-4 md:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-5xl mx-auto">
        <SectionHeader chapter="12" title="Operational Tuning & Configuration" />

        <p className="text-slate-300 mb-8">
          Kafka's defaults are designed for broad compatibility, not peak performance on your specific workload. Before
          tuning, establish a baseline benchmark, identify the bottleneck (CPU, disk, network, or consumer lag), adjust
          one parameter at a time, re-benchmark, and repeat. Changing multiple variables simultaneously makes it
          impossible to understand which knob actually helped.
        </p>

        <div className="space-y-12">
          {tuningCategories.map((category, categoryIndex) => {
            const Icon = category.icon;

            return (
              <div key={categoryIndex}>
                <h3
                  className="text-2xl font-bold flex items-center gap-2 mb-4"
                  style={{ color: category.color }}
                >
                  <Icon size={24} style={{ color: category.color }} />
                  {category.title}
                </h3>

                <div className="space-y-2">
                  {category.parameters.map((param, paramIndex) => {
                    const paramId = `${categoryIndex}-${paramIndex}`;
                    const isExpanded = expandedParam === paramId;

                    return (
                      <div
                        key={paramIndex}
                        className="border border-slate-700 rounded overflow-hidden"
                      >
                        <button
                          onClick={() => toggleParam(paramId)}
                          className="w-full p-4 bg-slate-900 hover:bg-slate-800 transition flex justify-between items-center text-left"
                        >
                          <div>
                            <span className="font-mono font-semibold text-white">{param.name}</span>
                            <span className="ml-3 text-sm text-slate-400">Default: {param.default}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={18} className="text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="p-4 bg-slate-800/50 border-t border-slate-700 space-y-3">
                            <div>
                              <h4 className="text-cyan-400 font-semibold mb-1 text-sm">Impact</h4>
                              <p className="text-slate-300 text-sm leading-relaxed">{param.impact}</p>
                            </div>
                            <div>
                              <h4 className="text-amber-400 font-semibold mb-1 text-sm">Recommendation</h4>
                              <p className="text-slate-300 text-sm leading-relaxed">{param.recommendation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tuning Methodology Callout */}
        <div className="mt-12 bg-blue-900/20 border border-blue-700/40 rounded-lg p-6">
          <h3 className="text-blue-200 font-bold text-lg flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-blue-400" />
            Tuning Methodology
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-200 text-sm">
            <li>Measure baseline — run a representative load test and record throughput, latency p50/p99, and consumer lag.</li>
            <li>Identify the bottleneck — is it producer throughput, consumer lag, broker I/O, network saturation, or CPU?</li>
            <li>Target one parameter — pick the single configuration most likely to address the bottleneck.</li>
            <li>Re-benchmark — run the same load test under identical conditions and compare results.</li>
            <li>Commit if better — if metrics improved without regressing other dimensions, keep the change.</li>
            <li>Repeat — move to the next biggest bottleneck and iterate until targets are met.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
