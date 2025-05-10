import type { FileOptions } from 'pocketbase';
import type { useClient } from '../hooks';

export const resolveFileUrl = (
  client: ReturnType<typeof useClient>,
  record?: {
    collectionId: string;
    id: string;
    [key: string]: any;
  } | null,
  file?: string,
  options: FileOptions = {
    thumb: '100x250',
  },
) => {
  if (!client || !file || !record) return undefined;

  return client.files.getURL(record, file, options);
};
