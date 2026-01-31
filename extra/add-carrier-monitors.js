#!/usr/bin/env node
/**
 * Add json-query-multi monitors for carrier health endpoints.
 * Usage: node extra/add-carrier-monitors.js [--api-key=uk1_xxx] [--dry-run]
 * Or set UPTIME_KUMA_API_KEY=uk1_xxx
 *
 * Creates one monitor per carrier: https://carrieruat.piyovi.io/{systemName:lowercase}/health
 * with health check entry = systemName.
 */

const Database = require("../server/database");
const { R } = require("redbean-node");
const args = require("args-parser")(process.argv);
const passwordHash = require("../server/password-hash");

// Unique carrier system names (from user list; "generic" etc. de-duplicated)
const CARRIER_SYSTEM_NAMES = [
    "fedex_freight",
    "ups_freight",
    "RL",
    "SEFL",
    "NMTransfer",
    "SpeedeeFreight",
    "Daytonfreight",
    "NewPenn",
    "PittOhio",
    "WardTrucking",
    "TQL",
    "CMForwarding",
    "tforce",
    "generic",
    "JAFrate",
    "midlandtransport",
    "FedEx",
    "DHL",
    "Dohrn",
    "AduiePyle",
    "YRCFreight",
    "Odfl",
    "Purolator",
    "Magnum",
    "CHRobinson",
    "OAKHFL",
    "Dbschenker",
    "CanadaPost",
    "coyote",
    "UPS",
    "Saia",
    "AAACooper",
    "ContactCartage",
    "Flock",
    "JBHUNT",
    "GlobalTranz",
    "peninsulatruck",
    "rudetransport",
    "PaceMotor",
    "USFHolland",
    "ESTES",
    "ABF",
    "XPOLogistics",
    "CrossCountryFreight",
    "Rist",
    "Averitt",
    "upsgf",
    "USFReddaway",
];

const BASE_URL = "https://carrieruat.piyovi.io";

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
        console.error("Usage: node extra/add-carrier-monitors.js --api-key=uk1_xxx [--dry-run]");
        console.error("Or set UPTIME_KUMA_API_KEY=uk1_xxx");
        process.exit(1);
    }

    if (dryRun) {
        console.log("Dry run – no monitors will be created.");
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

    const created = [];
    const skipped = [];

    for (const systemName of CARRIER_SYSTEM_NAMES) {
        const pathSegment = systemName.toLowerCase();
        const url = `${BASE_URL}/${pathSegment}/health`;
        const name = `${systemName} (${pathSegment})`;

        const existing = await R.findOne("monitor", " user_id = ? AND url = ? AND type = ? ", [
            userId,
            url,
            "json-query-multi",
        ]);
        if (existing) {
            skipped.push({ name, url });
            continue;
        }

        if (dryRun) {
            console.log("[dry-run] Would add:", name, url);
            created.push({ name, url });
            continue;
        }

        const monitor = {
            name,
            url,
            type: "json-query-multi",
            interval: 60,
            retry_interval: 60,
            resend_interval: 0,
            maxretries: 0,
            active: true,
            upside_down: false,
            ignore_tls: false,
            accepted_statuscodes_json: JSON.stringify(["200-299"]),
            health_check_entries: JSON.stringify([systemName]),
            health_entries_path: "entries",
            health_status_field: "status",
            health_expected_value: "Healthy",
        };

        const bean = R.dispense("monitor");
        bean.import(monitor);
        bean.user_id = userId;
        await R.store(bean);
        created.push({ name, url, id: bean.id });
        console.log("Added monitor:", bean.id, name);
    }

    await Database.close();

    console.log("\nDone. Created:", created.length, "Skipped (already exist):", skipped.length);
    if (skipped.length > 0) {
        console.log("Skipped URLs:", skipped.map((s) => s.url).join(", "));
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
