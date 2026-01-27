import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye } from "lucide-react";
import { type EmailTemplates } from "@/hooks/useSettings";

interface EmailTemplatesTabProps {
  selectedTemplate: keyof EmailTemplates;
  setSelectedTemplate: (template: keyof EmailTemplates) => void;
  emailTemplates: EmailTemplates;
  setEmailTemplates: React.Dispatch<React.SetStateAction<EmailTemplates>>;
}

const TEMPLATE_OPTIONS = [
  { value: "booking-confirmation", label: "Booking Confirmation" },
  { value: "cancellation", label: "Cancellation Notice" },
  { value: "check-in-reminder", label: "Check-in Reminder" },
  { value: "receipt", label: "Payment Receipt" },
];

const AVAILABLE_VARIABLES = [
  "{{guest_name}}", "{{property_name}}", "{{check_in_date}}", "{{check_out_date}}",
  "{{check_in_time}}", "{{check_out_time}}", "{{total_amount}}", "{{booking_id}}",
  "{{refund_amount}}", "{{property_address}}", "{{amount_paid}}", "{{payment_method}}", "{{payment_date}}"
];

export const EmailTemplatesTab = ({ 
  selectedTemplate, 
  setSelectedTemplate, 
  emailTemplates, 
  setEmailTemplates 
}: EmailTemplatesTabProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-display">
        <Mail className="h-5 w-5 text-primary" />
        Email Templates
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label>Select Template</Label>
        <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as keyof EmailTemplates)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailSubject">Email Subject</Label>
        <Input 
          id="emailSubject" 
          value={emailTemplates[selectedTemplate].subject}
          onChange={(e) => setEmailTemplates(prev => ({
            ...prev,
            [selectedTemplate]: { ...prev[selectedTemplate], subject: e.target.value }
          }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailBody">Email Body</Label>
        <Textarea 
          id="emailBody" 
          value={emailTemplates[selectedTemplate].body}
          onChange={(e) => setEmailTemplates(prev => ({
            ...prev,
            [selectedTemplate]: { ...prev[selectedTemplate], body: e.target.value }
          }))}
          rows={12}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Available Variables</Label>
        <p className="text-sm text-muted-foreground mb-2">Click to copy. Use these in your templates.</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_VARIABLES.map((variable) => (
            <Badge 
              key={variable} 
              variant="secondary" 
              className="cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => navigator.clipboard.writeText(variable)}
            >
              {variable}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview Email
        </Button>
      </div>
    </CardContent>
  </Card>
);
