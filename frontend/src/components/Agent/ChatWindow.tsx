import ChatMessage from "./ChatMessage";

const ChatWindow = ({ messages }: any) => {
    return (
        <div className="flex flex-col gap-4 overflow-y-auto h-[500px] p-4">

            {messages.map((msg: any, i: number) => (
                <ChatMessage key={i} message={msg} />
            ))}

        </div>
    );
};

export default ChatWindow;