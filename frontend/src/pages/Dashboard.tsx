import CampaignForm from "../components/Campaign/CampaignForm";
import EngagementCard from "../components/Campaign/EngagementCard";
import ResultDisplay from "../components/Campaign/ResultDisplay";
import Loader from "../components/ui/Loader";
import { useCampaign } from "../hooks/useCampaign";

const Dashboard: React.FC = () => {
    const { generate, loading, data, error } = useCampaign();

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-6">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">

                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    ContentOS
                </h1>

                {/* Campaign Input */}
                <CampaignForm onGenerate={generate} />

                {/* Loading State */}
                {loading && (
                    <div className="mt-6">
                        <Loader />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Results */}
                {data && (
                    <div className="mt-8 space-y-6">
                        <EngagementCard score={data.result.engagement_score} />
                        <ResultDisplay result={data.result} imageUrl={data.imageUrl} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;