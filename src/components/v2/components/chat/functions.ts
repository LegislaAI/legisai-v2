/* --------------------------------------------------------------------
 * File: src/components/chat/functions.ts
 * --------------------------------------------------------------------
 *  Function-Calling Toolkit for Gemini
 * ------------------------------------------------------------------*/

import type { ApiContextProps } from "@/context/ApiContext";
import {
  Chat,
  Part,
  Type,
  type FunctionDeclaration,
  type Schema,
} from "@google/genai";

type ApiMethods = Pick<ApiContextProps, "GetAPI" | "PostAPI">;

/* ------------------------------------------------------------------
 * 1. REGISTRY
 * ----------------------------------------------------------------*/
export interface ToolDefinition
  extends Omit<FunctionDeclaration, "parameters"> {
  parameters: Schema;
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

export function getFunctionDeclarations(): FunctionDeclaration[] {
  return Object.values(toolRegistry).map(
    ({
      /* eslint-disable @typescript-eslint/no-unused-vars */
      implementation: _implementation,
      /* eslint-enable */
      ...decl
    }) => decl,
  );
}

/* ------------------------------------------------------------------
 * 2. EXECUTOR
 * ----------------------------------------------------------------*/
export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  toolCallId: string;
}

export async function handleFunctionCalls(
  functionCalls: ToolCall[],
  chatSession: Chat,
  api: ApiMethods,
): Promise<string> {
  const toolResponses: Part[] = [];

  for (const { name, args, toolCallId } of functionCalls) {
    const def = toolRegistry[name];
    try {
      if (!def) throw new Error(`Unknown function: ${name}`);

      const output = await def.implementation(args, api);

      toolResponses.push({
        functionResponse: {
          id: toolCallId,
          name,
          response: { output: JSON.stringify(output) },
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "unknown error during call";
      toolResponses.push({
        functionResponse: {
          id: toolCallId,
          name,
          response: {
            // toolCode: 1, // field 'toolCode' might not be standard in all SDK versions, check if needed
            output: JSON.stringify({ error: true, message }),
          },
        },
      });
    }
  }

  const res = await chatSession.sendMessage({ message: toolResponses });
  return res.text ?? "";
}

/* ------------------------------------------------------------------
 * 3. EXAMPLE TOOLS
 * ----------------------------------------------------------------*/

registerTool({
  name: "vectorSearch",
  description: "search laws in vector database",
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchParam: {
        type: Type.STRING,
        description:
          "keywords based on the user request to maximize the search results",
      },
      type: {
        type: Type.STRING,
        description:
          "type of the proposition to search, example: PL, REQ, PEC, etc",
      },
      year: {
        type: Type.STRING,
        description: "year of the proposition to search",
      },
      number: {
        type: Type.STRING,
        description: "number of the proposition to search",
      },
      regime: {
        type: Type.STRING,
        description: "regime of the proposition to search",
      },
      page: {
        type: Type.NUMBER,
        description: "page of the search result",
      },
      authorId: {
        type: Type.STRING,
        description: "id of the author of the proposition",
      },
      situation: {
        type: Type.STRING,
        description: "situation of the proposition to search",
      },
      lastMovementDescription: {
        type: Type.STRING,
        description: "last movement description of the proposition to search",
      },
    },
    required: ["searchParam"],
  } as Schema,
  implementation: async (
    {
      searchParam,
      type,
      year,
      number,
      regime,
      page,
      situation,
      lastMovementDescription,
      authorId,
    },
    { GetAPI },
  ) => {
    let query = "";

    if (type) query += `&type=${type}`;
    if (year) query += `&year=${year}`;
    if (number) query += `&number=${number}`;
    if (regime) query += `&regime=${regime}`;
    if (situation) query += `&situation=${situation}`;
    if (lastMovementDescription)
      query += `&lastMovementDescription=${lastMovementDescription}`;
    if (authorId) query += `&authorId=${authorId}`;

    try {
      const result = await GetAPI(
        `/proposition/vetorial?searchParams=${searchParam}&page=${page}${query}`,
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
    type: Type.OBJECT,
    properties: {
      propositionId: {
        type: Type.STRING,
        description: "id of the proposition to be searched",
      },
    },
    required: ["propositionId"],
  } as Schema,
  implementation: async ({ propositionId }, { GetAPI }) => {
    const result = await GetAPI(`/proposition-process/${propositionId}`, false);
    return result.body;
  },
});

registerTool({
  name: "fetchAuthors",
  description: "search author list",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "First name of the authors",
      },
      page: {
        type: Type.NUMBER,
        description: "Page of the search result",
      },
    },
    required: ["name", "page"],
  } as Schema,
  implementation: async ({ name, page }, { GetAPI }) => {
    const result = await GetAPI(`/politician?query=${name}&page=${page}`, true);
    return result.body;
  },
});
