import { useState, useMemo } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  Eye,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import {
  useInventoryItems,
  useInventoryCategories,
  useSuppliers,
  useInventoryAlerts,
  useInventoryStats,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useCreateSupplier,
  useAcknowledgeAlert,
} from '@/hooks/useInventory';
import type { Database } from '@/integrations/supabase/types';

type InventoryItem = Database['public']['Tables']['inventory_items']['Row'] & {
  category?: Database['public']['Tables']['inventory_categories']['Row'];
  supplier?: Database['public']['Tables']['suppliers']['Row'];
};
type NewInventoryItem = Database['public']['Tables']['inventory_items']['Insert'];
type Supplier = Database['public']['Tables']['suppliers']['Row'];
type NewSupplier = Database['public']['Tables']['suppliers']['Insert'];

const stockStatusConfig = {
  critical: { label: 'Critical', className: 'bg-rose-500 text-white' },
  low: { label: 'Low Stock', className: 'bg-amber-500 text-white' },
  good: { label: 'In Stock', className: 'bg-emerald-500 text-white' },
  overstock: { label: 'Overstock', className: 'bg-blue-500 text-white' },
};

const alertSeverityConfig = {
  critical: { className: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' },
  warning: { className: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' },
  info: { className: 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400' },
};

const InventoryPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialogs
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [viewItemDialogOpen, setViewItemDialogOpen] = useState(false);
  const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState(false);
  const [addSupplierDialogOpen, setAddSupplierDialogOpen] = useState(false);

  // Selected items
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [itemForm, setItemForm] = useState<NewInventoryItem>({
    item_code: '',
    item_name: '',
    unit_of_measure: 'pieces',
    current_stock: 0,
    minimum_stock_level: 0,
    reorder_level: 0,
  });

  const [supplierForm, setSupplierForm] = useState<NewSupplier>({
    supplier_name: '',
    contact_person: '',
    email: '',
    phone: '',
    status: 'active',
  });

  // Data fetching
  const { data: allItems = [], isLoading: itemsLoading } = useInventoryItems();
  const { data: categories = [] } = useInventoryCategories();
  const { data: suppliers = [] } = useSuppliers('active');
  const { data: alerts = [] } = useInventoryAlerts(false);
  const { data: stats } = useInventoryStats();

  // Mutations
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const createSupplier = useCreateSupplier();
  const acknowledgeAlert = useAcknowledgeAlert();

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = !searchQuery ||
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'low_stock') {
        matchesStatus = item.current_stock <= item.reorder_level && item.current_stock > 0;
      } else if (statusFilter === 'out_of_stock') {
        matchesStatus = item.current_stock <= 0;
      } else if (statusFilter === 'in_stock') {
        matchesStatus = item.current_stock > item.reorder_level;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allItems, searchQuery, categoryFilter, statusFilter]);

  // Get stock status
  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= 0) return 'critical';
    if (item.current_stock <= item.reorder_level) return 'low';
    if (item.maximum_stock_level && item.current_stock > item.maximum_stock_level) return 'overstock';
    return 'good';
  };

  // Statistics cards
  const statsCards = [
    { label: 'Total Items', value: stats?.total || 0, icon: Package, color: 'text-foreground' },
    { label: 'Active Items', value: stats?.active || 0, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Low Stock', value: stats?.lowStock || 0, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Total Value', value: `₦${(stats?.totalValue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-sky-500' },
  ];

  // Handlers
  const handleAddItem = () => {
    setItemForm({
      item_code: '',
      item_name: '',
      unit_of_measure: 'pieces',
      current_stock: 0,
      minimum_stock_level: 0,
      reorder_level: 0,
    });
    setSelectedItem(null);
    setAddItemDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemForm({
      item_code: item.item_code,
      item_name: item.item_name,
      category_id: item.category_id,
      description: item.description,
      unit_of_measure: item.unit_of_measure,
      current_stock: item.current_stock,
      minimum_stock_level: item.minimum_stock_level,
      reorder_level: item.reorder_level,
      maximum_stock_level: item.maximum_stock_level,
      unit_cost: item.unit_cost,
      selling_price: item.selling_price,
      primary_supplier_id: item.primary_supplier_id,
      storage_location: item.storage_location,
      notes: item.notes,
    });
    setEditItemDialogOpen(true);
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setViewItemDialogOpen(true);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setItemToDelete({ id: item.id, name: item.item_name });
    setDeleteItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (selectedItem) {
      await updateItem.mutateAsync({ id: selectedItem.id, updates: itemForm });
      setEditItemDialogOpen(false);
    } else {
      await createItem.mutateAsync(itemForm);
      setAddItemDialogOpen(false);
    }
    setSelectedItem(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteItem.mutateAsync(itemToDelete.id);
    setItemToDelete(null);
  };

  const handleSaveSupplier = async () => {
    await createSupplier.mutateAsync(supplierForm);
    setAddSupplierDialogOpen(false);
    setSupplierForm({
      supplier_name: '',
      contact_person: '',
      email: '',
      phone: '',
      status: 'active',
    });
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await acknowledgeAlert.mutateAsync(alertId);
  };

  if (itemsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading inventory data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={cn("flex-1 transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Inventory Management</h1>
              <p className="text-muted-foreground mt-1">Track stock levels, suppliers, and inventory alerts</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setAddSupplierDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
              <Button onClick={handleAddItem} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/50 bg-card p-4 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <p className={cn('text-2xl font-bold', stat.color)}>
                  {typeof stat.value === 'string' ? stat.value : stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="border-b border-amber-500/30">
                <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Bell className="h-5 w-5" />
                  Stock Alerts ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {alerts.slice(0, 5).map((alert: any) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-3 rounded-lg border flex items-start justify-between',
                      alertSeverityConfig[alert.severity as keyof typeof alertSeverityConfig]?.className
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {alert.item?.item_name} - Current: {alert.item?.current_stock} {alert.item?.unit_of_measure}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Main Content - Tabs */}
          <Tabs defaultValue="items" className="space-y-4">
            <TabsList>
              <TabsTrigger value="items">Inventory Items</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            </TabsList>

            {/* Items Tab */}
            <TabsContent value="items" className="space-y-4">
              <Card className="border-border/50 bg-card">
                <CardHeader className="border-b border-border/50">
                  <div className="flex flex-col gap-4">
                    <CardTitle>Inventory Items</CardTitle>

                    {/* Filters */}
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by item name or code..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Stock Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Stock</SelectItem>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="low_stock">Low Stock</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                          <TableHead>Item Code</TableHead>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Reorder Level</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              No items found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredItems.map((item) => {
                            const status = getStockStatus(item);
                            return (
                              <TableRow key={item.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium">{item.item_code}</TableCell>
                                <TableCell>{item.item_name}</TableCell>
                                <TableCell>{item.category?.name || 'N/A'}</TableCell>
                                <TableCell>
                                  {item.current_stock} {item.unit_of_measure}
                                </TableCell>
                                <TableCell>
                                  {item.reorder_level} {item.unit_of_measure}
                                </TableCell>
                                <TableCell>
                                  {item.unit_cost ? `₦${item.unit_cost.toLocaleString()}` : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Badge className={stockStatusConfig[status].className}>
                                    {stockStatusConfig[status].label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-popover border-border">
                                      <DropdownMenuItem onClick={() => handleViewItem(item)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleDeleteItem(item)} className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Suppliers Tab */}
            <TabsContent value="suppliers" className="space-y-4">
              <Card className="border-border/50 bg-card">
                <CardHeader className="border-b border-border/50">
                  <CardTitle>Suppliers</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                          <TableHead>Supplier Name</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Payment Terms</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suppliers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No suppliers found
                            </TableCell>
                          </TableRow>
                        ) : (
                          suppliers.map((supplier) => (
                            <TableRow key={supplier.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                              <TableCell>{supplier.contact_person || 'N/A'}</TableCell>
                              <TableCell>{supplier.email || 'N/A'}</TableCell>
                              <TableCell>{supplier.phone || 'N/A'}</TableCell>
                              <TableCell className="capitalize">{supplier.payment_terms || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge className={supplier.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}>
                                  {supplier.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Add/Edit Item Dialog */}
      <Dialog open={addItemDialogOpen || editItemDialogOpen} onOpenChange={(open) => {
        setAddItemDialogOpen(open);
        setEditItemDialogOpen(open);
        if (!open) setSelectedItem(null);
      }}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Inventory Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Update inventory item details' : 'Add a new item to inventory'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_code">Item Code *</Label>
                <Input
                  id="item_code"
                  value={itemForm.item_code}
                  onChange={(e) => setItemForm({ ...itemForm, item_code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  value={itemForm.item_name}
                  onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category_id">Category</Label>
                <Select value={itemForm.category_id || ''} onValueChange={(value) => setItemForm({ ...itemForm, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unit_of_measure">Unit of Measure *</Label>
                <Input
                  id="unit_of_measure"
                  value={itemForm.unit_of_measure}
                  onChange={(e) => setItemForm({ ...itemForm, unit_of_measure: e.target.value })}
                  placeholder="e.g., pieces, kg, liters"
                />
              </div>
              <div>
                <Label htmlFor="current_stock">Current Stock</Label>
                <Input
                  id="current_stock"
                  type="number"
                  value={itemForm.current_stock}
                  onChange={(e) => setItemForm({ ...itemForm, current_stock: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="reorder_level">Reorder Level</Label>
                <Input
                  id="reorder_level"
                  type="number"
                  value={itemForm.reorder_level}
                  onChange={(e) => setItemForm({ ...itemForm, reorder_level: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="unit_cost">Unit Cost (NGN)</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  value={itemForm.unit_cost || 0}
                  onChange={(e) => setItemForm({ ...itemForm, unit_cost: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="primary_supplier_id">Supplier</Label>
                <Select value={itemForm.primary_supplier_id || ''} onValueChange={(value) => setItemForm({ ...itemForm, primary_supplier_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(sup => (
                      <SelectItem key={sup.id} value={sup.id}>
                        {sup.supplier_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="storage_location">Storage Location</Label>
                <Input
                  id="storage_location"
                  value={itemForm.storage_location || ''}
                  onChange={(e) => setItemForm({ ...itemForm, storage_location: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={itemForm.description || ''}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddItemDialogOpen(false);
              setEditItemDialogOpen(false);
              setSelectedItem(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={!itemForm.item_code || !itemForm.item_name || !itemForm.unit_of_measure}>
              {selectedItem ? 'Update' : 'Add'} Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
      <Dialog open={viewItemDialogOpen} onOpenChange={setViewItemDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Item Details: {selectedItem?.item_name}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Item Code</Label>
                  <p className="font-medium">{selectedItem.item_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{selectedItem.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Stock</Label>
                  <p className="font-medium">{selectedItem.current_stock} {selectedItem.unit_of_measure}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reorder Level</Label>
                  <p className="font-medium">{selectedItem.reorder_level} {selectedItem.unit_of_measure}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={stockStatusConfig[getStockStatus(selectedItem)].className}>
                    {stockStatusConfig[getStockStatus(selectedItem)].label}
                  </Badge>
                </div>
                {selectedItem.unit_cost && (
                  <div>
                    <Label className="text-muted-foreground">Unit Cost</Label>
                    <p className="font-medium">₦{selectedItem.unit_cost.toLocaleString()}</p>
                  </div>
                )}
                {selectedItem.storage_location && (
                  <div>
                    <Label className="text-muted-foreground">Storage Location</Label>
                    <p className="font-medium">{selectedItem.storage_location}</p>
                  </div>
                )}
                {selectedItem.supplier && (
                  <div>
                    <Label className="text-muted-foreground">Supplier</Label>
                    <p className="font-medium">{selectedItem.supplier.supplier_name}</p>
                  </div>
                )}
              </div>
              {selectedItem.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewItemDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={addSupplierDialogOpen} onOpenChange={setAddSupplierDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>Add a new supplier to your database</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="supplier_name">Supplier Name *</Label>
              <Input
                id="supplier_name"
                value={supplierForm.supplier_name}
                onChange={(e) => setSupplierForm({ ...supplierForm, supplier_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={supplierForm.contact_person || ''}
                onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="supplier_email">Email</Label>
              <Input
                id="supplier_email"
                type="email"
                value={supplierForm.email || ''}
                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="supplier_phone">Phone</Label>
              <Input
                id="supplier_phone"
                value={supplierForm.phone || ''}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSupplierDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSupplier} disabled={!supplierForm.supplier_name}>
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteItemDialogOpen}
        onOpenChange={setDeleteItemDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Inventory Item?"
        description={`Are you sure you want to delete ${itemToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default InventoryPage;
