# Auth0 Setup Guide

## Current Configuration

Your app is configured to use Auth0 for authentication with the following credentials:

- **Domain**: `dev-3e3n4mi7tokt4bpi.us.auth0.com`
- **Client ID**: `AFWuJwwc7ORHRQB1rSY041R0teostGA1`

## Required Auth0 Dashboard Configuration

To make Auth0 work properly, you MUST configure these URLs in your Auth0 Dashboard:

### 1. Go to Auth0 Dashboard

Visit: https://manage.auth0.com/

### 2. Navigate to Your Application

- Applications → Applications
- Select your ConnectHER application

### 3. Configure Callback URLs

Add these URLs to the **Allowed Callback URLs** field:

```
http://localhost:5173, http://localhost:5173/
```

### 4. Configure Logout URLs

Add these URLs to the **Allowed Logout URLs** field:

```
http://localhost:5173, http://localhost:5173/
```

### 5. Configure Web Origins

Add these URLs to the **Allowed Web Origins** field:

```
http://localhost:5173
```

### 6. Save Changes

Click **Save Changes** at the bottom of the page.

## How Auth0 Login Works

1. **User clicks "Login"** on your app
2. **Redirected to Auth0** login page (hosted by Auth0)
3. **User enters credentials** on Auth0's page
4. **Auth0 validates** and redirects back to your app
5. **User is logged in** on your app

## Testing Auth0

### 1. Restart the dev server

```bash
cd frontend
npm run dev
```

### 2. Test Registration

1. Go to `http://localhost:5173/register`
2. Fill in the form and click "Register"
3. You should be redirected to Auth0's signup page
4. Create an account on Auth0
5. You'll be redirected back to your dashboard

### 3. Test Login

1. Go to `http://localhost:5173/login`
2. Enter your email and click "Login"
3. You should be redirected to Auth0's login page
4. Enter your password
5. You'll be redirected back to your dashboard

## Troubleshooting

### Issue: "Callback URL mismatch" error

**Solution**: Make sure `http://localhost:5173` is added to Allowed Callback URLs in Auth0 Dashboard

### Issue: Stuck on loading

**Solution**:
1. Clear browser cache and localStorage
2. Make sure Auth0 Dashboard URLs are configured correctly
3. Check browser console for errors

### Issue: Not redirecting after login

**Solution**:
1. Check that `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` are set in `.env`
2. Restart the dev server
3. Clear browser cache

## Current Status

✅ Auth0 credentials configured in `.env`
✅ Auth0Provider set up in `main.tsx`
✅ AuthContext integrated with forms
⚠️ **ACTION REQUIRED**: Configure callback URLs in Auth0 Dashboard

Once you configure the callback URLs in Auth0 Dashboard, authentication should work!
