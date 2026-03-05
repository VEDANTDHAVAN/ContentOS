interface Props {
    score: number;
}

const EngagementCard = ({ score }: Props) => {
    const color =
        score >= 8 ? "text-green-600" :
            score >= 5 ? "text-yellow-600" :
                "text-red-600";

    return (
        <div className="mt-6 p-4 bg-white rounded-xl shadow">
            <h3 className="text-lg font-semibold">Predicted Engagement</h3>
            <p className={`text-3xl font-bold ${color}`}>
                {score}/10
            </p>
        </div>
    );
};

export default EngagementCard;