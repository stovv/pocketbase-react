import type { BaseModel } from 'pocketbase';
import { useEffect, useState } from 'react';
import { useLibDispatch } from '../../store';
import { actions } from '../../store';
import type { UseFetchCollectionProps } from '../../types';
import { prepareOptions } from '../../utils';
import { useClient } from '../use-client';

export const useFetchCollection = <RecordModel extends BaseModel = BaseModel>(
  collection: string,
  { expand, sort, filter, limit }: UseFetchCollectionProps,
) => {
  const client = useClient();
  const dispatch = useLibDispatch();

  // Loadings state
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options state
  const [sortIndexes, setSortIndexes] = useState<{ [id: string]: number }>({});
  const [filterIds, setFilteredIds] = useState<string[] | null>(null);

  // Data state
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
        dispatch(
          actions.setCollection({
            collection,
            data: items,
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
        setFilteredIds(filter ? items.map((item) => item.id) : null);

        setIsLoading(false);
      })
      .catch((e) => {
        setError(e);
        setIsLoading(false);
      });
  }, [client, collection, page, limit, expand, sort, filter]);

  return {
    total,
    isInitialized,
    isLoading,
    next: () => setPage((prev) => prev + 1),
    sortIndexes,
    filterIds,
    error,
  };
};
