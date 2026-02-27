import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDateSelection } from '@/hooks/useDateSelection';
import { cn } from '@/lib/utils';

interface AvailabilitySearchProps {
    className?: string;
    onSearch?: (checkIn: Date, checkOut: Date) => void;
    initialCheckIn?: Date;
    initialCheckOut?: Date;
    compact?: boolean; // For Property Page header
}

export const AvailabilitySearch = ({
    className,
    onSearch,
    initialCheckIn,
    initialCheckOut,
    compact = false
}: AvailabilitySearchProps) => {
    const navigate = useNavigate();
    const {
        checkIn,
        checkOut,
        checkInOpen,
        setCheckInOpen,
        checkOutOpen,
        setCheckOutOpen,
        checkOutMonth,
        setCheckOutMonth,
        handleCheckInSelect,
        handleCheckOutSelect,
    } = useDateSelection(initialCheckIn, initialCheckOut);

    // Get today at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleCheckAvailability = () => {
        if (checkIn && checkOut) {
            if (onSearch) {
                onSearch(checkIn, checkOut);
            } else {
                const params = new URLSearchParams();
                params.set('checkIn', format(checkIn, 'yyyy-MM-dd'));
                params.set('checkOut', format(checkOut, 'yyyy-MM-dd'));
                navigate(`/properties?${params.toString()}`);
            }
        }
    };

    return (
        <div className={cn(
            "w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full",
            compact ? "max-w-3xl border-border/20 bg-background/80" : "max-w-4xl p-2",
            className
        )}>
            <div className={cn("grid grid-cols-3 gap-0 items-center", compact ? "h-12" : "h-16")}>

                {/* Check In */}
                <div className={cn(
                    "relative border-r h-full flex items-center px-6 transition-colors cursor-pointer rounded-l-full group",
                    compact ? "border-border/10 hover:bg-muted/50" : "border-white/10 hover:bg-white/5"
                )}>
                    <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                        <PopoverTrigger asChild>
                            <div className="w-full text-left">
                                <label className={cn(
                                    "block text-xs uppercase tracking-wider mb-1 font-medium transition-colors",
                                    compact ? "text-muted-foreground group-hover:text-primary" : "text-white/60 group-hover:text-[#D4AF37]"
                                )}>
                                    Check In
                                </label>
                                <div className={cn(
                                    "flex items-center gap-3 font-display text-lg",
                                    compact ? "text-foreground" : "text-white"
                                )}>
                                    <CalendarIcon className={cn("h-5 w-5", compact ? "text-primary" : "text-[#D4AF37]")} />
                                    <span className={!checkIn ? (compact ? "text-muted-foreground" : "text-white/50") : ""}>
                                        {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Add Dates'}
                                    </span>
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                            <Calendar
                                mode="single"
                                selected={checkIn}
                                onSelect={handleCheckInSelect}
                                disabled={(date) => date < today}
                                initialFocus
                                className="rounded-md border border-border"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Check Out */}
                <div className={cn(
                    "relative border-r h-full flex items-center px-6 transition-colors cursor-pointer group",
                    compact ? "border-border/10 hover:bg-muted/50" : "border-white/10 hover:bg-white/5"
                )}>
                    <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                        <PopoverTrigger asChild>
                            <div className="w-full text-left">
                                <label className={cn(
                                    "block text-xs uppercase tracking-wider mb-1 font-medium transition-colors",
                                    compact ? "text-muted-foreground group-hover:text-primary" : "text-white/60 group-hover:text-[#D4AF37]"
                                )}>
                                    Check Out
                                </label>
                                <div className={cn(
                                    "flex items-center gap-3 font-display text-lg",
                                    compact ? "text-foreground" : "text-white"
                                )}>
                                    <CalendarIcon className={cn("h-5 w-5", compact ? "text-primary" : "text-[#D4AF37]")} />
                                    <span className={!checkOut ? (compact ? "text-muted-foreground" : "text-white/50") : ""}>
                                        {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Add Dates'}
                                    </span>
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                            <Calendar
                                mode="single"
                                selected={checkOut}
                                onSelect={handleCheckOutSelect}
                                disabled={(date) => date <= (checkIn || today)}
                                month={checkOutMonth}
                                onMonthChange={setCheckOutMonth}
                                initialFocus
                                className="rounded-md border border-border"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Search Button */}
                <div className={cn("flex items-center", compact ? "pl-2 pr-1" : "pl-2 pr-1 h-full")}>
                    <Button
                        className={cn(
                            "w-full rounded-full font-body uppercase tracking-widest text-sm font-bold shadow-lg transition-all transform hover:scale-[1.02]",
                            compact ? "h-10 bg-primary text-primary-foreground hover:bg-primary/90" : "h-12 bg-[#D4AF37] text-black hover:bg-[#c5a028] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]",
                            checkIn && checkOut && "animate-pulsate-bha border-2 border-white/20"
                        )}
                        onClick={handleCheckAvailability}
                        disabled={!checkIn || !checkOut}
                    >
                        <span className="mr-2">{compact ? 'Search' : 'Check Availability'}</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
