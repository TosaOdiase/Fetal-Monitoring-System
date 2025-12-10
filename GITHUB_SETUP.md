# GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Fill in the details:
   - **Repository name:** `Fetal-Monitoring-System`
   - **Description:** `Real-time fetal cardiac monitoring system for high-risk pregnancy surveillance - CWRU Senior Capstone Project`
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

## Step 2: Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
cd "/Users/tosaodiase/Documents/EBME 370/fetal-ekg-monitor-web"

# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Fetal-Monitoring-System.git

# Rename branch to main (optional, if you prefer main over master)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Upload

1. Go to your repository on GitHub
2. You should see all files including:
   - README.md with comprehensive documentation
   - All source code files
   - Configuration files
   - .gitignore

## Step 4: Add Repository Topics (Optional but Recommended)

On your GitHub repository page:
1. Click the gear icon next to "About"
2. Add relevant topics:
   - `biomedical-engineering`
   - `medical-device`
   - `ekg-monitoring`
   - `fetal-monitoring`
   - `react`
   - `typescript`
   - `signal-processing`
   - `case-western-reserve`
   - `senior-capstone`
   - `healthcare`

## Repository URL

After setup, your repository will be available at:
```
https://github.com/YOUR_USERNAME/Fetal-Monitoring-System
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Troubleshooting

**If you get an authentication error:**
- You may need to use a Personal Access Token instead of password
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate a new token with `repo` scope
- Use the token as your password when pushing

**If the remote already exists:**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/Fetal-Monitoring-System.git
```

## Next Steps

After pushing to GitHub:
1. Add a project description and website link (if deployed)
2. Add collaborators if working with a team
3. Create issues for future enhancements
4. Set up GitHub Pages for live demo (optional)
