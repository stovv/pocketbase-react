# Content Fetching

The PocketBase React SDK provides powerful hooks for fetching and managing content from your PocketBase collections.

## Expanded Records

### Understanding Expand

The SDK provides a powerful way to handle expanded records. When you request expanded relations, they are automatically embedded into the original record structure. This means that instead of having separate references, the expanded data becomes part of the record itself:

```typescript
// Original record structure
interface User {
  id: string;
  name: string;
  author: string; // Reference ID to Author
  bio: string; // Reference ID to Bio
}

// After expansion with expand: ['author', 'author.bio']
interface ExpandedUser {
  id: string;
  name: string;
  author: {
    id: string;
    nickname: string;
    bio: {
      id: string;
      description: string;
      otherField: string;
    }
  }
}
```

This approach provides several benefits:
1. Direct access to nested data without checking expand object
2. Cleaner TypeScript types for expanded records
3. Simpler state management as expanded data is part of the record

### Type Safety with Expand

```typescript
import { BaseModel } from 'pocketbase';

// Define your record types
interface Bio extends BaseModel {
  description: string;
  otherField: string;
}

interface Author extends BaseModel {
  nickname: string;
  bio: Bio;
}

interface User extends BaseModel {
  name: string;
  author: Author; // Will be populated with expanded data
}

// Usage with hooks
const { data } = useCollection<User>('users', {
  expand: ['author', 'author.bio']
});

// Direct access to nested data
data.map(user => {
  console.log(user.author.nickname); // Properly typed
  console.log(user.author.bio.description); // Properly typed
});
```

## Collection Management

### useCollection Hook

The `useCollection` hook provides a complete solution for working with collections:

```typescript
type UseCollectionProps<T extends BaseModel> = {
  expand?: string[];           // Relations to expand (supports nested expand with dot notation)
  options?: {
    limit?: number;           // Records per page
    sort?: {                  // Sorting configuration
      [key: string]: 'desc' | 'asc'
    };
    filter?: string;         // Filter query
  };
};

const {
  data,           // array of records of type T with expanded fields embedded
  isLoading,      // loading state
  isError,        // error state
  error,          // error object
  isInitialized,  // initialization state
  isEnd,          // whether there are more records
  next            // function to load next page
} = useCollection<T>(collection, options);
```

### Basic Usage

```tsx
import { useCollection } from 'pocketbase-react';

interface Bio extends BaseModel {
  description: string;
  createdAt: string;
}

interface Author extends BaseModel {
  nickname: string;
  avatar: string;
  bio: Bio;
}

interface Post extends BaseModel {
  title: string;
  content: string;
  author: Author; // Will contain expanded author data
}

const PostsList = () => {
  const { data, isLoading, isError, error } = useCollection<Post>('posts', {
    options: {
      sort: { created: 'desc' },
      limit: 20,
      filter: 'status = "published"'
    },
    expand: ['author', 'author.bio']
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error}</div>;

  return (
    <div>
      {data.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <div className="author">
            <img src={post.author.avatar} alt={post.author.nickname} />
            <p>By: {post.author.nickname}</p>
            <p>Bio: {post.author.bio.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Infinite Scroll Implementation

```tsx
import { useCollection } from 'pocketbase-react';
import { useEffect, useRef } from 'react';

const InfiniteScrollPosts = () => {
  const { 
    data, 
    isLoading, 
    isError,
    error, 
    next, 
    isEnd 
  } = useCollection('posts', {
    options: {
      sort: { created: 'desc' },
      limit: 20
    },
    expand: ['author']
  });

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && !isEnd) {
          next();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isLoading, isEnd]);

  if (isError) return <div>Error: {error}</div>;

  return (
    <div>
      {data.map(post => (
        <div key={post.id} className="post-card">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {post.expand?.author && (
            <div className="author">
              By {post.expand.author.name}
            </div>
          )}
        </div>
      ))}
      
      {!isEnd && (
        <div ref={observerTarget}>
          {isLoading ? 'Loading more posts...' : 'Load more'}
        </div>
      )}
    </div>
  );
};
```

## Record Management

### useRecord Hook

The `useRecord` hook is designed for working with individual records:

```typescript
const { 
  data,           // record object of type T with expanded fields embedded
  isLoading,      // loading state
  isError,        // error state
  error,          // error object
  isInitialized,  // initialization state
  isDeleted       // whether record was deleted
} = useRecord<T extends BaseModel>(collection, id, expand);
```

### Basic Usage

```tsx
import { useRecord } from 'pocketbase-react';

interface Category extends BaseModel {
  name: string;
  description: string;
}

interface Bio extends BaseModel {
  description: string;
  socialLinks: string[];
}

interface Author extends BaseModel {
  nickname: string;
  avatar: string;
  bio: Bio;
}

interface Post extends BaseModel {
  title: string;
  content: string;
  author: Author;
  categories: Category[];
}

const SinglePost = ({ id }) => {
  const { 
    data: post, 
    isLoading, 
    isError,
    error,
    isDeleted 
  } = useRecord<Post>('posts', id, ['author', 'author.bio', 'categories']);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error}</div>;
  if (isDeleted) return <div>Post was deleted</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <div className="author">
        <img src={post.author.avatar} alt={post.author.nickname} />
        <p>By: {post.author.nickname}</p>
        <p>Bio: {post.author.bio.description}</p>
        <div className="social-links">
          {post.author.bio.socialLinks.map(link => (
            <a key={link} href={link}>{link}</a>
          ))}
        </div>
      </div>
      <div className="categories">
        {post.categories.map(category => (
          <span key={category.id} className="category">
            {category.name} - {category.description}
          </span>
        ))}
      </div>
    </div>
  );
};
```

## Real-time Updates

Both `useCollection` and `useRecord` hooks automatically handle real-time updates. When a record is created, updated, or deleted, the UI will update automatically.

### Collection Updates

- New records are added to the collection
- Updated records are updated in place with expanded fields embedded
- Deleted records are removed from the collection

### Record Updates

- Record updates are reflected immediately with all expanded fields
- When a record is deleted, `isDeleted` becomes `true`

## Connection Status

### useConnectionStatus Hook

Monitor the connection status to PocketBase:

```tsx
import { useConnectionStatus } from 'pocketbase-react';

const ConnectionIndicator = () => {
  const isConnected = useConnectionStatus();
  
  return (
    <div className={`status ${isConnected ? 'online' : 'offline'}`}>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}; 