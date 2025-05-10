import type { ContentState } from '../store/types';
import type { ExpandType, FileFields } from '../types';
import { processExpand, saveExpandedRecords } from './expand';
import { processFileFields } from './files';
import type { useClient } from '../hooks';

export const processRecord = (
  state: ContentState,
  collection: string,
  record: any,
  expand?: ExpandType,
  client?: ReturnType<typeof useClient>,
  fileFields?: FileFields,
) => {
  let processedRecord = record;

  if (client && fileFields) {
    processedRecord = processFileFields(client, record, fileFields);
  }

  if (expand && record.expand) {
    // Обработка expand для записи
    processedRecord = processExpand(processedRecord, record.expand, state);
    state[collection] = {
      ...state?.[collection],
      [record.id]: processedRecord,
    };

    // Сохранение связанных записей
    const expandedCollections = saveExpandedRecords(record, record.expand, state);
    Object.entries(expandedCollections).forEach(([collectionId, records]) => {
      records.forEach((expandedRecord) => {
        state[collectionId] = {
          ...state?.[collectionId],
          [expandedRecord.id]: expandedRecord,
        };
      });
    });
    return;
  }

  state[collection] = {
    ...state?.[collection],
    [record.id]: processedRecord,
  };
};
