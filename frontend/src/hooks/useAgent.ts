import { useState } from "react";
import { generateCampaign } from "@/services/api";
import { useAuth } from "@clerk/react";
import type { Campaign } from "@/types/campaign";

export interface AgentMessage {
    role: "user" | "assistant";
    content?: string;
    campaign?: Campaign;
}

export const useAgent = () => {
    const { userId } = useAuth();
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async (prompt: string) => {

        setMessages((prev) => [
            ...prev,
            { role: "user", content: prompt }
        ]);

        setLoading(true);

        try {
            const response = await generateCampaign(prompt, userId!);

            const campaign = {
                campaignId: response.campaignId,
                campaignGoal: response.campaignGoal,
                generatedContent: response.campaign,
                imageUrl: response.imageUrl,
                createdAt: response.createdAt
            };

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    campaign
                }
            ]);

        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    };

    return { messages, sendMessage, loading };
};