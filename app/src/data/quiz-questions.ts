export interface Question {
  id: string;
  chapter: string;
  chapterNum: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'concept' | 'scenario' | 'code';
}

export const quizQuestions: Question[] = [
  // ===== CHAPTER 1 (3 existing + 2 new) =====
  {
    id: 'ch1-q1',
    chapter: 'Understanding Transaction Streaming',
    chapterNum: 1,
    question: 'What are the three characteristics of a data stream?',
    options: [
      'Bounded, periodic, fixed sizes',
      'Unbounded, sporadic, varying sizes',
      'Bounded, continuous, ordered',
      'Finite, scheduled, uniform',
    ],
    correctIndex: 1,
    explanation: 'Data streams are unbounded (never-ending), sporadic (arriving at irregular intervals), and vary in size (individual records differ in payload).',
    difficulty: 'beginner',
    type: 'concept',
  },
  {
    id: 'ch1-q2',
    chapter: 'Understanding Transaction Streaming',
    chapterNum: 1,
    question: 'Which of these is NOT typically considered transaction data?',
    options: [
      'INSERT operations',
      'UPDATE operations',
      'READ operations',
      'DELETE operations',
    ],
    correctIndex: 2,
    explanation: 'READ operations are queries, not mutations. Transaction data consists of INSERT, UPDATE, DELETE, and DDL statements that change the database state.',
    difficulty: 'beginner',
    type: 'concept',
  },
  {
    id: 'ch1-q3',
    chapter: 'Understanding Transaction Streaming',
    chapterNum: 1,
    question: 'What is the main limitation of traditional batch processing for modern data?',
    options: [
      'It requires too much storage',
      'It cannot support real-time and continuous changes',
      'It only works with small datasets',
      'It lacks encryption support',
    ],
    correctIndex: 1,
    explanation: 'Batch processing processes data in scheduled windows, which means it cannot support real-time use cases that require immediate reactions to continuous changes.',
    difficulty: 'beginner',
    type: 'concept',
  },
  {
    id: 'ch1-q4',
    chapter: 'Understanding Transaction Streaming',
    chapterNum: 1,
    question: 'You receive 10,000 IoT sensor readings per second. Which data characteristic makes this a streaming use case?',
    options: [
      'Data is bounded and pre-defined',
      'Data is unbounded and continuous',
      'Data arrives in scheduled batches',
      'Data is write-once, never updated',
    ],
    correctIndex: 1,
    explanation: 'IoT sensors produce continuous, unbounded streams of data. Batch processing would introduce unacceptable latency; streaming is required.',
    difficulty: 'intermediate',
    type: 'scenario',
  },
  {
    id: 'ch1-q5',
    chapter: 'Understanding Transaction Streaming',
    chapterNum: 1,
    question: 'A fraud detection system needs to flag suspicious transactions within 100ms of detection. Why is streaming essential?',
    options: [
      'Streaming reduces storage costs',
      'Streaming allows processing to happen as data arrives, enabling sub-second response',
      'Streaming eliminates the need for databases',
      'Streaming is the only way to store transactions',
    ],
    correctIndex: 1,
    explanation: 'Streaming processes records as they arrive, enabling millisecond-level reactions. Batch processing (hours/days) would miss the fraud opportunity.',
    difficulty: 'intermediate',
    type: 'scenario',
  },

  // ===== CHAPTER 2 (3 existing + 3 new) =====
  {
    id: 'ch2-q1',
    chapter: 'Kafka Architecture',
    chapterNum: 2,
    question: 'What is the smallest unit of data in Kafka?',
    options: ['Topic', 'Partition', 'Record', 'Broker'],
    correctIndex: 2,
    explanation: "A record is the base unit of Kafka's data log structure. One or more interrelated records constitutes a database transaction.",
    difficulty: 'beginner',
    type: 'concept',
  },
  {
    id: 'ch2-q2',
    chapter: 'Kafka Architecture',
    chapterNum: 2,
    question: 'What ensures that records with the same key maintain order?',
    options: [
      'The broker timestamp',
      'They always land in the same partition',
      'The consumer group coordination',
      'The schema registry',
    ],
    correctIndex: 1,
    explanation: 'Kafka guarantees ordering within a single partition. By hashing the key to a partition, all records with the same key are written to the same partition and remain ordered.',
    difficulty: 'beginner',
    type: 'concept',
  },
  {
    id: 'ch2-q3',
    chapter: 'Kafka Architecture',
    chapterNum: 2,
    question: 'Where are consumer group offsets stored in modern Kafka?',
    options: [
      'In ZooKeeper',
      'In the broker memory',
      'In a Kafka topic (__consumer_offsets)',
      'In the producer logs',
    ],
    correctIndex: 2,
    explanation: 'Since Kafka 0.10, offsets are stored durably in the __consumer_offsets internal topic, not ZooKeeper. This enables better scalability and reliability.',
    difficulty: 'beginner',
    type: 'concept',
  },
  {
    id: 'ch2-q4',
    chapter: 'Kafka Architecture',
    chapterNum: 2,
    question: 'You have a topic with 6 partitions and 3 consumers in a group. How many partitions will each consumer read?',
    options: [
      '6 partitions per consumer',
      '3 partitions per consumer',
      '2 partitions per consumer',
      '1 partition per consumer',
    ],
    correctIndex: 2,
    explanation: 'Kafka divides partitions evenly: 6 partitions / 3 consumers = 2 partitions per consumer. Each partition is assigned to exactly one consumer in the group.',
    difficulty: 'intermediate',
    type: 'scenario',
  },
  {
    id: 'ch2-q5',
    chapter: 'Kafka Architecture',
    chapterNum: 2,
    question: 'A consumer joins an existing consumer group reading from a 4-partition topic. What happens?',
    options: [
      'The new consumer immediately starts reading all 4 partitions',
      'A rebalancing occurs; all consumers pause, revoke partitions, and re-assign',
      'The existing consumers are stopped permanently',
      'Kafka rejects the join request',
    ],
    correctIndex: 1,
    explanation: 'Rebalancing ensures fair partition distribution. All consumers pause, offsets are committed, the coordinator assigns new partitions, and consumers resume. This pause may cause latency (~5-10s).',
    difficulty: 'intermediate',
    type: 'scenario',
  },

  // ===== CHAPTER 3 (2 existing + 1 new) =====
  {
    id: 'ch3-q1',
    chapter: 'Kafka Connect & CDC',
    chapterNum: 3,
    question: "Which CDC method requires reading the database's transaction log directly?",
    options: [
      'Trigger-based CDC',
      'Query-based CDC',
      'Log-based CDC',
      'File-based CDC',
    ],
    correctIndex: 2,
    explanation: 'Log-based CDC reads the database transaction log (e.g., PostgreSQL WAL, MySQL binlog). It has minimal impact and provides near real-time delivery.',
    difficulty: 'beginner',
    type: 'concept',
  },
  {
    id: 'ch3-q2',
    chapter: 'Kafka Connect & CDC',
    chapterNum: 3,
    question: 'A trigger-based CDC system adds significant load to your database. Which alternative is more performant?',
    options: [
      'Add more triggers',
      'Switch to query-based CDC',
      'Switch to log-based CDC',
      'Disable CDC entirely',
    ],
    correctIndex: 2,
    explanation: "Log-based CDC reads logs directly without adding query load or triggers. It's the recommended production approach for high-volume databases.",
    difficulty: 'intermediate',
    type: 'scenario',
  },
  {
    id: 'ch3-q3',
    chapter: 'Kafka Connect & CDC',
    chapterNum: 3,
    question: 'You deploy a Kafka Connect source connector that fails every 10 minutes. How should you respond?',
    options: [
      'Immediately restart the entire cluster',
      'Check the connector logs, identify the root cause, fix the config, redeploy',
      'Manually copy data instead of using Connect',
      'Increase the broker memory',
    ],
    correctIndex: 1,
    explanation: "Kafka Connect tracks connector health via REST API status endpoints. Check logs for errors (e.g., connection refused, schema mismatch), fix the config, and redeploy. Restarting doesn't address the root cause.",
    difficulty: 'intermediate',
    type: 'scenario',
  },

  // ===== CHAPTER 4 (2 existing + 1 new) =====
  {
    id: 'ch4-q1',
    chapter: 'Topics, Partitions & Serialization',
    chapterNum: 4,
    question: 'You want all orders from customer_id=42 to land in the same partition for consistent processing. What should you use as the partition key?',
    options: [
      'The topic name',
      'The customer_id',
      'A random UUID',
      'The current timestamp',
    ],
    correctIndex: 1,
    explanation: 'Using customer_id as the key ensures all records for that customer hash to the same partition, maintaining order and enabling stateful, customer-level processing.',
    difficulty: 'intermediate',
    type: 'scenario',
  },
  {
    id: 'ch4-q2',
    chapter: 'Topics, Partitions & Serialization',
    chapterNum: 4,
    question: 'Adding a new field to your Avro schema as optional. Is this backward compatible?',
    options: [
      'No, old producers will fail',
      'No, new consumers will fail',
      'Yes, old producers and new consumers coexist',
      'It depends on the field type',
    ],
    correctIndex: 2,
    explanation: 'Adding an optional field is backward compatible. Old producers omit it (new consumer uses default); new producers include it (old consumer ignores it).',
    difficulty: 'intermediate',
    type: 'concept',
  },
  {
    id: 'ch4-q3',
    chapter: 'Topics, Partitions & Serialization',
    chapterNum: 4,
    question: 'You need to partition transactions by country for data residency. What partitioning strategy minimizes hot partitions?',
    options: [
      'Use country as the key (e.g., "US", "EU")',
      'Use transaction_id as the key',
      'Use country + random suffix as the key (e.g., "US-001", "US-002")',
      'Use a round-robin strategy',
    ],
    correctIndex: 2,
    explanation: 'If you use only the country, one partition may receive all US transactions (hot partition). Adding a suffix (random or modulo) distributes US transactions across multiple partitions while preserving data residency logic.',
    difficulty: 'advanced',
    type: 'scenario',
  },

  // ===== CHAPTER 5 (1 existing + 3 new) =====
  {
    id: 'ch5-q1',
    chapter: 'Stream Processing',
    chapterNum: 5,
    question: 'What is the stream-table duality?',
    options: [
      'Streams and tables are the same thing',
      'A stream is an unbounded, append-only log; a table is a snapshot at a point in time',
      'Tables can never be created from streams',
      'Streams are faster than tables',
    ],
    correctIndex: 1,
    explanation: 'The duality states that a stream of INSERT/UPDATE/DELETE is equivalent to the final state (table). Replaying the stream from the beginning reconstructs the table.',
    difficulty: 'intermediate',
    type: 'concept',
  },
  {
    id: 'ch5-q2',
    chapter: 'Stream Processing',
    chapterNum: 5,
    question: "Which window type is best for analyzing a user's browsing session (with gaps between clicks)?",
    options: [
      'Tumbling window (fixed 10-minute windows)',
      'Hopping window (5-minute windows, 1-minute advance)',
      'Session window (30-second timeout)',
      'All are equally suitable',
    ],
    correctIndex: 2,
    explanation: 'Session windows close when no activity occurs for a timeout (e.g., 30 seconds). This naturally captures a user session, unlike fixed-duration windows that may split sessions.',
    difficulty: 'intermediate',
    type: 'scenario',
  },
  {
    id: 'ch5-q3',
    chapter: 'Stream Processing',
    chapterNum: 5,
    question: 'You count page views per URL in a Tumbling window. A record arrives 5 minutes late. Where does it go?',
    options: [
      'It updates the window it should have belonged to',
      'It creates a new late window',
      'It is dropped or sent to a side-output',
      'It updates all windows equally',
    ],
    correctIndex: 2,
    explanation: "By default, Tumbling windows close and don't accept late data. Late arrivals are dropped or routed to a separate side-output for separate handling (e.g., backfill or alerting).",
    difficulty: 'advanced',
    type: 'concept',
  },
  {
    id: 'ch5-q4',
    chapter: 'Stream Processing',
    chapterNum: 5,
    question: 'In KSQL, you want to build a materialized view of active users. What do you create?',
    options: [
      'A STREAM',
      'A TABLE via GROUP BY and EMIT CHANGES',
      'A CONNECTOR',
      'A topic',
    ],
    correctIndex: 1,
    explanation: 'KSQL TABLE materializes a grouped aggregation (e.g., SELECT user_id, COUNT(*) FROM clicks GROUP BY user_id EMIT CHANGES). EMIT CHANGES pushes updates to a changelog topic, enabling real-time state access.',
    difficulty: 'intermediate',
    type: 'code',
  },

  // ===== CHAPTER 6 (1 existing + 1 new) =====
  {
    id: 'ch6-q1',
    chapter: 'Best Practices',
    chapterNum: 6,
    question: 'What is the first step when designing a streaming data pipeline?',
    options: [
      'Choose a database',
      'Set up a Kafka cluster',
      'Document the data model, topic structure, and SLAs',
      'Start writing consumer code',
    ],
    correctIndex: 2,
    explanation: 'Good design starts with planning: what data flows, how should it be partitioned, what are SLAs (latency, availability)? This informs schema, partitioning, and deployment decisions.',
    difficulty: 'beginner',
    type: 'concept',
  },
  {
    id: 'ch6-q2',
    chapter: 'Best Practices',
    chapterNum: 6,
    question: 'You monitor a consumer group and see lag increasing daily. What is the most likely cause?',
    options: [
      'The producers are broken',
      'The consumer is processing slower than data is being produced',
      'The topic has too many partitions',
      'Kafka is running out of disk space',
    ],
    correctIndex: 1,
    explanation: 'Lag = (latest offset) - (consumer offset). Rising lag means the consumer cannot keep up with the producer. Scale the consumer (more instances) or optimize processing logic.',
    difficulty: 'intermediate',
    type: 'scenario',
  },

  // ===== CHAPTER 7 (1 existing + 1 new) =====
  {
    id: 'ch7-q1',
    chapter: 'Deployment Options',
    chapterNum: 7,
    question: 'Which deployment model eliminates operational overhead but includes usage-based pricing?',
    options: [
      'Self-managed on-premise',
      'Open-source DIY',
      'Fully managed (Confluent Cloud)',
      'Hybrid',
    ],
    correctIndex: 2,
    explanation: 'Confluent Cloud is fully managed — you pay based on throughput, storage, and connections. It removes cluster operations, patching, and scaling decisions.',
    difficulty: 'beginner',
    type: 'concept',
  },
  {
    id: 'ch7-q2',
    chapter: 'Deployment Options',
    chapterNum: 7,
    question: 'Your organization requires data to remain on-premise for compliance. Which deployment model fits?',
    options: [
      'Confluent Cloud',
      'AWS MSK',
      'Self-managed Kafka on your own infrastructure',
      'Confluent Platform (managed)',
    ],
    correctIndex: 2,
    explanation: "Self-managed Kafka on your own infrastructure gives full control over data location. Managed cloud services (MSK, Confluent Cloud) may not meet on-premise requirements.",
    difficulty: 'intermediate',
    type: 'scenario',
  },
];

export function getQuestionsByChapter(chapterNum: number): Question[] {
  return quizQuestions.filter((q) => q.chapterNum === chapterNum);
}

export function getQuestionsByDifficulty(difficulty: string): Question[] {
  return quizQuestions.filter((q) => q.difficulty === difficulty);
}
