import { redirect } from "next/navigation";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { WorkspaceChrome } from "./workspace-chrome";
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

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const name = getDisplayName(user);
  const initials = deriveInitials(name);

  return (
    <div className="ws" data-theme="dark" suppressHydrationWarning>
      {/* Applies a saved theme choice before paint so there's no flash. This
          div is server-rendered and never re-diffed by React, so mutating
          the attribute imperatively here is safe. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=localStorage.getItem('ws-theme');if(t==='light'||t==='dark')document.currentScript.parentElement.setAttribute('data-theme',t);}catch(e){}",
        }}
      />
      <WsUIProvider>
        <WorkspaceChrome name={name} email={email} initials={initials} />
        {children}
      </WsUIProvider>
    </div>
  );
}
