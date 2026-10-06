// Legal copy for the Privacy Policy and Terms of Service screens.
//
// DRAFT: written from what the app actually does (see each section), but it
// has not been reviewed by a lawyer. Before release, confirm the items marked
// CONFIRM below and have the final text approved.

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocumentContent {
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

// CONFIRM: the legal company name and the support address.
export const COMPANY_NAME = 'Base2Brand';
export const SUPPORT_EMAIL = 'support@base2brand.com';
const APP_NAME = 'AIME';
const LAST_UPDATED = 'October 6, 2026';

export const PRIVACY_POLICY_CONTENT: LegalDocumentContent = {
  lastUpdated: LAST_UPDATED,
  intro: `${APP_NAME} is a voice-first AI assistant. This policy explains what information the ${APP_NAME} app collects, how ${COMPANY_NAME} ("we", "us") uses it, and the choices you have.`,
  sections: [
    {
      title: '1. Information we collect',
      bullets: [
        'Account details: your name, email address and role, provided when your account is created and when you sign in.',
        'Your conversations: the text of what you say to the assistant and the assistant\'s replies. These are kept as your chat history.',
        'Session information: a sign-in token that keeps you logged in, and a signal that tells our servers your assistant session is active.',
        'Device preferences: for example the assistant voice you choose and whether you have seen the intro. These stay on your device.',
      ],
    },
    {
      title: '2. Your voice and the microphone',
      paragraphs: [
        'The app asks for microphone access (and, on iPhone, speech recognition access) only so you can talk to the assistant.',
        `Your speech is turned into text by the speech recognition service built into your phone: Apple's on iPhone and Google's on Android. Depending on your device settings, that service may send audio to Apple or Google to be processed under their own privacy policies. ${APP_NAME} does not record or store your audio. Only the resulting text is sent to our servers.`,
        'Replies are read aloud by your phone\'s built-in text-to-speech voice. You can turn off microphone access at any time in your phone settings, but then voice input will not work.',
      ],
    },
    {
      title: '3. How we use your information',
      bullets: [
        'To sign you in and keep your account secure.',
        'To generate the assistant\'s replies and show your chat history.',
        'To operate, maintain and improve the service, and to fix problems.',
        'To contact you about your account or about changes to this policy.',
      ],
    },
    {
      title: '4. Sharing',
      paragraphs: [
        'We share information only as needed to run the service: with the hosting and AI service providers that process your messages for us, and with the speech services built into your phone as described above. These providers may use the information only to provide their services to us.',
        'We may also disclose information if the law requires it, or to protect the rights, safety and security of our users and our service.',
        'We do not sell your personal information.',
      ],
    },
    {
      title: '5. Your organisation',
      paragraphs: [
        'If your account was set up by your employer or another organisation, they may be able to access account and usage information for their users, as set out in their agreement with us. Please ask them about their own policies.',
      ],
    },
    {
      title: '6. How long we keep it',
      paragraphs: [
        'We keep your account information and chat history while your account is active. When you delete your account, we delete or anonymise your personal information, except where we must keep some of it to meet legal obligations or resolve disputes.',
      ],
    },
    {
      title: '7. Security',
      paragraphs: [
        'We use reasonable technical and organisational measures to protect your information, including encrypted connections to our servers. No method of transmission or storage is completely secure, so we cannot guarantee absolute security. Keep your password private and sign out on shared devices.',
      ],
    },
    {
      title: '8. Your choices and rights',
      bullets: [
        'Access or correct your account details by contacting us.',
        'Delete your account from the Profile screen in the app.',
        'Control the microphone and speech recognition permissions in your phone settings.',
        'Depending on where you live, you may also have rights to object to or restrict certain processing, or to receive a copy of your data. Contact us to use them.',
      ],
    },
    {
      title: '9. Children',
      paragraphs: [
        `${APP_NAME} is intended for working adults and is not directed to children under 16. We do not knowingly collect information from children. If you believe a child has given us information, please contact us and we will delete it.`,
      ],
    },
    {
      title: '10. Changes to this policy',
      paragraphs: [
        'We may update this policy from time to time. When we do, we will change the "Last updated" date above and, for significant changes, tell you in the app.',
      ],
    },
    {
      title: '11. Contact us',
      paragraphs: [`Questions or requests about privacy? Email us at ${SUPPORT_EMAIL}.`],
    },
  ],
};

export const TERMS_OF_SERVICE_CONTENT: LegalDocumentContent = {
  lastUpdated: LAST_UPDATED,
  intro: `These terms govern your use of the ${APP_NAME} app and service provided by ${COMPANY_NAME} ("we", "us"). By creating an account or using the app you agree to them. If you do not agree, please do not use the app.`,
  sections: [
    {
      title: '1. The service',
      paragraphs: [
        `${APP_NAME} is a voice-first AI assistant. You speak to it, it answers in text and out loud, and it keeps a history of your conversations. We may add, change or remove features over time.`,
      ],
    },
    {
      title: '2. Your account',
      bullets: [
        'You must be at least 16 and able to enter a binding agreement.',
        'Your account may be created for you by your employer or organisation. You are responsible for activity under your account.',
        'Give accurate information, keep your password confidential, and tell us promptly if you think your account has been misused.',
      ],
    },
    {
      title: '3. Using the assistant safely',
      bullets: [
        'Do not use the app in a way that distracts you from driving or from any task that needs your full attention. Follow all traffic laws and workplace safety rules.',
        'The assistant is not for emergencies. In an emergency, contact your local emergency services.',
        'Do not rely on the assistant alone for medical, legal, financial or safety decisions.',
      ],
    },
    {
      title: '4. AI answers can be wrong',
      paragraphs: [
        'The assistant uses artificial intelligence. Its answers may be incomplete, out of date or incorrect, and speech recognition can mishear you. Check anything important before you act on it. You are responsible for how you use the answers.',
      ],
    },
    {
      title: '5. Acceptable use',
      paragraphs: ['You agree not to:'],
      bullets: [
        'break the law or infringe anyone else\'s rights;',
        'use the service to create or share harmful, abusive, deceptive or illegal content;',
        'try to gain unauthorised access to the service, other accounts or our systems, or to disrupt or overload them;',
        'copy, reverse engineer or resell the app or service, except as the law allows;',
        'share confidential information you are not allowed to share.',
      ],
    },
    {
      title: '6. Your content',
      paragraphs: [
        'You keep ownership of what you say and type to the assistant. You give us permission to process it, store it as your chat history and use it to provide, secure and improve the service, as described in our Privacy Policy.',
      ],
    },
    {
      title: '7. Our rights',
      paragraphs: [
        `The ${APP_NAME} app, its design, software and branding belong to ${COMPANY_NAME} and our licensors and are protected by law. We give you a limited, personal, non-transferable licence to use the app for its intended purpose while these terms apply.`,
      ],
    },
    {
      title: '8. Ending your use',
      paragraphs: [
        'You can stop using the app and delete your account from the Profile screen at any time. We may suspend or end your access if you break these terms, if your organisation ends your access, or if we must do so to protect the service or comply with the law.',
      ],
    },
    {
      title: '9. Disclaimers',
      paragraphs: [
        `The service is provided "as is" and "as available". To the fullest extent the law allows, ${COMPANY_NAME} makes no promise that it will be uninterrupted, error-free or suitable for your particular purpose.`,
      ],
    },
    {
      title: '10. Limit of liability',
      paragraphs: [
        `To the fullest extent the law allows, ${COMPANY_NAME} is not liable for indirect, incidental or consequential losses, or for loss of profits, data or goodwill, arising from your use of the service. Nothing in these terms limits liability that cannot be limited by law.`,
      ],
    },
    {
      title: '11. Changes to these terms',
      paragraphs: [
        'We may update these terms. If we make a significant change we will tell you in the app. Using the app after a change means you accept the updated terms.',
      ],
    },
    {
      title: '12. Contact us',
      paragraphs: [`Questions about these terms? Email us at ${SUPPORT_EMAIL}.`],
    },
  ],
};
