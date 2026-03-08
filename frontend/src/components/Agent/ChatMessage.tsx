import ResultDisplay from "../Campaign/ResultDisplay";

interface Props {
    message: any;
}

const ChatMessage = ({ message }: Props) => {
    if (message.role == "user") {
        return (
            <div className="flex justify-end">
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl max-w-md">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <div className="bg-white border px-4 py-3 rounded-xl max-w-xl shadow-sm">

                {message.campaign ? (
                    <ResultDisplay
                        campaign={{
                            generatedContent: message.campaign.generatedContent,
                            imageUrl: message.campaign.imageUrl,
                            campaignId: message.campaign.campaignId,
                            campaignGoal: message.campaign.campaignGoal,
                            createdAt: message.campaign.createdAt,
                        }}
                    />
                ) : (
                    <p>{message.content}</p>
                )}

            </div>
        </div>
    );
};

export default ChatMessage;