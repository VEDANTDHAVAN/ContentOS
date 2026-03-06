import { useEffect, useState } from "react";
import { getCampaigns } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { Campaign } from "../../types/campaign";
import { formatDate } from "../../lib/utils";

const CampaignHistory = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await getCampaigns();
                const data: Campaign[] = Array.isArray(response) ? response : response.campaigns || [];
                setCampaigns(data);
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            }
        };

        fetchCampaigns();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold tracking-tight">Previous Campaigns</h2>
                <div className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                    {campaigns.length}
                </div>
            </div>

            <div className="space-y-4">
                {campaigns.map((c, i) => (
                    <motion.div
                        key={c.campaignId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader className="p-4 pb-0">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-medium uppercase tracking-wider">{formatDate(c.createdAt)}</span>
                                </div>
                                <CardTitle className="text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                    {c.campaignGoal}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Score: {c.generatedContent.engagement_score}/10
                                        </p>
                                    </div>
                                    {c.imageUrl && (
                                        <div className="size-8 rounded-md overflow-hidden border border-border/50">
                                            <img
                                                src={c.imageUrl}
                                                className="size-full object-cover"
                                                alt="Preview"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {campaigns.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl">
                        <p className="text-muted-foreground text-sm">No campaigns yet. Start by generating one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignHistory;