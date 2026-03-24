from db.models import Bot


class PromptBuilder:
    def __init__(
        self,
        bot: Bot,
        chunks: list[dict],
        question: str,
        conversation_history: list[dict] = [],
    ):
        self.bot = bot
        self.chunks = chunks
        self.conversation_history = conversation_history
        self.question = question

    def build(self) -> list[dict]:
        """Builds a prompt for the LLM in the format of a list of messages with role and content."""
        prompt = []

        # bot's system prompt and the retrieved context chunks
        context = "\n\n".join([chunk["content"] for chunk in self.chunks])

        system_message = {
            "role": "system",
            "content": f"{self.bot.system_prompt}\n\nUse the following context to answer questions:\n\n{context}",
        }
        prompt.append(system_message)

        # Add conversation history
        for message in self.conversation_history[
            -10:
        ]:  # Limit to last 10 messages for context
            prompt.append({"role": message["role"], "content": message["content"]})

        # Add the user's question as the final user message
        prompt.append({"role": "user", "content": self.question})

        return prompt
