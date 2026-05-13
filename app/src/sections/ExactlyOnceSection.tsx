import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import { Zap, AlertTriangle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Component ─── */

export default function ExactlyOnceSection() {
  const sectionRef = useRef(null);

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
    <section id="chapter-13" ref={sectionRef} className="py-20 px-4 md:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
      <SectionHeader chapter="13" title="Advanced: Exactly-Once Semantics (EOS)" />

      <div className="max-w-4xl mx-auto space-y-10">

        {/* Warning Callout */}
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-5 flex gap-4">
          <AlertTriangle size={22} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-200 font-semibold mb-1">When You Need This</h3>
            <p className="text-amber-200 text-sm leading-relaxed">
              Only mission-critical systems (financial transactions, inventory management, payment processing) require
              exactly-once. Most applications tolerate at-least-once delivery with idempotent processing. Exactly-once
              adds complexity and latency — only reach for it when duplicate messages cause real business harm.
            </p>
          </div>
        </div>

        {/* Subsection A: Producer-Side */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={22} className="text-cyan-400" />
            Producer-Side: Idempotent Producers
          </h2>
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              When a producer sends a message and the broker acknowledgement is lost (network timeout), the producer
              retries — potentially writing the same message twice. Without idempotence, you get duplicate records.
            </p>

            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Producer Config</p>
              <code className="block bg-slate-900 p-3 rounded text-xs text-slate-300 font-mono">
                enable.idempotence=true
              </code>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Mechanism</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Kafka assigns each producer a unique <span className="bg-slate-900 px-2 py-1 rounded text-xs font-mono">Producer ID</span> and
                tracks a per-partition <span className="bg-slate-900 px-2 py-1 rounded text-xs font-mono">sequence number</span> for every message.
                The broker deduplicates retries by rejecting messages whose sequence number it has already seen.
              </p>
            </div>

            <div className="border-t border-slate-700 pt-3">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">Trade-off</p>
              <p className="text-slate-300 text-sm">
                Slight latency increase but eliminates producer-side duplicates.
              </p>
            </div>
          </div>
        </div>

        {/* Subsection B: Consumer-Side */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={22} className="text-cyan-400" />
            Consumer-Side: Transactional Reads
          </h2>
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              Consumers commit offsets periodically. If a consumer crashes between processing a message and committing
              its offset, the message will be re-delivered on restart — potentially processed twice. Transactional reads
              prevent consumers from reading uncommitted (in-flight) records written by transactional producers.
            </p>

            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Consumer Config</p>
              <code className="block bg-slate-900 p-3 rounded text-xs text-slate-300 font-mono">
                isolation.level=read_committed
              </code>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Mechanism</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                With <span className="bg-slate-900 px-2 py-1 rounded text-xs font-mono">read_committed</span>, the consumer only
                reads records that have been fully committed by their transactional producer — it never sees messages
                from aborted or in-progress transactions.
              </p>
            </div>

            <div className="border-t border-slate-700 pt-3">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">Trade-off</p>
              <p className="text-slate-300 text-sm">
                Can't read latest offset until committed, adding latency.
              </p>
            </div>
          </div>
        </div>

        {/* Subsection C: End-to-End */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={22} className="text-cyan-400" />
            End-to-End Exactly-Once
          </h2>
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              True end-to-end exactly-once requires combining both sides: enable idempotent producers so broker-side
              deduplication catches retries, and set <span className="bg-slate-900 px-2 py-1 rounded text-xs font-mono">isolation.level=read_committed</span> so
              consumers never observe partial transactions. But there's a third requirement that Kafka cannot enforce
              for you: your <strong className="text-white">application logic must be idempotent</strong>.
            </p>

            <p className="text-slate-300 text-sm leading-relaxed">
              Idempotent application logic means the same input always produces the same output with no side effects
              from repetition. If Kafka delivers a message twice (before EOS is fully configured, or across system
              boundaries), your code should produce the same result as if it had only run once.
            </p>

            {/* Green callout: SQL example */}
            <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
              <h4 className="text-green-300 font-semibold mb-2 text-sm">Example: Idempotent SQL Update</h4>
              <p className="text-green-200 text-xs mb-3 leading-relaxed">
                Track the last processed record ID and make re-processing a no-op — if the record was already applied,
                the <span className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">WHERE</span> clause silently skips it.
              </p>
              <pre className="bg-slate-900 p-3 rounded text-xs text-slate-300 font-mono overflow-x-auto">{`-- Only update if this txn_id hasn't been applied yet
UPDATE account_balances
SET balance = balance - :amount,
    last_processed_txn_id = :txn_id
WHERE account_id = :account_id
  AND last_processed_txn_id != :txn_id;
-- If txn_id already matches, zero rows are updated — safe no-op`}</pre>
            </div>
          </div>
        </div>

        {/* Exactly-Once Checklist */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-5">
          <h3 className="text-white font-bold text-lg mb-4">Exactly-Once Checklist</h3>
          <ul className="space-y-2 text-sm">
            {[
              <>Enable <code className="bg-slate-900 px-2 py-1 rounded text-xs font-mono">enable.idempotence=true</code> on all producers</>,
              <>Set <code className="bg-slate-900 px-2 py-1 rounded text-xs font-mono">isolation.level=read_committed</code> on all consumers</>,
              <>Make application logic idempotent (same input = same output, always)</>,
              <>Use distributed transactions if coordinating writes across multiple external systems</>,
              <>Monitor end-to-end latency — EOS adds overhead; set SLO alerts before rollout</>,
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300">
                <span className="text-cyan-400 font-bold flex-shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
