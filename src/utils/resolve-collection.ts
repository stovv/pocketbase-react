import type { Client, FileFields } from '../types';
import type { BaseModelWithExpand } from '../types/store';
import { resolveRecord } from './resolve-record';

/**
 * Резолвит массив записей PocketBase
 * @param records - Массив записей PocketBase
 * @param expand - Массив путей для резолва relations
 * @param fileFields - Объект с полями файлов для резолва
 * @param client - Инстанс PocketBase для получения URL файлов
 *
 */
export const resolveCollection = <T extends BaseModelWithExpand = BaseModelWithExpand>(
  records: (T | null)[],
  expand: string[] = [],
  fileFields: FileFields = { single: [], multiple: [] },
  client: Client,
): Array<Omit<T, 'expand'> | null> => {
  return records.map((record) =>
    record ? resolveRecord(record, expand, fileFields, client) : null,
  );
};
