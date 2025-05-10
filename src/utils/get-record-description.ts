import type { RecordDescription } from '../types';

export const getRecordDescription = ({ id, collection }: RecordDescription) => [
  collection,
  id,
];

export const findRecordSubscribe = (records: string[][], record: RecordDescription) =>
  records.findIndex(
    ([collection, id]) => collection === record.collection && id === record.id,
  );

export const hasRecordSubscribe = (records: string[][], record: RecordDescription) =>
  findRecordSubscribe(records, record) !== -1;
