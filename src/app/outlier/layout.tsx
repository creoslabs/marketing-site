import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/data";
import { OutlierChrome } from "./outlier-chrome";
import { WsUIProvider } from "@/components/ws-ui-provider";

export default async function OutlierLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="ws" data-theme="dark" suppressHydrationWarning>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=localStorage.getItem('ws-theme');if(t==='light'||t==='dark')document.currentScript.parentElement.setAttribute('data-theme',t);}catch(e){}",
        }}
      />
      <WsUIProvider>
        <OutlierChrome />
        {children}
      </WsUIProvider>
    </div>
  );
}
