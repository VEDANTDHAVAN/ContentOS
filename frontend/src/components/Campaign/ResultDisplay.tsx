import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card";
import type { CampaignResult } from "../../types/campaign";
import { Linkedin, Twitter, Share2, Copy, Download } from "lucide-react";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

interface Props {
    result: CampaignResult;
    imageUrl?: string;
}

const ResultDisplay = ({ result, imageUrl }: Props) => {
    return (
        <div className="space-y-8 pb-12">

            {/* LinkedIn Preview */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="border-none shadow-xl shadow-indigo-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <Linkedin size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-lg">LinkedIn Post</CardTitle>
                                <CardDescription>Optimized for professional reach</CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon-sm"><Copy size={14} /></Button>
                            <Button variant="ghost" size="icon-sm"><Share2 size={14} /></Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                                "{result.linkedin_post}"
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Twitter Preview */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="border-none shadow-xl shadow-indigo-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-sky-50 text-sky-500">
                                <Twitter size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Twitter Thread</CardTitle>
                                <CardDescription>{result.twitter_thread.length} tweets generated</CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon-sm"><Copy size={14} /></Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {result.twitter_thread.map((tweet, i) => (
                            <div key={i} className="relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-sky-100 dark:before:bg-sky-900 last:before:hidden">
                                <div className="absolute left-0 top-1 size-6 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-bold text-white">
                                    {i + 1}
                                </div>
                                <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100/50 dark:bg-sky-950/20 dark:border-sky-900/50">
                                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                                        {tweet}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Generated Creative */}
            {imageUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="border-none shadow-xl shadow-indigo-500/5 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Generated Creative</CardTitle>
                                <CardDescription>AI-generated visual asset</CardDescription>
                            </div>
                            <Button variant="secondary" size="sm" className="gap-2">
                                <Download size={14} />
                                High Res
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="aspect-video relative group">
                                <img
                                    src={imageUrl}
                                    alt="Generated Creative"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="secondary">View Fullscreen</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default ResultDisplay;