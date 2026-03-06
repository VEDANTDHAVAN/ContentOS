import { Card, CardContent } from "../ui/Card";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface Props {
    score: number;
}

const EngagementCard = ({ score }: Props) => {
    const percentage = (score / 10) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="border-none shadow-lg shadow-indigo-500/5 overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={16} className="text-emerald-500" />
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Engagement Potential
                                </p>
                            </div>
                            <p className="text-5xl font-black text-foreground tracking-tighter">
                                {score}<span className="text-2xl text-muted-foreground/50">/10</span>
                            </p>
                        </div>

                        <div className="relative size-20">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                <circle
                                    cx="18" cy="18" r="16"
                                    fill="none"
                                    className="stroke-secondary"
                                    strokeWidth="3"
                                />
                                <motion.circle
                                    cx="18" cy="18" r="16"
                                    fill="none"
                                    className="stroke-indigo-500"
                                    strokeWidth="3"
                                    strokeDasharray="100"
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: 100 - percentage }}
                                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-xs font-bold text-indigo-600">{percentage}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full ${i < score ? "bg-indigo-500" : "bg-secondary"}`}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default EngagementCard;