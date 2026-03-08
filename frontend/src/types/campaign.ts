export interface CampaignResult {
    linkedin_post: string;
    twitter_thread: string[];
    engagement_score: number;
}

export interface GenerateCampaignResponse {
    campaignId: string;
    campaign: CampaignResult;
    imageUrl: string;
    predictedEngagement?: number;
    contentCalendar?: any[];
    campaignGoal: string;
    createdAt: string;
}

export interface Campaign {
    campaignId: string;
    campaignGoal: string;
    generatedContent: CampaignResult;
    imageUrl?: string;
    createdAt: string;
}