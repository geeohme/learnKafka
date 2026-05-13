import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'kafkaTutorial.learningProgress';
const firstChapterSectionId = 'chapter-1';

type StoredProgress = {
  userName: string;
  lastHeadingId: string;
  currentChapter: string;
};

type HeadingRecord = {
  id: string;
  chapterLabel: string;
};

const defaultProgress: StoredProgress = {
  userName: '',
  lastHeadingId: '',
  currentChapter: 'Chapter 1',
};

function readStoredProgress(): StoredProgress {
  if (typeof window === 'undefined') return defaultProgress;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;

    return {
      ...defaultProgress,
      ...JSON.parse(raw),
    };
  } catch {
    return defaultProgress;
  }
}

function writeStoredProgress(progress: StoredProgress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getChapterLabel(section: HTMLElement | null) {
  const sectionId = section?.id ?? '';
  const chapterMatch = sectionId.match(/^chapter-(\d+)$/);

  if (chapterMatch) {
    return `Chapter ${Number(chapterMatch[1])}`;
  }

  if (sectionId === 'course-overview') {
    return 'Course Overview';
  }

  if (sectionId === 'knowledge-check') {
    return 'Knowledge Check';
  }

  const chapterNumber = section?.querySelector<HTMLElement>('.chapter-num')?.textContent?.trim();
  if (chapterNumber) {
    return `Chapter ${Number(chapterNumber)}`;
  }

  return section?.querySelector<HTMLElement>('.section-title, h2')?.textContent?.trim() || 'Current chapter';
}

function collectTrackableHeadings(): HeadingRecord[] {
  const sectionHeadingCounts = new Map<string, number>();

  return Array.from(document.querySelectorAll<HTMLElement>('main section h2, main section h3')).map(
    (heading) => {
      const section = heading.closest<HTMLElement>('section[id]');
      const sectionId = section?.id || 'heading';
      const nextIndex = (sectionHeadingCounts.get(sectionId) || 0) + 1;
      sectionHeadingCounts.set(sectionId, nextIndex);

      if (!heading.id) {
        heading.id = `${sectionId}-heading-${nextIndex}`;
      }

      return {
        id: heading.id,
        chapterLabel: getChapterLabel(section),
      };
    },
  );
}

function scrollToHeading(headingId: string) {
  const target = document.getElementById(headingId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function getFirstHeadingIdInSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  const heading = section?.querySelector<HTMLElement>('h2, h3');

  if (heading && !heading.id) {
    heading.id = `${sectionId}-heading-entry`;
  }

  return heading?.id || sectionId;
}

function getHeadingChapterLabel(headingId: string, fallback: string) {
  return getChapterLabel(document.getElementById(headingId)?.closest<HTMLElement>('section[id]') ?? null) || fallback;
}

function getSectionIdFromLabel(label: string) {
  const chapterMatch = label.match(/^Chapter\s+(\d+)$/i);
  if (chapterMatch) return `chapter-${Number(chapterMatch[1])}`;
  if (label === 'Knowledge Check') return 'knowledge-check';
  if (label === 'Course Overview') return 'course-overview';
  return firstChapterSectionId;
}

function resolveStoredHeadingId(progress: StoredProgress) {
  if (progress.lastHeadingId && document.getElementById(progress.lastHeadingId)) {
    return progress.lastHeadingId;
  }

  return getFirstHeadingIdInSection(getSectionIdFromLabel(progress.currentChapter));
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<StoredProgress>(() => readStoredProgress());
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const trackingPausedRef = useRef(false);
  const pendingHeadingIdRef = useRef(firstChapterSectionId);
  const hasUserName = progress.userName.trim().length > 0;

  const persistProgress = useCallback((updates: Partial<StoredProgress>) => {
    setProgress((current) => {
      const next = { ...current, ...updates };
      writeStoredProgress(next);
      return next;
    });
  }, []);

  const promptForName = useCallback((targetHeadingId = getFirstHeadingIdInSection(firstChapterSectionId)) => {
    pendingHeadingIdRef.current = targetHeadingId;
    setIsPromptOpen(true);
  }, []);

  const resumeLearning = useCallback(() => {
    if (!hasUserName) {
      promptForName(getFirstHeadingIdInSection(firstChapterSectionId));
      return;
    }

    scrollToHeading(resolveStoredHeadingId(progress));
  }, [hasUserName, progress, promptForName]);

  const startOrResumeLearning = useCallback(() => {
    if (!hasUserName) {
      promptForName(getFirstHeadingIdInSection(firstChapterSectionId));
      return;
    }

    resumeLearning();
  }, [hasUserName, promptForName, resumeLearning]);

  const requestProtectedHeading = useCallback(
    (targetHeadingId = getFirstHeadingIdInSection(firstChapterSectionId)) => {
      if (!hasUserName) {
        promptForName(targetHeadingId);
        return;
      }

      scrollToHeading(targetHeadingId);
    },
    [hasUserName, promptForName],
  );

  const goToLanding = useCallback(() => {
    trackingPausedRef.current = true;
    window.scrollTo({ top: 0, behavior: 'auto' });

    window.setTimeout(() => {
      trackingPausedRef.current = false;
    }, 300);
  }, []);

  const saveUserName = useCallback(
    (name: string) => {
      const userName = name.trim();
      if (!userName) return;

      const lastHeadingId = pendingHeadingIdRef.current || getFirstHeadingIdInSection(firstChapterSectionId);
      persistProgress({
        userName,
        lastHeadingId,
        currentChapter: getHeadingChapterLabel(lastHeadingId, progress.currentChapter || 'Chapter 1'),
      });
      setIsPromptOpen(false);

      window.setTimeout(() => scrollToHeading(lastHeadingId), 100);
    },
    [persistProgress, progress.currentChapter],
  );

  useEffect(() => {
    if (isPromptOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }

    document.body.style.overflow = '';
  }, [isPromptOpen]);

  useEffect(() => {
    const headings = collectTrackableHeadings();
    if (headings.length === 0) return;

    const handleScroll = () => {
      const chapterOneSection = document.getElementById(firstChapterSectionId);
      if (!hasUserName) {
        if (!isPromptOpen && chapterOneSection && window.scrollY >= chapterOneSection.offsetTop - 120) {
          promptForName(getFirstHeadingIdInSection(firstChapterSectionId));
        }
        return;
      }

      if (trackingPausedRef.current) return;

      const firstHeading = document.getElementById(headings[0].id);
      if (firstHeading && window.scrollY < firstHeading.offsetTop - 140) return;

      const current = headings.reduce((nearest, heading) => {
        const element = document.getElementById(heading.id);
        if (!element) return nearest;

        const distance = Math.abs(element.getBoundingClientRect().top - 96);
        if (!nearest || distance < nearest.distance) {
          return { ...heading, distance };
        }

        return nearest;
      }, null as (HeadingRecord & { distance: number }) | null);

      if (!current) return;

      persistProgress({
        lastHeadingId: current.id,
        currentChapter: current.chapterLabel,
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasUserName, isPromptOpen, persistProgress, promptForName]);

  return {
    userName: progress.userName,
    currentChapter: progress.currentChapter,
    hasUserName,
    isPromptOpen,
    openPrompt: promptForName,
    saveUserName,
    startOrResumeLearning,
    resumeLearning,
    requestProtectedHeading,
    goToLanding,
  };
}
