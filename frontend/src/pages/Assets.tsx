import React, { useEffect, useState } from "react";
import { getCampaigns } from "../services/api";
import MainLayout from "../layouts/MainLayout";
import { Card, CardContent } from "../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, Image as ImageIcon, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import type { Campaign } from "../types/campaign";
import { formatDate } from "../lib/utils";

const AssetsPage: React.FC = () => {
    const [assets, setAssets] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await getCampaigns();
                // If response is nested or an array directly
                const campaigns: Campaign[] = Array.isArray(response) ? response : response.campaigns || [];

                // Filter only campaigns that have an image
                const images = campaigns.filter((c) => c.imageUrl).sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
                setAssets(images);
            } catch (error) {
                console.error("Failed to fetch assets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    const filteredAssets = assets.filter(asset =>
        asset.campaignGoal?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Creative Assets</h1>
                        <p className="text-muted-foreground mt-2">
                            A gallery of all AI-generated visuals for your campaigns.
                        </p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-square rounded-3xl bg-secondary/50 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredAssets.map((asset, i) => (
                                <motion.div
                                    key={asset.campaignId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                >
                                    <Card className="group border-none shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
                                        <CardContent className="p-0">
                                            <div className="aspect-square relative overflow-hidden">
                                                <img
                                                    src={asset.imageUrl}
                                                    alt={asset.campaignGoal}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 px-6 text-center">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="rounded-full"
                                                            onClick={() => {
                                                                const link = document.createElement("a");
                                                                link.href = asset.imageUrl!;
                                                                link.download = `campaign-${asset.campaignId}.png`;
                                                                link.click();
                                                            }}
                                                        >
                                                            <Download size={18} />
                                                        </Button>
                                                        <Button size="icon" variant="secondary" className="rounded-full" onClick={() => window.open(asset.imageUrl, '_blank')}>
                                                            <ExternalLink size={18} />
                                                        </Button>
                                                    </div>
                                                    <p className="text-white text-xs font-bold uppercase tracking-widest line-clamp-2">
                                                        {asset.campaignGoal}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                                    <ImageIcon size={12} />
                                                    <span>AI Creative</span>
                                                    <span className="mx-1">•</span>
                                                    <span>{formatDate(asset.createdAt)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredAssets.length === 0 && (
                            <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-3xl">
                                <div className="size-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon size={32} className="text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold">No assets found</h3>
                                <p className="text-muted-foreground mt-1 mb-4">
                                    Try a different search or generate a new campaign.
                                </p>

                                <Button onClick={() => window.location.href = "/"}>
                                    Generate Campaign
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </MainLayout>
    );
};

export default AssetsPage;
