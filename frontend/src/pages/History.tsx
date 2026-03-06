import React from "react";
import CampaignHistory from "../components/Campaign/CampaignHistory";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";

const HistoryPage: React.FC = () => {
    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Campaign History</h1>
                    <p className="text-muted-foreground mt-2">
                        Review and manage your previously generated AI campaigns.
                    </p>
                </div>

                <CampaignHistory />
            </motion.div>
        </MainLayout>
    );
};

export default HistoryPage;
