import { describe, it, expect } from 'vitest';
import { formatCurrencyKZT, parseCurrencyKZT } from '@/lib/currency';

describe('Currency utilities', () => {
  describe('formatCurrencyKZT', () => {
    it('formats number with KZT symbol', () => {
      expect(formatCurrencyKZT(1000)).toContain('₸');
    });

    it('formats with thousands separator', () => {
      const result = formatCurrencyKZT(1000000);
      expect(result).toMatch(/1[\s,]000[\s,]000/);
    });

    it('handles zero', () => {
      expect(formatCurrencyKZT(0)).toContain('0');
    });
  });

  describe('parseCurrencyKZT', () => {
    it('parses formatted string to number', () => {
      expect(parseCurrencyKZT('1 000 ₸')).toBe(1000);
    });

    it('parses plain number string', () => {
      expect(parseCurrencyKZT('1000')).toBe(1000);
    });

    it('returns 0 for invalid input', () => {
      expect(parseCurrencyKZT('abc')).toBe(0);
    });
  });
});
