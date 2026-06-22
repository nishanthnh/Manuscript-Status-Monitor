const CONFIG = {
  emailTo: "your-email@example.com",
  trackerPageUrl: "https://track.authorhub.elsevier.com/?uuid=YOUR_TRACKER_UUID_HERE",
  trackerApiBaseUrl: "https://tnlkuelk67.execute-api.us-east-1.amazonaws.com/tracker/",
  emailSubjectPrefix: "Manuscript tracker",
};

const STATUS_LABELS = {
  3: "Under Review",
  4: "Required Reviews Complete",
  23: "Under Review",
};

const WATCHED_FIELDS = [
  ["manuscriptNumber", "Manuscript"],
  ["journal", "Journal"],
  ["title", "Title"],
  ["status", "Status"],
  ["statusCode", "Status code"],
  ["lastReviewActivity", "Last review activity"],
  ["revision", "Revision"],
  ["reviewsCompleted", "Reviews completed"],
  ["reviewInvitationsAccepted", "Review invitations accepted"],
  ["reviewInvitationsSent", "Review invitations sent"],
];

function checkManuscriptStatus() {
  const current = fetchStatusSnapshot();
  const properties = PropertiesService.getScriptProperties();
  const previousHash = properties.getProperty("lastStatusHash");
  const previousSnapshotText = properties.getProperty("lastStatusSnapshot");

  if (!previousHash) {
    saveSnapshot(properties, current);
    sendEmail(
      CONFIG.emailSubjectPrefix + " started",
      "The hourly manuscript checker is now active.\n\n" + formatSnapshot(current.snapshot)
    );
    return;
  }

  if (previousHash !== current.hash) {
    const previousSnapshot = previousSnapshotText ? JSON.parse(previousSnapshotText) : null;
    saveSnapshot(properties, current);

    const body =
      "Your manuscript tracking page changed.\n\n" +
      formatChanges(previousSnapshot, current.snapshot) +
      "\n\nPrevious:\n" +
      (previousSnapshot ? formatSnapshot(previousSnapshot) : "No previous details were saved.") +
      "\n\nCurrent:\n" +
      formatSnapshot(current.snapshot);

    sendEmail(CONFIG.emailSubjectPrefix + " changed", body);
  }
}

function sendTestEmail() {
  const current = fetchStatusSnapshot();
  sendEmail(
    CONFIG.emailSubjectPrefix + " test",
    "This is a test email from your manuscript tracker.\n\n" + formatSnapshot(current.snapshot)
  );
}

function resetSavedStatus() {
  const properties = PropertiesService.getScriptProperties();
  properties.deleteProperty("lastStatusHash");
  properties.deleteProperty("lastStatusSnapshot");
  sendEmail(CONFIG.emailSubjectPrefix + " reset", "Saved manuscript status was cleared.");
}

function fetchStatusSnapshot() {
  const response = UrlFetchApp.fetch(getTrackerApiUrl(), {
    method: "get",
    muteHttpExceptions: true,
    headers: {
      Accept: "application/json",
    },
  });

  if (response.getResponseCode() !== 200) {
    throw new Error("Tracker returned HTTP " + response.getResponseCode());
  }

  const data = JSON.parse(response.getContentText());
  const snapshot = buildSnapshot(data);

  return {
    snapshot: snapshot,
    hash: sha256(JSON.stringify(buildWatchedSnapshot(snapshot))),
  };
}

function buildSnapshot(data) {
  const reviewSummary = data.ReviewSummary || {};
  return {
    manuscriptNumber: data.PubdNumber || "",
    journal: data.JournalName || "",
    title: data.ManuscriptTitle || "",
    status: STATUS_LABELS[data.Status] || "Review Complete",
    statusCode: data.Status || "",
    lastReviewActivity: formatUnixDate(data.LastUpdated),
    revision: data.LatestRevisionNumber || 0,
    reviewsCompleted: reviewSummary.ReviewsCompleted || "",
    reviewInvitationsAccepted: reviewSummary.ReviewInvitationsAccepted || "",
    reviewInvitationsSent: reviewSummary.ReviewInvitationsSent || "",
    checkedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss z"),
    link: CONFIG.trackerPageUrl,
  };
}

function buildWatchedSnapshot(snapshot) {
  const watched = {};
  WATCHED_FIELDS.forEach(function (field) {
    watched[field[0]] = snapshot[field[0]];
  });
  return watched;
}

function formatSnapshot(snapshot) {
  return [
    "Manuscript: " + snapshot.manuscriptNumber,
    "Journal: " + snapshot.journal,
    "Title: " + snapshot.title,
    "Status: " + snapshot.status + " (" + snapshot.statusCode + ")",
    "Last review activity: " + snapshot.lastReviewActivity,
    "Revision: " + snapshot.revision,
    "Reviews completed: " + snapshot.reviewsCompleted,
    "Review invitations accepted: " + snapshot.reviewInvitationsAccepted,
    "Review invitations sent: " + snapshot.reviewInvitationsSent,
    "Checked at: " + snapshot.checkedAt,
    "Link: " + snapshot.link,
  ].join("\n");
}

function formatChanges(previousSnapshot, currentSnapshot) {
  if (!previousSnapshot) {
    return "Changed fields: previous details were not available.";
  }

  const changes = WATCHED_FIELDS.filter(function (field) {
    const key = field[0];
    return String(previousSnapshot[key]) !== String(currentSnapshot[key]);
  }).map(function (field) {
    const key = field[0];
    const label = field[1];
    return "- " + label + ": " + previousSnapshot[key] + " -> " + currentSnapshot[key];
  });

  return changes.length ? "Changed fields:\n" + changes.join("\n") : "Saved details changed.";
}

function getTrackerApiUrl() {
  const uuid = getTrackerUuid();
  return CONFIG.trackerApiBaseUrl.replace(/\/$/, "") + "/" + encodeURIComponent(uuid);
}

function getTrackerUuid() {
  const match = String(CONFIG.trackerPageUrl).match(/[?&]uuid=([^&#]+)/i);
  if (!match || match[1].indexOf("YOUR_TRACKER_UUID") !== -1) {
    throw new Error("Replace CONFIG.trackerPageUrl with your manuscript tracking URL.");
  }
  return decodeURIComponent(match[1]);
}

function saveSnapshot(properties, current) {
  properties.setProperty("lastStatusHash", current.hash);
  properties.setProperty("lastStatusSnapshot", JSON.stringify(current.snapshot));
}

function formatUnixDate(seconds) {
  if (!seconds) {
    return "";
  }
  return Utilities.formatDate(new Date(seconds * 1000), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function sha256(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text);
  return bytes
    .map(function (byte) {
      const value = byte < 0 ? byte + 256 : byte;
      return ("0" + value.toString(16)).slice(-2);
    })
    .join("");
}

function sendEmail(subject, body) {
  MailApp.sendEmail({
    to: CONFIG.emailTo,
    subject: subject,
    body: body,
  });
}
