#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const defaultQueuePath = path.resolve(process.cwd(), "../../OPENCLAW_MONITOR_HEARTBEAT_QUEUE.md");
const queuePath = process.env.HEARTBEAT_QUEUE_FILE
  ? path.resolve(process.cwd(), process.env.HEARTBEAT_QUEUE_FILE)
  : defaultQueuePath;

if (!fs.existsSync(queuePath)) {
  console.warn(`[queue:check] queue file not found, skip: ${queuePath}`);
  process.exit(0);
}

const text = fs.readFileSync(queuePath, "utf8");

const section = (title) => {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`## ${escaped}[\\s\\S]*?(?=\\n## |$)`, "m");
  const match = text.match(regex);
  return match?.[0] ?? "";
};

const collectIds = (block) => [...block.matchAll(/\[([A-Z0-9-]+)\]/g)].map((m) => m[1]);
const dedupe = (arr) => [...new Set(arr)];

const todoIds = collectIds(section("TODO (대기 중인 작업)"));
const doingIds = collectIds(section("DOING (진행 중인 작업)"));
const doneIds = collectIds(section("DONE (완료된 작업)"));

const overlap = (left, right) => dedupe(left.filter((id) => right.includes(id)));

const errors = [];
const todoDoneOverlap = overlap(todoIds, doneIds);
if (todoDoneOverlap.length > 0) {
  errors.push(`IDs duplicated in TODO and DONE: ${todoDoneOverlap.join(", ")}`);
}

const doingDoneOverlap = overlap(doingIds, doneIds);
if (doingDoneOverlap.length > 0) {
  errors.push(`IDs duplicated in DOING and DONE: ${doingDoneOverlap.join(", ")}`);
}

const hasTodoSection = section("TODO (대기 중인 작업)").trim().length > 0;
if (!hasTodoSection) {
  errors.push("TODO section is missing.");
}

if (errors.length > 0) {
  console.error("[queue:check] ❌ queue consistency check failed");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`[queue:check] ✅ queue consistency check passed (${path.relative(process.cwd(), queuePath)})`);
