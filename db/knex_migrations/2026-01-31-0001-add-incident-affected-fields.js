// Add Affected Monitors and Affected Areas to incident (comma-separated text)
// Idempotent: skips adding columns that already exist (e.g. after partial run or DB switch).
exports.up = async function (knex) {
    if (!(await knex.schema.hasColumn("incident", "affected_monitors"))) {
        await knex.schema.alterTable("incident", (table) => {
            table.text("affected_monitors").nullable();
        });
    }
    if (!(await knex.schema.hasColumn("incident", "affected_areas"))) {
        await knex.schema.alterTable("incident", (table) => {
            table.text("affected_areas").nullable();
        });
    }
};

exports.down = async function (knex) {
    if (await knex.schema.hasColumn("incident", "affected_monitors")) {
        await knex.schema.alterTable("incident", (table) => table.dropColumn("affected_monitors"));
    }
    if (await knex.schema.hasColumn("incident", "affected_areas")) {
        await knex.schema.alterTable("incident", (table) => table.dropColumn("affected_areas"));
    }
};
