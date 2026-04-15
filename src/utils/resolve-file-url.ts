import omit from 'lodash/omit';
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

  if (options?.thumb && options?.download)
    return {
      thumb: client.files.getURL(record, file, omit(options, 'download')),
      download: client.files.getURL(record, file, omit(options, 'thumb')),
    };

  return client.files.getURL(record, file, options);
};
