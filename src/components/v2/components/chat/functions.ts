/* --------------------------------------------------------------------
 * File: src/components/chat/functions.ts
 * --------------------------------------------------------------------
 *  Function-Calling Toolkit for OpenRouter
 *  Compatível com a API OpenRouter que segue o padrão OpenAI
 * ------------------------------------------------------------------*/

import type { ApiContextProps } from "@/context/ApiContext";
import type { OpenRouterTool, OpenRouterToolCall } from "./types";

type ApiMethods = Pick<ApiContextProps, "GetAPI" | "PostAPI">;

/* ------------------------------------------------------------------
 * 1. REGISTRY
 * ----------------------------------------------------------------*/
export interface ToolDefinition {
  name: string;
  description?: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
  implementation: (
    args: Record<string, unknown>,
    api: ApiMethods,
  ) => Promise<unknown> | unknown;
}

const toolRegistry: Record<string, ToolDefinition> = {};

export function registerTool(def: ToolDefinition): void {
  if (!def.name) throw new Error("Tool must have a valid name");
  toolRegistry[def.name] = def;
}

/** Retorna as tools no formato OpenRouter/OpenAI */
export function getOpenRouterTools(): OpenRouterTool[] {
  return Object.values(toolRegistry).map(({ name, description, parameters }) => ({
    type: "function" as const,
    function: {
      name,
      description,
      parameters,
    },
  }));
}

/* ------------------------------------------------------------------
 * 2. EXECUTOR - Executa tool calls localmente
 * ----------------------------------------------------------------*/
export interface ToolCallResult {
  id: string;
  name: string;
  output: unknown;
  error?: string;
}

export async function executeToolCalls(
  toolCalls: OpenRouterToolCall[],
  api: ApiMethods,
): Promise<ToolCallResult[]> {
  const results: ToolCallResult[] = [];

  for (const call of toolCalls) {
    const funcName = call.function.name;
    const def = toolRegistry[funcName];
    
    try {
      if (!def) throw new Error(`Unknown function: ${funcName}`);
      
      const args = JSON.parse(call.function.arguments || "{}");
      const output = await def.implementation(args, api);

      results.push({
        id: call.id,
        name: funcName,
        output,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error during call";
      results.push({
        id: call.id,
        name: funcName,
        output: null,
        error: message,
      });
    }
  }

  return results;
}

/* ------------------------------------------------------------------
 * 3. REGISTERED TOOLS
 * ----------------------------------------------------------------*/

registerTool({
  name: "vectorSearch",
  description: "search laws in vector database",
  parameters: {
    type: "object",
    properties: {
      searchParam: {
        type: "string",
        description: "keywords based on the user request to maximize the search results",
      },
      type: {
        type: "string",
        description: "type of the proposition to search, example: PL, REQ, PEC, etc",
      },
      year: {
        type: "string",
        description: "year of the proposition to search",
      },
      number: {
        type: "string",
        description: "number of the proposition to search",
      },
      regime: {
        type: "string",
        description: "regime of the proposition to search",
      },
      page: {
        type: "number",
        description: "page of the search result",
      },
      authorId: {
        type: "string",
        description: "id of the author of the proposition",
      },
      situation: {
        type: "string",
        description: "situation of the proposition to search",
      },
      lastMovementDescription: {
        type: "string",
        description: "last movement description of the proposition to search",
      },
    },
    required: ["searchParam"],
  },
  implementation: async (
    { searchParam, type, year, number, regime, page, situation, lastMovementDescription, authorId },
    { GetAPI },
  ) => {
    let query = "";

    if (type) query += `&type=${type}`;
    if (year) query += `&year=${year}`;
    if (number) query += `&number=${number}`;
    if (regime) query += `&regime=${regime}`;
    if (situation) query += `&situation=${situation}`;
    if (lastMovementDescription) query += `&lastMovementDescription=${lastMovementDescription}`;
    if (authorId) query += `&authorId=${authorId}`;

    try {
      const result = await GetAPI(
        `/proposition/vetorial?searchParams=${searchParam}&page=${page || 1}${query}`,
        false,
      );
      return result.body;
    } catch (error) {
      console.error(error);
      return { error: "Failed to fetch propositions" };
    }
  },
});

registerTool({
  name: "propositionDetails",
  description: "search proposition details",
  parameters: {
    type: "object",
    properties: {
      propositionId: {
        type: "string",
        description: "id of the proposition to be searched",
      },
    },
    required: ["propositionId"],
  },
  implementation: async ({ propositionId }, { GetAPI }) => {
    const result = await GetAPI(`/proposition-process/${propositionId}`, false);
    return result.body;
  },
});

registerTool({
  name: "fetchAuthors",
  description: "search author list",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "First name of the authors",
      },
      page: {
        type: "number",
        description: "Page of the search result",
      },
    },
    required: ["name", "page"],
  },
  implementation: async ({ name, page }, { GetAPI }) => {
    const result = await GetAPI(`/politician?query=${name}&page=${page}`, true);
    return result.body;
  },
});
