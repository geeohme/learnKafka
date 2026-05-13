import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import CodeBlock from '@/components/CodeBlock';
import { FileJson, Database, Code2, CheckCircle2, AlertTriangle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Type Definitions ─── */

interface SerializationFormat {
  name: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  size: string;
  schemaEvolution: string;
  speed: string;
  use: string;
  pros: string[];
  cons: string[];
  example: string;
}

interface SchemaEvolutionRule {
  change: string;
  backward: string;
  forward: string;
  impact: string;
  example: string;
}

/* ─── Data Constants ─── */

const serializationFormats: SerializationFormat[] = [
  {
    name: 'JSON',
    icon: FileJson,
    size: '~150 bytes per record',
    schemaEvolution: 'No built-in schema; producers and consumers must agree independently',
    speed: 'Slow — text parsing overhead',
    use: 'Development, debugging, human-readable logs',
    pros: [
      'Human-readable',
      'Language-agnostic',
      'Easy to debug',
      'No schema registry required'
    ],
    cons: [
      'Large payload size',
      'Slow serialization/deserialization',
      'No schema enforcement',
      'Easy to introduce breaking changes'
    ],
    example: `{
  "txn_id": "12345",
  "amount": 99.99,
  "timestamp": 1620000000
}`,
  },
  {
    name: 'Avro',
    icon: Database,
    size: '~50 bytes per record',
    schemaEvolution: 'Built-in; schema evolution rules ensure forward/backward compatibility',
    speed: 'Fast — binary serialization with schema caching',
    use: 'Production pipelines, Confluent ecosystem, CDC',
    pros: [
      'Compact binary format',
      'Schema versioning & evolution',
      'Language-independent codegen',
      'Widely used in enterprise Kafka'
    ],
    cons: [
      'Requires schema registry',
      'Learning curve (schema definition)',
      'Not human-readable',
      'Couples to Avro schema'
    ],
    example: `{
  "type": "record",
  "name": "Transaction",
  "fields": [
    {"name": "txn_id", "type": "string"},
    {"name": "amount", "type": "double"},
    {"name": "timestamp", "type": "long"}
  ]
}`,
  },
  {
    name: 'Protobuf',
    icon: Code2,
    size: '~40 bytes per record',
    schemaEvolution: 'Excellent; backward/forward compatible by design',
    speed: 'Fast — binary, more efficient than Avro',
    use: 'gRPC services, high-volume real-time streams',
    pros: [
      'Most compact format',
      'Superior schema evolution',
      'Excellent performance',
      'Native gRPC integration'
    ],
    cons: [
      'Requires schema registry & compiler',
      'Steeper learning curve',
      'Less mature Kafka integration than Avro',
      'Not readable without decoder'
    ],
    example: `syntax = "proto3";

message Transaction {
  string txn_id = 1;
  double amount = 2;
  int64 timestamp = 3;
}`,
  },
];

const schemaEvolutionRules: SchemaEvolutionRule[] = [
  {
    change: 'Add optional field',
    backward: 'YES',
    forward: 'YES',
    impact: 'Old producers (no new field) work with new consumers (have default). New producers work with old consumers (they ignore new field).',
    example: 'Add "status: string = \'pending\'" to Transaction schema'
  },
  {
    change: 'Remove field',
    backward: 'NO',
    forward: 'YES',
    impact: 'Old producers (include field) fail with new consumers (field gone). New producers work with old consumers.',
    example: 'Remove deprecated "legacy_id" field'
  },
  {
    change: 'Change field type',
    backward: 'NO',
    forward: 'NO',
    impact: 'Breaking — old and new code incompatible. Requires coordination or dual-write.',
    example: 'Change "amount: double" to "amount: int" — loses precision'
  },
];

/* ─── Component ─── */

export default function SerializationDeepDiveSection() {
  const sectionRef = useRef(null);
  const [selectedFormat, setSelectedFormat] = useState(0);

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

  const format = serializationFormats[selectedFormat];
  const Icon = format.icon;

  return (
    <section id="chapter-10" ref={sectionRef} className="py-20 px-4 md:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
      <SectionHeader chapter="10" title="Serialization & Schema Evolution" />

      <div className="max-w-5xl mx-auto mt-12 space-y-12">
        {/* Serialization Formats Subsection */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8">Serialization Formats</h2>

          {/* Format Selection Buttons */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {serializationFormats.map((fmt, idx) => {
              const isActive = idx === selectedFormat;
              const FormatIcon = fmt.icon;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFormat(idx)}
                  className={`p-4 rounded-lg border transition-all duration-200 flex items-center gap-3 ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                      : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <FormatIcon size={20} />
                  <span className="font-semibold">{fmt.name}</span>
                </button>
              );
            })}
          </div>

          {/* Format Details Panel */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6 mb-8">
            {/* Header with Icon and Name */}
            <div className="flex items-center gap-3 pb-6 border-b border-slate-700">
              <Icon size={32} className="text-cyan-400" />
              <div>
                <h3 className="text-2xl font-bold text-white">{format.name}</h3>
                <p className="text-slate-400 text-sm">{format.size}</p>
              </div>
            </div>

            {/* Key Characteristics */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-amber-400 font-semibold mb-2 text-sm">Speed</h4>
                <p className="text-slate-300 text-sm">{format.speed}</p>
              </div>
              <div>
                <h4 className="text-blue-400 font-semibold mb-2 text-sm">Common Use</h4>
                <p className="text-slate-300 text-sm">{format.use}</p>
              </div>
            </div>

            {/* Pros Section */}
            <div className="pt-4">
              <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} />
                Advantages
              </h4>
              <ul className="space-y-2">
                {format.pros.map((pro, idx) => (
                  <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons Section */}
            <div className="pt-4">
              <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Disadvantages
              </h4>
              <ul className="space-y-2">
                {format.cons.map((con, idx) => (
                  <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Schema Evolution & Use Case */}
            <div className="border-t border-slate-700 pt-6 space-y-4">
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm">Schema Evolution</h4>
                <p className="text-slate-300 text-sm">{format.schemaEvolution}</p>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <CodeBlock
            examples={[
              {
                language: format.name,
                code: format.example,
              },
            ]}
            title={`${format.name} Example`}
          />
        </div>

        {/* Schema Evolution Rules Subsection */}
        <div className="pt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Schema Evolution Rules</h2>
          <p className="text-slate-300 mb-8 max-w-3xl">
            When you modify your schema, compatibility depends on the direction of change. Here are the key rules:
          </p>

          {/* Rules Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-600 bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-cyan-400 font-semibold text-sm">Change</th>
                  <th className="px-4 py-3 text-center text-cyan-400 font-semibold text-sm">Backward?</th>
                  <th className="px-4 py-3 text-center text-cyan-400 font-semibold text-sm">Forward?</th>
                  <th className="px-4 py-3 text-left text-cyan-400 font-semibold text-sm">Impact</th>
                </tr>
              </thead>
              <tbody>
                {schemaEvolutionRules.map((rule, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/30 transition">
                    <td className="px-4 py-4 text-slate-300 text-sm font-medium">{rule.change}</td>
                    <td className="px-4 py-4 text-center">
                      {rule.backward === 'YES' ? (
                        <span className="inline-flex items-center gap-1 text-green-400 font-semibold">
                          <CheckCircle2 size={16} />
                          YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                          <AlertTriangle size={16} />
                          NO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {rule.forward === 'YES' ? (
                        <span className="inline-flex items-center gap-1 text-green-400 font-semibold">
                          <CheckCircle2 size={16} />
                          YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                          <AlertTriangle size={16} />
                          NO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-300 text-sm">{rule.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Schema Registry Callout */}
          <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-6">
            <h3 className="text-blue-300 font-semibold mb-2">Schema Registry as Your Safety Net</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Avro and Protobuf schemas should be stored in a Schema Registry (Confluent Schema Registry, AWS Glue, etc.).
              The registry enforces compatibility rules, prevents breaking changes, and maintains a versioned history of your
              schemas. Always validate schema changes against your compatibility mode (BACKWARD, FORWARD, or FULL) before
              deploying to production.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
