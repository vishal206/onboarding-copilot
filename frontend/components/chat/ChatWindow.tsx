import MessageBubble from "./MessageBubble";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWindow({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 overflow-y-auto border p-4 mb-2">
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
    </div>
  );
}
