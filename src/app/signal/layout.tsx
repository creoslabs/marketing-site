import { redirect } from "next/navigation";
import { getUser, getDisplayName } from "@/lib/supabase/data";
import { SignalChrome } from "./signal-chrome";
import { countAttention } from "@/lib/integrations/store";
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
  const attention = (await countAttention(user.id)) > 0;

  return (
    <div className="ws">
      <WsUIProvider>
        <SignalChrome name={name} email={email} initials={initials} attention={attention} />
        {children}
      </WsUIProvider>
    </div>
  );
}
