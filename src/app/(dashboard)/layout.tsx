import { LanguageProvider } from "@/components/language-provider";
import { DashboardLayoutShell } from "@/components/dashboard-layout-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <DashboardLayoutShell>{children}</DashboardLayoutShell>
    </LanguageProvider>
  );
}
