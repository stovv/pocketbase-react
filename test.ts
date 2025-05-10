import cloneDeep from 'lodash.clonedeep';
import type { RecordModel } from 'pocketbase';
import type { Client, FileFields } from './src';
import type { BaseModelWithExpand } from './src';

export const resolveFileUrl = <T extends RecordModel = RecordModel>(
  client: any,
  record?: T | null,
  file?: string,
  options?: {
    thumb: '100x250';
  },
) => {
  console.log('Record', file, record);
  return file;
};

/**
 * Резолвит вложенное поле по пути с поддержкой массивов
 * @param obj - Объект или массив объектов, в котором ищем поле
 * @param path - Путь до поля в формате 'relation.field' или 'array.field'
 * @param setValue - Функция для установки значения
 */
const resolveNestedField = (
  obj: Record<string, any> | Record<string, any>[],
  path: string,
  setValue: (target: Record<string, any>, key: string) => void,
) => {
  const parts = path.split('.');

  const processObject = (
    target: Record<string, any> | Record<string, any>[],
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
  client: any,
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
      console.log('TARGET', target);
      if (target[key]) {
        target[key] = resolveFileUrl(client, record, key);
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

const record = {
  id: '415l4xjz7b787ix',
  collectionId: 'pbc_3346940990',
  collectionName: 'groups',
  created: '2025-02-04 21:39:12.412Z',
  updated: '2025-05-17 00:11:08.567Z',
  title: 'Помощь и поддержка',
  users: [
    {
      id: '797528dkblw18eb',
      collectionId: '_pb_users_auth_',
      collectionName: 'users',
      avatars: [],
      // ... другие поля
    },
    {
      id: '4y4e7x00yc76032',
      collectionId: '_pb_users_auth_',
      collectionName: 'users',
      avatars: ['7331f0ad3d_just_a_chill_guy_2_2_ui4e9c4py3.jpeg'],
      // ... другие поля
    },
  ],
};

const result = resolveRecord(
  record,
  ['users'],
  {
    multiple: ['users.avatars'],
  },
  null,
);

console.log('RES', result);
