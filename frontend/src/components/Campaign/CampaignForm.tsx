import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

interface Props {
    onGenerate: (goal: string) => void;
}

const CampaignForm = ({ onGenerate }: Props) => {
    const [goal, setGoal] = useState<string>("");

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!goal) return;
        onGenerate(goal);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="overflow-hidden border-none shadow-xl shadow-indigo-500/5">
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={16} className="text-indigo-500" />
                        <CardTitle className="text-xl">New Campaign</CardTitle>
                    </div>
                    <CardDescription>
                        Describe your goal and let AI handle the content strategy.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <Textarea
                            placeholder="e.g. Launch a new eco-friendly water bottle for fitness enthusiasts on LinkedIn and Twitter..."
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="min-h-[120px] resize-none focus-visible:ring-indigo-500/30 transition-all border-border/50"
                        />

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 group transition-all"
                        >
                            Generate Campaign
                            <Send size={18} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default CampaignForm;