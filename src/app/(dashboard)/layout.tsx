import { LanguageProvider } from "@/components/language-provider";
import { DashboardLayoutShell } from "@/components/dashboard-layout-shell";
import { getRequestLocale } from "@/i18n/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();

  return (
    <LanguageProvider initialLocale={locale}>
      <DashboardLayoutShell>{children}</DashboardLayoutShell>
    </LanguageProvider>
  );
}
