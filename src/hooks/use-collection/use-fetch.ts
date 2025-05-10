import { useEffect, useState } from 'react';
import { useClient } from '../use-client';
import { useLibDispatch } from '../../store';
import { prepareOptions } from '../../utils';
import { actions } from '../../store/content';
import type { BaseModel } from 'pocketbase';
import type { UseFetchCollectionProps } from '../../types';

export const useFetch = <RecordModel extends BaseModel = BaseModel>(
  collection: string,
  { expand, sort, filter, limit, fileFields }: UseFetchCollectionProps,
) => {
  const client = useClient();
  const dispatch = useLibDispatch();

  // Loadings state
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options state
  const [sortIndexes, setSortIndexes] = useState<{ [id: string]: number }>({});
  const [filterIds, setFilteredIds] = useState<string[]>([]);

  // Data state
  const [data, setData] = useState<RecordModel[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Fetch data
  useEffect(() => {
    if (!client) return;
    setIsLoading(true);
    setInitialized(true);

    client
      .collection(collection)
      .getList<RecordModel>(page, limit, prepareOptions({ expand, sort, filter }))
      .then(async ({ items, totalItems }) => {
        // Save data
        setData(items);
        dispatch(
          actions.setCollection({
            collection,
            data: items,
            expand,
            client,
            fileFields,
          }),
        );

        // Save total
        setTotal(totalItems);

        // Save sort indexes
        if (sort) {
          const indexes = items.reduce(
            (acc, item, index) => ({
              ...acc,
              [item.id]: index,
            }),
            {},
          );
          setSortIndexes(indexes);
        }

        // Save filter ids
        if (filter) {
          setFilteredIds(items.map((item) => item.id));
        }

        setIsLoading(false);
      })
      .catch((e) => {
        setError(e);
        setIsLoading(false);
      });
  }, [client, collection, page, limit, expand, sort, filter]);

  const next = () => {
    if (!total || !data || data.length >= total) return;
    setPage(page + 1);
  };

  return {
    total,
    isInitialized,
    isLoading,
    next,
    sortIndexes,
    filterIds,
    error,
  };
};
