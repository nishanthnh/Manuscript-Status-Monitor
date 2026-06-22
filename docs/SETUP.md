# Setup Guide

This guide shows how to run the manuscript status monitor fully online using Google Apps Script.

## 1. Create the Apps Script Project

1. Open [script.google.com](https://script.google.com).
2. Click **New project**.
3. Rename the project, for example: `manuscript_status_monitor`.
4. Delete the default `myFunction` code.
5. Paste the contents of [`../Code.gs`](../Code.gs).

## 2. Configure the Script

At the top of the script, edit this block:

```javascript
const CONFIG = {
  emailTo: "your-email@example.com",
  trackerPageUrl: "https://track.authorhub.elsevier.com/?uuid=YOUR_TRACKER_UUID_HERE",
  trackerApiBaseUrl: "https://tnlkuelk67.execute-api.us-east-1.amazonaws.com/tracker/",
  emailSubjectPrefix: "Manuscript tracker",
};
```

Replace:

- `your-email@example.com` with the email address where you want alerts
- `YOUR_TRACKER_UUID_HERE` with the UUID from your own manuscript tracking URL

Example tracker URL format:

```text
https://track.authorhub.elsevier.com/?uuid=YOUR_TRACKER_UUID_HERE
```

## 3. Send a Test Email

1. In Apps Script, choose `sendTestEmail` from the function dropdown.
2. Click **Run**.
3. Approve the Google permission prompts.
4. Check your inbox for a test email.

If Google shows "Google has not verified this app", this is expected for a personal script. Continue only if you created the script yourself and understand the requested permissions.

## 4. Save the First Baseline

Choose `checkManuscriptStatus` from the function dropdown and click **Run**.

The first run saves the current manuscript details and sends a "started" email.

## 5. Add the Hourly Trigger

1. Click the clock icon on the left sidebar.
2. Click **Add Trigger**.
3. Use these settings:

```text
Function: checkManuscriptStatus
Deployment: Head
Event source: Time-driven
Type: Hour timer
Interval: Every hour
```

4. Click **Save**.

The script will now run online. Your computer does not need to stay on.

## 6. Reset the Saved Status

If you want the script to forget the saved baseline, run:

```text
resetSavedStatus
```

Then run:

```text
checkManuscriptStatus
```

This saves a fresh baseline.
