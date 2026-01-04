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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Receipt } from "lucide-react";

// Mock rooms for selection
const mockRooms = [
  { id: "101A", guest: "John Smith" },
  { id: "102B", guest: "Sarah Johnson" },
  { id: "103A", guest: "Michael Brown" },
  { id: "104B", guest: "Emily Davis" },
  { id: "105A", guest: "Robert Wilson" },
  { id: "201A", guest: "Lisa Anderson" },
  { id: "202B", guest: "James Taylor" },
];

// Mock menu items for initial items selection
const mockMenuItems = [
  { id: 1, name: "Mojito", price: 14.00, category: "Cocktails" },
  { id: 2, name: "Espresso Martini", price: 16.00, category: "Cocktails" },
  { id: 3, name: "Gin & Tonic", price: 15.00, category: "Cocktails" },
  { id: 4, name: "Margarita", price: 14.00, category: "Cocktails" },
  { id: 5, name: "Craft IPA", price: 8.00, category: "Beer" },
  { id: 6, name: "Lager", price: 7.00, category: "Beer" },
  { id: 7, name: "House Red Wine", price: 12.00, category: "Wine" },
  { id: 8, name: "House White Wine", price: 11.00, category: "Wine" },
  { id: 9, name: "Prosecco Glass", price: 10.00, category: "Wine" },
  { id: 10, name: "Whisky Neat", price: 18.00, category: "Spirits" },
  { id: 11, name: "Vodka Soda", price: 12.00, category: "Spirits" },
  { id: 12, name: "Soft Drink", price: 4.00, category: "Non-Alcoholic" },
  { id: 13, name: "Coffee", price: 5.00, category: "Non-Alcoholic" },
];

interface TabItem {
  itemId: number;
  name: string;
  quantity: number;
  price: number;
}

interface NewTabDialogProps {
  trigger?: React.ReactNode;
  onTabCreated?: (data: { room: string; guest: string; items: TabItem[]; total: number }) => void;
}

export function NewTabDialog({ trigger, onTabCreated }: NewTabDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [tabItems, setTabItems] = useState<TabItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState("");

  const handleAddItem = () => {
    if (!selectedMenuItem) return;
    
    const menuItem = mockMenuItems.find(item => item.id.toString() === selectedMenuItem);
    if (!menuItem) return;

    const existingItem = tabItems.find(item => item.itemId === menuItem.id);
    if (existingItem) {
      setTabItems(tabItems.map(item =>
        item.itemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setTabItems([...tabItems, {
        itemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price
      }]);
    }
    setSelectedMenuItem("");
  };

  const handleRemoveItem = (itemId: number) => {
    setTabItems(tabItems.filter(item => item.itemId !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, delta: number) => {
    setTabItems(tabItems.map(item => {
      if (item.itemId === itemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const calculateTabTotal = () => {
    return tabItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleCreateTab = () => {
    const roomData = mockRooms.find(r => r.id === selectedRoom);
    if (!roomData) return;

    const tabData = {
      room: selectedRoom,
      guest: roomData.guest,
      items: tabItems,
      total: calculateTabTotal()
    };

    console.log("Creating tab:", tabData);
    onTabCreated?.(tabData);
    
    // Reset form and close dialog
    setSelectedRoom("");
    setTabItems([]);
    setSelectedMenuItem("");
    setIsOpen(false);
  };

  const selectedRoomData = mockRooms.find(r => r.id === selectedRoom);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            New Tab
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Guest Tab</DialogTitle>
          <DialogDescription>
            Open a new tab for a guest room with initial items.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="room">Select Room</Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger id="room">
                <SelectValue placeholder="Choose a room" />
              </SelectTrigger>
              <SelectContent>
                {mockRooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.id} - {room.guest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoomData && (
              <p className="text-sm text-muted-foreground">
                Guest: {selectedRoomData.guest}
              </p>
            )}
          </div>

          {/* Add Items */}
          <div className="space-y-2">
            <Label>Add Items</Label>
            <div className="flex gap-2">
              <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {mockMenuItems.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} - ${item.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddItem} size="icon" variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Items List */}
          {tabItems.length > 0 && (
            <div className="space-y-2">
              <Label>Tab Items</Label>
              <div className="border border-border rounded-lg divide-y divide-border">
                {tabItems.map(item => (
                  <div key={item.itemId} className="flex items-center justify-between p-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item.itemId, -1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item.itemId, 1)}
                      >
                        +
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveItem(item.itemId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold text-primary">
                  ${calculateTabTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {tabItems.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No items added yet. Select items from the dropdown above.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTab}
            disabled={!selectedRoom || tabItems.length === 0}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Create Tab
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
