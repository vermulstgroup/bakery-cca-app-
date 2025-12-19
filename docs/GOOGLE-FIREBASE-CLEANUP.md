# Google Cloud & Firebase Cleanup Guide

**Date:** 2025-12-19
**Purpose:** Remove old Google Cloud/Firebase deployment to avoid costs

---

## Background

The BISS Bakery app was previously deployed on Google Cloud Run at:
```
https://studio--studio-7015425522-94d4d.us-central1.hosted.app
```

The app has been migrated to **Vercel** (free tier) and is now live at:
```
https://biss-bakery-app.vercel.app
```

The old Google Cloud deployment should be deleted to avoid any potential charges.

---

## Step-by-Step Cleanup Instructions

### Step 1: Delete Firebase Project

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select the project: `studio-7015425522` (or similar name)
3. Click the **gear icon** (Settings) in the left sidebar
4. Scroll down to **"Your project"** section
5. Click **"Delete project"**
6. Follow the prompts to confirm deletion
7. Type the project ID to confirm

### Step 2: Delete Google Cloud Resources

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select the project from the dropdown at the top
3. Go to **Cloud Run** (search in the top bar)
4. Select the `studio` service
5. Click **"Delete"** and confirm

### Step 3: Shut Down the Project (Optional but Recommended)

1. In Google Cloud Console, go to **IAM & Admin** → **Settings**
2. Click **"Shut down"** at the top
3. This prevents any accidental resource creation
4. The project will be deleted after 30 days

---

## Verification

After cleanup, verify:

- [ ] Firebase Console shows no active projects (or project is marked for deletion)
- [ ] Google Cloud Console shows no running Cloud Run services
- [ ] Old URL returns 404 or error: `https://studio--studio-7015425522-94d4d.us-central1.hosted.app`
- [ ] New Vercel URL works: `https://biss-bakery-app.vercel.app`

---

## New Deployment Details

| Property | Value |
|----------|-------|
| **Platform** | Vercel (Free Tier) |
| **URL** | https://biss-bakery-app.vercel.app |
| **Version** | 2.0.0 |
| **App Name** | BISS Bakery - Child Care Africa |
| **Repository** | Connected to GitHub main branch |

---

## Cost Comparison

| Platform | Monthly Cost |
|----------|-------------|
| Google Cloud Run | Variable (pay per use) |
| Firebase (Blaze) | Variable (pay per use) |
| **Vercel Free Tier** | **$0** |

The Vercel free tier includes:
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- Automatic builds from GitHub

---

## Questions?

Contact: stefan@vermulstgroup.com
