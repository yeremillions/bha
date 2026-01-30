import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const NewsletterSection = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFirstName, setNewsletterFirstName] = useState('');
  const [newsletterLastName, setNewsletterLastName] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!newsletterFirstName.trim()) {
      toast.error('Please enter your first name');
      return;
    }
    if (!newsletterLastName.trim()) {
      toast.error('Please enter your last name');
      return;
    }

    setIsSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { 
          email: newsletterEmail,
          firstName: newsletterFirstName.trim(),
          lastName: newsletterLastName.trim()
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || 'Successfully subscribed to our newsletter!');
        setNewsletterEmail('');
        setNewsletterFirstName('');
        setNewsletterLastName('');
      } else {
        throw new Error(data?.error || 'Failed to subscribe');
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast.error(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-24 bg-secondary/50">
      <div className="container mx-auto px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="font-body text-muted-foreground mb-8">
            Get exclusive deals, new property listings, and travel tips delivered to your inbox.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input 
                type="text" 
                placeholder="First name"
                className="bg-background"
                value={newsletterFirstName}
                onChange={(e) => setNewsletterFirstName(e.target.value)}
                disabled={isSubscribing}
              />
              <Input 
                type="text" 
                placeholder="Last name"
                className="bg-background"
                value={newsletterLastName}
                onChange={(e) => setNewsletterLastName(e.target.value)}
                disabled={isSubscribing}
              />
            </div>
            <div className="flex gap-3">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 bg-background"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubscribe()}
                disabled={isSubscribing}
              />
              <Button 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleNewsletterSubscribe}
                disabled={isSubscribing}
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
