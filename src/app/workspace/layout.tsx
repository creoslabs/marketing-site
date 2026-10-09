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

  const email = user?.email ?? "";
  const name = getDisplayName(user);
  const initials = deriveInitials(name);

  return (
    <div className="ws">
      <WsUIProvider>
        <WorkspaceChrome name={name} email={email} initials={initials} />
        {children}
      </WsUIProvider>
    </div>
  );
}
