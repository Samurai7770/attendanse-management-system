# Firebase Local Development Setup

## Issue
The backend is fully migrated to Firebase, but you need to set up Firebase credentials to make it work locally.

## Solution: Two Options

### Option 1: Google Cloud CLI (Recommended for Development)

This is the easiest way for local development.

#### Steps:
1. **Install Google Cloud CLI**
   - Download from: https://cloud.google.com/sdk/docs/install
   - Or via Chocolatey: `choco install google-cloud-sdk`

2. **Authenticate with Google**
   ```bash
   gcloud auth application-default login
   ```
   - This will open a browser where you log in with your Google account
   - Accept the permissions
   
3. **Close and restart your backend**
   - The backend will now use your authenticated Google account

4. **That's it!** The backend should now connect to Firebase

---

### Option 2: Firebase Service Account Key (For Production/Render)

This is required for deployment on Render.

#### Steps:
1. **Get Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `attendancesystem-36430`
   - Click ⚙️ **Project Settings** (top left)
   - Go to **Service Accounts** tab
   - Click **Generate New Private Key** button
   - Save the downloaded JSON file

2. **Add to Environment**
   - **For local testing**: Copy the entire JSON content and add to `.env`:
     ```
     FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"attendancesystem-36430","...":"..."}
     ```
   
   - **For Render deployment**: In Render dashboard:
     - Go to your service settings
     - Add secret: `FIREBASE_SERVICE_ACCOUNT_KEY` = entire JSON content

3. **Restart backend**
   - Backend will now use the service account key

---

## Quick Test

After setting up credentials, test the backend:

```bash
npm start
```

Test the login endpoint:
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","role":"student"}'
```

You should get a 200 response with user data.

---

## Troubleshooting

### Still getting "Could not load the default credentials"?
- Make sure you ran `gcloud auth application-default login`
- Restart your backend after running the gcloud command
- Check that your Google account has access to the Firebase project

### "Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY"?
-Make sure you copied the ENTIRE JSON as one line without extra formatting
- Don't include line breaks in the environment variable

### "Permission denied" errors?
- Make sure your Google account or service account has Editor permissions on the Firebase project
- Go to Firebase Project Settings → Project Permissions

for MoreHelp:
- Firebase Docs: https://firebase.google.com/docs/firestore
- GCloud Setup: https://cloud.google.com/docs/authentication/getting-started
