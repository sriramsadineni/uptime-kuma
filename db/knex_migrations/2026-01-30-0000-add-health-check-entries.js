/**
 * Migration to add health check entries support
 * Allows monitoring multiple entries from a single health endpoint
 */
exports.up = function (knex) {
    return knex.schema
        .alterTable("monitor", function (table) {
            // JSON array of entry keys to monitor (e.g., ["piyovi-carrier", "carrier-ship"])
            table.text("health_check_entries").nullable();
            // Path to the entries object in the response (e.g., "entries")
            table.string("health_entries_path", 255).nullable();
            // Path to the status field within each entry (e.g., "status")
            table.string("health_status_field", 255).nullable().defaultTo("status");
            // Expected value for healthy status (e.g., "Healthy")
            table.string("health_expected_value", 255).nullable().defaultTo("Healthy");
        })
        .then(() => {
            return knex.schema.alterTable("heartbeat", function (table) {
                // Entry key for multi-entry health checks (null for regular monitors)
                table.string("entry_key", 255).nullable();
            });
        })
        .then(() => {
            // Add index for entry_key queries
            return knex.schema.alterTable("heartbeat", function (table) {
                table.index(["monitor_id", "entry_key", "time"], "monitor_entry_time_index");
            });
        });
};

exports.down = function (knex) {
    return knex.schema
        .alterTable("heartbeat", function (table) {
            table.dropIndex(["monitor_id", "entry_key", "time"], "monitor_entry_time_index");
        })
        .then(() => {
            return knex.schema.alterTable("heartbeat", function (table) {
                table.dropColumn("entry_key");
            });
        })
        .then(() => {
            return knex.schema.alterTable("monitor", function (table) {
                table.dropColumn("health_check_entries");
                table.dropColumn("health_entries_path");
                table.dropColumn("health_status_field");
                table.dropColumn("health_expected_value");
            });
        });
};
