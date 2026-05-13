import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from '@/components/SectionHeader';
import { Lock, Shield, KeyRound, HardDrive, AlertTriangle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Type Definitions ─── */

interface Mechanism {
  name: string;
  desc: string;
}

interface SecurityTopic {
  title: string;
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  color: string;
  description: string;
  mechanisms: Mechanism[];
}

/* ─── Data Constants ─── */

const securityTopics: SecurityTopic[] = [
  {
    title: 'Authentication',
    icon: Lock,
    color: '#00f5ff',
    description: 'Verify producer and consumer identity',
    mechanisms: [
      {
        name: 'SASL/PLAIN',
        desc: 'Username and password authentication over a secure channel. Simple to configure but credentials are sent in plaintext — requires TLS.',
      },
      {
        name: 'SASL/SCRAM',
        desc: 'Challenge-response protocol that hashes credentials. More secure than PLAIN; credentials are never sent directly.',
      },
      {
        name: 'OAuth 2.0',
        desc: 'Token-based authentication via an external identity provider. Enables short-lived tokens and centralised credential management.',
      },
    ],
  },
  {
    title: 'Encryption in Transit',
    icon: Shield,
    color: '#ff00aa',
    description: 'Protect data between clients and brokers',
    mechanisms: [
      {
        name: 'TLS/SSL',
        desc: 'Encrypts all data in transit between clients and brokers. Configure listeners with SSL protocol and provide keystores and truststores.',
      },
      {
        name: 'Client Certificates',
        desc: 'Mutual TLS (mTLS) where both the broker and client present certificates. Provides strong two-way authentication alongside encryption.',
      },
    ],
  },
  {
    title: 'Authorization (ACLs)',
    icon: KeyRound,
    color: '#ffaa00',
    description: 'Control who can do what with topics and clusters',
    mechanisms: [
      {
        name: 'Kafka ACLs',
        desc: 'Fine-grained access control lists on topics, consumer groups, and cluster operations. Managed via kafka-acls.sh or the AdminClient API.',
      },
      {
        name: 'Role-Based Access',
        desc: 'Group permissions into roles (e.g. producer, consumer, admin) and assign principals to roles. Simplifies management at scale.',
      },
    ],
  },
  {
    title: 'Encryption at Rest',
    icon: HardDrive,
    color: '#00f5ff',
    description: 'Protect data on disk',
    mechanisms: [
      {
        name: 'OS/Filesystem Encryption',
        desc: 'Encrypt the broker data directory using dm-crypt/LUKS (Linux) or equivalent. Transparent to Kafka — no broker configuration needed.',
      },
      {
        name: 'Broker-Level Encryption',
        desc: 'Encrypt message payloads before writing to disk. Requires producer-side encryption or a custom storage plugin for key management.',
      },
    ],
  },
];

const checklistItems = [
  'Enable SASL/SCRAM or OAuth',
  'Enforce TLS/SSL',
  'Define and test ACL rules',
  'Encrypt storage',
  'Rotate credentials and certificates',
  'Monitor unauthorized access attempts',
];

/* ─── Component ─── */

export default function SecuritySection() {
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
    <section
      id="chapter-11"
      ref={sectionRef}
      className="py-20 px-4 md:px-8 bg-gradient-to-b from-slate-950 to-slate-900"
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeader chapter="11" title="Security Considerations" />

        {/* Production Warning Callout */}
        <div className="mb-12 flex items-start gap-4 rounded-lg border border-red-700/40 bg-red-900/20 p-5">
          <AlertTriangle size={24} className="flex-shrink-0 mt-0.5 text-red-400" />
          <div>
            <h3 className="font-bold text-red-400 mb-1">Production Requirement</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              All production Kafka deployments must implement authentication, encryption in transit,
              and ACLs. Running without these controls exposes your cluster to unauthorised access,
              data interception, and compliance violations.
            </p>
          </div>
        </div>

        {/* Security Topics */}
        <div className="grid gap-10 md:grid-cols-2">
          {securityTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <div key={topic.title}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={28} style={{ color: topic.color }} />
                  <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">{topic.description}</p>

                <div className="space-y-3">
                  {topic.mechanisms.map((mechanism) => (
                    <div
                      key={mechanism.name}
                      className="rounded bg-slate-800/40 border border-slate-700 p-4"
                    >
                      <p className="font-semibold text-slate-200 mb-1">{mechanism.name}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{mechanism.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Checklist */}
        <div className="mt-14 rounded-lg border border-slate-700 bg-slate-800/30 p-8">
          <h3 className="text-lg font-bold text-white mb-5">Security Checklist</h3>
          <ul className="space-y-2">
            {checklistItems.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-cyan-400 font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
