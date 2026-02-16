import { useState } from 'react';
import { addDays } from 'date-fns';

export const useDateSelection = (initialCheckIn?: Date, initialCheckOut?: Date) => {
    const [checkIn, setCheckIn] = useState<Date | undefined>(initialCheckIn);
    const [checkOut, setCheckOut] = useState<Date | undefined>(initialCheckOut);
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkOutOpen, setCheckOutOpen] = useState(false);
    const [checkOutMonth, setCheckOutMonth] = useState<Date>(initialCheckOut || (initialCheckIn ? addDays(initialCheckIn, 1) : new Date()));

    const handleCheckInSelect = (date: Date | undefined) => {
        setCheckIn(date);

        // Logic from Landing.tsx
        if (date && (!checkOut || checkOut <= date)) {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            setCheckOut(nextDay);
            setCheckOutMonth(nextDay);
        } else if (date && checkOut) {
            setCheckOutMonth(checkOut);
        } else if (date) {
            // Fallback/Similar to first case, ensures checkOutMonth tracks next day if only date is selected
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            setCheckOutMonth(nextDay);
        }

        setCheckInOpen(false);
        // Auto-open checkout popover
        setTimeout(() => setCheckOutOpen(true), 200);
    };

    const handleCheckOutSelect = (date: Date | undefined) => {
        setCheckOut(date);
        if (date) setCheckOutMonth(date);
        setCheckOutOpen(false);
    };

    return {
        checkIn,
        setCheckIn,
        checkOut,
        setCheckOut,
        checkInOpen,
        setCheckInOpen,
        checkOutOpen,
        setCheckOutOpen,
        checkOutMonth,
        setCheckOutMonth,
        handleCheckInSelect,
        handleCheckOutSelect,
    };
};
