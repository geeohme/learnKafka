# Kafka Foundations — Interactive Learning App

An interactive, single-page learning experience for Apache Kafka built with React, TypeScript, and Vite. Designed to take developers from zero to production-ready Kafka knowledge through animated sections, interactive quizzes, and real-world code examples.

## What It Covers

The app is structured as a guided course with the following chapters and deep-dive sections:

| Chapter | Topic |
|---|---|
| 1 | Kafka Core Concepts — topics, partitions, brokers, offsets |
| 2 | Producers & Consumers — configuration, consumer groups, rebalancing |
| 3 | Kafka Connect — source/sink connectors, the Connect framework |
| 4 | Kafka Streams — stream processing, KStreams, KTables |
| 5 | Schema Registry & Avro — schema evolution, serialization contracts |
| 6 | Monitoring & Observability — key metrics, consumer lag, alerting |
| 7 | Deployment & Operations — partitioning strategy, retention, scaling |

**Deep Dives:**
- Exactly-Once Semantics (EOS) — idempotent producers, transactions
- Serialization — Avro, Protobuf, JSON Schema trade-offs
- Security — TLS, SASL, ACLs, encryption at rest
- Operational Tuning — throughput vs. latency configuration
- Failure Scenarios — broker failures, network partitions, consumer crashes
- Code Examples — runnable producer/consumer patterns

## Features

- Personalized progress tracking (name prompt, chapter progress saved to localStorage)
- GSAP-powered scroll animations with Lenis smooth scrolling
- Interactive knowledge check quizzes with scoring
- Syntax-highlighted code examples
- Responsive design with a dark, high-contrast aesthetic

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **React Router v7** (client-side routing)
- **Tailwind CSS** + **shadcn/ui** (component library)
- **GSAP** + **Lenis** (animations and smooth scroll)
- **Recharts** (data visualizations)
- Deployed on **Cloudflare Pages**

## Local Development

```bash
cd app
npm install
npm run dev        # starts dev server at http://localhost:3000
npm run build      # production build → dist/
```

## Cloudflare Pages Deployment

| Setting | Value |
|---|---|
| Root directory | `app` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | 22+ |
