import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/data";
import { OutlierChrome } from "./outlier-chrome";
import { WsUIProvider } from "@/components/ws-ui-provider";
import { getJobs } from "./live-data";

export default async function OutlierLayout({ children }: { children: React.ReactNode }) {
  const [user, { jobs, finished }] = await Promise.all([getUser(), getJobs()]);
  if (!user) {
    redirect("/login");
  }

  const runningCount = jobs.filter((j) => j.state === "running").length;
  const lastPulledLabel = finished[0]?.relativeTime ?? null;

  return (
    <div className="ws" data-theme="dark" suppressHydrationWarning>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=localStorage.getItem('ws-theme');if(t==='light'||t==='dark')document.currentScript.parentElement.setAttribute('data-theme',t);}catch(e){}",
        }}
      />
      <WsUIProvider>
        <OutlierChrome runningCount={runningCount} lastPulledLabel={lastPulledLabel} />
        {children}
      </WsUIProvider>
    </div>
  );
}
