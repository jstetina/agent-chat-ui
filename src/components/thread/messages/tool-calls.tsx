import { AIMessage, ToolMessage } from "@langchain/langgraph-sdk";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MarkdownText } from "../markdown-text";

function isComplexValue(value: unknown): boolean {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}

export function ToolCalls({
  toolCalls,
}: {
  toolCalls: AIMessage["tool_calls"];
}) {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      {toolCalls.map((tc, idx) => {
        const args = tc.args as Record<string, unknown>;
        const hasArgs = Object.keys(args).length > 0;
        return (
          <div
            key={idx}
            className="overflow-hidden rounded-lg border border-gray-200"
          >
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
              <h3 className="font-medium text-gray-900">
                {tc.name}
                {tc.id && (
                  <code className="ml-2 rounded bg-gray-100 px-2 py-1 text-sm">
                    {tc.id}
                  </code>
                )}
              </h3>
            </div>
            {hasArgs ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(args).map(([key, value], argIdx) => (
                      <tr key={argIdx}>
                        <td className="px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-900">
                          {key}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {isComplexValue(value) ? (
                            <code className="rounded bg-gray-50 px-2 py-1 font-mono text-sm break-all">
                              {JSON.stringify(value, null, 2)}
                            </code>
                          ) : (
                            String(value)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <code className="block p-3 text-sm">{"{}"}</code>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ToolResult({ message }: { message: ToolMessage }) {
  // Start expanded by default for better visibility
  const [isExpanded, setIsExpanded] = useState(true);

  let parsedContent: unknown;
  let isJsonContent = false;

  try {
    if (typeof message.content === "string") {
      parsedContent = JSON.parse(message.content);
      isJsonContent = isComplexValue(parsedContent);
    }
  } catch {
    // Content is not JSON, use as is
    parsedContent = message.content;
  }

  const contentStr = isJsonContent
    ? JSON.stringify(parsedContent, null, 2)
    : String(message.content);
  const contentLines = contentStr.split("\n");
  const shouldTruncate = contentLines.length > 4 || contentStr.length > 500;
  const displayedContent =
    shouldTruncate && !isExpanded
      ? contentStr.length > 500
        ? contentStr.slice(0, 500) + "..."
        : contentLines.slice(0, 4).join("\n") + "\n..."
      : contentStr;

  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {message.name ? (
              <h3 className="font-medium text-gray-900">
                Tool Result:{" "}
                <code className="rounded bg-gray-100 px-2 py-1">
                  {message.name}
                </code>
              </h3>
            ) : (
              <h3 className="font-medium text-gray-900">Tool Result</h3>
            )}
            {message.tool_call_id && (
              <code className="ml-2 rounded bg-gray-100 px-2 py-1 text-sm">
                {message.tool_call_id}
              </code>
            )}
          </div>
        </div>
        <div className="min-w-full bg-gray-100">
          <div className="overflow-x-auto p-3">
            {isJsonContent ? (
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {(Array.isArray(parsedContent)
                    ? isExpanded
                      ? (parsedContent as unknown[])
                      : (parsedContent as unknown[]).slice(0, 5)
                    : Object.entries(parsedContent as Record<string, unknown>)
                  ).map((item, argIdx) => {
                    const [key, value] = Array.isArray(parsedContent)
                      ? [argIdx, item]
                      : (item as [string, unknown]);
                    return (
                      <tr key={argIdx}>
                        <td className="px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-900">
                          {key}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {isComplexValue(value) ? (
                            <code className="rounded bg-gray-50 px-2 py-1 font-mono text-sm break-all">
                              {JSON.stringify(value, null, 2)}
                            </code>
                          ) : (
                            String(value)
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="prose prose-sm max-w-none">
                <MarkdownText>{displayedContent}</MarkdownText>
              </div>
            )}
          </div>
          {((shouldTruncate && !isJsonContent) ||
            (isJsonContent &&
              Array.isArray(parsedContent) &&
              (parsedContent as unknown[]).length > 5)) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full cursor-pointer items-center justify-center border-t border-gray-200 py-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
