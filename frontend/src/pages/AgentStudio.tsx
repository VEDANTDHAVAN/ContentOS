import MainLayout from "../layouts/MainLayout";
import ChatWindow from "../components/Agent/ChatWindow";
import ChatInput from "../components/Agent/ChatInput";
import { useAgent } from "../hooks/useAgent";

const AgentStudio = () => {
    const { messages, sendMessage, loading } = useAgent();

    return (
        <MainLayout>

            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg flex flex-col h-[650px]">

                <div className="p-4 border-b font-semibold">
                    ContentOS Agent
                </div>

                <ChatWindow messages={messages} />

                <div className="p-4">
                    <ChatInput onSend={sendMessage} loading={loading} />
                </div>

            </div>

        </MainLayout>
    );
};

export default AgentStudio;