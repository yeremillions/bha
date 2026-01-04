import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
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
  { id: 1, guestName: "John Smith", room: "101A", amount: 145.50, items: 8, status: "open", openedAt: "2024-01-15 18:30" },
  { id: 2, guestName: "Sarah Johnson", room: "102B", amount: 67.25, items: 4, status: "open", openedAt: "2024-01-15 19:15" },
  { id: 3, guestName: "Michael Brown", room: "103A", amount: 234.00, items: 12, status: "open", openedAt: "2024-01-15 17:45" },
  { id: 4, guestName: "Emily Davis", room: "104B", amount: 89.75, items: 5, status: "pending", openedAt: "2024-01-14 20:00" },
  { id: 5, guestName: "Robert Wilson", room: "101B", amount: 312.50, items: 15, status: "closed", openedAt: "2024-01-14 18:00" },
];

const mockSales = [
  { id: 1, item: "Château Margaux 2018", category: "Wine", quantity: 2, amount: 180.00, time: "19:45", guest: "John Smith" },
  { id: 2, item: "Hendrick's Gin & Tonic", category: "Cocktails", quantity: 3, amount: 45.00, time: "19:30", guest: "Sarah Johnson" },
  { id: 3, item: "Craft Beer Flight", category: "Beer", quantity: 1, amount: 28.00, time: "19:15", guest: "Michael Brown" },
  { id: 4, item: "Espresso Martini", category: "Cocktails", quantity: 2, amount: 32.00, time: "19:00", guest: "Emily Davis" },
  { id: 5, item: "Premium Whisky Selection", category: "Spirits", quantity: 1, amount: 95.00, time: "18:45", guest: "John Smith" },
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
  { title: "Today's Revenue", value: "$1,847.50", change: "+12.5%", icon: DollarSign, trend: "up" },
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
                          tab.room.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-playfair text-foreground">Bar Management</h1>
                <p className="text-muted-foreground mt-1">Manage tabs, sales, and inventory</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View Reports
                </Button>
                <NewTabDialog 
                  onTabCreated={(data) => {
                    toast({
                      title: "Tab Created",
                      description: `New tab opened for Room ${data.room} - ${data.guest} ($${data.total.toFixed(2)})`,
                    });
                  }}
                />
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <Card 
                  key={index} 
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className={`text-xs ${
                          stat.trend === "up" ? "text-emerald-400" : 
                          stat.trend === "warning" ? "text-amber-400" : 
                          "text-muted-foreground"
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${
                        stat.trend === "warning" ? "bg-amber-500/10" : "bg-primary/10"
                      }`}>
                        <stat.icon className={`h-5 w-5 ${
                          stat.trend === "warning" ? "text-amber-400" : "text-primary"
                        }`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50">
                <TabsTrigger value="tabs" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Guest Tabs
                </TabsTrigger>
                <TabsTrigger value="sales" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Today's Sales
                </TabsTrigger>
                <TabsTrigger value="inventory" className="gap-2">
                  <Package className="h-4 w-4" />
                  Inventory
                </TabsTrigger>
              </TabsList>

              {/* Guest Tabs Tab */}
              <TabsContent value="tabs" className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-lg font-semibold">Active Guest Tabs</CardTitle>
                      <div className="flex gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search guests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-[200px] bg-background/50"
                          />
                        </div>
                        <Select value={tabFilter} onValueChange={setTabFilter}>
                          <SelectTrigger className="w-[130px] bg-background/50">
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tabs</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead>Guest</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Opened</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTabs.map((tab) => (
                          <TableRow key={tab.id} className="border-border/50">
                            <TableCell className="font-medium">{tab.guestName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">{tab.room}</Badge>
                            </TableCell>
                            <TableCell>{tab.items} items</TableCell>
                            <TableCell className="font-semibold">${tab.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-1">
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
                                <DropdownMenuContent align="end">
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Today's Sales Tab */}
              <TabsContent value="sales" className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-lg font-semibold">Today's Sales Activity</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Last updated: Just now
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead>Item</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Guest</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSales.map((sale) => (
                          <TableRow key={sale.id} className="border-border/50">
                            <TableCell className="font-medium">{sale.item}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(sale.category)}
                                <span className="text-muted-foreground">{sale.category}</span>
                              </div>
                            </TableCell>
                            <TableCell>{sale.guest}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell className="font-semibold text-emerald-400">${sale.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-muted-foreground">{sale.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-4">
                {/* Low Stock Alerts */}
                {mockInventory.filter(i => i.stock <= i.minStock).length > 0 && (
                  <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-amber-400">Low Stock Alert</p>
                          <p className="text-sm text-muted-foreground">
                            {mockInventory.filter(i => i.stock <= i.minStock).length} items need to be reordered
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                          View All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-lg font-semibold">Inventory Overview</CardTitle>
                      <div className="flex gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-[200px] bg-background/50"
                          />
                        </div>
                        <Select value={inventoryFilter} onValueChange={setInventoryFilter}>
                          <SelectTrigger className="w-[150px] bg-background/50">
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Items</SelectItem>
                            <SelectItem value="low">Low Stock</SelectItem>
                            <SelectItem value="spirits">Spirits</SelectItem>
                            <SelectItem value="wine">Wine</SelectItem>
                            <SelectItem value="beer">Beer</SelectItem>
                            <SelectItem value="mixers">Mixers</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead>Item</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Stock Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Ordered</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((item) => {
                          const stockStatus = getStockStatus(item.stock, item.minStock);
                          const stockPercentage = Math.min((item.stock / (item.minStock * 2)) * 100, 100);
                          
                          return (
                            <TableRow key={item.id} className="border-border/50">
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(item.category)}
                                  <span className="text-muted-foreground">{item.category}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1.5 w-32">
                                  <div className="flex justify-between text-xs">
                                    <span>{item.stock} {item.unit}</span>
                                    <span className="text-muted-foreground">min: {item.minStock}</span>
                                  </div>
                                  <Progress 
                                    value={stockPercentage} 
                                    className="h-1.5"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${stockStatus.color}/20 text-${stockStatus.color.replace('bg-', '')} border-${stockStatus.color.replace('bg-', '')}/30`}>
                                  {stockStatus.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{item.lastOrdered}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
