import { useState } from "react";
import { generateCampaign } from "../services/api";
import type { GenerateCampaignResponse } from "../types/campaign";
import axios from "axios";

export const useCampaign = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<GenerateCampaignResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generate = async (goal: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await generateCampaign(goal);

            console.log("API Response:", response);
            setData(response);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? "API error");
            } else {
                setError("Unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return { generate, loading, data, error };
};