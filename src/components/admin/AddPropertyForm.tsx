import { useState } from 'react';
import { X, Upload, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/hooks/use-toast';

interface AddPropertyFormProps {
  onClose: () => void;
  onSubmit: (property: PropertyFormData) => void;
}

export interface PropertyFormData {
  name: string;
  type: string;
  location: string;
  address?: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  cleaningFee?: number;
  amenities?: string[];
  images?: string[];
  status: string;
  featured?: boolean;
}

const propertyTypes = ['Apartment', 'Penthouse', 'Studio', 'House', 'Villa', 'Loft'];

export const AddPropertyForm = ({ onClose, onSubmit }: AddPropertyFormProps) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    type: '',
    location: '',
    description: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 0,
    status: 'available',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.location || !formData.pricePerNight) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
    toast({
      title: "Property added",
      description: `${formData.name} has been added successfully.`,
    });
    onClose();
  };

  const handleChange = (field: keyof PropertyFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden mb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Home className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Add New Property</h2>
            <p className="text-sm text-muted-foreground">Enter the details for your new property</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Property Name */}
          <div className="md:col-span-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Property Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Luxury 3-Bedroom Penthouse"
              className="mt-1.5 bg-background border-border/50"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          {/* Property Type */}
          <div>
            <Label htmlFor="type" className="text-sm font-medium">
              Property Type <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger className="mt-1.5 bg-background border-border/50">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium">
              Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g., Victoria Island, Lagos"
              className="mt-1.5 bg-background border-border/50"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>

          {/* Bedrooms */}
          <div>
            <Label htmlFor="bedrooms" className="text-sm font-medium">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              min={1}
              className="mt-1.5 bg-background border-border/50"
              value={formData.bedrooms}
              onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Bathrooms */}
          <div>
            <Label htmlFor="bathrooms" className="text-sm font-medium">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              min={1}
              className="mt-1.5 bg-background border-border/50"
              value={formData.bathrooms}
              onChange={(e) => handleChange('bathrooms', parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Max Guests */}
          <div>
            <Label htmlFor="maxGuests" className="text-sm font-medium">Max Guests</Label>
            <Input
              id="maxGuests"
              type="number"
              min={1}
              className="mt-1.5 bg-background border-border/50"
              value={formData.maxGuests}
              onChange={(e) => handleChange('maxGuests', parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Price Per Night */}
          <div>
            <Label htmlFor="pricePerNight" className="text-sm font-medium">
              Price Per Night (₦) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pricePerNight"
              type="number"
              min={0}
              placeholder="e.g., 75000"
              className="mt-1.5 bg-background border-border/50"
              value={formData.pricePerNight || ''}
              onChange={(e) => handleChange('pricePerNight', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger className="mt-1.5 bg-background border-border/50">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the property features, amenities, and unique selling points..."
              className="mt-1.5 bg-background border-border/50 min-h-[100px]"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Image Upload Placeholder */}
          <div className="md:col-span-2">
            <Label className="text-sm font-medium">Property Images</Label>
            <div className="mt-1.5 border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB each
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border/50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Add Property
          </Button>
        </div>
      </form>
    </div>
  );
};
