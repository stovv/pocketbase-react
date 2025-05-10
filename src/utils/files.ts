import type { useClient } from '../hooks';
import type { FileFields } from '../types';
import { resolveFileUrl } from './resolve-file-url';

export const processFileFields = (
  client: ReturnType<typeof useClient>,
  record: any,
  fileFields?: FileFields,
) => {
  if (!fileFields || !client) return record;

  const processedRecord = { ...record };

  // Обработка одиночных файловых полей
  if (fileFields.single) {
    fileFields.single.forEach((field) => {
      if (record[field]) {
        processedRecord[field] = resolveFileUrl(client, record, record[field]);
      }
    });
  }

  // Обработка множественных файловых полей
  if (fileFields.multiple) {
    fileFields.multiple.forEach((field) => {
      if (Array.isArray(record[field])) {
        processedRecord[field] = record[field].map((file: string) =>
          resolveFileUrl(client, record, file),
        );
      }
    });
  }

  return processedRecord;
};
