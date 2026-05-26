"use client";

import { createContext, useContext } from "react";

interface BotContextValue {
  botId: string | null;
  botLoading: boolean;
}

export const BotContext = createContext<BotContextValue>({
  botId: null,
  botLoading: true,
});

export const useBotId = () => useContext(BotContext);
