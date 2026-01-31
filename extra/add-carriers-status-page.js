#!/usr/bin/env node
/**
 * Add a new status page "Carriers" and assign all carrier monitors to it.
 * Usage: node extra/add-carriers-status-page.js [--api-key=uk1_xxx] [--dry-run]
 * Or set UPTIME_KUMA_API_KEY=uk1_xxx
 *
 * - Creates status page with slug "carriers" and title "Carriers" (if not exists).
 * - Creates one group "Carriers" on that page.
 * - Adds all monitors (type json-query-multi, URL containing carrieruat.piyovi.io) to the group.
 */

const Database = require("../server/database");
const { R } = require("redbean-node");
const args = require("args-parser")(process.argv);
const passwordHash = require("../server/password-hash");

const STATUS_PAGE_SLUG = "carriers";
const STATUS_PAGE_TITLE = "Carriers";
const GROUP_NAME = "Carriers";
const CARRIER_URL_PATTERN = "%carrieruat.piyovi.io%";

async function getUserIdFromApiKey(apiKey) {
    if (typeof apiKey !== "string" || !apiKey.startsWith("uk") || !apiKey.includes("_")) {
        throw new Error("Invalid API key format. Expected uk{id}_{secret}");
    }
    const index = apiKey.substring(2, apiKey.indexOf("_"));
    const clear = apiKey.substring(apiKey.indexOf("_") + 1);

    const hash = await R.findOne("api_key", " id = ? ", [index]);
    if (hash === null) {
        throw new Error("API key not found.");
    }
    if (!hash.active) {
        throw new Error("API key is inactive.");
    }
    const dayjs = require("dayjs");
    const expiry = dayjs(hash.expires);
    if (expiry.isBefore(dayjs())) {
        throw new Error("API key has expired.");
    }
    const valid = passwordHash.verify(clear, hash.key);
    if (!valid) {
        throw new Error("API key verification failed.");
    }
    return hash.user_id;
}

async function main() {
    const apiKey = args["api-key"] || process.env.UPTIME_KUMA_API_KEY;
    const dryRun = "dry-run" in args;

    if (!apiKey) {
        console.error("Usage: node extra/add-carriers-status-page.js --api-key=uk1_xxx [--dry-run]");
        console.error("Or set UPTIME_KUMA_API_KEY=uk1_xxx");
        process.exit(1);
    }

    if (dryRun) {
        console.log("Dry run – no changes will be made.");
    }

    console.log("Connecting to database...");
    Database.initDataDir(args);
    await Database.connect(false, false, true);

    let userId;
    try {
        userId = await getUserIdFromApiKey(apiKey);
        console.log("API key valid. User ID:", userId);
    } catch (e) {
        console.error("API key error:", e.message);
        await Database.close();
        process.exit(1);
    }

    let statusPage = await R.findOne("status_page", " slug = ? ", [STATUS_PAGE_SLUG]);

    if (!statusPage) {
        if (dryRun) {
            console.log("[dry-run] Would create status page:", STATUS_PAGE_SLUG, STATUS_PAGE_TITLE);
        } else {
            statusPage = R.dispense("status_page");
            statusPage.slug = STATUS_PAGE_SLUG;
            statusPage.title = STATUS_PAGE_TITLE;
            statusPage.theme = "auto";
            statusPage.icon = "";
            statusPage.published = true;
            statusPage.search_engine_index = true;
            statusPage.show_tags = false;
            statusPage.show_powered_by = true;
            if (statusPage.autoRefreshInterval === undefined) {
                statusPage.autoRefreshInterval = 300;
            }
            await R.store(statusPage);
            console.log("Created status page:", statusPage.slug, "(id:", statusPage.id + ")");
        }
    } else {
        console.log("Using existing status page:", statusPage.slug, "(id:", statusPage.id + ")");
    }

    if (dryRun && !statusPage) {
        await Database.close();
        console.log("Done (dry run).");
        return;
    }

    if (!statusPage) {
        await Database.close();
        process.exit(1);
    }

    let groupBean = await R.findOne("group", " status_page_id = ? AND name = ? ", [
        statusPage.id,
        GROUP_NAME,
    ]);

    if (!groupBean) {
        if (dryRun) {
            console.log("[dry-run] Would create group:", GROUP_NAME);
        } else {
            groupBean = R.dispense("group");
            groupBean.status_page_id = statusPage.id;
            groupBean.name = GROUP_NAME;
            groupBean.public = true;
            groupBean.active = true;
            groupBean.weight = 1000;
            await R.store(groupBean);
            console.log("Created group:", groupBean.name, "(id:", groupBean.id + ")");
        }
    } else {
        console.log("Using existing group:", groupBean.name, "(id:", groupBean.id + ")");
    }

    if (dryRun) {
        const count = await R.getCell(
            "SELECT COUNT(*) FROM monitor WHERE user_id = ? AND type = ? AND url LIKE ?",
            [userId, "json-query-multi", CARRIER_URL_PATTERN]
        );
        console.log("[dry-run] Would add", count, "carrier monitors to the group.");
        await Database.close();
        console.log("Done (dry run).");
        return;
    }

    const carrierMonitors = await R.getAll(
        "SELECT id FROM monitor WHERE user_id = ? AND type = ? AND url LIKE ? ORDER BY name",
        [userId, "json-query-multi", CARRIER_URL_PATTERN]
    );

    await R.exec("DELETE FROM monitor_group WHERE group_id = ? ", [groupBean.id]);

    let weight = 1;
    for (const row of carrierMonitors) {
        const rel = R.dispense("monitor_group");
        rel.group_id = groupBean.id;
        rel.monitor_id = row.id;
        rel.weight = weight++;
        rel.send_url = false;
        await R.store(rel);
    }

    await Database.close();
    console.log("Done. Status page:", STATUS_PAGE_SLUG, "| Group:", GROUP_NAME, "| Monitors added:", carrierMonitors.length);
    console.log("View at: /status/" + STATUS_PAGE_SLUG);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
