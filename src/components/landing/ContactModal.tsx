
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
import { supabase } from "@/integrations/supabase/client";

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

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const data = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                message: formData.get('message') as string,
            };

            const { error } = await supabase.functions.invoke('send-contact-email', {
                body: data,
            });

            if (error) throw error;

            toast({
                title: "Message Sent",
                description: "Our concierge team will contact you shortly.",
                className: "bg-[#020408] text-white border-white/10",
            });
            setOpen(false);
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Failed to send",
                description: "Please try again later or contact us directly.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
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
                        <Input id="name" name="name" required className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37]/50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white/80">Email</Label>
                        <Input id="email" name="email" type="email" required className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37]/50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-white/80">Phone</Label>
                        <Input id="phone" name="phone" type="tel" className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37]/50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message" className="text-white/80">Message</Label>
                        <Textarea id="message" name="message" required className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37]/50 min-h-[100px]" />
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
