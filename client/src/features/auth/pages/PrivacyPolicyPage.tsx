import { LegalDocumentPage } from "@features/auth/components/LegalDocumentPage";

const sections = [
  {
    title: "Information we collect",
    paragraphs: [
      "We may collect account details such as your name, email address, login activity, and organization context, along with resumes, job descriptions, application records, and other workflow data submitted through the platform.",
      "We may also collect technical information needed to operate the service, including browser metadata, device information, and diagnostic logs.",
    ],
  },
  {
    title: "How data is used",
    paragraphs: [
      "We use collected information to provide authentication, resume screening, candidate matching, analytics, workflow automation, support, and service reliability features.",
      "We may also use data to improve platform quality, investigate abuse, comply with legal obligations, and maintain system security.",
    ],
  },
  {
    title: "Cookies and session usage",
    paragraphs: [
      "NexSkill uses secure authentication cookies and session-related data to keep users signed in, protect account access, and support features such as remember-me behavior when selected.",
      "These mechanisms are used for service operation and security rather than for storing plain-text passwords or exposing sensitive credentials in browser storage.",
    ],
  },
  {
    title: "Authentication and security",
    paragraphs: [
      "We apply security controls designed to protect account access and sensitive data, including protected authentication flows, session handling, and safeguards around password storage and token issuance.",
      "No system is completely risk-free, but we take reasonable steps to reduce unauthorized access, misuse, and accidental disclosure.",
    ],
  },
  {
    title: "Data retention",
    paragraphs: [
      "We retain personal and workflow data for as long as needed to operate the service, satisfy contractual obligations, resolve disputes, enforce policies, and comply with applicable law.",
      "Retention periods may vary depending on account status, legal obligations, customer instructions, and the type of information involved.",
    ],
  },
  {
    title: "Third-party services",
    paragraphs: [
      "We may rely on third-party providers for infrastructure, analytics, email delivery, storage, and other operational capabilities. Those providers may process data on our behalf subject to their own contractual and security obligations.",
      "If future integrations are added, this policy can be updated to reflect those services more specifically.",
    ],
  },
  {
    title: "User rights and updates",
    paragraphs: [
      "Depending on your location and relationship to the platform, you may have rights related to access, correction, deletion, or restriction of certain personal information. Requests should be routed through the appropriate support or administrative contact.",
      "We may update this Privacy Policy as the platform evolves. When material changes are made, we may provide notice through the application or other reasonable channels.",
    ],
  },
];

const PrivacyPolicyPage = () => (
  <LegalDocumentPage
    title="Privacy Policy"
    intro="This Privacy Policy explains the starter approach NexSkill uses to collect, process, secure, and retain information within a semantic-driven resume screening platform."
    sections={sections}
  />
);

export default PrivacyPolicyPage;
