import axios from "axios";
import type { GenerateCampaignResponse } from "../types/campaign";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const generateCampaign = async (
    campaignGoal: string
): Promise<GenerateCampaignResponse> => {
    const response = await API.post<GenerateCampaignResponse>(
        "/generate", { campaignGoal }
    );
    return response.data;
};