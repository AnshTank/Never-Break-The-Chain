#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";
import fetch from "node-fetch";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const OUTPUT_DIR = path.join(process.cwd(), "generated-images");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function downloadAndSaveImage(imageUrl, filename) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Failed to download image");

  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  return filePath;
}

const server = new Server(
  { name: "pollinations", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

// Define tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request;

  if (name !== "generate_image") {
    throw new Error(`Unknown tool: ${name}`);
  }

  const prompt = args?.prompt;
  if (!prompt) throw new Error("prompt is required");

  const width = args?.width ?? 768;
  const height = args?.height ?? 768;
  const seed = args?.seed ?? Math.floor(Math.random() * 999999);

  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}`;

  const hash = crypto.randomBytes(6).toString("hex");
  const filename = `img_${Date.now()}_${hash}.png`;

  const savedPath = await downloadAndSaveImage(imageUrl, filename);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: true,
            prompt,
            imageUrl,
            savedPath,
            filename,
            width,
            height,
            seed,
          },
          null,
          2,
        ),
      },
    ],
  };
});

// List tools
server.listTools = async () => {
  return {
    tools: [
      {
        name: "generate_image",
        description:
          "Generate an image using Pollinations (free, no key) and store it locally.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            width: { type: "number", default: 768 },
            height: { type: "number", default: 768 },
            seed: { type: "number" },
          },
          required: ["prompt"],
        },
      },
    ],
  };
};

const transport = new StdioServerTransport();
await server.connect(transport);
