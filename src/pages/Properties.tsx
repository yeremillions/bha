import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProperties, useCreateProperty, useDeleteProperty } from '@/hooks/useProperties';
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
  ArrowUpDown,
  Building2,
  Sparkles,
  Shield,
  Zap,
  Wifi,
  Tv,
  UtensilsCrossed,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AddPropertyForm, PropertyFormData } from '@/components/admin/AddPropertyForm';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Amenity icons mapping
const amenityIcons = {
  security: Shield,
  power: Zap,
  wifi: Wifi,
  entertainment: Tv,
  kitchen: UtensilsCrossed,
};

const amenityLabels = {
  security: 'Security',
  power: 'Power',
  wifi: 'WiFi',
  entertainment: 'Smart TV',
  kitchen: 'Kitchen',
};

const amenityDescriptions = {
  security: 'CCTV Surveillance, 24/7 Armed Security, Gated Premises, Well-lit Surroundings',
  power: 'Backup Generators, Solar Power, Inverters, 24hr Electricity Supply',
  wifi: 'Ultra-Fast Wi-Fi in All Rooms & Common Areas',
  entertainment: 'Smart TVs with Netflix, YouTube & Cable Channels',
  kitchen: 'Full Kitchen: Fridge, Microwave, Gas Cooker, Cooking Utensils',
};

// Status and payment styles


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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [showAddForm, setShowAddForm] = useState(false);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // Fetch properties from database
  const { data: properties = [], isLoading, error } = useProperties({
    status: statusFilter,
    search: searchQuery,
  });

  // Create and delete mutations
  const createProperty = useCreateProperty();
  const deleteProperty = useDeleteProperty();

  const handleAddProperty = async (propertyData: PropertyFormData) => {
    await createProperty.mutateAsync({
      name: propertyData.name,
      type: propertyData.type,
      description: propertyData.description,
      location: propertyData.location,
      address: propertyData.address,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      max_guests: propertyData.maxGuests,
      base_price_per_night: propertyData.pricePerNight,
      cleaning_fee: propertyData.cleaningFee,
      amenities: propertyData.amenities,
      images: propertyData.images,
      status: 'available',
      featured: propertyData.featured,
    });
    setShowAddForm(false);
  };

  const handleDeleteProperty = (id: string) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    await deleteProperty.mutateAsync(propertyToDelete);
    setPropertyToDelete(null);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Client-side sorting (search and status filtering handled by database)
  const filteredProperties = useMemo(() => {
    const sorted = [...properties].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'price-desc':
          return b.base_price_per_night - a.base_price_per_night;
        case 'capacity-desc':
          return b.max_guests - a.max_guests;
        default:
          return 0;
      }
    });
    return sorted;
  }, [properties, sortBy]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-destructive">Error loading properties. Please try again.</div>
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
              <h1 className="text-3xl font-display font-bold text-foreground">Properties</h1>
              <p className="text-muted-foreground mt-1">
                Manage your {properties.length} properties
              </p>
            </div>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </div>

          {/* Add Property Form */}
          {showAddForm && (
            <AddPropertyForm 
              onClose={() => setShowAddForm(false)} 
              onSubmit={handleAddProperty}
            />
          )}

          {/* Stats Cards - Glassmorphism */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { 
                label: 'Total Properties', 
                value: properties.length, 
                color: 'text-foreground',
                gradient: 'from-accent/20 to-accent/5',
                delay: 0,
                filterValue: 'all'
              },
              { 
                label: 'Available', 
                value: properties.filter(p => p.status === 'available').length, 
                color: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'from-emerald-500/20 to-emerald-500/5',
                delay: 1,
                filterValue: 'available'
              },
              { 
                label: 'Occupied', 
                value: properties.filter(p => p.status === 'occupied').length, 
                color: 'text-sky-600 dark:text-sky-400',
                gradient: 'from-sky-500/20 to-sky-500/5',
                delay: 2,
                filterValue: 'occupied'
              },
              {
                label: 'Maintenance',
                value: properties.filter(p => p.status === 'maintenance').length,
                color: 'text-amber-600 dark:text-amber-400',
                gradient: 'from-amber-500/20 to-amber-500/5',
                showTrend: false,
                delay: 3,
                filterValue: 'maintenance'
              },
            ].map((stat) => (
              <button
                key={stat.label}
                onClick={() => stat.filterValue && setStatusFilter(stat.filterValue)}
                disabled={!stat.filterValue}
                className={cn(
                  "group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 text-left",
                  stat.gradient,
                  stat.filterValue 
                    ? "cursor-pointer hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5" 
                    : "cursor-default",
                  statusFilter === stat.filterValue 
                    ? "border-accent ring-2 ring-accent/20" 
                    : "border-border/50"
                )}
                style={{ animationDelay: `${stat.delay * 100}ms` }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
                
                <div className="relative">
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={cn("text-2xl font-display font-bold", stat.color)}>
                      {stat.value}
                    </p>
                    {stat.showTrend && (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">+2.5%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Decorative sparkle */}
                <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Filters & Search - Enhanced Glass Bar */}
          <div className="relative rounded-2xl border border-border/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm p-4 mb-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-background/50 border-border/50 hover:bg-background transition-colors">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 bg-background/50 border-border/50 hover:bg-background transition-colors">
                    <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="capacity-desc">Capacity (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex rounded-lg border border-border/50 bg-background/50 p-1">
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
            
            {/* Active filters indicator */}
            {(searchQuery || statusFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
                    Search: "{searchQuery}"
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs capitalize">
                    {statusFilter}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Properties Grid/List */}
          {viewMode === 'grid' && filteredProperties.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProperties.map((property, index) => (
                <div
                  key={property.id}
                  className="group rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-2 hover:border-accent/30 animate-fade-in"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop'}
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
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Price */}
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white font-display font-bold text-lg">
                        ₦{property.base_price_per_night.toLocaleString()}
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
                    
                    {/* Room Details */}
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
                        <span>{property.max_guests}</span>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {property.review_count} reviews
                      </div>
                    </div>
                    
                    {/* Amenities */}
                    <TooltipProvider delayDuration={200}>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {property.amenities.slice(0, 4).map((amenity) => {
                          const Icon = amenityIcons[amenity as keyof typeof amenityIcons];
                          const label = amenityLabels[amenity as keyof typeof amenityLabels];
                          const description = amenityDescriptions[amenity as keyof typeof amenityDescriptions];
                          return (
                            <Tooltip key={amenity}>
                              <TooltipTrigger asChild>
                                <div 
                                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs cursor-help transition-colors hover:bg-accent/20"
                                >
                                  <Icon className="h-3 w-3" />
                                  <span className="hidden sm:inline">{label}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-center">
                                <p className="font-medium">{description}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                        {property.amenities.length > 4 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground cursor-help hover:text-accent transition-colors">
                                +{property.amenities.length - 4} more
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{property.amenities.slice(4).map(a => amenityLabels[a as keyof typeof amenityLabels]).join(', ')}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'list' && filteredProperties.length > 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden animate-fade-in">
              <div className="divide-y divide-border/50">
                {filteredProperties.map((property, index) => (
                  <div
                    key={property.id}
                    className="group flex items-center gap-4 p-4 hover:bg-accent/5 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image */}
                    <div className="relative h-20 w-28 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop'}
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
                          <span>{property.max_guests} guests</span>
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
                        <p className="text-[10px] text-muted-foreground">{property.review_count} reviews</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display font-bold text-sm">₦{property.base_price_per_night.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">per night</p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Empty state - Enhanced */}
          {filteredProperties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative mb-6">
                {/* Decorative circles */}
                <div className="absolute inset-0 rounded-full bg-accent/5 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-accent/60" />
                </div>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No properties found
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                We couldn't find any properties matching your current filters. Try adjusting your search or filter criteria.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteProperty}
        title="Delete Property?"
        description="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default Properties;
