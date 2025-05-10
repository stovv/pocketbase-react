export type ExpandType = string[];
export type FileFields = {
  single: string[];
  multiple: string[];
};

/**
 * Other hooks models
 * */
export type UseAuthProps = {
  expand?: ExpandType;
};

/**
 * Record models
 * */
export type UseRecordProps = {
  expand?: ExpandType;
  fileFields?: FileFields;
};

export type UseSubscribeRecordProps = {
  id?: string;
  expand?: ExpandType;
  fileFields?: FileFields;
  isInitialized: boolean;
  isLoading: boolean;
};

/**
 * Collection models
 * */
export type UseCollectionProps = {
  expand?: ExpandType;
  fileFields?: FileFields;
  options?: CollectionOptionsType;
};

export type UseSubscribeCollectionProps = {
  isInitialized: boolean;
  isLoading: boolean;
  expand?: ExpandType;
  fileFields?: FileFields;
};

export type UseFetchCollectionProps = {
  expand?: ExpandType;
  fileFields?: FileFields;
} & CollectionOptionsType;

export type CollectionOptionsType = {
  limit?: number;
  sort?: {
    [key: string]: 'desc' | 'asc';
  };
  filter?: string;
};
