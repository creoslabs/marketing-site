"use client";

import { ToastProvider } from "./ws-toast";
import { ConfirmProvider } from "./ws-confirm";
import { CommandPaletteProvider } from "./ws-command-palette";

// Mounted once inside each product's .ws root (Workspace/Outlier/Signal
// layouts) so toast() and confirm() replace window.alert()/confirm() —
// native dialogs read as an unfinished prototype, not a real product — and
// so Cmd/Ctrl+K opens a real command palette everywhere.
export function WsUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <CommandPaletteProvider>{children}</CommandPaletteProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
