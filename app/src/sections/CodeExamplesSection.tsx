import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CodeBlock from '@/components/CodeBlock';
import { Code } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Producer Examples ─── */

const producerExamples = [
  {
    language: 'Python (confluent-kafka)',
    code: `from confluent_kafka import Producer
import json

producer = Producer({
    'bootstrap.servers': 'localhost:9092',
    'client.id': 'transaction-producer'
})

def delivery_callback(err, msg):
    if err:
        print(f'ERROR: {err}')
    else:
        print(f'Delivered to partition {msg.partition()} at offset {msg.offset()}')

# Produce a transaction record
transaction = {
    'txn_id': '12345',
    'amount': 99.99,
    'timestamp': 1620000000
}

producer.produce(
    topic='transactions',
    key=str(transaction['txn_id']),
    value=json.dumps(transaction),
    callback=delivery_callback
)

producer.flush()  # Wait for delivery
`,
  },
  {
    language: 'Java (kafka-clients)',
    code: `import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.*;

Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", StringSerializer.class.getName());
props.put("value.serializer", StringSerializer.class.getName());
props.put("client.id", "transaction-producer");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

String txnId = "12345";
String txnValue = "{\\"txn_id\\":\\"12345\\",\\"amount\\":99.99}";

ProducerRecord<String, String> record =
    new ProducerRecord<>("transactions", txnId, txnValue);

producer.send(record, (metadata, exception) -> {
    if (exception != null) {
        exception.printStackTrace();
    } else {
        System.out.println("Sent to partition " + metadata.partition()
            + " at offset " + metadata.offset());
    }
});

producer.close();
`,
  },
  {
    language: 'Node.js (kafkajs)',
    code: `const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'transaction-producer',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

await producer.connect();

const transaction = {
  txn_id: '12345',
  amount: 99.99,
  timestamp: Date.now()
};

await producer.send({
  topic: 'transactions',
  messages: [
    {
      key: transaction.txn_id.toString(),
      value: JSON.stringify(transaction)
    }
  ]
});

await producer.disconnect();
`,
  },
];

/* ─── Consumer Examples ─── */

const consumerExamples = [
  {
    language: 'Python (confluent-kafka)',
    code: `from confluent_kafka import Consumer, KafkaError
import json

consumer = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'analytics-group',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False
})

consumer.subscribe(['transactions'])

try:
    while True:
        msg = consumer.poll(timeout=1.0)

        if msg is None:
            continue

        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                print(f'Error: {msg.error()}')
                break

        # Process the message
        transaction = json.loads(msg.value().decode('utf-8'))
        print(f"Processing: {transaction}")

        # Commit offset after successful processing
        consumer.commit(asynchronous=False)

finally:
    consumer.close()
`,
  },
  {
    language: 'Java (kafka-clients)',
    code: `import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.util.*;

Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "analytics-group");
props.put("key.deserializer", StringDeserializer.class.getName());
props.put("value.deserializer", StringDeserializer.class.getName());
props.put("auto.offset.reset", "earliest");
props.put("enable.auto.commit", "false");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("transactions"));

try {
    while (true) {
        ConsumerRecords<String, String> records = consumer.poll(
            java.time.Duration.ofMillis(100));

        for (ConsumerRecord<String, String> record : records) {
            System.out.println("Partition: " + record.partition()
                + ", Offset: " + record.offset()
                + ", Value: " + record.value());

            // Process record here

            // Commit offset after processing
            consumer.commitSync();
        }
    }
} finally {
    consumer.close();
}
`,
  },
  {
    language: 'Node.js (kafkajs)',
    code: `const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'analytics-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'analytics-group' });

await consumer.connect();
await consumer.subscribe({ topic: 'transactions', fromBeginning: true });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const transaction = JSON.parse(message.value.toString());
    console.log('Processing transaction:', transaction);

    // Your business logic here
    // Offset is committed automatically after eachMessage returns
  },
  autoCommit: true
});
`,
  },
];

/* ─── Component ─── */

export default function CodeExamplesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="chapter-8"
      className="py-20 bg-[#0a0a0f]"
    >
      <div className="container-main">
        {/* ─── Section Header ─── */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00f5ff]/10 border border-[#00f5ff]/20">
              <Code className="w-8 h-8 text-[#00f5ff]" />
            </div>
            <div>
              <span className="block font-['Syne'] font-extrabold text-6xl leading-none text-[#ffaa00] opacity-30 select-none -mb-2">
                08
              </span>
              <h2 className="font-['Syne'] font-bold text-[clamp(2rem,4vw,3.5rem)] leading-tight text-[#f0f0ff] tracking-tight">
                Code Examples
              </h2>
            </div>
          </div>
          <div className="h-[2px] w-[200px] bg-gradient-to-r from-[#00f5ff] to-[#ffaa00]" />
        </div>

        {/* ─── Main Content Container ─── */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* ─── Producer Subsection ─── */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-6 h-6 text-[#00f5ff]" />
              <h3 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff]">
                Writing Data with Producers
              </h3>
            </div>
            <p className="text-[#c8c8d8] mb-6 leading-relaxed">
              A producer serializes your data and sends it to a Kafka topic. The key determines partitioning;
              the callback confirms delivery. Here are working examples in three languages:
            </p>

            <CodeBlock
              examples={producerExamples}
              title="Producer: Send Transaction Records"
            />

            <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700/40 rounded-lg">
              <p className="text-sm text-amber-200">
                <strong className="block mb-2">Key points:</strong>
                Always use a key for order guarantees. Always handle delivery errors.
                Flush or close to ensure all messages are sent before exiting.
              </p>
            </div>
          </div>

          {/* ─── Consumer Subsection ─── */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-6 h-6 text-[#00f5ff]" />
              <h3 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff]">
                Reading Data with Consumers
              </h3>
            </div>
            <p className="text-[#c8c8d8] mb-6 leading-relaxed">
              A consumer subscribes to one or more topics and processes records as they arrive.
              Consumer group coordination handles parallel processing across partitions:
            </p>

            <CodeBlock
              examples={consumerExamples}
              title="Consumer: Read and Process Transactions"
            />

            <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700/40 rounded-lg">
              <p className="text-sm text-amber-200">
                <strong className="block mb-2">Key points:</strong>
                Set <code className="bg-black/30 px-1 rounded">enable.auto.commit = false</code> for safer offset management.
                Commit only after successfully processing. Consumer group handles rebalancing automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
