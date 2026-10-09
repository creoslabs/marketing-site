import type { Metadata } from "next";
import { CONTACT_EMAIL, LegalPage, LegalSection } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use — Creos Labs",
  description: "The terms that apply when you use Creos Labs, Outlier and Signal.",
  alternates: { canonical: "/terms" },
};

const TOC = [
  { id: "agreement", label: "Agreement" },
  { id: "service", label: "The service" },
  { id: "accounts", label: "Your account" },
  { id: "use", label: "Acceptable use" },
  { id: "content", label: "Your content" },
  { id: "public", label: "Public data & AI output" },
  { id: "integrations", label: "Integrations & your keys" },
  { id: "billing", label: "Access & billing" },
  { id: "availability", label: "Availability & changes" },
  { id: "ending", label: "Ending your use" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Liability" },
  { id: "law", label: "Governing law" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Use"
      toc={TOC}
      intro={
        <>
          These terms apply when you use creos-labs.com, Outlier, Signal and anything else we run under Creos Labs (the &ldquo;service&rdquo;). By creating an account or using the service you
          agree to them. If you don&apos;t, please don&apos;t use it. Our <a href="/privacy">Privacy Policy</a> explains how we handle your information.
        </>
      }
    >
      <LegalSection id="agreement" title="Agreement">
        <p>
          If you use Creos Labs for an organisation, you confirm you can bind it to these terms, and &ldquo;you&rdquo; includes that organisation. You must be old enough to form a binding
          contract where you live, and at least 18.
        </p>
      </LegalSection>

      <LegalSection id="service" title="The service">
        <p>
          <strong>Outlier</strong> tracks the public posts of creators you choose and scores them against each creator&apos;s own median. <strong>Signal</strong> analyses ad creative you
          upload and scores it against best-practice criteria. Both are decision aids. We may add, change or retire features as the products develop.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="Your account">
        <ul>
          <li>Give accurate information and keep your login details secure. You&apos;re responsible for what happens under your account.</li>
          <li>One person per login unless we agree otherwise. Don&apos;t share access in ways that get around the plan you&apos;re on.</li>
          <li>Tell us promptly at {CONTACT_EMAIL} if you think your account has been accessed without permission.</li>
        </ul>
      </LegalSection>

      <LegalSection id="use" title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>break the law, or upload or send content that infringes someone&apos;s rights, is unlawful, or is harmful;</li>
          <li>use Outlier in a way that breaches the terms of the platforms whose public content you&apos;re tracking, or to harass, profile or surveil individuals;</li>
          <li>attempt to access other users&apos; accounts or data, probe or test the service&apos;s security, or interfere with its operation;</li>
          <li>send automated requests beyond normal use, or use the service to build a competing product;</li>
          <li>reverse engineer the service, or resell or sublicense access without our written permission;</li>
          <li>use integrations to send spam or content you don&apos;t have the right to send.</li>
        </ul>
        <p>We may suspend access that breaks these rules or puts the service or other users at risk.</p>
      </LegalSection>

      <LegalSection id="content" title="Your content">
        <p>
          You keep ownership of what you upload or create (&ldquo;your content&rdquo;), including creative uploaded to Signal and notes and scripts in Outlier. You give us a limited licence to
          store, process and display it, and to send it to our service providers, only as needed to run the service for you — including analysing it with AI services and delivering it to
          integrations you set up. The licence ends when your content is deleted, apart from backups and copies we must keep by law.
        </p>
        <p>You promise you have the rights needed to upload your content and to have it analysed this way.</p>
      </LegalSection>

      <LegalSection id="public" title="Public data & AI output">
        <ul>
          <li>
            <strong>Public data.</strong> Outlier shows publicly available content created by others. It remains theirs. You&apos;re responsible for how you use it, including respecting copyright,
            platform rules and the people behind the content. Scripts generated from it are starting points; don&apos;t copy another creator&apos;s work.
          </li>
          <li>
            <strong>AI output.</strong> Scores, breakdowns, transcripts and scripts are produced partly by AI and can be wrong or incomplete. They&apos;re guidance, not a guarantee of how an ad
            will perform, whether a platform will approve it, or that a post is an outlier for the reasons shown. Check important decisions yourself.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="integrations" title="Integrations & your keys">
        <p>
          Integrations connect to Slack, email, Google Sheets and Notion. Those services have their own terms, and your use of them is under those terms. If a connection is revoked or fails,
          deliveries stop until you reconnect.
        </p>
        <p>
          If you add your own API keys for third-party services, you&apos;re responsible for those accounts, their costs and their usage limits. We use your keys only to run your requests.
        </p>
      </LegalSection>

      <LegalSection id="billing" title="Access & billing">
        <p>
          Creos Labs is currently available by invitation while we test. If paid plans are introduced, we&apos;ll tell you the price and terms before you&apos;re charged anything, and you can
          choose not to continue. Where you do subscribe, the subscription renews until you cancel; you can cancel at any time and your access continues to the end of the period you&apos;ve paid
          for. Taxes may apply. Unless the law says otherwise, payments already made aren&apos;t refundable.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="Availability & changes">
        <p>
          We work to keep the service running but don&apos;t promise it will always be available or error-free. We may change the service, and we may update these terms; if a change is material
          we&apos;ll tell you, and continuing to use the service afterwards means you accept it.
        </p>
      </LegalSection>

      <LegalSection id="ending" title="Ending your use">
        <p>
          You can stop using the service and ask us to delete your account at any time by emailing {CONTACT_EMAIL}. We may suspend or end your access if you break these terms or we have to for
          legal reasons. What&apos;s fair to keep going after that — such as the sections on ownership, disclaimers and liability — continues to apply.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="Disclaimers">
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the extent the law allows, we don&apos;t give warranties that it will meet your needs, be uninterrupted or
          error-free, or that its results (including scores and analysis) are accurate or fit for a particular purpose.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Liability">
        <p>
          Nothing in these terms excludes or limits rights or remedies you have under law that can&apos;t be excluded, including consumer guarantees. Subject to that, and to the extent the law
          allows, Creos Labs isn&apos;t liable for indirect or consequential loss, loss of profit, revenue or data, or for losses from your use of third-party services; and our total liability
          for any claim relating to the service is limited to the amount you paid us in the 12 months before the claim arose (or A$100 if you haven&apos;t paid anything).
        </p>
      </LegalSection>

      <LegalSection id="law" title="Governing law">
        <p>
          These terms are governed by the laws of the jurisdiction in which Creos Labs is established, and disputes will be resolved by the courts there, unless a law that applies to you says
          otherwise.
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
