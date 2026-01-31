#!/usr/bin/env node
/**
 * Delete all monitors (and their heartbeats, status page links, etc.).
 * Usage: node extra/delete-all-monitors.js [--dry-run]
 * Use --dry-run to only print what would be deleted.
 */

const Database = require("../server/database");
const { R } = require("redbean-node");
const args = require("args-parser")(process.argv);

async function main() {
    const dryRun = "dry-run" in args;

    if (dryRun) {
        console.log("Dry run – no changes will be made.");
    }

    console.log("Connecting to database...");
    Database.initDataDir(args);
    await Database.connect(false, false, true);

    const monitors = await R.find("monitor");
    const count = monitors.length;

    if (count === 0) {
        console.log("No monitors to delete.");
        await Database.close();
        process.exit(0);
    }

    console.log("Found %s monitor(s).", count);
    if (dryRun) {
        console.log("[dry-run] Would delete: %s", monitors.map((m) => `${m.name} (id=${m.id})`).join(", "));
        await Database.close();
        process.exit(0);
    }

    for (const monitor of monitors) {
        await R.trash(monitor);
        console.log("Deleted monitor: %s (id=%s)", monitor.name, monitor.id);
    }

    console.log("Done. Deleted %s monitor(s).", count);
    await Database.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
