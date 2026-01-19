import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wine,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Search,
  Plus,
  CreditCard,
  Clock,
  Beer,
  Coffee,
  Martini,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Sparkles,
  Filter,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewTabDialog } from "@/components/bar/NewTabDialog";
import { toast } from "@/hooks/use-toast";
import {
  useBarItems,
  useLowStockItems,
} from "@/hooks/useBarItems";
import {
  useBarTabs,
  useBarRevenueToday,
  useItemsSoldToday,
} from "@/hooks/useBarTabs";

export default function Bar() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tabs");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabFilter, setTabFilter] = useState<"all" | "open" | "closed">("all");
  const [inventoryFilter, setInventoryFilter] = useState("all");

  // Fetch data from hooks
  const statusFilter = tabFilter === "all" ? undefined : tabFilter;
  const { data: allTabs = [], isLoading: tabsLoading } = useBarTabs(statusFilter);
  const { data: barItems = [], isLoading: itemsLoading } = useBarItems();
  const { data: lowStockItems = [], isLoading: lowStockLoading } = useLowStockItems();
  const { data: todayRevenue = 0, isLoading: revenueLoading } = useBarRevenueToday();
  const { data: itemsSoldToday = 0, isLoading: itemsSoldLoading } = useItemsSoldToday();

  // Filter tabs based on search
  const filteredTabs = useMemo(() => {
    return allTabs.filter(tab => {
      const matchesSearch = tab.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (tab.room_number && tab.room_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            tab.tab_number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [allTabs, searchTerm]);

  // Filter inventory based on search and filter
  const filteredInventory = useMemo(() => {
    return barItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = inventoryFilter === "all" ||
                            (inventoryFilter === "low" && item.stock_quantity <= item.min_stock_level) ||
                            item.category.toLowerCase() === inventoryFilter.toLowerCase();
      return matchesSearch && matchesFilter && item.active;
    });
  }, [barItems, searchTerm, inventoryFilter]);

  // Calculate stats
  const openTabsCount = allTabs.filter(tab => tab.status === 'open').length;

  // Get today's sales (recent tab items from closed tabs today)
  const todaysSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allTabs
      .filter(tab => tab.status === 'closed' && new Date(tab.closed_at!) >= today)
      .slice(0, 10); // Show last 10 sales
  }, [allTabs]);

  const isLoading = tabsLoading || itemsLoading;

  const getStockStatus = (stock: number, minStock: number) => {
    const ratio = stock / minStock;
    if (ratio <= 0.5) return { color: "bg-destructive", status: "Critical" };
    if (ratio <= 1) return { color: "bg-amber-500", status: "Low" };
    return { color: "bg-emerald-500", status: "Good" };
  };

  const getTabStatusBadge = (status: string) => {
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "wine": return <Wine className="h-4 w-4" />;
      case "beer": return <Beer className="h-4 w-4" />;
      case "spirits": return <Martini className="h-4 w-4" />;
      case "cocktails": return <Martini className="h-4 w-4" />;
      default: return <Coffee className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-accent/3 blur-3xl" />
      </div>
      
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
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
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Bar Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage tabs, sales, and inventory
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Reports
              </Button>
              <NewTabDialog 
                onTabCreated={(data) => {
                  toast({
                    title: "Tab Created",
                    description: `New tab opened for Apt ${data.apartment} - ${data.guest} (₦${data.total.toLocaleString()})`,
                  });
                }}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Today's Revenue */}
            <div className="group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 from-accent/20 to-accent/5 border-border/50">
              <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground font-medium">Today's Revenue</p>
                  <DollarSign className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                  {revenueLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `₦${todayRevenue.toLocaleString()}`}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">
                  From bar sales
                </p>
              </div>
              <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Open Tabs */}
            <div className="group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 from-accent/20 to-accent/5 border-border/50">
              <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground font-medium">Open Tabs</p>
                  <CreditCard className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {tabsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : openTabsCount}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Currently active
                </p>
              </div>
              <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Items Sold */}
            <div className="group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 from-accent/20 to-accent/5 border-border/50">
              <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground font-medium">Items Sold</p>
                  <Wine className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                  {itemsSoldLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : itemsSoldToday}
                </p>
                <p className="text-xs mt-1 text-emerald-600 dark:text-emerald-400">
                  Today's total
                </p>
              </div>
              <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Low Stock Items */}
            <div className="group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 from-amber-500/20 to-amber-500/5 border-border/50">
              <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground font-medium">Low Stock Items</p>
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                </div>
                <p className="text-2xl font-display font-bold text-amber-600 dark:text-amber-400">
                  {lowStockLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : lowStockItems.length}
                </p>
                <p className="text-xs mt-1 text-amber-600 dark:text-amber-400">
                  {lowStockItems.length > 0 ? "Action needed" : "All good"}
                </p>
              </div>
              <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 w-full sm:w-auto flex-wrap h-auto p-1">
              <TabsTrigger value="tabs" className="gap-2 text-sm flex-1 sm:flex-initial">
                <CreditCard className="h-4 w-4" />
                Guest Tabs
              </TabsTrigger>
              <TabsTrigger value="sales" className="gap-2 text-sm flex-1 sm:flex-initial">
                <DollarSign className="h-4 w-4" />
                Today's Sales
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2 text-sm flex-1 sm:flex-initial">
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
            </TabsList>

            {/* Guest Tabs Tab */}
            <TabsContent value="tabs" className="space-y-6">
              {/* Filters */}
              <div className="relative rounded-2xl border border-border/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Filters</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by guest or apartment..."
                      className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={tabFilter} onValueChange={(value) => setTabFilter(value as 'all' | 'open' | 'closed')}>
                    <SelectTrigger className="w-full md:w-44 bg-background/50 border-border/50 hover:bg-background transition-colors">
                      <SelectValue placeholder="All Tabs" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="all">All Tabs</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Guest Tabs Table */}
              <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold text-foreground">Active Guest Tabs</h3>
                </div>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Guest</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Apartment</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Items</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Amount</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Opened</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Status</TableHead>
                        <TableHead className="text-muted-foreground font-medium text-right whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mt-2">Loading tabs...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredTabs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <p className="text-muted-foreground">No tabs found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTabs.map((tab, index) => (
                          <TableRow
                            key={tab.id}
                            className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer"
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => navigate(`/dashboard/bar/${tab.id}`)}
                          >
                            <TableCell className="font-medium text-foreground">{tab.customer_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {tab.room_number || tab.tab_number}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-foreground">
                              {/* We'll need to fetch tab items count separately or store it */}
                              -
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">₦{tab.total.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-1 whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {format(new Date(tab.opened_at), 'MMM d, HH:mm')}
                              </div>
                            </TableCell>
                            <TableCell>{getTabStatusBadge(tab.status)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover border-border z-50">
                                  <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); }}>
                                    <Plus className="h-4 w-4" /> Add Items
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/bar/${tab.id}`); }}>
                                    <CreditCard className="h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  {tab.status === 'open' && (
                                    <DropdownMenuItem className="gap-2 text-emerald-400" onClick={(e) => e.stopPropagation()}>
                                      <CheckCircle2 className="h-4 w-4" /> Close Tab
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Today's Sales Tab */}
            <TabsContent value="sales" className="space-y-6">
              <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-semibold text-foreground">Today's Sales Activity</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Last updated: Just now
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Item</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Category</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Guest</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Qty</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Amount</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mt-2">Loading sales...</p>
                          </TableCell>
                        </TableRow>
                      ) : todaysSales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-muted-foreground">No sales today</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        todaysSales.map((tab, index) => (
                          <TableRow
                            key={tab.id}
                            className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell className="font-medium text-foreground">Tab {tab.tab_number}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Tab Sale</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-foreground">{tab.customer_name}</TableCell>
                            <TableCell className="text-foreground">-</TableCell>
                            <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                              ₦{tab.total.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {tab.closed_at && format(new Date(tab.closed_at), 'HH:mm')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              {/* Low Stock Alerts */}
              {!lowStockLoading && lowStockItems.length > 0 && (
                <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-600 dark:text-amber-400">Low Stock Alert</p>
                        <p className="text-sm text-muted-foreground">
                          {lowStockItems.length} items need to be reordered
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      onClick={() => setInventoryFilter('low')}
                    >
                      View All
                    </Button>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="relative rounded-2xl border border-border/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Filters</h3>
                  </div>
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={inventoryFilter} onValueChange={setInventoryFilter}>
                    <SelectTrigger className="w-full md:w-44 bg-background/50 border-border/50 hover:bg-background transition-colors">
                      <SelectValue placeholder="All Items" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="spirits">Spirits</SelectItem>
                      <SelectItem value="wine">Wine</SelectItem>
                      <SelectItem value="beer">Beer</SelectItem>
                      <SelectItem value="mixers">Mixers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold text-foreground">Inventory Overview</h3>
                </div>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Item</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Category</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Stock Level</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Status</TableHead>
                        <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Last Ordered</TableHead>
                        <TableHead className="text-muted-foreground font-medium text-right whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mt-2">Loading inventory...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredInventory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-muted-foreground">No items found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInventory.map((item, index) => {
                          const stockStatus = getStockStatus(item.stock_quantity, item.min_stock_level);
                          const stockPercentage = Math.min((item.stock_quantity / (item.min_stock_level * 2)) * 100, 100);

                          return (
                            <TableRow
                              key={item.id}
                              className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(item.category)}
                                  <span className="text-muted-foreground capitalize">{item.category.replace('_', ' ')}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1.5 min-w-[120px]">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-foreground">{item.stock_quantity} {item.unit}</span>
                                    <span className="text-muted-foreground">min: {item.min_stock_level}</span>
                                  </div>
                                  <Progress
                                    value={stockPercentage}
                                    className="h-1.5"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  stockStatus.status === "Critical" && "bg-rose-500 text-white border-rose-500",
                                  stockStatus.status === "Low" && "bg-amber-500 text-white border-amber-500",
                                  stockStatus.status === "Good" && "bg-emerald-500 text-white border-emerald-500"
                                )}>
                                  {stockStatus.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground whitespace-nowrap">
                                {item.updated_at ? format(new Date(item.updated_at), 'MMM d, yyyy') : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-popover border-border z-50">
                                    <DropdownMenuItem className="gap-2">
                                      <Plus className="h-4 w-4" /> Update Stock
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                      <Package className="h-4 w-4" /> Reorder
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
