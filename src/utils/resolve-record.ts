import cloneDeep from 'lodash.clonedeep';
import type { Client, SubscribeFieldMap } from '../types';
import type { BaseModelWithExpand } from '../types/store';
import { resolveFileUrl } from './resolve-file-url';

/**
 * Резолвит вложенное поле по пути с поддержкой массивов
 * @param obj - Объект или массив объектов, в котором ищем поле
 * @param path - Путь до поля в формате 'relation.field' или 'array.field'
 * @param setValue - Функция для установки значения
 */
const resolveNestedField = (
  obj: BaseModelWithExpand | BaseModelWithExpand[],
  path: string,
  setValue: (target: BaseModelWithExpand, key: string) => void,
) => {
  const parts = path.split('.');

  const processObject = (
    target: BaseModelWithExpand | BaseModelWithExpand[],
    remainingParts: string[],
  ) => {
    if (Array.isArray(target)) {
      target.forEach((item) => processObject(item, remainingParts));
      return;
    }

    if (!target || typeof target !== 'object') {
      return;
    }

    if (remainingParts.length === 1) {
      setValue(target, remainingParts[0]);
      return;
    }

    const [current, ...rest] = remainingParts;
    if (target[current]) {
      processObject(target[current], rest);
    }
  };

  processObject(obj, parts);
};

/**
 * Рекурсивно резолвит expand данные
 */
const resolveExpandData = (
  target: any,
  expandData: any,
  path: string[],
  client: Client,
) => {
  if (!expandData || !target || path.length === 0) return;

  const [current, ...rest] = path;

  if (!expandData[current]) return;

  // Обрабатываем текущий уровень
  if (Array.isArray(expandData[current])) {
    target[current] = expandData[current].map((item: any) => {
      const { expand: itemExpand, ...itemData } = item;
      const resolved = cloneDeep(itemData);

      // Рекурсивно обрабатываем вложенные expand
      if (rest.length > 0 && itemExpand) {
        resolveExpandData(resolved, itemExpand, rest, client);
      }

      return resolved;
    });
  } else {
    const { expand: currentExpand, ...currentData } = expandData[current];
    target[current] = cloneDeep(currentData);

    if (rest.length > 0 && currentExpand) {
      resolveExpandData(target[current], currentExpand, rest, client);
    }
  }
};

/**
 * Резолвит relations и file fields в записи PocketBase
 * @param record - Запись из PocketBase
 * @param expand - Массив путей для резолва relations (например: ['relation', 'other.relation.subrelation'])
 * @param fileFields - Объект с полями файлов для резолва, поддерживает пути и массивы
 * @param client - Инстанс PocketBase для получения URL файлов
 */
export const resolveRecord = <T extends BaseModelWithExpand = BaseModelWithExpand>(
  record: T,
  expand: string[] = [],
  fileFields: SubscribeFieldMap['fileFields'],
  client: Client,
): Omit<T, 'expand'> => {
  const { expand: expandData, ...resolvedRecord } = record;
  const result = cloneDeep(resolvedRecord) as any;

  // Резолвим relations для каждого пути expand
  for (const expandPath of expand) {
    const parts = expandPath.split('.');
    resolveExpandData(result, expandData, parts, client);
  }

  // Резолвим single file fields
  for (const field of fileFields?.single ?? []) {
    const { key: fieldKey, options } =
      typeof field === 'string' ? { key: field, options: {} } : field;
    resolveNestedField(result, fieldKey, (target, key) => {
      if (target[key]) {
        target[key] = resolveFileUrl(client, target, target[key], options);
      }
    });
  }

  // Резолвим multiple file fields
  for (const field of fileFields?.multiple ?? []) {
    const { key: fieldKey, options } =
      typeof field === 'string' ? { key: field, options: {} } : field;

    resolveNestedField(result, fieldKey, (target, key) => {
      if (Array.isArray(target[key])) {
        target[key] = target[key].map((file: string) =>
          resolveFileUrl(client, target, file, options),
        );
      }
    });
  }

  return result;
};
