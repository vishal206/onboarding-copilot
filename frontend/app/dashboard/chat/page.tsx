"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import { sendMessageStream } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { getToken } = useAuth();

  const botId = "00000000-0000-0000-0000-000000000001";

  const handleSend = async (question: string) => {
    // ✅ SINGLE state update
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: "" },
    ]);

    const token = await getToken();

    if (!token) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = "Authentication error.";
        return updated;
      });
      return;
    }

    await sendMessageStream(botId, question, token, (chunk) => {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        updated[lastIndex] = {
          ...updated[lastIndex],
          content: updated[lastIndex].content + chunk,
        };

        return updated;
      });
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 p-6 text-black">
      <ChatWindow messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
