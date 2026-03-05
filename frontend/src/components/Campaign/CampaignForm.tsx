import React, { useState } from "react";

interface Props {
    onGenerate: (goal: string) => void;
}

const CampaignForm = ({ onGenerate }: Props) => {
    const [goal, setGoal] = useState<string>("");

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!goal) return;
        onGenerate(goal);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Enter campaign goal..."
            />
            <button type="submit">Generate</button>
        </form>
    );
};

export default CampaignForm;