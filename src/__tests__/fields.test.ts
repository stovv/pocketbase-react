import { describe, it, expect } from 'vitest';
import { convertSort, prepareOptions } from '../utils/fields';
import type { ExpandType } from '../types';

describe('fields utils', () => {
  describe('convertSort', () => {
    it('должен конвертировать объект сортировки в строку', () => {
      const sort: { [key: string]: 'asc' | 'desc' } = {
        name: 'asc',
        age: 'desc',
      };

      const result = convertSort(sort);

      expect(result).toBe('name,-age');
    });

    it('должен обрабатывать пустой объект сортировки', () => {
      const sort: { [key: string]: 'asc' | 'desc' } = {};

      const result = convertSort(sort);

      expect(result).toBe('');
    });
  });

  describe('prepareOptions', () => {
    it('должен подготавливать опции с expand', () => {
      const props: { expand: ExpandType } = {
        expand: ['profile', 'posts'],
      };

      const result = prepareOptions(props);

      expect(result).toEqual({
        expand: ['profile', 'posts'],
      });
    });

    it('должен подготавливать опции с sort', () => {
      const props: { sort: { [key: string]: 'asc' | 'desc' } } = {
        sort: {
          name: 'asc',
          age: 'desc',
        },
      };

      const result = prepareOptions(props);

      expect(result).toEqual({
        sort: 'name,-age',
      });
    });

    it('должен подготавливать опции с filter', () => {
      const props: { filter: string } = {
        filter: 'age > 18',
      };

      const result = prepareOptions(props);

      expect(result).toEqual({
        filter: 'age > 18',
      });
    });

    it('должен подготавливать опции со всеми параметрами', () => {
      const props: {
        expand: ExpandType;
        sort: { [key: string]: 'asc' | 'desc' };
        filter: string;
      } = {
        expand: ['profile'],
        sort: {
          name: 'asc',
        },
        filter: 'age > 18',
      };

      const result = prepareOptions(props);

      expect(result).toEqual({
        expand: ['profile'],
        sort: 'name',
        filter: 'age > 18',
      });
    });

    it('должен обрабатывать пустые опции', () => {
      const props = {};

      const result = prepareOptions(props);

      expect(result).toEqual({});
    });

    it('должен обрабатывать строковый expand', () => {
      const props: { expand: ExpandType } = {
        expand: ['profile'],
      };

      const result = prepareOptions(props);

      expect(result).toEqual({
        expand: ['profile'],
      });
    });
  });
});
