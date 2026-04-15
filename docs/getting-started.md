# Getting Started

## Installation

### React

```bash
# Using npm
npm install pocketbase-react --save

# Using yarn
yarn add pocketbase-react
```

### React Native / Expo

For React Native or Expo projects, you'll need to install an additional polyfill for EventSource:

```bash
# Using npm
npm install react-native-sse --save

# Using yarn
yarn add react-native-sse
```

Create an EventSource polyfill file:

```typescript
// EventSource.ts
import EventSource from 'react-native-sse';

// @ts-ignore
global.EventSource = EventSource;
```

## Setup

### Provider Configuration

The SDK uses a provider pattern to manage state and configuration. Here's how to set it up:

```tsx
// App.tsx
import { PocketBaseProvider } from 'pocketbase-react';

const App = () => {
  return (
    <PocketBaseProvider
      serverURL="YOUR_SERVER_URL"                 // PocketBase server URL
      connectionCheckInterval={30}                // Connection check interval in seconds
      webRedirectUrl="http://localhost:3000"      // OAuth redirect URL for web
      mobileRedirectUrl="expo://localhost:19000"  // OAuth redirect URL for mobile
    > 
      <YourApp />
    </PocketBaseProvider>
  );
};
```


## Basic Usage

### Connection Status Monitoring

```tsx
import { useConnectionStatus } from 'pocketbase-react';

const ConnectionStatus = () => {
  const isConnected = useConnectionStatus();
  
  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
};
```

### Using Collection

The `useCollection` hook provides an easy way to interact with your PocketBase collections:

```tsx
import { useCollection } from 'pocketbase-react';
import { BaseModel } from 'pocketbase';

interface Author extends BaseModel {
  name: string;
  avatar: string;
}

interface Post extends BaseModel {
  title: string;
  content: string;
  author: Author; // Will be populated when expanded
}

const PostsList = () => {
  const { 
    data,           // array of records with expanded fields embedded
    isLoading,      // loading state
    isError,        // error state
    error,          // error object
    isInitialized,  // initialization state
    isEnd,          // whether there are more records
    next           // function to load next page
  } = useCollection<Post>('posts', {
    options: {
      sort: { created: 'desc' },
      limit: 20
    },
    expand: ['author'] // author field will be populated with Author data
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
            <img src={post.author.avatar} alt={post.author.name} />
            <p>By: {post.author.name}</p>
          </div>
        </div>
      ))}
      {!isEnd && (
        <button onClick={next}>
          Load More
        </button>
      )}
    </div>
  );
};
```

### Working with Single Records

```tsx
import { useRecord } from 'pocketbase-react';
import { BaseModel } from 'pocketbase';

interface Category extends BaseModel {
  name: string;
  color: string;
}

interface Author extends BaseModel {
  name: string;
  avatar: string;
}

interface Post extends BaseModel {
  title: string;
  content: string;
  author: Author; // Will be populated when expanded
  categories: Category[]; // Will be populated when expanded
}

const SinglePost = ({ id }) => {
  const { 
    data: post,     // record data with expanded fields embedded
    isLoading,      // loading state
    isError,        // error state
    error,          // error object
    isDeleted,      // whether record was deleted
    isInitialized   // initialization state
  } = useRecord<Post>('posts', id, ['author', 'categories']);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error}</div>;
  if (isDeleted) return <div>Post was deleted</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <div className="author">
        <img src={post.author.avatar} alt={post.author.name} />
        <p>By: {post.author.name}</p>
      </div>
      <div className="categories">
        {post.categories.map(category => (
          <span 
            key={category.id} 
            className="category"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        ))}
      </div>
    </div>
  );
};
```