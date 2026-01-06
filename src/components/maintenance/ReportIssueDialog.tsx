import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const reportIssueSchema = z.object({
  property: z.string().min(1, 'Please select a property'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select a priority'),
  issue: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
});

type ReportIssueFormData = z.infer<typeof reportIssueSchema>;

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const properties = [
  'Luxury 3-Bedroom Penthouse',
  'Cozy 2-Bedroom Apartment',
  'Executive Studio',
  'Family 4-Bedroom Home',
  'Luxury Penthouse',
];

const categories = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'Security',
  'IT/Electrical',
  'Facilities',
  'General Repairs',
];

const priorities = [
  { value: 'urgent', label: 'Urgent - Immediate attention required' },
  { value: 'high', label: 'High - Within 24 hours' },
  { value: 'normal', label: 'Normal - Within 3 days' },
  { value: 'low', label: 'Low - When convenient' },
];

export function ReportIssueDialog({ open, onOpenChange }: ReportIssueDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportIssueFormData>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: {
      property: '',
      category: '',
      priority: '',
      issue: '',
      location: '',
    },
  });

  const onSubmit = async (data: ReportIssueFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Issue Reported',
      description: `Maintenance ticket created for ${data.property}`,
    });
    
    form.reset();
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">Report Maintenance Issue</DialogTitle>
          <DialogDescription>
            Create a new maintenance ticket. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="property"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border z-50">
                      {properties.map((property) => (
                        <SelectItem key={property} value={property}>
                          {property}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border z-50">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border z-50">
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Master bedroom, Kitchen, Lobby"
                      className="bg-background/50 border-border/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the maintenance issue in detail..."
                      className="bg-background/50 border-border/50 min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Report Issue'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
