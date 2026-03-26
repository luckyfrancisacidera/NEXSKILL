import { LegalDocumentPage } from "@features/auth/components/LegalDocumentPage";

const sections = [
  {
    title: "Acceptance of terms",
    paragraphs: [
      "By creating an account or using NexSkill, you agree to these Terms of Service and any related policies referenced in the platform. If you do not agree, you should not access or use the service.",
      "These starter terms are intended for a semantic-driven resume screening system and may be updated later to reflect legal, operational, or customer-specific requirements.",
    ],
  },
  {
    title: "User responsibilities",
    paragraphs: [
      "You are responsible for providing accurate information, maintaining lawful use of the platform, and ensuring that any resumes, job descriptions, or candidate data you upload are handled in compliance with applicable laws and permissions.",
      "You agree not to misuse the platform for spam, unauthorized scraping, harmful automation, discriminatory decision-making, or any activity that could damage the service or other users.",
    ],
  },
  {
    title: "Account security",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You should notify us promptly if you suspect unauthorized access.",
      "We may suspend or restrict access if we reasonably believe an account has been compromised or is being used in violation of these terms.",
    ],
  },
  {
    title: "Platform usage rules",
    paragraphs: [
      "NexSkill may provide resume screening, matching, scoring, and workflow support features. You remain responsible for reviewing outputs and making final hiring or operational decisions.",
      "You may not use the platform to upload unlawful content, interfere with service availability, reverse engineer protected systems, or bypass rate limits, access controls, or security protections.",
    ],
  },
  {
    title: "Intellectual property",
    paragraphs: [
      "The platform, branding, software, and related materials remain the property of NexSkill or its licensors. These terms grant you a limited right to use the service in accordance with your account permissions.",
      "You retain ownership of the content you submit, but you grant us the rights reasonably necessary to host, process, secure, and display that content in order to operate the service.",
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "The platform is provided on an as-available basis. To the fullest extent permitted by law, NexSkill disclaims warranties not expressly stated and is not liable for indirect, incidental, special, or consequential damages arising from use of the service.",
      "Because resume analysis and matching may rely on automated processing, you should independently review important outputs before taking material action.",
    ],
  },
  {
    title: "Updates to terms",
    paragraphs: [
      "We may revise these terms from time to time. Material updates may be communicated through the platform or other reasonable means, and continued use after changes take effect constitutes acceptance of the updated terms.",
    ],
  },
];

const TermsOfServicePage = () => (
  <LegalDocumentPage
    title="Terms of Service"
    intro="These Terms of Service describe the baseline rules for accessing and using NexSkill, including account expectations, platform usage standards, and responsibility boundaries."
    sections={sections}
  />
);

export default TermsOfServicePage;
