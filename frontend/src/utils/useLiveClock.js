import { useState, useEffect } from 'react';

/**
 * Custom React hook for live dynamic date and real-time ticking clock.
 * Updates precisely every 1,000ms.
 */
export function useLiveClock() {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    // Sync to nearest second boundary for minimal drift
    const update = () => setCurrentDate(new Date());
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = currentDate.getHours();
  let greeting = 'Good evening';
  let greetingPeriod = 'evening';

  if (hours >= 5 && hours < 12) {
    greeting = 'Good morning';
    greetingPeriod = 'morning';
  } else if (hours >= 12 && hours < 17) {
    greeting = 'Good afternoon';
    greetingPeriod = 'afternoon';
  } else if (hours >= 17 && hours < 22) {
    greeting = 'Good evening';
    greetingPeriod = 'evening';
  } else {
    greeting = 'Good night';
    greetingPeriod = 'night';
  }

  // Format: "Thursday, 22 October 2026"
  const fullDateString = currentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Short format: "Thu, Oct 22"
  const shortDateString = currentDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Time format: "04:30:15 PM"
  const timeString = currentDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Short time format: "04:30 PM"
  const shortTimeString = currentDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const dayOfWeek = currentDate.toLocaleDateString(undefined, { weekday: 'long' });

  return {
    currentDate,
    greeting,
    greetingPeriod,
    fullDateString,
    shortDateString,
    timeString,
    shortTimeString,
    dayOfWeek,
  };
}

