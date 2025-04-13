export const formatDuration = (duration: string): string => {
  const unit = duration.slice(-1);
  const value = duration.slice(0, -1);

  const units: Record<string, string> = {
    m: 'minutes',
    h: 'hours',
    d: 'days',
  };

  return `${value} ${units[unit] || duration}`;
};
