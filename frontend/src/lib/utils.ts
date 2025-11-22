import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    A1: 'bg-emerald-500',
    A2: 'bg-teal-500',
    B1: 'bg-blue-500',
    B2: 'bg-indigo-500',
    C1: 'bg-purple-500',
    C2: 'bg-pink-500',
  };
  return colors[level] || 'bg-gray-500';
}

export function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    Bronze: 'text-amber-700',
    Silver: 'text-gray-400',
    Gold: 'text-yellow-500',
    Platinum: 'text-cyan-300',
    Diamond: 'text-blue-400',
    Master: 'text-red-500',
  };
  return colors[rank] || 'text-gray-500';
}

export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
