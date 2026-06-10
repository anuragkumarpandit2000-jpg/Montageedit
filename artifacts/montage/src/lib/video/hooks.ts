import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
  }
}

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);
  const durationsList = Object.values(durations);
  const totalScenes = durationsList.length;
  const recordedRef = useRef(false);

  useEffect(() => {
    window.startRecording?.();
    let isSubscribed = true;
    let timeout: NodeJS.Timeout;

    const playScene = (index: number) => {
      if (!isSubscribed) return;
      setCurrentScene(index);
      
      const isLastScene = index === totalScenes - 1;
      
      timeout = setTimeout(() => {
        if (!isSubscribed) return;
        if (isLastScene && !recordedRef.current) {
          window.stopRecording?.();
          recordedRef.current = true;
        }
        playScene((index + 1) % totalScenes);
      }, durationsList[index] || 3000);
    };

    playScene(0);

    return () => {
      isSubscribed = false;
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationsList.join(',')]);

  return { currentScene };
}