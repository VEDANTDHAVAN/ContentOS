import type { CampaignResult } from "../../types/campaign";

interface Props {
    result: CampaignResult;
    imageUrl?: string;
}

const ResultDisplay = ({ result, imageUrl }: Props) => {
    return (
        <div>
            <h3>LinkedIn Post</h3>
            <p>{result.linkedin_post}</p>

            <h3>Twitter Thread</h3>
            {result.twitter_thread.map((tweet, index) => (
                <p key={index}>{tweet}</p>
            ))}

            <h3>Generated Image</h3>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Campaign Creative"
                    className="rounded-lg shadow-lg mt-4"
                />
            )}
        </div>
    );
};

export default ResultDisplay;