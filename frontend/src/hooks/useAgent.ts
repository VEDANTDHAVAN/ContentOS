import { useState } from "react";
import { generateCampaign } from "@/services/api";

export interface AgentMessage {
    role: "user" | "assistant";
    content: string;
    result?: any;
}

export const useAgent = () => {
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async (prompt: string) => {
        setMessages((prev) => [
            ...prev, { role: "user", content: prompt }
        ]);

        setLoading(true);

        try {
            const response = await generateCampaign(prompt);

            setMessages((prev) => [
                ...prev, {
                    role: "assistant",
                    content: "Generated campaign",
                    result: response
                }
            ]);
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    };

    return { messages, sendMessage, loading };
};