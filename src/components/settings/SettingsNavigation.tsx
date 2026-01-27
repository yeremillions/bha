import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SettingsNavigationProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SettingsNavigation = ({ tabs, activeTab, setActiveTab }: SettingsNavigationProps) => (
  <>
    {/* Mobile Tabs - Horizontal Scroll */}
    <div className="lg:hidden mb-6">
      <Card>
        <CardContent className="p-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex-shrink-0",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Desktop Sidebar Navigation */}
    <Card className="hidden lg:block lg:col-span-1 h-fit">
      <CardContent className="p-2">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  </>
);
