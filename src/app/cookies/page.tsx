import type { Metadata } from "next";
import styles from "@/components/site/site.module.css";
import { CONTACT_EMAIL, LegalPage, LegalSection } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Notice — Creos Labs",
  description: "The cookies and similar storage Creos Labs uses, and how to control them.",
  alternates: { canonical: "/cookies" },
};

const TOC = [
  { id: "what", label: "What this covers" },
  { id: "list", label: "What we use" },
  { id: "control", label: "Your choices" },
  { id: "contact", label: "Contact" },
];

const ITEMS: Array<[string, string, string, string]> = [
  ["Sign-in session", "Essential", "Keeps you signed in across creos-labs.com, Outlier and Signal. Set by our sign-in provider.", "Until you sign out, or up to about a week of inactivity"],
  ["Preferences (browser storage)", "Essential", "Remembers small settings on your device, such as dismissed announcements.", "Until you clear your browser data"],
  ["Google Analytics (_ga, _ga_*)", "Analytics", "Counts visits and shows how pages are used, so we can improve the site and apps.", "Up to 2 years"],
];

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie Notice"
      toc={TOC}
      intro="Cookies are small files a website stores in your browser. This page lists the cookies and similar storage Creos Labs uses, and how to control them."
    >
      <LegalSection id="what" title="What this covers">
        <p>
          This applies to creos-labs.com and the Outlier and Signal apps on its subdomains. For how we handle personal information more broadly, see the <a href="/privacy">Privacy Policy</a>.
        </p>
      </LegalSection>

      <LegalSection id="list" title="What we use">
        <table className={styles.legalTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>What it does</th>
              <th>How long</th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map(([name, type, what, how]) => (
              <tr key={name}>
                <td>
                  <strong>{name}</strong>
                </td>
                <td>{type}</td>
                <td>{what}</td>
                <td>{how}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>We don&apos;t use advertising or cross-site tracking cookies.</p>
      </LegalSection>

      <LegalSection id="control" title="Your choices">
        <ul>
          <li>
            <strong>Browser settings.</strong> You can block or delete cookies in your browser. Blocking the essential ones will stop sign-in from working.
          </li>
          <li>
            <strong>Analytics.</strong> To opt out of Google Analytics across sites, install Google&apos;s{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" rel="noreferrer">
              opt-out browser add-on
            </a>
            , or enable your browser&apos;s &ldquo;Do Not Track&rdquo; or tracking-protection features.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about this notice: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
