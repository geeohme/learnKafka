import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import { AlertTriangle, TrendingUp, Zap, RefreshCw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Type Definitions ─── */

interface ScenarioCard {
  title: string;
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties; className?: string }>;
  color: string;
  problem: string;
  kafkaResponse: string;
  userAction: string;
}

/* ─── Data Constants ─── */

const failureScenarios: ScenarioCard[] = [
  {
    title: 'Broker Failure',
    icon: AlertTriangle,
    color: '#ff4444',
    problem: 'One broker in a 3-broker cluster crashes. Clients trying to write to partitions on that broker fail.',
    kafkaResponse: 'The cluster detects the broker is down. In-sync replicas (ISR) of partitions on the dead broker promote a replica to leader. Producers retry their sends and succeed on the new leader. Consumers pick up processing without data loss.',
    userAction: 'Monitor broker health via JMX metrics. Restart the failed broker when ready — it rejoins the cluster and re-syncs data.',
  },
  {
    title: 'Consumer Lag',
    icon: TrendingUp,
    color: '#ffaa00',
    problem: 'A slow consumer group falls behind. Offset commits lag by 10 minutes; real-time alerting is now delayed.',
    kafkaResponse: 'Kafka stores offsets in __consumer_offsets. The consumer continues retrying, but the lag grows. No data is lost — it persists on disk (default 7 days). The consumer will eventually catch up.',
    userAction: 'Monitor consumer lag via lag metrics. Increase consumer threads or parallelism. If critical, scale the consumer group (add more instances).',
  },
  {
    title: 'Producer Timeout',
    icon: Zap,
    color: '#00f5ff',
    problem: 'A producer sends a message but the broker does not acknowledge within request.timeout.ms (30s default). The producer raises an exception.',
    kafkaResponse: 'The send fails with a timeout error. If the message was actually written (broker slow, not crashed), retrying risks duplication. The producer must decide: retry with deduplication enabled (idempotent producer) or fail.',
    userAction: 'Catch the timeout exception. Log it. For idempotent producers (enable.idempotence=true), retry safely. For others, decide: retry or fail fast.',
  },
  {
    title: 'Rebalancing',
    icon: RefreshCw,
    color: '#ff00aa',
    problem: 'A new consumer joins the group. All consumers stop, revoke their partitions, rejoin, and rebalance (pause ~5-10s).',
    kafkaResponse: 'The group coordinator detects the join. All consumers pause at their offsets, rejoin with new assignment, and resume. Messages between revoke and resume may be re-processed (depends on commit strategy).',
    userAction: 'Monitor rebalancing time via metrics. Tune session.timeout.ms (longer = slower detection, fewer false rebalances). Ensure consumers handle duplicates (idempotent processing).',
  },
];

/* ─── Component ─── */

export default function FailureScenariosSection() {
  const sectionRef = useRef(null);
  const [expandedId, setExpandedId] = useState<number | null>(0);

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

  return (
    <section id="chapter-9" ref={sectionRef} className="py-20 px-4 md:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
      <SectionHeader chapter="09" title="Failure Scenarios & Recovery" />

      <div className="max-w-4xl mx-auto mt-12 space-y-4">
        <p className="text-slate-300 mb-8">
          Real-world Kafka deployments will encounter failures. Here's what happens and how to respond:
        </p>

        {failureScenarios.map((scenario, idx) => {
          const Icon = scenario.icon;
          const isExpanded = expandedId === idx;

          return (
            <div
              key={idx}
              className="border border-slate-700 rounded-lg overflow-hidden transition hover:border-slate-600"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : idx)}
                className="w-full p-6 flex items-start gap-4 bg-slate-900 hover:bg-slate-800 transition"
              >
                <Icon size={24} style={{ color: scenario.color }} className="flex-shrink-0 mt-1" />
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-white">{scenario.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{scenario.problem}</p>
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 bg-slate-800/50 border-t border-slate-700 space-y-4">
                  <div>
                    <h4 className="text-cyan-400 font-semibold mb-2">How Kafka Responds</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{scenario.kafkaResponse}</p>
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-semibold mb-2">What You Should Do</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{scenario.userAction}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
