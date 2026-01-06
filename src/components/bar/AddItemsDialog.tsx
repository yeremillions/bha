import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Minus,
  Wine,
  Beer,
  Martini,
  Coffee,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
}

interface SelectedItem extends MenuItem {
  quantity: number;
}

interface AddItemsDialogProps {
  trigger: React.ReactNode;
  guestName: string;
  onItemsAdded: (items: SelectedItem[]) => void;
}

const menuItems: MenuItem[] = [
  { id: 1, name: "Château Margaux 2018", category: "Wine", price: 57500 },
  { id: 2, name: "Prosecco DOC", category: "Wine", price: 25000 },
  { id: 3, name: "Sauvignon Blanc", category: "Wine", price: 18000 },
  { id: 4, name: "Hendrick's Gin & Tonic", category: "Cocktails", price: 9000 },
  { id: 5, name: "Espresso Martini", category: "Cocktails", price: 9500 },
  { id: 6, name: "Mojito", category: "Cocktails", price: 8500 },
  { id: 7, name: "Old Fashioned", category: "Cocktails", price: 10000 },
  { id: 8, name: "Margarita", category: "Cocktails", price: 8500 },
  { id: 9, name: "Grey Goose Vodka", category: "Spirits", price: 26000 },
  { id: 10, name: "Premium Whisky", category: "Spirits", price: 12000 },
  { id: 11, name: "Hennessy VS", category: "Spirits", price: 35000 },
  { id: 12, name: "Craft IPA", category: "Beer", price: 4500 },
  { id: 13, name: "Heineken", category: "Beer", price: 3500 },
  { id: 14, name: "Guinness Stout", category: "Beer", price: 4000 },
  { id: 15, name: "Craft Beer Flight", category: "Beer", price: 18000 },
  { id: 16, name: "Mixed Nuts", category: "Snacks", price: 5500 },
  { id: 17, name: "Cheese Platter", category: "Snacks", price: 35000 },
  { id: 18, name: "Olives", category: "Snacks", price: 4000 },
];

const categories = ["All", "Wine", "Cocktails", "Spirits", "Beer", "Snacks"];

export function AddItemsDialog({ trigger, guestName, onItemsAdded }: AddItemsDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "wine": return <Wine className="h-4 w-4" />;
      case "beer": return <Beer className="h-4 w-4" />;
      case "spirits": return <Martini className="h-4 w-4" />;
      case "cocktails": return <Martini className="h-4 w-4" />;
      default: return <Coffee className="h-4 w-4" />;
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addItem = (item: MenuItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (itemId: number) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const getItemQuantity = (itemId: number) => {
    return selectedItems.find(i => i.id === itemId)?.quantity || 0;
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = () => {
    if (selectedItems.length > 0) {
      onItemsAdded(selectedItems);
      setSelectedItems([]);
      setSearchTerm("");
      setSelectedCategory("All");
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedItems([]);
      setSearchTerm("");
      setSelectedCategory("All");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Items to Tab</DialogTitle>
          <DialogDescription>
            Adding items for {guestName}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                selectedCategory === category && "bg-accent text-accent-foreground"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Items List */}
        <ScrollArea className="flex-1 max-h-[300px] border rounded-lg">
          <div className="p-2 space-y-2">
            {filteredItems.map(item => {
              const quantity = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    quantity > 0 ? "bg-accent/10 border-accent/30" : "bg-card hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-sm">₦{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      {quantity > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeItem(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      )}
                      {quantity > 0 && (
                        <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                      )}
                      <Button
                        variant={quantity > 0 ? "default" : "outline"}
                        size="icon"
                        className={cn("h-7 w-7", quantity > 0 && "bg-accent hover:bg-accent/90")}
                        onClick={() => addItem(item)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No items found</p>
            )}
          </div>
        </ScrollArea>

        {/* Selected Items Summary */}
        {selectedItems.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Selected Items</span>
              <span className="font-medium">{totalItems} items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-bold">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedItems.length === 0}
            className="bg-accent hover:bg-accent/90"
          >
            Add {totalItems > 0 ? `${totalItems} Items` : "Items"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
