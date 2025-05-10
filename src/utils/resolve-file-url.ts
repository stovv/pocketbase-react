import type { BaseModel, FileOptions } from 'pocketbase';
import type { Client } from '../types';

export const resolveFileUrl = <T extends BaseModel = BaseModel>(
  client: Client,
  record?: T | null,
  file?: string,
  options: FileOptions = {
    thumb: '100x250',
  },
) => {
  if (!client || !file || !record) return undefined;

  return client.files.getURL(record, file, options);
};
