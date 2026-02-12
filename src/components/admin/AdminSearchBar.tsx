import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Calendar, User, MapPin, Hash, Mail, Phone, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useProperties } from '@/hooks/useProperties';
import { useBookingsPaginated } from '@/hooks/useBookings';
import { useCustomers } from '@/hooks/useCustomers';

interface SearchResult {
  id: string;
  type: 'property' | 'booking' | 'customer';
  title: string;
  subtitle: string;
  meta?: string;
  icon: typeof Building2;
  url: string;
}

export const AdminSearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch data with search query using pagination
  // Using small page sizes since we only show top 5 results per category
  const { data: propertiesData, isLoading: propertiesLoading } = useProperties({ search: query });
  const { data: bookingsData, isLoading: bookingsLoading } = useBookingsPaginated(
    { search: query },
    { page: 1, pageSize: 20 } // Small page size for search
  );
  const { data: customersData, isLoading: customersLoading } = useCustomers({ search: query });
  
  const properties = propertiesData || [];
  const bookings = bookingsData?.data || [];
  const customers = customersData || [];

  const isLoading = propertiesLoading || bookingsLoading || customersLoading;

  // Build search results
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!query || query.length < 2) return [];

    const results: SearchResult[] = [];

    // Add properties
    properties.slice(0, 5).forEach((property) => {
      results.push({
        id: property.id,
        type: 'property',
        title: property.name,
        subtitle: property.location,
        meta: property.address || undefined,
        icon: Building2,
        url: `/dashboard/properties`,
      });
    });

    // Add bookings
    bookings.slice(0, 5).forEach((booking) => {
      const propertyName = booking.property?.name || 'Unknown Property';
      const customerName = booking.customer?.full_name || 'Unknown Guest';
      const checkIn = new Date(booking.check_in_date).toLocaleDateString();
      const checkOut = new Date(booking.check_out_date).toLocaleDateString();

      results.push({
        id: booking.id,
        type: 'booking',
        title: `${booking.booking_number}`,
        subtitle: `${propertyName} • ${customerName}`,
        meta: `${checkIn} - ${checkOut}`,
        icon: Calendar,
        url: `/dashboard/bookings`,
      });
    });

    // Add customers
    customers.slice(0, 5).forEach((customer) => {
      results.push({
        id: customer.id,
        type: 'customer',
        title: customer.full_name,
        subtitle: customer.email,
        meta: customer.phone || undefined,
        icon: User,
        url: `/dashboard/customers`,
      });
    });

    return results;
  }, [query, properties, bookings, customers]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % searchResults.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  // Handle query change
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(0);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(0);
  };

  // Get result type badge
  const getTypeBadge = (type: SearchResult['type']) => {
    switch (type) {
      case 'property':
        return <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">Property</span>;
      case 'booking':
        return <span className="text-[10px] text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full font-semibold">Booking</span>;
      case 'customer':
        return <span className="text-[10px] text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full font-semibold">Customer</span>;
    }
  };

  // Get result icon color
  const getIconColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'property':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'booking':
        return 'text-sky-600 dark:text-sky-400';
      case 'customer':
        return 'text-violet-600 dark:text-violet-400';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search properties, bookings, customers..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full pl-10 pr-20 bg-muted/50 border-transparent focus:border-accent/50 focus:bg-background transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {/* Search results dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Searching...
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full px-4 py-3 flex items-start gap-3 transition-colors text-left',
                      selectedIndex === index
                        ? 'bg-accent/10'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      result.type === 'property' && 'bg-emerald-500/10',
                      result.type === 'booking' && 'bg-sky-500/10',
                      result.type === 'customer' && 'bg-violet-500/10'
                    )}>
                      <Icon className={cn('h-4 w-4', getIconColor(result.type))} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeBadge(result.type)}
                        <h4 className="text-sm font-medium truncate">{result.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      {result.meta && (
                        <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{result.meta}</p>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-border mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <span>Esc to close</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
