import type { Metadata } from "next";
import styles from "@/components/site/site.module.css";
import { CONTACT_EMAIL, LegalPage, LegalSection } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Creos Labs",
  description: "What Creos Labs collects, why, who it's shared with, and the choices you have.",
  alternates: { canonical: "/privacy" },
};

const TOC = [
  { id: "who", label: "Who we are" },
  { id: "collect", label: "What we collect" },
  { id: "use", label: "How we use it" },
  { id: "share", label: "Who we share it with" },
  { id: "integrations", label: "Integrations" },
  { id: "social", label: "Social accounts" },
  { id: "cookies", label: "Cookies & analytics" },
  { id: "retention", label: "Keeping & deleting data" },
  { id: "security", label: "Security" },
  { id: "transfers", label: "International transfers" },
  { id: "rights", label: "Your rights" },
  { id: "children", label: "Children" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

const PROVIDERS: Array<[string, string, string]> = [
  ["Vercel", "Hosts the website and apps", "Request logs, IP addresses, the content of pages and API requests as they're served"],
  ["Supabase", "Database, sign-in and file storage", "Your account, content, analysis results, stored files, integration settings and delivery logs"],
  ["Anthropic", "AI analysis of ad creative and posts", "Keyframes and images from the creative you upload to Signal; transcripts and captions from posts you analyse in Outlier"],
  ["Groq", "Speech-to-text for videos", "Audio from videos you ask Outlier to transcribe"],
  ["Apify", "Collecting public social media data", "The public handles you track, so it can fetch their public posts"],
  ["Google (Analytics)", "Understanding how the site and apps are used", "Page views, device and browser details, approximate location"],
  ["Resend", "Sending email (alerts, digests, confirmations)", "The email addresses you add and the content of the messages sent to them"],
  ["Slack, Google Sheets, Notion", "Only if you connect them", "The results you choose to send, and the access token that lets us send them (see Integrations)"],
  ["Payment provider", "Only if and when you subscribe", "Billing details, handled by the provider — we don't store full card numbers"],
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      toc={TOC}
      intro={
        <>
          This explains what information Creos Labs collects when you use our website, Outlier and Signal, what we do with it, and the choices you have. We&apos;ve tried to keep it plain.
          Questions go to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </>
      }
    >
      <LegalSection id="who" title="Who we are">
        <p>
          &ldquo;Creos Labs&rdquo;, &ldquo;we&rdquo; and &ldquo;us&rdquo; means the team behind creos-labs.com, outlier.creos-labs.com and signal.creos-labs.com. We decide what personal
          information is collected and how it&apos;s used, which makes us the controller of it under privacy laws that use that term.
        </p>
      </LegalSection>

      <LegalSection id="collect" title="What we collect">
        <h3>Information you give us</h3>
        <ul>
          <li>
            <strong>Account details:</strong> your email address, name, and a password (stored only as a hash by our sign-in provider), plus an avatar if you add one.
          </li>
          <li>
            <strong>Signal content:</strong> the images and videos you upload for analysis, their filenames, and the scores and findings we generate. We delete the original video file
            after analysis and keep the keyframes the report is built from; uploaded static images are kept so the report can show them.
          </li>
          <li>
            <strong>Outlier content:</strong> the creator handles you track, your notes, favourites, collections, and the scripts you generate.
          </li>
          <li>
            <strong>API keys you add:</strong> if you supply your own keys for services such as Anthropic, Groq or Apify, they&apos;re stored with your account and used only to run your requests.
          </li>
          <li>
            <strong>Integration settings:</strong> destinations you set up (a Slack channel, email addresses, a Sheet, a Notion database) and what you choose to send to each.
          </li>
          <li>
            <strong>Messages to us:</strong> anything you email to {CONTACT_EMAIL}.
          </li>
        </ul>

        <h3>Information we collect as you use the service</h3>
        <ul>
          <li>Technical data such as IP address, browser and device type, pages viewed and timestamps, from our hosting provider and from Google Analytics.</li>
          <li>Activity in your account — pulls, analyses, notifications, delivery logs for your integrations — so the product can show you history and tell you when something fails.</li>
        </ul>

        <h3>Public information about other people</h3>
        <p>
          Outlier collects publicly available information about creators and posts you ask it to track, such as handles, public profile pictures, captions, view and like counts, thumbnails, and
          transcripts of public videos. We collect it because you asked us to, and use it only to power your account.
        </p>
      </LegalSection>

      <LegalSection id="use" title="How we use it">
        <ul>
          <li>To provide Outlier, Signal and your account — including running analyses, scoring posts and creative, and showing your history.</li>
          <li>To send what you&apos;ve asked for: alerts, digests, confirmation emails and test messages through your integrations.</li>
          <li>To keep the service secure, prevent abuse, fix bugs and understand which features are used.</li>
          <li>To reply to you and send essential notices about your account or changes to these terms.</li>
          <li>To meet legal obligations.</li>
        </ul>
        <p>We don&apos;t sell your personal information, and we don&apos;t use it to show you advertising.</p>
      </LegalSection>

      <LegalSection id="share" title="Who we share it with">
        <p>We use these service providers to run Creos Labs. They only receive what they need to do their job.</p>
        <table className={styles.legalTable}>
          <thead>
            <tr>
              <th>Provider</th>
              <th>What it does</th>
              <th>What it receives</th>
            </tr>
          </thead>
          <tbody>
            {PROVIDERS.map(([name, role, data]) => (
              <tr key={name}>
                <td>
                  <strong>{name}</strong>
                </td>
                <td>{role}</td>
                <td>{data}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Each provider handles information under its own terms and privacy policy. We may also disclose information if the law requires it, to protect our rights or the safety of others, or as
          part of a sale or restructuring of the business (we&apos;d tell you first).
        </p>
      </LegalSection>

      <LegalSection id="integrations" title="Integrations">
        <p>
          You can connect Slack, email, Google Sheets and Notion so results reach the tools your team uses. Integrations send results <strong>out</strong>; connecting one gives Creos Labs access
          only to what each service&apos;s own approval screen shows:
        </p>
        <ul>
          <li>
            <strong>Slack:</strong> permission to post to the one channel you pick.
          </li>
          <li>
            <strong>Google Sheets:</strong> access only to files Creos Labs itself creates (Google&apos;s <code>drive.file</code> permission), never the rest of your Drive.
          </li>
          <li>
            <strong>Notion:</strong> access only to the pages and databases you grant.
          </li>
          <li>
            <strong>Email:</strong> each address is confirmed by a link before anything is sent to it.
          </li>
        </ul>
        <p>
          Access tokens are encrypted when stored and never shown in your browser. Disconnecting an integration revokes the token with the provider where one is available, deletes it from our
          storage and cancels anything still queued. You can also remove Creos Labs from inside Slack, Google or Notion at any time.
        </p>
      </LegalSection>

      <LegalSection id="social" title="Social accounts">
        <p>
          We never ask for your Instagram, TikTok, Meta or YouTube logins, and none of our integrations read from or connect to your social accounts. Outlier works from public information only.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies & analytics">
        <p>
          We use essential cookies to keep you signed in, and Google Analytics to understand how the site and apps are used. Details, and how to opt out, are in our{" "}
          <a href="/cookies">Cookie Notice</a>.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="Keeping & deleting data">
        <p>
          We keep your information while your account is open. If you ask us to delete your account, we remove your content, analysis results, integrations and delivery logs. Some information may
          remain for a short time in backups, or longer where we must keep it by law (for example, billing records).
        </p>
        <p>
          To delete your account or any of your data, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address on your account.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Security">
        <p>
          Data is encrypted in transit. Integration tokens are encrypted at rest, and access to your content is limited to your account. No system is perfectly secure, so please use a strong,
          unique password. If we learn of a breach that affects you, we&apos;ll tell you as the law requires.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="International transfers">
        <p>
          Our providers operate in several countries, so your information may be processed outside the country where you live. Where the law requires safeguards for those transfers, we rely on
          our providers&apos; contractual protections.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Your rights">
        <p>
          Depending on where you live, you may have the right to access the personal information we hold about you, correct it, delete it, object to or restrict how we use it, receive a copy of
          it, and withdraw consent you&apos;ve given. To use any of these rights, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If you&apos;re unhappy with how we&apos;ve handled
          your information, you can contact us first, and you also have the right to complain to your local privacy regulator.
        </p>
        <p>
          If you appear in the public content Outlier tracks and want it removed, email us with the handle and we&apos;ll look into it promptly.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>Creos Labs is for people running marketing, and isn&apos;t directed at children under 16. We don&apos;t knowingly collect their information. If you think we have, tell us and we&apos;ll delete it.</p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We&apos;ll update this page when our practices change and revise the date at the top. For significant changes we&apos;ll also notify account holders by email or in the app.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Creos Labs · <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
