import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Wine,
  Beer,
  Martini,
  Coffee,
  CreditCard,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  User,
  Home,
  Receipt,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data - in real app this would come from database
const mockTabs = [
  { id: 1, guestName: "John Smith", apartment: "101A", amount: 87500, items: 8, status: "open", openedAt: "2024-01-15 18:30" },
  { id: 2, guestName: "Sarah Johnson", apartment: "102B", amount: 42500, items: 4, status: "open", openedAt: "2024-01-15 19:15" },
  { id: 3, guestName: "Michael Brown", apartment: "103A", amount: 145000, items: 12, status: "open", openedAt: "2024-01-15 17:45" },
  { id: 4, guestName: "Emily Davis", apartment: "104B", amount: 55000, items: 5, status: "pending", openedAt: "2024-01-14 20:00" },
  { id: 5, guestName: "Robert Wilson", apartment: "101B", amount: 195000, items: 15, status: "closed", openedAt: "2024-01-14 18:00" },
];

const mockTabItems = [
  { id: 1, tabId: 1, item: "Château Margaux 2018", category: "Wine", quantity: 1, unitPrice: 57500, amount: 57500, time: "18:45" },
  { id: 2, tabId: 1, item: "Hendrick's Gin & Tonic", category: "Cocktails", quantity: 2, unitPrice: 9000, amount: 18000, time: "19:00" },
  { id: 3, tabId: 1, item: "Premium Whisky", category: "Spirits", quantity: 1, unitPrice: 12000, amount: 12000, time: "19:30" },
  { id: 4, tabId: 2, item: "Espresso Martini", category: "Cocktails", quantity: 2, unitPrice: 9500, amount: 19000, time: "19:20" },
  { id: 5, tabId: 2, item: "Craft Beer Flight", category: "Beer", quantity: 1, unitPrice: 18000, amount: 18000, time: "19:35" },
  { id: 6, tabId: 2, item: "Mixed Nuts", category: "Snacks", quantity: 1, unitPrice: 5500, amount: 5500, time: "19:40" },
  { id: 7, tabId: 3, item: "Prosecco DOC", category: "Wine", quantity: 2, unitPrice: 25000, amount: 50000, time: "17:50" },
  { id: 8, tabId: 3, item: "Mojito", category: "Cocktails", quantity: 4, unitPrice: 8500, amount: 34000, time: "18:15" },
  { id: 9, tabId: 3, item: "Cheese Platter", category: "Snacks", quantity: 1, unitPrice: 35000, amount: 35000, time: "18:30" },
  { id: 10, tabId: 3, item: "Grey Goose Vodka", category: "Spirits", quantity: 1, unitPrice: 26000, amount: 26000, time: "19:00" },
];

export default function BarTabDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const tab = mockTabs.find(t => t.id === Number(id));
  const tabItems = mockTabItems.filter(item => item.tabId === Number(id));

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "wine": return <Wine className="h-4 w-4" />;
      case "beer": return <Beer className="h-4 w-4" />;
      case "spirits": return <Martini className="h-4 w-4" />;
      case "cocktails": return <Martini className="h-4 w-4" />;
      default: return <Coffee className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Open</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>;
      case "closed":
        return <Badge className="bg-muted text-muted-foreground">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!tab) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tab Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested tab could not be found.</p>
          <Button onClick={() => navigate('/dashboard/bar')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-accent/3 blur-3xl" />
      </div>

      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={cn(
          'relative transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {/* Back Button & Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/bar')}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-display font-bold text-foreground">Tab #{tab.id}</h1>
                  {getStatusBadge(tab.status)}
                </div>
                <p className="text-muted-foreground mt-1">
                  Opened {tab.openedAt}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tab.status === 'open' && (
                <>
                  <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Add Items", description: "Add items dialog coming soon" })}>
                    <Plus className="h-4 w-4" />
                    Add Items
                  </Button>
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => toast({ title: "Close Tab", description: "Tab closure coming soon" })}>
                    <CheckCircle2 className="h-4 w-4" />
                    Close Tab
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Guest Info Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { label: "Guest", value: tab.guestName, icon: User, gradient: "from-accent/20 to-accent/5" },
              { label: "Apartment", value: tab.apartment, icon: Home, gradient: "from-sky-500/20 to-sky-500/5" },
              { label: "Total Items", value: `${tabItems.length} items`, icon: Receipt, gradient: "from-emerald-500/20 to-emerald-500/5" },
              { label: "Total Amount", value: `₦${tab.amount.toLocaleString()}`, icon: CreditCard, gradient: "from-amber-500/20 to-amber-500/5" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/10",
                  stat.gradient,
                  "border-border/50"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <stat.icon className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                </div>
                <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Tab Items */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Tab Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="text-muted-foreground font-medium">Item</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Category</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-center">Qty</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">Unit Price</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">Amount</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tabItems.length > 0 ? (
                      tabItems.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium text-foreground">{item.item}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              {getCategoryIcon(item.category)}
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-foreground">{item.quantity}</TableCell>
                          <TableCell className="text-right text-muted-foreground">₦{item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-semibold text-foreground">₦{item.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.time}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No items on this tab yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Total */}
              <div className="p-4 border-t border-border/50 flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-display font-bold text-foreground">₦{tab.amount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {tab.status !== 'closed' && (
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={() => toast({ title: "Void Tab", description: "Void confirmation coming soon" })}
              >
                <XCircle className="h-4 w-4" />
                Void Tab
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
