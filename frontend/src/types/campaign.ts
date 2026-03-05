export interface CampaignResult {
    linkedin_post: string;
    twitter_thread: string[];
    engagement_score: number;
}

export interface GenerateCampaignResponse {
    campaignId: string;
    result: CampaignResult;
    imageUrl: string;
}