import { Github, Twitter } from 'lucide-react';

const chapterLinks = [
  { label: 'Ch 1 — Transaction Streaming', href: '#chapter-1' },
  { label: 'Ch 2 — Kafka Architecture', href: '#chapter-2' },
  { label: 'Ch 3 — Data Ingestion', href: '#chapter-3' },
  { label: 'Ch 4 — CDC with Kafka', href: '#chapter-4' },
  { label: 'Ch 5 — Stream Processing', href: '#chapter-5' },
  { label: 'Ch 6 — Planning Your Journey', href: '#chapter-6' },
  { label: 'Ch 7 — Ten Things to Consider', href: '#chapter-7' },
  { label: 'Knowledge Check', href: '#knowledge-check' },
];

const resourceLinks = [
  { label: 'Apache Kafka', href: 'https://kafka.apache.org/' },
  { label: 'Confluent', href: 'https://www.confluent.io/' },
  { label: 'Kafka Documentation', href: 'https://kafka.apache.org/documentation/' },
  { label: 'ksqlDB', href: 'https://ksqldb.io/' },
];

export default function Footer() {
  const handleClick = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#12121a] pt-24 pb-12">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-1 font-['Syne'] font-bold text-2xl text-[#f0f0ff] mb-2">
              KAFKA
              <span className="w-2 h-2 rounded-full bg-[#00f5ff]" />
            </a>
            <p className="text-[#8a8a9a] text-sm font-['Syne'] mb-4">Foundations</p>
            <p className="text-[#8a8a9a] text-sm leading-relaxed max-w-xs">
              An interactive guide to Apache Kafka fundamentals. Learn data streaming from the ground up.
            </p>
          </div>

          {/* Chapters */}
          <div>
            <h4 className="font-['Syne'] font-semibold text-[#f0f0ff] mb-4">Chapters</h4>
            <ul className="space-y-2.5">
              {chapterLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleClick(link.href)}
                    className="text-[#8a8a9a] hover:text-[#f0f0ff] text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-['Syne'] font-semibold text-[#f0f0ff] mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8a8a9a] hover:text-[#f0f0ff] text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1a1a25] mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[#8a8a9a] text-sm">
          <p>Based on Apache Kafka, Special Edition</p>
          <p>© 2025 Kafka Foundations</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/apache/kafka" target="_blank" rel="noopener noreferrer" className="hover:text-[#00f5ff] transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com/apachekafka" target="_blank" rel="noopener noreferrer" className="hover:text-[#00f5ff] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
