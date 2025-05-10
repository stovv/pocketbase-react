# Authentication

The PocketBase React SDK provides comprehensive authentication functionality through the `useAuth` hook.

## Basic Usage

```tsx
import { useAuth } from 'pocketbase-react';

// Define your user model type
interface Profile extends BaseModel {
  description: string;
  socialLinks: string[];
}

interface UserModel extends BaseModel {
  email: string;
  name: string;
  profile: Profile; // Will be populated when expanded
}

const AuthComponent = () => {
  const { 
    isSigned,      // whether user is signed in
    user,          // current user data with expanded fields embedded
    isLoading,     // loading state
    isError,       // error state
    error,         // error object
    isDeleted,     // whether user profile was deleted
    actions        // auth actions
  } = useAuth<UserModel>({
    expand: ['profile'] // expand relations - they will be embedded in the user object
  });

  if (isDeleted) return <div>The profile has been deleted :(</div>;
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error}</div>;
  if (!isSigned) return <LoginForm />;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <div className="profile">
        <p>{user.profile.description}</p>
        <div className="social-links">
          {user.profile.socialLinks.map(link => (
            <a key={link} href={link}>{link}</a>
          ))}
        </div>
      </div>
      <button onClick={actions.signOut}>Sign Out</button>
    </div>
  );
};
```

## Hook Type Definition

```typescript
function useAuth<UserModel extends BaseModel>({ 
  expand?: string[] // Relations to expand - they will be embedded in the user object
}: UseAuthProps) => {
  isSigned: boolean | null;    // null during initial load
  user: UserModel | null;      // current user data with expanded fields
  isLoading: boolean;         // loading state
  isError: boolean;           // error state
  error: string | null;       // error message
  isDeleted: boolean;         // whether user profile was deleted
  isInitialized: boolean;     // whether auth state is initialized
  actions: {
    registerWithEmail: (email: string, password: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithProvider: (provider: string, openURL: (url: string) => Promise<void>) => Promise<void>;
    submitProviderResult: (urlOrParams: string | { code: string; state: string }) => Promise<void>;
    signOut: () => void;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    sendEmailVerification: (email: string) => Promise<void>;
    updateProfile: (id: string, record: Record<string, unknown>) => Promise<void>;
    updateEmail: (email: string) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
  };
}
```

## Authentication Actions

### Email Authentication

```tsx
const { actions } = useAuth();

// Register with email
await actions.registerWithEmail(email, password);

// Sign in with email
await actions.signInWithEmail(email, password);

// Send password reset email
await actions.sendPasswordResetEmail(email);

// Send email verification
await actions.sendEmailVerification(email);
```

### OAuth Authentication

```tsx
const { actions } = useAuth();

// Sign in with OAuth provider (e.g., 'google', 'github')
await actions.signInWithProvider(provider, async (url) => {
  // Handle URL opening (e.g., using WebBrowser in Expo)
  await WebBrowser.openBrowserAsync(url);
});

// Handle OAuth redirect result
await actions.submitProviderResult(url);
```

### Profile Management

```tsx
const { actions } = useAuth();

// Update user profile
await actions.updateProfile(id, {
  bio: 'New bio',
  avatar: file // File object
});

// Update email
await actions.updateEmail(newEmail);

// Delete user account
await actions.deleteUser(id);
```

## Complete Authentication Example

```tsx
import { useAuth } from 'pocketbase-react';
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser'; // For Expo apps
import { BaseModel } from 'pocketbase';

interface Settings extends BaseModel {
  theme: string;
  notifications: boolean;
}

interface Profile extends BaseModel {
  bio: string;
  avatar: string;
  settings: Settings; // Will be populated when expanded
}

interface UserModel extends BaseModel {
  email: string;
  name: string;
  profile: Profile; // Will be populated when expanded
}

const AuthExample = () => {
  const { 
    isSigned, 
    user, 
    isLoading,
    isError,
    error,
    isDeleted,
    actions 
  } = useAuth<UserModel>({
    expand: ['profile', 'profile.settings'] // Nested expand is supported
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      await actions.signInWithEmail(email, password);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      await actions.signInWithProvider(provider, async (url) => {
        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        } else {
          await WebBrowser.openBrowserAsync(url);
        }
      });
    } catch (error) {
      console.error('OAuth sign in failed:', error);
    }
  };

  if (isDeleted) return <div>The profile has been deleted :(</div>;
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error}</div>;

  if (isSigned && user) {
    return (
      <div>
        <h1>Welcome, {user.name}!</h1>
        <div>
          <h2>Profile</h2>
          <p>Email: {user.email}</p>
          <p>Bio: {user.profile.bio}</p>
          {user.profile.avatar && (
            <img src={user.profile.avatar} alt="Profile" />
          )}
          <div className="settings">
            <h3>Settings</h3>
            <p>Theme: {user.profile.settings.theme}</p>
            <p>Notifications: {user.profile.settings.notifications ? 'On' : 'Off'}</p>
          </div>
        </div>
        <button onClick={actions.signOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleEmailSignIn}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Sign In with Email</button>
      </form>

      <button onClick={() => handleOAuthSignIn('google')}>
        Sign In with Google
      </button>
      <button onClick={() => handleOAuthSignIn('github')}>
        Sign In with GitHub
      </button>
    </div>
  );
}; 
```