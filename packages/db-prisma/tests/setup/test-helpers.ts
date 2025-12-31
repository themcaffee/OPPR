/**
 * Creates a date N days ago from now
 */
export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Creates a date N years ago from now
 */
export function yearsAgo(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

/**
 * Creates a date with a specific age in days for precise decay testing
 */
export function dateWithAgeInDays(ageInDays: number): Date {
  const date = new Date();
  date.setTime(date.getTime() - ageInDays * 24 * 60 * 60 * 1000);
  return date;
}
