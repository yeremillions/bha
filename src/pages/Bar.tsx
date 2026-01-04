import { useState } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewTabDialog } from "@/components/bar/NewTabDialog";
import { toast } from "@/hooks/use-toast";

// Mock data
const mockTabs = [
  { id: 1, guestName: "John Smith", apartment: "101A", amount: 87500, items: 8, status: "open", openedAt: "2024-01-15 18:30" },
  { id: 2, guestName: "Sarah Johnson", apartment: "102B", amount: 42500, items: 4, status: "open", openedAt: "2024-01-15 19:15" },
  { id: 3, guestName: "Michael Brown", apartment: "103A", amount: 145000, items: 12, status: "open", openedAt: "2024-01-15 17:45" },
  { id: 4, guestName: "Emily Davis", apartment: "104B", amount: 55000, items: 5, status: "pending", openedAt: "2024-01-14 20:00" },
  { id: 5, guestName: "Robert Wilson", apartment: "101B", amount: 195000, items: 15, status: "closed", openedAt: "2024-01-14 18:00" },
];

const mockSales = [
  { id: 1, item: "Château Margaux 2018", category: "Wine", quantity: 2, amount: 115000, time: "19:45", guest: "John Smith" },
  { id: 2, item: "Hendrick's Gin & Tonic", category: "Cocktails", quantity: 3, amount: 27000, time: "19:30", guest: "Sarah Johnson" },
  { id: 3, item: "Craft Beer Flight", category: "Beer", quantity: 1, amount: 18000, time: "19:15", guest: "Michael Brown" },
  { id: 4, item: "Espresso Martini", category: "Cocktails", quantity: 2, amount: 19000, time: "19:00", guest: "Emily Davis" },
  { id: 5, item: "Premium Whisky Selection", category: "Spirits", quantity: 1, amount: 65000, time: "18:45", guest: "John Smith" },
];

const mockInventory = [
  { id: 1, name: "Grey Goose Vodka", category: "Spirits", stock: 8, minStock: 5, unit: "bottles", lastOrdered: "2024-01-10" },
  { id: 2, name: "Hendrick's Gin", category: "Spirits", stock: 3, minStock: 4, unit: "bottles", lastOrdered: "2024-01-08" },
  { id: 3, name: "Château Margaux 2018", category: "Wine", stock: 12, minStock: 6, unit: "bottles", lastOrdered: "2024-01-12" },
  { id: 4, name: "Craft IPA", category: "Beer", stock: 24, minStock: 20, unit: "cans", lastOrdered: "2024-01-14" },
  { id: 5, name: "Prosecco DOC", category: "Wine", stock: 2, minStock: 8, unit: "bottles", lastOrdered: "2024-01-05" },
  { id: 6, name: "Angostura Bitters", category: "Mixers", stock: 6, minStock: 3, unit: "bottles", lastOrdered: "2024-01-11" },
  { id: 7, name: "Fresh Lime Juice", category: "Mixers", stock: 4, minStock: 10, unit: "bottles", lastOrdered: "2024-01-13" },
  { id: 8, name: "Premium Tonic Water", category: "Mixers", stock: 36, minStock: 24, unit: "bottles", lastOrdered: "2024-01-14" },
];

const statCards = [
  { title: "Today's Revenue", value: "₦1,147,500", change: "+12.5%", icon: DollarSign, trend: "up" },
  { title: "Open Tabs", value: "4", change: "3 pending", icon: CreditCard, trend: "neutral" },
  { title: "Items Sold", value: "47", change: "+8 vs yesterday", icon: Wine, trend: "up" },
  { title: "Low Stock Items", value: "3", change: "Action needed", icon: AlertTriangle, trend: "warning" },
];

export default function Bar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("tabs");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabFilter, setTabFilter] = useState("all");
  const [inventoryFilter, setInventoryFilter] = useState("all");

  const filteredTabs = mockTabs.filter(tab => {
    const matchesSearch = tab.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tab.apartment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = tabFilter === "all" || tab.status === tabFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = inventoryFilter === "all" || 
                          (inventoryFilter === "low" && item.stock <= item.minStock) ||
                          item.category.toLowerCase() === inventoryFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
            {statCards.map((stat, index) => (
              <div
                key={stat.title}
                className={cn(
                  "group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5",
                  stat.trend === "warning" 
                    ? "from-amber-500/20 to-amber-500/5" 
                    : "from-accent/20 to-accent/5",
                  "border-border/50"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                    <stat.icon className={cn(
                      "h-4 w-4",
                      stat.trend === "warning" ? "text-amber-400" : "text-muted-foreground/50"
                    )} />
                  </div>
                  <p className={cn(
                    "text-2xl font-display font-bold",
                    stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" :
                    stat.trend === "warning" ? "text-amber-600 dark:text-amber-400" :
                    "text-foreground"
                  )}>
                    {stat.value}
                  </p>
                  <p className={cn(
                    "text-xs mt-1",
                    stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" :
                    stat.trend === "warning" ? "text-amber-600 dark:text-amber-400" :
                    "text-muted-foreground"
                  )}>
                    {stat.change}
                  </p>
                </div>
                
                {/* Decorative sparkle */}
                <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
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
                  <Select value={tabFilter} onValueChange={setTabFilter}>
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
                      {filteredTabs.map((tab, index) => (
                        <TableRow 
                          key={tab.id} 
                          className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium text-foreground">{tab.guestName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">{tab.apartment}</Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{tab.items} items</TableCell>
                          <TableCell className="font-semibold text-foreground">₦{tab.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {tab.openedAt}
                            </div>
                          </TableCell>
                          <TableCell>{getTabStatusBadge(tab.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover border-border z-50">
                                <DropdownMenuItem className="gap-2">
                                  <Plus className="h-4 w-4" /> Add Items
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <CreditCard className="h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-emerald-400">
                                  <CheckCircle2 className="h-4 w-4" /> Close Tab
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive">
                                  <XCircle className="h-4 w-4" /> Void Tab
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
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
                      {mockSales.map((sale, index) => (
                        <TableRow 
                          key={sale.id} 
                          className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium text-foreground">{sale.item}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(sale.category)}
                              <span className="text-muted-foreground">{sale.category}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">{sale.guest}</TableCell>
                          <TableCell className="text-foreground">{sale.quantity}</TableCell>
                          <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">₦{sale.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">{sale.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              {/* Low Stock Alerts */}
              {mockInventory.filter(i => i.stock <= i.minStock).length > 0 && (
                <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-600 dark:text-amber-400">Low Stock Alert</p>
                        <p className="text-sm text-muted-foreground">
                          {mockInventory.filter(i => i.stock <= i.minStock).length} items need to be reordered
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
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
                      {filteredInventory.map((item, index) => {
                        const stockStatus = getStockStatus(item.stock, item.minStock);
                        const stockPercentage = Math.min((item.stock / (item.minStock * 2)) * 100, 100);
                        
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
                                <span className="text-muted-foreground">{item.category}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1.5 min-w-[120px]">
                                <div className="flex justify-between text-xs">
                                  <span className="text-foreground">{item.stock} {item.unit}</span>
                                  <span className="text-muted-foreground">min: {item.minStock}</span>
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
                            <TableCell className="text-muted-foreground whitespace-nowrap">{item.lastOrdered}</TableCell>
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
                      })}
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
