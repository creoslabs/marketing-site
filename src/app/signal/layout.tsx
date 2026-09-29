import { redirect } from "next/navigation";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { SignalChrome } from "./signal-chrome";
import { WsUIProvider } from "@/components/ws-ui-provider";

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

export default async function SignalLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
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
        <SignalChrome name={name} email={email} initials={initials} />
        {children}
      </WsUIProvider>
    </div>
  );
}
