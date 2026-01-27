import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeasonalPricingRule {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  multiplier: number;
  active: boolean;
}

interface SeasonalPricingTabProps {
  seasonalPricing: SeasonalPricingRule[];
  updateSeasonalPricingRule: (id: string, updates: Partial<SeasonalPricingRule>) => void;
  deleteSeasonalPricingRule: (id: string) => void;
}

export const SeasonalPricingTab = ({ 
  seasonalPricing, 
  updateSeasonalPricingRule, 
  deleteSeasonalPricingRule 
}: SeasonalPricingTabProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="flex items-center gap-2 font-display">
        <Calendar className="h-5 w-5 text-primary" />
        Seasonal Pricing Rules
      </CardTitle>
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Add Rule
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Set rate multipliers for specific date ranges. A multiplier of 1.5 means 50% higher rates, 0.85 means 15% discount.
      </p>

      {seasonalPricing.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No pricing rules configured yet. Click "Add Rule" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {seasonalPricing.map((rule) => (
            <div 
              key={rule.id} 
              className={cn(
                "p-4 rounded-lg border transition-colors",
                rule.active ? "bg-muted/30 border-border" : "bg-muted/10 border-border/50 opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-foreground">{rule.name}</h4>
                    <Badge variant={rule.active ? "default" : "secondary"}>
                      {rule.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        rule.multiplier >= 1 
                          ? "text-emerald-600 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400" 
                          : "text-amber-600 border-amber-600 dark:text-amber-400 dark:border-amber-400"
                      )}
                    >
                      {rule.multiplier >= 1 ? "+" : ""}{((rule.multiplier - 1) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{rule.start_date} → {rule.end_date}</span>
                    <span>Multiplier: {rule.multiplier}x</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={rule.active}
                    onCheckedChange={(checked) => updateSeasonalPricingRule(rule.id, { active: checked })}
                  />
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteSeasonalPricingRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
