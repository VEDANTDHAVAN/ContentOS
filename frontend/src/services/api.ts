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
    campaignGoal: string, userId: string
): Promise<GenerateCampaignResponse> => {
    const response = await API.post<GenerateCampaignResponse>(
        "/agent", { campaignGoal, userId }
    );
    return response.data;
};

export const getCampaigns = async (userId: string) => {
    const response = await API.get("/campaigns", {
        params: { userId }
    });
    return response.data;
};