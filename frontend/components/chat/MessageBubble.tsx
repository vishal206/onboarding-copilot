type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (!message.content && message.role === "assistant") {
    return (
      <div className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`px-4 py-2 rounded-lg max-w-[70%] ${
            isUser ? "bg-black text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          <span className="animate-pulse">...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-lg max-w-[70%] ${
          isUser ? "bg-black text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {message.content || (
          <span className="animate-pulse text-gray-400">...</span>
        )}
      </div>
    </div>
  );
}
