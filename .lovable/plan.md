

# Plan: Implement Real Authentication

## What needs to happen

Replace the fake local-state auth with real backend authentication so users can sign up, log in, stay logged in across refreshes, and have uploads attached to their account.

## Changes

### 1. Auth context (new file: `src/context/AuthContext.tsx`)
- Create a dedicated auth context using `supabase.auth.onAuthStateChange` and `supabase.auth.getSession`
- Expose: `user`, `session`, `loading`, `signUp`, `signIn`, `signOut`
- Wrap the app with this provider

### 2. Login page (`src/pages/Login.tsx`)
- Replace fake `handleSubmit` with real `supabase.auth.signUp` / `supabase.auth.signInWithPassword`
- Show proper error messages (invalid credentials, email taken, etc.)
- Replace fake forgot-password with `supabase.auth.resetPasswordForEmail`
- Remove dependency on `AppContext.setAuthenticated`

### 3. AppContext (`src/context/AppContext.tsx`)
- Remove `isAuthenticated` / `setAuthenticated` local state
- Read auth state from the new AuthContext instead
- When user is authenticated, pass `user.id` as `user_id` when persisting media/share links

### 4. Route protection (`src/components/DashboardLayout.tsx`)
- If user is not authenticated, redirect to `/login`
- Show loading state while session is being checked

### 5. Upload persistence (`src/lib/supabaseHelpers.ts`)
- Update `persistMedia` to accept and store `user_id` from the authenticated session
- Update `persistShareLink` similarly

### 6. App.tsx
- Add `AuthProvider` wrapping the app
- Add a `/reset-password` route for the password reset flow

### 7. Password reset page (new: `src/pages/ResetPassword.tsx`)
- Check for recovery token in URL
- Let user set a new password via `supabase.auth.updateUser`

### 8. Auth configuration
- Use `cloud--configure_auth` to ensure email+password auth is enabled
- Email confirmation will be required by default (no auto-confirm)

## What stays the same
- Anonymous upload flow (2 free uploads without account) — unchanged
- All UI styling and layout — unchanged
- Database schema — unchanged (tables already have nullable `user_id`)
- Landing page, share pages — unchanged

## Estimated scope
~7 files changed/created. Core auth flow with sign up, sign in, sign out, session persistence, route protection, and password reset.

