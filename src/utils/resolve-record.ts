import cloneDeep from 'lodash.clonedeep';
import type { Client, FileFields } from '../types';
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
      // Если текущий элемент - массив, обрабатываем каждый элемент с теми же оставшимися частями пути
      target.forEach((item) => processObject(item, remainingParts));
      return;
    }

    if (!target || typeof target !== 'object') {
      return;
    }

    if (remainingParts.length === 1) {
      // Если это последняя часть пути, применяем setValue
      setValue(target, remainingParts[0]);
      return;
    }

    // Для промежуточных частей пути
    const [current, ...rest] = remainingParts;
    if (target[current]) {
      processObject(target[current], rest);
    }
  };

  processObject(obj, parts);
};

/**
 * Резолвит relations и file fields в записи PocketBase
 * @param record - Запись из PocketBase
 * @param expand - Массив путей для резолва relations (например: ['relation', 'other.relation.subrelation'])
 * @param fileFields - Объект с полями файлов для резолва, поддерживает пути и массивы (например: ['users.avatar'] или ['users.avatars'])
 * @param client - Инстанс PocketBase для получения URL файлов
 */
export const resolveRecord = <T extends BaseModelWithExpand = BaseModelWithExpand>(
  record: T,
  expand: string[] = [],
  fileFields: FileFields = { single: [], multiple: [] },
  client: Client,
): Omit<T, 'expand'> => {
  // Создаем копию записи без поля expand
  const { expand: expandData, ...resolvedRecord } = record;
  const result = cloneDeep(resolvedRecord) as any;

  // Резолвим relations
  for (const path of expand) {
    const parts = path.split('.');
    let current = expandData;
    let target = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current?.[part]) break;

      if (i === parts.length - 1) {
        target[part] = cloneDeep(current[part]);
      } else {
        target[part] = target[part] || {};
        target = target[part];
        current = (current[part] as Record<string, any>)?.expand;
      }
    }
  }

  // Резолвим single file fields
  for (const field of fileFields?.single ?? []) {
    resolveNestedField(result, field, (target, key) => {
      if (target[key]) {
        target[key] = resolveFileUrl(client, target, target[key]);
      }
    });
  }

  // Резолвим multiple file fields
  for (const field of fileFields?.multiple ?? []) {
    resolveNestedField(result, field, (target, key) => {
      if (Array.isArray(target[key])) {
        target[key] = target[key].map((file: string) =>
          resolveFileUrl(client, target, file),
        );
      }
    });
  }

  return result;
};
