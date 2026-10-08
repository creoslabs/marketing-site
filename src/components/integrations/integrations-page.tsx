import { existsSync } from "node:fs";
import path from "node:path";
import { getUser } from "@/lib/supabase/data";
import { AppMain, PageHeader } from "@/components/app/ui";
import { providerConfigured } from "@/lib/integrations/config";
import { PROVIDERS, type Provider } from "@/lib/integrations/events";
import { listIntegrations, type PublicIntegration } from "@/lib/integrations/store";
import { IntegrationsView, type Flash, type ProductSlug } from "./integrations-view";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// One page for both products and Workspace: connections belong to the
// account, so connecting in Outlier shows as connected in Signal too.
export async function IntegrationsPage({ product, searchParams }: { product: ProductSlug; searchParams: SearchParams }) {
  const user = await getUser();

  let integrations: PublicIntegration[] = PROVIDERS.map((provider) => ({ provider, state: "not_connected", label: null, config: {}, routing: {}, lastDelivery: null, needsSetup: false }));
  let loadError: string | null = null;
  if (user) {
    try {
      integrations = await listIntegrations(user.id);
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Couldn’t load integrations.";
    }
  }

  const available = Object.fromEntries(PROVIDERS.map((p) => [p, providerConfigured(p)])) as Record<Provider, boolean>;
  const logos = Object.fromEntries(PROVIDERS.map((p) => [p, existsSync(path.join(process.cwd(), "public/brand/integrations", `${p}.svg`))])) as Record<Provider, boolean>;

  const flash: Flash = {
    connected: first(searchParams.connected),
    error: first(searchParams.error),
    provider: first(searchParams.provider),
    setup: first(searchParams.setup) === "1",
  };

  return (
    <AppMain>
      <PageHeader eyebrow="Settings · Integrations" line1="Integrations." line2="Where results go." sub="Send results to the tools your team already uses." />
      <IntegrationsView integrations={integrations} product={product} available={available} logos={logos} flash={flash} loadError={loadError} />
    </AppMain>
  );
}
