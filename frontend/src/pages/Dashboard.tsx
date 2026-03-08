import CampaignForm from "../components/Campaign/CampaignForm";
import EngagementCard from "../components/Campaign/EngagementCard";
import ResultDisplay from "../components/Campaign/ResultDisplay";
import Loader from "../components/ui/Loader";
import { useCampaign } from "../hooks/useCampaign";
import MainLayout from "../layouts/MainLayout";

const Dashboard: React.FC = () => {
    const { generate, loading, data, error } = useCampaign();

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">

                <CampaignForm onGenerate={generate} />

                {loading && <Loader />}

                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {data && (
                    <>
                        <EngagementCard score={data.campaign?.engagement_score} />
                        <ResultDisplay
                            campaign={data}
                        />
                    </>
                )}

            </div>
        </MainLayout>
    );
};

export default Dashboard;