export async function sendMessageStream(
  botId: string,
  question: string,
  token: string,
  onChunk: (chunk: string) => void,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/query/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bot_id: botId,
        question,
      }),
    },
  );

  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
  }
}
