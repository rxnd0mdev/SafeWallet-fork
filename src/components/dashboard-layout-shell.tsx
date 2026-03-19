"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  LayoutDashboard,
  Scan,
  AlertTriangle,
  User,
  LogOut,
  Menu,
  CreditCard,
  History,
  Sparkles,
} from "lucide-react";
import { type Messages } from "@/i18n";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

function getNavItems(messages: Messages) {
  return [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/scan", label: "Health Scanner", icon: Scan },
    { href: "/dashboard/scam", label: "Scam Checker", icon: AlertTriangle },
    {
      href: "/dashboard/history",
      label: messages.dashboardLayout.nav.history,
      icon: History,
    },
    {
      href: "/dashboard/profile",
      label: messages.dashboardLayout.nav.profile,
      icon: User,
    },
  ];
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { messages } = useLocale();
  const pathname = usePathname();
  const navItems = getNavItems(messages);

  return (
    <nav className="flex flex-col gap-2 px-4">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (pathname.startsWith(item.href + "/") && item.href !== "/dashboard");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group",
              isActive
                ? "bg-[#F2A971]/10 text-[#F2A971]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5",
                isActive
                  ? "text-[#F2A971]"
                  : "text-white/40 group-hover:text-white/80 transition-colors"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { messages } = useLocale();
  const copy = messages.dashboardLayout;
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-[#0B0A08] text-white selection:bg-[#F2A971]/30 font-sans">
      <aside className="relative z-20 hidden w-72 border-r border-white/5 bg-[#0B0A08] lg:flex lg:flex-col">
        <div className="absolute top-0 right-0 h-32 w-full bg-[#F2A971]/5 blur-[60px] pointer-events-none" />

        <div className="flex h-20 items-center gap-3 px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F2A971] to-amber-600 shadow-[0_0_15px_rgba(242,169,113,0.4)]">
            <Shield className="h-6 w-6 text-[#0B0A08]" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white/90">
            SafeWallet
          </span>
        </div>

        <div className="px-6 py-2">
          <div className="h-px w-full bg-white/5" />
        </div>

        <div className="flex-1 py-4">
          <div className="mb-4 px-6 text-xs font-semibold tracking-wider text-white/30 uppercase">
            {copy.mainMenu}
          </div>
          <SidebarNav />
        </div>

        <div className="p-6">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1A1D24] p-5 transition-colors hover:border-[#3323D2]/50">
            <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#3323D2]/30 blur-[40px] pointer-events-none transition-colors group-hover:bg-[#3323D2]/50" />
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#8B7DFF]" />
              <p className="text-sm font-bold text-white/90">{copy.upgradeTitle}</p>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-white/50">
              {copy.upgradeDescription}
            </p>
            <Button
              size="sm"
              className="h-9 w-full rounded-xl border border-white/5 bg-white/10 text-xs text-white transition-colors hover:bg-white/20"
            >
              <CreditCard className="mr-2 h-3.5 w-3.5" />
              {copy.upgradePrice}
            </Button>
          </div>
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/5 bg-[#0B0A08]/80 px-6 backdrop-blur-xl lg:px-10">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 border-r border-white/5 bg-[#0B0A08] p-0 text-white"
              >
                <div className="flex h-20 items-center gap-3 px-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F2A971] to-amber-600">
                    <Shield
                      className="h-6 w-6 text-[#0B0A08]"
                      fill="currentColor"
                    />
                  </div>
                  <span className="text-xl font-bold">SafeWallet</span>
                </div>
                <div className="px-6 py-2">
                  <div className="h-px w-full bg-white/5" />
                </div>
                <div className="px-6 pt-4">
                  <LanguageSwitcher className="w-full justify-center" />
                </div>
                <div className="py-4">
                  <SidebarNav />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full ring-2 ring-transparent transition-all outline-none focus-visible:ring-[#F2A971]">
                <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                  <AvatarFallback className="bg-[#1A1D24] text-sm font-bold text-[#F2A971]">
                    SW
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="mt-2 w-56 rounded-2xl border border-white/10 bg-[#1A1D24] text-white shadow-2xl"
              >
                <div className="border-b border-white/5 px-4 py-3">
                  <p className="text-sm font-medium text-white/90">
                    {copy.accountTitle}
                  </p>
                  <p className="truncate text-xs text-white/50">
                    {copy.accountSubtitle}
                  </p>
                </div>
                <div className="p-2">
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/profile")}
                    className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-white/10 focus:text-white"
                  >
                    <User className="mr-3 h-4 w-4 text-white/50" /> {copy.profile}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-white/5" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-xl px-3 py-2.5 text-red-400 focus:bg-red-500/20 focus:text-red-400"
                  >
                    <LogOut className="mr-3 h-4 w-4" /> {copy.signOut}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="relative z-10 flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
