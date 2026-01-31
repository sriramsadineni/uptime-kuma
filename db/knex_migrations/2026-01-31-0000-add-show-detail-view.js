// Add show_detail_view to monitor_group for status page "Enable detail view" setting
exports.up = function (knex) {
    return knex.schema.alterTable("monitor_group", function (table) {
        table.boolean("show_detail_view").defaultTo(false).notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("monitor_group", function (table) {
        table.dropColumn("show_detail_view");
    });
};
