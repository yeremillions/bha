
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface ContactModalProps {
    children: React.ReactNode;
}

export function ContactModal({ children }: ContactModalProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setLoading(false);
        setOpen(false);
        toast({
            title: "Message Sent",
            description: "Our concierge team will contact you shortly.",
            className: "bg-[#020408] text-white border-white/10",
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#020408] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-[#D4AF37]">Concierge Service</DialogTitle>
                    <DialogDescription className="font-body text-white/60">
                        Send us a message and we'll get back to you immediately.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-white/80">Name</Label>
                        <Input id="name" required className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37]/50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white/80">Email</Label>
                        <Input id="email" type="email" required className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37]/50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-white/80">Phone</Label>
                        <Input id="phone" type="tel" className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37]/50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message" className="text-white/80">Message</Label>
                        <Textarea id="message" required className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37]/50 min-h-[100px]" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading} className="bg-[#D4AF37] text-black hover:bg-[#B5952F] font-medium">
                            {loading ? "Sending..." : "Send Message"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
