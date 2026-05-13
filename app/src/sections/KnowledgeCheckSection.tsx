import { useRef, useState, useCallback, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Target,
  Trophy,
  Zap,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { quizQuestions } from '@/data/quiz-questions';
import type { Question } from '@/data/quiz-questions';

gsap.registerPlugin(ScrollTrigger);

const questions: Question[] = quizQuestions;

interface AnswerState {
  selectedIndex: number | null;
  isCorrect: boolean | null;
}

type QuizPhase = 'answering' | 'feedback' | 'summary';

const PERFORMANCE_MESSAGES = [
  { threshold: 0, message: 'Keep studying — you\'ll get there!', icon: BookOpen },
  { threshold: 50, message: 'Good effort! Review the chapters you missed.', icon: Target },
  { threshold: 75, message: 'Great job! You know Kafka pretty well.', icon: Zap },
  { threshold: 90, message: 'Outstanding! You are a Kafka master!', icon: Trophy },
];

export default function KnowledgeCheckSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const celebrationRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<QuizPhase>('answering');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [answers, setAnswers] = useState<AnswerState[]>(
    Array(questions.length).fill({ selectedIndex: null, isCorrect: null })
  );

  const filteredQuestions = useMemo(
    () =>
      selectedDifficulty === 'all'
        ? questions
        : questions.filter((q) => q.difficulty === selectedDifficulty),
    [selectedDifficulty]
  );

  const currentQuestion = filteredQuestions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const score = useMemo(
    () => answers.filter((a) => a.isCorrect === true).length,
    [answers]
  );
  const progressPercent = ((currentIndex + (phase === 'feedback' ? 1 : 0)) / filteredQuestions.length) * 100;

  const handleDifficultyChange = useCallback((level: 'all' | 'beginner' | 'intermediate' | 'advanced') => {
    setSelectedDifficulty(level);
    setCurrentIndex(0);
    setAnswers(Array(questions.length).fill({ selectedIndex: null, isCorrect: null }));
    setPhase('answering');
  }, []);

  const handleSelect = useCallback((index: number) => {
    if (phase !== 'answering') return;
    const isCorrect = index === currentQuestion.correctIndex;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = { selectedIndex: index, isCorrect };
      return next;
    });
    setPhase('feedback');
  }, [phase, currentIndex, currentQuestion.correctIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPhase('answering');
    } else {
      setPhase('summary');
    }
  }, [currentIndex, filteredQuestions.length]);

  const handleRestartAll = useCallback(() => {
    setCurrentIndex(0);
    setAnswers(Array(questions.length).fill({ selectedIndex: null, isCorrect: null }));
    setPhase('answering');
  }, []);

  const handleRetryMissed = useCallback(() => {
    const missedIndices = answers
      .map((a, i) => (a.isCorrect === false ? i : -1))
      .filter((i) => i !== -1);
    if (missedIndices.length === 0) return;

    // For simplicity, restart with all questions but clear wrong answers.
    const clearedAnswers = answers.map((a) =>
      a.isCorrect === false ? { selectedIndex: null, isCorrect: null } : a
    );
    setAnswers(clearedAnswers);
    setCurrentIndex(missedIndices[0]);
    setPhase('answering');
  }, [answers]);

  const chapterStats = useMemo(() => {
    const stats: Record<
      number,
      { chapter: string; total: number; correct: number }
    > = {};
    filteredQuestions.forEach((q, i) => {
      if (!stats[q.chapterNum]) {
        stats[q.chapterNum] = { chapter: q.chapter, total: 0, correct: 0 };
      }
      stats[q.chapterNum].total += 1;
      if (answers[i]?.isCorrect) {
        stats[q.chapterNum].correct += 1;
      }
    });
    return stats;
  }, [answers, filteredQuestions]);

  const performance = useMemo(() => {
    const pct = (score / filteredQuestions.length) * 100;
    for (let i = PERFORMANCE_MESSAGES.length - 1; i >= 0; i--) {
      if (pct >= PERFORMANCE_MESSAGES[i].threshold) {
        return PERFORMANCE_MESSAGES[i];
      }
    }
    return PERFORMANCE_MESSAGES[0];
  }, [score, filteredQuestions.length]);

  // GSAP: header and card entrance animations
  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(sectionRef.current.querySelector('.kc-header'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      }
    );

    gsap.fromTo(sectionRef.current.querySelector('.quiz-card-wrapper'),
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current.querySelector('.quiz-card-wrapper'),
          start: 'top 85%',
          once: true,
        },
      }
    );
  }, { scope: sectionRef });

  // GSAP: animate card transitions between questions
  useGSAP(() => {
    if (cardRef.current && (phase === 'answering' || phase === 'feedback')) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [currentIndex, phase]);

  // GSAP: celebration animation for high scores
  useGSAP(() => {
    if (phase === 'summary' && summaryRef.current) {
      const pct = (score / filteredQuestions.length) * 100;
      if (pct >= 75 && celebrationRef.current) {
        const particles = celebrationRef.current.querySelectorAll('.celebration-particle');
        gsap.fromTo(
          particles,
          {
            scale: 0,
            opacity: 1,
            y: 0,
            x: 0,
          },
          {
            scale: 1,
            opacity: 0,
            y: () => gsap.utils.random(-120, -40),
            x: () => gsap.utils.random(-120, 120),
            duration: 1.2,
            stagger: 0.08,
            ease: 'power2.out',
            repeat: 1,
          }
        );
      }

      gsap.fromTo(summaryRef.current.querySelectorAll('.summary-animate'),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, [phase, score]);

  const missedCount = answers.filter((a) => a.isCorrect === false).length;

  return (
    <section id="knowledge-check" ref={sectionRef} className="py-24 bg-[#0a0a0f]">
      <div className="container-main">
        {/* Header */}
        <div className="kc-header text-center mb-12">
          <span className="inline-block font-['Syne'] font-semibold text-sm tracking-[0.2em] uppercase text-[#ffaa00] mb-4">
            Test Your Understanding
          </span>
          <h2 className="font-['Syne'] font-bold text-[clamp(2rem,4vw,3.5rem)] text-[#f0f0ff] mb-4">
            Knowledge Check
          </h2>
          <p className="text-[#c8c8d8] text-lg max-w-xl mx-auto">
            {questions.length} questions across all 7 chapters. Can you score a perfect {questions.length}?
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level)}
              className={`px-4 py-2 rounded-lg font-['Syne'] font-medium text-sm transition-all duration-200 ${
                selectedDifficulty === level
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Quiz Card */}
        {(phase === 'answering' || phase === 'feedback') && (
          <div className="quiz-card-wrapper max-w-3xl mx-auto">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Syne'] text-sm text-[#8a8a9a]">
                  Question {currentIndex + 1} of {filteredQuestions.length}
                </span>
                <span className="font-['JetBrains_Mono'] text-sm text-[#ffaa00]">
                  Score: {score}/{filteredQuestions.length}
                </span>
              </div>
              <Progress
                value={progressPercent}
                className="h-2 bg-[#1a1a25]"
              />
            </div>

            <div
              ref={cardRef}
              className="bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 md:p-10"
            >
              {/* Chapter badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#1a1a25] text-[#00f5ff] font-['JetBrains_Mono'] text-xs font-bold">
                  {currentQuestion.chapterNum}
                </span>
                <span className="font-['Syne'] font-semibold text-xs uppercase tracking-[0.15em] text-[#ffaa00]">
                  {currentQuestion.chapter}
                </span>
              </div>

              {/* Question */}
              <h3 className="font-['Syne'] font-semibold text-xl md:text-2xl text-[#f0f0ff] mb-8 leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  let btnClass =
                    'w-full text-left p-4 rounded-xl border transition-all duration-300 text-sm ';

                  if (phase === 'answering') {
                    btnClass +=
                      'border-[#1a1a25] bg-[#1a1a25]/50 text-[#c8c8d8] hover:border-[rgba(0,245,255,0.3)] hover:bg-[#1a1a25] cursor-pointer';
                  } else if (index === currentQuestion.correctIndex) {
                    btnClass +=
                      'border-[#00f5ff] bg-[#00f5ff]/10 text-[#00f5ff]';
                  } else if (
                    index === currentAnswer.selectedIndex &&
                    index !== currentQuestion.correctIndex
                  ) {
                    btnClass +=
                      'border-[#ff4444] bg-[#ff4444]/10 text-[#ff4444]';
                  } else {
                    btnClass +=
                      'border-[#1a1a25] bg-[#1a1a25]/30 text-[#8a8a9a]';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelect(index)}
                      disabled={phase === 'feedback'}
                      className={btnClass}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-['JetBrains_Mono'] text-xs opacity-60">
                          {String.fromCharCode(65 + index)})
                        </span>
                        <span className="flex-1">{option}</span>
                        {phase === 'feedback' &&
                          index === currentQuestion.correctIndex && (
                            <CheckCircle className="w-5 h-5 text-[#00f5ff] flex-shrink-0" />
                          )}
                        {phase === 'feedback' &&
                          index === currentAnswer.selectedIndex &&
                          index !== currentQuestion.correctIndex && (
                            <XCircle className="w-5 h-5 text-[#ff4444] flex-shrink-0" />
                          )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {phase === 'feedback' && (
                <div className="mt-8 pt-6 border-t border-[#1a1a25]">
                  <div className="flex items-center gap-2 mb-3">
                    {currentAnswer.isCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-[#00f5ff]" />
                        <span className="font-['Syne'] font-semibold text-sm text-[#00f5ff]">
                          Correct!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-[#ff4444]" />
                        <span className="font-['Syne'] font-semibold text-sm text-[#ff4444]">
                          Not quite
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-[#c8c8d8] text-sm leading-relaxed mb-6">
                    {currentQuestion.explanation}
                  </p>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1a1a25] text-[#f0f0ff] font-['Syne'] font-semibold text-sm border border-[#1a1a25] hover:border-[rgba(0,245,255,0.3)] hover:bg-[#1a1a25]/80 transition-all duration-300"
                  >
                    {currentIndex < filteredQuestions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        View Results
                        <Trophy className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {phase === 'summary' && (
          <div ref={summaryRef} className="max-w-3xl mx-auto">
            <div className="relative bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 md:p-12 overflow-hidden">
              {/* Celebration particles */}
              <div
                ref={celebrationRef}
                className="absolute inset-0 pointer-events-none overflow-hidden"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="celebration-particle absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        i % 3 === 0
                          ? '#00f5ff'
                          : i % 3 === 1
                          ? '#ffaa00'
                          : '#ff00aa',
                    }}
                  />
                ))}
              </div>

              {/* Score circle */}
              <div className="summary-animate text-center mb-10 relative z-10">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-[#1a1a25] bg-[#0a0a0f] mb-6">
                  <div className="text-center">
                    <span className="block font-['Syne'] font-bold text-4xl text-[#f0f0ff]">
                      {score}
                    </span>
                    <span className="block font-['JetBrains_Mono'] text-xs text-[#8a8a9a]">
                      /{filteredQuestions.length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <performance.icon className="w-6 h-6 text-[#ffaa00]" />
                  <h3 className="font-['Syne'] font-bold text-2xl text-[#f0f0ff]">
                    {performance.message}
                  </h3>
                </div>
                <p className="text-[#c8c8d8] text-sm max-w-md mx-auto">
                  You answered {score} out of {filteredQuestions.length} questions
                  correctly ({Math.round((score / filteredQuestions.length) * 100)}%).
                </p>
              </div>

              {/* Chapter breakdown */}
              <div className="summary-animate mb-10 relative z-10">
                <h4 className="font-['Syne'] font-semibold text-sm uppercase tracking-[0.15em] text-[#ffaa00] mb-4">
                  Breakdown by Chapter
                </h4>
                <div className="space-y-3">
                  {Object.entries(chapterStats).map(([num, stat]) => {
                    const pct = (stat.correct / stat.total) * 100;
                    const needsStudy = pct < 100;
                    return (
                      <div
                        key={num}
                        className="flex items-center gap-4 p-3 rounded-xl bg-[#0a0a0f] border border-[#1a1a25]"
                      >
                        <span className="font-['JetBrains_Mono'] text-xs text-[#00f5ff] w-6">
                          {num}
                        </span>
                        <span className="flex-1 text-sm text-[#c8c8d8]">
                          {stat.chapter}
                        </span>
                        <span className="font-['JetBrains_Mono'] text-xs text-[#8a8a9a]">
                          {stat.correct}/{stat.total}
                        </span>
                        {needsStudy ? (
                          <BookOpen className="w-4 h-4 text-[#ffaa00] flex-shrink-0" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-[#00f5ff] flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="summary-animate flex flex-col sm:flex-row gap-3 relative z-10">
                {missedCount > 0 && (
                  <button
                    onClick={handleRetryMissed}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ffaa00] text-[#0a0a0f] font-['Syne'] font-semibold text-sm hover:bg-[#ffaa00]/90 transition-all duration-300"
                  >
                    <Target className="w-4 h-4" />
                    Retry Missed Questions ({missedCount})
                  </button>
                )}
                <button
                  onClick={handleRestartAll}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1a1a25] text-[#f0f0ff] font-['Syne'] font-semibold text-sm border border-[#1a1a25] hover:border-[rgba(0,245,255,0.3)] hover:bg-[#1a1a25]/80 transition-all duration-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart All Questions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
