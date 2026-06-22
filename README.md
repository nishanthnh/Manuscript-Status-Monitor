# Manuscript Status Monitor

A small Google Apps Script automation that checks the status of a manuscript submitted to a journal using its tracking URL, then emails you only when the status or review details change.

This project was built as a lightweight research productivity tool for journal submissions that provide a simple URL to track manuscript progress: no server, no paid API, and no local computer running in the background.

## Features

- Runs online with Google Apps Script
- Checks a manuscript tracker every hour or at any schedule you choose
- Stores the previous status in Script Properties
- Sends an email only when watched fields change
- Includes a test email function
- Includes a reset function for starting over

## How It Works

1. Google Apps Script fetches the public tracker JSON data.
2. The script extracts manuscript status and review activity fields.
3. It creates a hash of the watched fields.
4. It compares the new hash with the last saved hash.
5. If the hash changed, it emails the previous and current details.

## Quick Start

1. Go to [script.google.com](https://script.google.com).
2. Create a new Apps Script project.
3. Paste the contents of [`Code.gs`](Code.gs) into the editor.
4. Edit the `CONFIG` block at the top:

```javascript
const CONFIG = {
  emailTo: "your-email@example.com",
  trackerPageUrl: "https://track.authorhub.elsevier.com/?uuid=YOUR_TRACKER_UUID_HERE",
  trackerApiBaseUrl: "https://tnlkuelk67.execute-api.us-east-1.amazonaws.com/tracker/",
  emailSubjectPrefix: "Manuscript tracker",
};
```

5. Replace `your-email@example.com` with your email address.
6. Replace `YOUR_TRACKER_UUID_HERE` with the UUID from your own tracker URL.
7. Save the project.
8. Run `sendTestEmail` once and approve the Google permission prompts.
9. Confirm that the test email arrives.
10. Add a time-driven trigger for `checkManuscriptStatus`.

Detailed setup steps are in [`docs/SETUP.md`](docs/SETUP.md).

## Trigger Settings

Recommended trigger settings:

- Function: `checkManuscriptStatus`
- Deployment: `Head`
- Event source: `Time-driven`
- Type: `Hour timer`
- Interval: `Every hour`

## Watched Fields

The script currently watches:

- Manuscript number
- Journal name
- Manuscript title
- Status
- Status code
- Last review activity
- Revision number
- Reviews completed
- Review invitations accepted
- Review invitations sent

You can edit `WATCHED_FIELDS` in [`Code.gs`](Code.gs) if you want fewer or more fields.

## Privacy Notes

Do not publish your real manuscript tracking URL, UUID, email address, manuscript title, manuscript number, or screenshots with private details.

Tracking URLs may be public to anyone who has the link. Treat them like private information.

## Limitations

- This template is designed for public tracker pages that do not require login.
- It will not work for portals that require CAPTCHA, two-factor authentication, or an active browser session.
- The tracker provider may change its backend endpoint in the future.
- This project is not affiliated with Elsevier or any journal publisher.

## Suggested GitHub Topics

`google-apps-script`, `automation`, `email-alerts`, `research-tools`, `manuscript-tracking`, `status-monitor`

## License

MIT License. See [`LICENSE`](LICENSE).
