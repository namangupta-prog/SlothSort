import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Download,
  FolderOpen,
  History,
  Home,
  ListChecks,
  Menu,
  Settings as SettingsIcon,
  UploadCloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import SlothMark from "@/components/SlothMark";
import ConnectionPill from "@/components/ConnectionPill";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/upload", label: "Upload", icon: UploadCloud },
  { to: "/review", label: "Review", icon: ListChecks },
  { to: "/library", label: "Library", icon: FolderOpen },
  { to: "/activity", label: "Activity", icon: History },
  { to: "/export", label: "Export", icon: Download },
  { to: "/settings", label: "Settings", icon: SettingsIcon }
];

function NavItem({ item, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {item.label}
    </NavLink>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="hidden shrink-0 flex-col gap-8 border-r border-border/70 bg-card/50 px-6 py-8 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 xl:w-72">
          <Link to="/" className="flex items-center gap-3">
            <SlothMark size={44} className="rounded-2xl" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg font-semibold tracking-tight">SlothSort</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                AI file organizer
              </span>
            </span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </nav>

          <div className="rounded-3xl border border-border/70 bg-secondary/60 p-4">
            <ConnectionPill />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <SlothMark size={34} className="rounded-xl" />
              <span className="font-display text-base font-semibold tracking-tight">SlothSort</span>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="font-display tracking-tight">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {NAV.map((item) => (
                    <NavItem key={item.to} item={item} onNavigate={() => setOpen(false)} />
                  ))}
                </nav>
                <div className="mt-6 rounded-3xl border border-border/70 bg-secondary/60 p-4">
                  <ConnectionPill />
                </div>
              </SheetContent>
            </Sheet>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <div className="mx-auto w-full max-w-5xl animate-fade-up">
              <Outlet />
            </div>
          </main>

          <footer className="px-6 pb-8 pt-2 text-center text-xs leading-relaxed text-muted-foreground">
            Demo workspace · SlothSort only suggests. It never moves, renames or deletes your real files.
          </footer>
        </div>
      </div>
    </div>
  );
}