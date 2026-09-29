import { redirect } from "next/navigation";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { OutlierChrome } from "./outlier-chrome";
import { WsUIProvider } from "@/components/ws-ui-provider";
import { getJobs } from "./live-data";

function deriveInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export default async function OutlierLayout({ children }: { children: React.ReactNode }) {
  const [user, { jobs, finished }] = await Promise.all([getUser(), getJobs()]);
  if (!user) {
    redirect("/login");
  }

  const runningCount = jobs.filter((j) => j.state === "running").length;
  const lastPulledLabel = finished[0]?.relativeTime ?? null;
  const name = getDisplayName(user);
  const email = user?.email ?? "";
  const initials = deriveInitials(name);

  return (
    <div className="ws" data-theme="dark" suppressHydrationWarning>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=localStorage.getItem('ws-theme');if(t==='light'||t==='dark')document.currentScript.parentElement.setAttribute('data-theme',t);}catch(e){}",
        }}
      />
      <WsUIProvider>
        <OutlierChrome runningCount={runningCount} lastPulledLabel={lastPulledLabel} name={name} email={email} initials={initials} />
        {children}
      </WsUIProvider>
    </div>
  );
}
