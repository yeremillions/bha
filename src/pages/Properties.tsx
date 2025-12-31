import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MoreHorizontal,
  Bed,
  Bath,
  Users,
  MapPin,
  Star,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock property data
const properties = [
  {
    id: '1',
    name: 'Luxury 3-Bedroom Penthouse',
    type: 'Penthouse',
    location: 'Victoria Island, Lagos',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 75000,
    rating: 4.9,
    reviews: 24,
    status: 'available',
    occupancy: 85,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Executive Studio Suite',
    type: 'Studio',
    location: 'Lekki Phase 1, Lagos',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 35000,
    rating: 4.7,
    reviews: 18,
    status: 'occupied',
    occupancy: 92,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Cozy 2-Bedroom Apartment',
    type: 'Apartment',
    location: 'Ikoyi, Lagos',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 55000,
    rating: 4.8,
    reviews: 31,
    status: 'available',
    occupancy: 78,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Family Home with Garden',
    type: 'House',
    location: 'Ikeja GRA, Lagos',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 95000,
    rating: 4.6,
    reviews: 12,
    status: 'maintenance',
    occupancy: 65,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'Modern Loft Space',
    type: 'Loft',
    location: 'Victoria Island, Lagos',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 45000,
    rating: 4.9,
    reviews: 27,
    status: 'available',
    occupancy: 88,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Beachfront Villa',
    type: 'Villa',
    location: 'Lekki, Lagos',
    bedrooms: 5,
    bathrooms: 4,
    maxGuests: 10,
    pricePerNight: 150000,
    rating: 5.0,
    reviews: 8,
    status: 'available',
    occupancy: 72,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
  },
];

const statusStyles = {
  available: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  occupied: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  maintenance: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
};

const statusLabels = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
};

const Properties = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              <h1 className="text-3xl font-display font-bold text-foreground">Properties</h1>
              <p className="text-muted-foreground mt-1">
                Manage your {properties.length} properties
              </p>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs text-muted-foreground font-medium">Total Properties</p>
              <p className="text-2xl font-display font-bold text-foreground mt-1">{properties.length}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs text-muted-foreground font-medium">Available</p>
              <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {properties.filter(p => p.status === 'available').length}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs text-muted-foreground font-medium">Occupied</p>
              <p className="text-2xl font-display font-bold text-sky-600 dark:text-sky-400 mt-1">
                {properties.filter(p => p.status === 'occupied').length}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs text-muted-foreground font-medium">Avg. Occupancy</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-display font-bold text-foreground">
                  {Math.round(properties.reduce((acc, p) => acc + p.occupancy, 0) / properties.length)}%
                </p>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                className="pl-10 bg-card border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-card border-border/50">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border border-border/50 bg-card p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Properties Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="group rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Status badge */}
                    <Badge 
                      variant="outline"
                      className={cn(
                        'absolute top-3 left-3',
                        statusStyles[property.status as keyof typeof statusStyles]
                      )}
                    >
                      {statusLabels[property.status as keyof typeof statusLabels]}
                    </Badge>
                    
                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 h-8 w-8 bg-black/30 hover:bg-black/50 text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* Price */}
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white font-display font-bold text-lg">
                        ₦{property.pricePerNight.toLocaleString()}
                        <span className="text-sm font-normal opacity-80">/night</span>
                      </p>
                    </div>
                    
                    {/* Rating */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/30 rounded-full px-2 py-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-white text-xs font-medium">{property.rating}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{property.location}</span>
                    </div>
                    
                    {/* Amenities */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{property.maxGuests}</span>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {property.reviews} reviews
                      </div>
                    </div>
                    
                    {/* Occupancy bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-medium text-foreground">{property.occupancy}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-accent to-gold-light transition-all"
                          style={{ width: `${property.occupancy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="divide-y divide-border/50">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Image */}
                    <div className="relative h-20 w-28 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={property.image}
                        alt={property.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-foreground truncate">
                          {property.name}
                        </h3>
                        <Badge 
                          variant="outline"
                          className={cn(
                            'shrink-0 text-[10px]',
                            statusStyles[property.status as keyof typeof statusStyles]
                          )}
                        >
                          {statusLabels[property.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span>{property.location}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Bed className="h-3 w-3" />
                          <span>{property.bedrooms} bed</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Bath className="h-3 w-3" />
                          <span>{property.bathrooms} bath</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{property.maxGuests} guests</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-sm">{property.rating}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{property.reviews} reviews</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display font-bold text-sm">₦{property.pricePerNight.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">per night</p>
                      </div>
                      <div className="w-20">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Occ.</span>
                          <span className="font-medium">{property.occupancy}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-accent to-gold-light"
                            style={{ width: `${property.occupancy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No properties found matching your criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Properties;
