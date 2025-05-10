import type { ExpandType } from '../types';

export const convertSort = (sort: {
  [key: string]: 'desc' | 'asc';
}) =>
  Object.keys(sort)
    .map((key) => `${sort[key] === 'desc' ? '-' : ''}${key}`)
    .join(',');

export const prepareOptions = (props: {
  expand?: ExpandType;
  sort?: {
    [key: string]: 'desc' | 'asc';
  };
  filter?: string;
}) => {
  let options = {};

  if (props.expand) {
    const expandArray = Array.isArray(props.expand) ? props.expand : [props.expand];
    options = {
      ...options,
      expand: expandArray,
    };
  }

  if (props.sort) {
    options = {
      ...options,
      sort: convertSort(props.sort),
    };
  }

  if (props.filter) {
    options = {
      ...options,
      filter: props.filter,
    };
  }

  return options;
};
