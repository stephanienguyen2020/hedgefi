import {
  elizaLogger,
  Action,
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
  composeContext,
  generateMessageResponse,
  ModelClass,
} from "@elizaos/core";
import { betExample } from "./betExample";

export const CREATE_BET: Action = {
  name: "createBet",
  description: "Create a bet",
  similes: ["create a bet", "make a bet", "bet"],
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback: HandlerCallback
  ) => {
    let currentState: State = state;
    if (!currentState) {
      currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

  },
  validate: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    return true;
  },
  examples: betExample,
};
