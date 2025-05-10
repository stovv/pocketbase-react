import type { BaseModel } from 'pocketbase';
import type { ContentState } from '../store/types';

type ExpandMap = {
  [key: string]: {
    fields: string[];
    nested: ExpandMap;
  };
};

interface ExpandRecord extends BaseModel {
  expand?: Record<string, any>;
  collectionId?: string;
}

const parseExpandString = (expand: string[]): ExpandMap => {
  const result: ExpandMap = {};

  expand.forEach((path) => {
    const parts = path.split('.');
    let current = result;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          fields: [],
          nested: {},
        };
      }

      if (index < parts.length - 1) {
        // If this is not the last part of the path, add the field to the current level
        current[part].fields.push(parts[index + 1]);
        // And move to the nested object
        current = current[part].nested;
      }
    });
  });

  return result;
};

export const processExpand = (
  record: BaseModel,
  expand: Record<string, any>,
  state: ContentState,
) => {
  const processedRecord = { ...record };

  Object.entries(expand).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Process array of related records
      processedRecord[key] = value.map((item: ExpandRecord) => {
        const processed = {
          ...item,
          collectionId: item.collectionId || key,
        };

        // Process nested expands for each array item
        if (item.expand) {
          processed.expand = item.expand;
          return processExpand(processed, item.expand, state);
        }

        return processed;
      });
    } else if (value && typeof value === 'object') {
      // Process single related record
      const expandRecord = value as ExpandRecord;
      const processed = {
        ...expandRecord,
        collectionId: expandRecord.collectionId || key,
      };

      // Process nested expands
      if (expandRecord.expand) {
        processed.expand = expandRecord.expand;
        processedRecord[key] = processExpand(processed, expandRecord.expand, state);
      } else {
        processedRecord[key] = processed;
      }
    }
  });

  return processedRecord;
};

export const saveExpandedRecords = (
  record: BaseModel,
  expand: Record<string, any>,
  state: ContentState,
) => {
  const collections: { [key: string]: BaseModel[] } = {};

  const processRecord = (value: ExpandRecord, collectionId: string) => {
    if (!collections[collectionId]) {
      collections[collectionId] = [];
    }

    // Save current record
    collections[collectionId].push(value);

    // If there are nested expands, process them
    if (value.expand) {
      Object.entries(value.expand).forEach(([nestedKey, nestedValue]) => {
        if (Array.isArray(nestedValue)) {
          nestedValue.forEach((item: ExpandRecord) => {
            processRecord(item, item.collectionId || nestedKey);
          });
        } else if (nestedValue && typeof nestedValue === 'object') {
          const expandRecord = nestedValue as ExpandRecord;
          processRecord(expandRecord, expandRecord.collectionId || nestedKey);
        }
      });
    }
  };

  Object.entries(expand).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Сохраняем массив связанных записей
      value.forEach((item: ExpandRecord) => {
        processRecord(item, item.collectionId || key);
      });
    } else if (value && typeof value === 'object') {
      // Сохраняем одиночную связанную запись
      const expandRecord = value as ExpandRecord;
      processRecord(expandRecord, expandRecord.collectionId || key);
    }
  });

  return collections;
};
