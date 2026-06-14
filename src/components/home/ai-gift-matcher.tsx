
"use client"

import { useState } from "react";
import { Sparkles, Loader2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { aiGiftMatcherSuggestions, type AiGiftMatcherOutput } from "@/ai/flows/ai-gift-matcher-suggestions";

export function AiGiftMatcher() {
  const [game, setGame] = useState("");
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiGiftMatcherOutput | null>(null);

  const handleMatch = async () => {
    if (!game || !budget) return;
    setLoading(true);
    try {
      const suggestions = await aiGiftMatcherSuggestions({
        game,
        budget: Number(budget),
        goal: goal || "Best value"
      });
      setResult(suggestions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 py-6">
      <Card className="bg-gradient-to-br from-primary/20 via-background to-accent/10 border-white/10 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-headline font-bold">AI GIFT MATCHER</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Smart suggestions</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-muted-foreground">SELECT GAME</Label>
              <Input 
                placeholder="e.g. MLBB India" 
                className="bg-black/20 border-white/5 h-9 text-xs"
                value={game}
                onChange={(e) => setGame(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-muted-foreground">BUDGET (₹)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 500" 
                  className="bg-black/20 border-white/5 h-9 text-xs"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-muted-foreground">GOAL</Label>
                <Input 
                  placeholder="e.g. Buy skin" 
                  className="bg-black/20 border-white/5 h-9 text-xs"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full h-9 bg-primary hover:bg-primary/90 text-xs font-bold gap-2"
              onClick={handleMatch}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              GET RECOMMENDATIONS
            </Button>
          </div>

          {result && (
            <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1 uppercase">
                <Sparkles className="h-3 w-3" /> Recommended for you
              </h4>
              {result.suggestions.map((item, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-foreground">{item.package_name}</span>
                    <span className="text-xs font-black text-primary">{item.price}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2 leading-relaxed">{item.reason}</p>
                  {item.best_for_goal && (
                    <span className="bg-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Best for goal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
