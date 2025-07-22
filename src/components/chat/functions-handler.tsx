/* --------------------------------------------------------------------
 * File: src/ai/functions/index.ts
 * --------------------------------------------------------------------
 *  ✨  "Function‑Calling" Toolkit for Gemini
 *  ---------------------------------------------------------------
 *  • Central registry (`toolRegistry`) maps <name> ➜ implementation.
 *  • `registerTool()` lets you add new functions in one line.
 *  • `getFunctionDeclarations()` returns an array ready for
 *    Google AI SDK → `config.tools[0].functionDeclarations`.
 *  • `handleFunctionCalls()` executa as chamadas recebidas do modelo,
 *    devolve as `functionResponse` parts e o texto final.
 *
 *  Basta:
 *    import { registerTool, getFunctionDeclarations, handleFunctionCalls }
 *    from "@/ai/functions";
 *
 *  Depois registre quantas funções quiser — tudo em um único local.
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
            toolCode: 1,
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
 * 3. EXAMPLE TOOL: echoName
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
    },
    required: ["searchParam"],
  } as Schema,
  implementation: async ({ searchParam }, { GetAPI }) => {
    try {
      const result = await GetAPI(
        `/proposition/vetorial?searchParams=${searchParam}`,
        false,
      );

      return result.body;
    } catch (error) {
      console.error(error);
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

/* ------------------------------------------------------------------
 * Example tool: createClient
 * ----------------------------------------------------------------*/
// registerTool({
//   name: "createClient",
//   description:
//     "Create a client lead at the end of the conversation using contact info.",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       name: { type: Type.STRING, description: "Client full name" },
//       phone: { type: Type.STRING, description: "Phone number" },
//       summary: { type: Type.STRING, description: "Chat summary" },
//       email: { type: Type.STRING, description: "Email address" },
//     },
//     required: ["name", "phone", "summary", "email"],
//   } as Schema,
//   implementation: async ({ name, phone, summary, email }) => {
//     const resp = await PostAPI("/lead", {
//       name,
//       phone,
//       aiChat: summary,
//       email,
//       boardId: "72c955f3-d6d0-4843-9067-fd4889ff37a1",
//     });

//     if (resp.status === 201) {
//       return {
//         status: "success",
//         clientName: name,
//         message: "Client creation process initiated.",
//       };
//     }
//     throw new Error(`API error (${resp.status})`);
//   },
// });
/* ------------------------------------------------------------------
 * HOW TO ADD NEW TOOLS
 * ------------------------------------------------------------------
 * registerTool({
 *   name: "sendEmail",
 *   description: "Send an email to the given address",
 *   parameters: {
 *     type: Type.OBJECT,
 *     properties: {
 *       to:   { type: Type.STRING },
 *       body: { type: Type.STRING },
 *     },
 *     required: ["to", "body"],
 *   } as Schema,
 *   implementation: async ({ to, body }) => {
 *     // ...your logic...
 *     return { sent: true };
 *   },
 * });
 */
