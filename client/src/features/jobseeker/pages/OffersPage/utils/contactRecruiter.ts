const buildMailtoUrl = (email: string) => `mailto:${email}`;

const buildGmailComposeUrl = (email: string) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

export const openRecruiterContact = (email: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const gmailWindow = window.open(buildGmailComposeUrl(email), "_blank", "noopener,noreferrer");

  if (gmailWindow) {
    return;
  }

  window.location.href = buildMailtoUrl(email);
};

export const fallbackRecruiterMailto = (email: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.location.href = buildMailtoUrl(email);
};
