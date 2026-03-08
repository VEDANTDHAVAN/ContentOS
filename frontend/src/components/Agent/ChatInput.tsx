import { useState } from "react";
import { Button } from "../ui/Button";

interface Props {
    onSend: (message: string) => void;
    loading: boolean;
}

const ChatInput = ({ onSend, loading }: Props) => {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(input);
        setInput("");
    };

    return (
        <div className="flex gap-2 border-t pt-4">

            <input
                className="flex-1 border rounded-lg px-4 py-2"
                placeholder="Ask ContentOS agent..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <Button onClick={handleSend} disabled={loading}>
                {loading ? "Thinking..." : "Send"}
            </Button>

        </div>
    );
};

export default ChatInput;