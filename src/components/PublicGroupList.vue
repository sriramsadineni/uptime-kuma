<template>
    <!-- Group List -->
    <Draggable v-model="$root.publicGroupList" :disabled="!editMode" item-key="id" :animation="100">
        <template #item="group">
            <div class="group-card mb-4" data-testid="group">
                <!-- Group Header -->
                <div class="group-header">
                    <div class="title-section">
                        <font-awesome-icon
                            v-if="editMode && showGroupDrag"
                            icon="arrows-alt-v"
                            class="action drag me-3"
                        />
                        <font-awesome-icon
                            v-if="editMode"
                            icon="times"
                            class="action remove me-3"
                            @click="removeGroup(group.index)"
                        />
                        <Editable
                            v-model="group.element.name"
                            :contenteditable="editMode"
                            tag="span"
                            class="group-name"
                            data-testid="group-name"
                        />
                    </div>

                    <GroupSortDropdown
                        :group="group.element"
                        :group-index="group.index"
                        :show-certificate-expiry="showCertificateExpiry"
                        @update-group="updateGroup"
                    />
                </div>

                <!-- Group Body -->
                <div class="group-body position-relative">
                    <div v-if="group.element.monitorList.length === 0" class="text-center no-monitor-msg">
                        {{ $t("No Monitors") }}
                    </div>

                    <!-- Monitor List -->
                    <!-- animation is not working, no idea why -->
                    <Draggable
                        v-model="group.element.monitorList"
                        class="monitor-list"
                        group="same-group"
                        :disabled="!editMode"
                        :animation="100"
                        item-key="id"
                    >
                        <template #item="monitor">
                            <div
                                class="item"
                                :class="{ 'has-entries': hasEntries(monitor.element), 'entries-expanded': isEntriesExpanded(monitor.element.id) }"
                                data-testid="monitor"
                            >
                                <div
                                    class="row monitor-header"
                                    :class="{ 'clickable': hasEntries(monitor.element) }"
                                    @click="hasEntries(monitor.element) ? toggleEntries(monitor.element.id) : null"
                                >
                                    <div class="col-9 col-xl-6 small-padding">
                                        <div class="info">
                                            <!-- Expand/collapse icon for monitors with entries -->
                                            <font-awesome-icon
                                                v-if="hasEntries(monitor.element)"
                                                :icon="isEntriesExpanded(monitor.element.id) ? 'chevron-down' : 'chevron-right'"
                                                class="expand-icon me-2"
                                            />
                                            <font-awesome-icon
                                                v-if="editMode"
                                                icon="arrows-alt-v"
                                                class="action drag me-3"
                                            />
                                            <font-awesome-icon
                                                v-if="editMode"
                                                icon="times"
                                                class="action remove me-3"
                                                @click.stop="removeMonitor(group.index, monitor.index)"
                                            />

                                            <font-awesome-icon
                                                v-if="editMode"
                                                icon="cog"
                                                class="action me-3 ms-0"
                                                :class="{ 'link-active': true, 'btn-link': true }"
                                                data-testid="monitor-settings"
                                                @click.stop="$refs.monitorSettingDialog.show(group, monitor)"
                                            />
                                            <Status
                                                v-if="showOnlyLastHeartbeat"
                                                :status="statusOfLastHeartbeat(monitor.element.id)"
                                            />
                                            <!-- Both clickable link + detail view → link to detail page -->
                                            <a
                                                v-if="slug && showLink(monitor) && monitor.element.showDetailView && !editMode"
                                                :href="detailViewHref(monitor.element.id)"
                                                class="item-name"
                                                data-testid="monitor-name"
                                            >
                                                {{ monitor.element.name }}
                                            </a>
                                            <!-- Clickable link only (no detail view) → external URL -->
                                            <a
                                                v-else-if="showLink(monitor)"
                                                :href="monitor.element.url"
                                                class="item-name"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                data-testid="monitor-name"
                                                @click.stop
                                            >
                                                {{ monitor.element.name }}
                                            </a>
                                            <!-- No clickable link → plain text (detail view is disabled when no link) -->
                                            <p v-else class="item-name" data-testid="monitor-name">
                                                {{ monitor.element.name }}
                                            </p>
                                            <Uptime
                                                v-if="!showOnlyLastHeartbeat"
                                                :monitor="monitor.element"
                                                type="24"
                                                :pill="true"
                                                class="main-uptime-pill"
                                            />
                                            <!-- Entry count badge -->
                                            <span
                                                v-if="hasEntries(monitor.element)"
                                                class="entries-badge"
                                            >
                                                {{ monitor.element.healthCheckEntries.length }}
                                            </span>
                                        </div>
                                        <div class="extra-info">
                                            <div
                                                v-if="showCertificateExpiry && monitor.element.certExpiryDaysRemaining"
                                            >
                                                <Tag
                                                    :item="{
                                                        name: $t('Cert Exp.'),
                                                        value: formattedCertExpiryMessage(monitor),
                                                        color: certExpiryColor(monitor),
                                                    }"
                                                    :size="'sm'"
                                                />
                                            </div>
                                            <div v-if="showTags">
                                                <Tag
                                                    v-for="tag in monitor.element.tags"
                                                    :key="tag"
                                                    :item="tag"
                                                    :size="'sm'"
                                                    data-testid="monitor-tag"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div :key="$root.userHeartbeatBar" class="col-3 col-xl-6 bar-column">
                                        <HeartbeatBar size="mid" :monitor-id="monitor.element.id" />
                                    </div>
                                </div>

                                <!-- Health Check Entries (collapsible) -->
                                <div
                                    v-if="hasEntries(monitor.element)"
                                    v-show="isEntriesExpanded(monitor.element.id)"
                                    class="health-entries-list"
                                >
                                    <div
                                        v-for="entry in monitor.element.healthCheckEntries"
                                        :key="entry.key"
                                        class="health-entry-row row"
                                    >
                                        <div class="col-9 col-xl-6 small-padding">
                                            <div class="entry-info">
                                                <span
                                                    class="entry-dot"
                                                    :class="{
                                                        'dot-up': entry.status === 1,
                                                        'dot-down': entry.status === 0,
                                                        'dot-pending': entry.status === 2 || entry.status === null
                                                    }"
                                                ></span>
                                                <span class="entry-name">{{ entry.key }}</span>
                                                <span
                                                    v-if="entryUptimePercent(entry) !== null"
                                                    class="badge rounded-pill entry-uptime-pill"
                                                    :class="entryUptimePillClass(entry)"
                                                    :title="$t('hours', 24)"
                                                >
                                                    {{ entryUptimePercent(entry) }}%
                                                </span>
                                            </div>
                                        </div>
                                        <div class="col-3 col-xl-6 bar-column">
                                            <HeartbeatBar
                                                size="mid"
                                                :heartbeat-list="entry.beats"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Draggable>
                </div>
            </div>
        </template>
    </Draggable>
    <MonitorSettingDialog ref="monitorSettingDialog" />
</template>

<script>
import MonitorSettingDialog from "./MonitorSettingDialog.vue";
import Draggable from "vuedraggable";
import HeartbeatBar from "./HeartbeatBar.vue";
import Uptime from "./Uptime.vue";
import Tag from "./Tag.vue";
import Status from "./Status.vue";
import GroupSortDropdown from "./GroupSortDropdown.vue";

export default {
    components: {
        MonitorSettingDialog,
        Draggable,
        HeartbeatBar,
        Uptime,
        Tag,
        Status,
        GroupSortDropdown,
    },
    props: {
        /** Are we in edit mode? */
        editMode: {
            type: Boolean,
            required: true,
        },
        /** Status page slug (for detail view link) */
        slug: {
            type: String,
            default: null,
        },
        /** Should tags be shown? */
        showTags: {
            type: Boolean,
        },
        /** Should expiry be shown? */
        showCertificateExpiry: {
            type: Boolean,
        },
        /** Should only the last heartbeat be shown? */
        showOnlyLastHeartbeat: {
            type: Boolean,
        },
    },
    data() {
        return {
            expandedEntries: {},
        };
    },
    computed: {
        showGroupDrag() {
            return this.$root.publicGroupList.length >= 2;
        },
    },
    watch: {
        // No watchers needed - sorting is handled by GroupSortDropdown component
    },
    created() {
        // Sorting is now handled by GroupSortDropdown component
    },
    methods: {
        /**
         * Check if monitor has health check entries
         * @param {object} monitor Monitor to check
         * @returns {boolean} Has entries
         */
        hasEntries(monitor) {
            return monitor.healthCheckEntries && monitor.healthCheckEntries.length > 0;
        },

        /**
         * Toggle visibility of health check entries for a monitor
         * @param {number} monitorId ID of monitor to toggle
         * @returns {void}
         */
        toggleEntries(monitorId) {
            this.expandedEntries[monitorId] = !this.expandedEntries[monitorId];
        },

        /**
         * Check if entries are expanded for a monitor
         * @param {number} monitorId ID of monitor to check
         * @returns {boolean} Are entries expanded
         */
        isEntriesExpanded(monitorId) {
            return this.expandedEntries[monitorId] === true;
        },

        /**
         * Link to public monitor detail page
         * @param {number} monitorId Monitor ID
         * @returns {string} URL path
         */
        detailViewHref(monitorId) {
            const s = this.slug || "default";
            return "/status/" + encodeURIComponent(s) + "/monitor/" + monitorId;
        },

        /**
         * Compute uptime percentage from entry beats (same logic as main monitor)
         * @param {object} entry Entry with beats array
         * @returns {string|null} e.g. "100" or "99.5", or null if no beats
         */
        entryUptimePercent(entry) {
            const beats = entry.beats;
            if (!beats || beats.length === 0) {
                return null;
            }
            const up = beats.filter((b) => b.status === 1).length;
            const pct = Math.round((up / beats.length) * 10000) / 100;
            return String(pct);
        },

        /**
         * Pill class for entry uptime (success/danger/warning like main Uptime component)
         * @param {object} entry Entry with status and beats
         * @returns {string} Bootstrap badge class
         */
        entryUptimePillClass(entry) {
            if (entry.status === 0) {
                return "pill-danger";
            }
            if (entry.status === 2 || entry.status === null) {
                return "pill-warning";
            }
            return "pill-success";
        },

        /**
         * Remove the specified group
         * @param {number} index Index of group to remove
         * @returns {void}
         */
        removeGroup(index) {
            this.$root.publicGroupList.splice(index, 1);
        },

        /**
         * Remove a monitor from a group
         * @param {number} groupIndex Index of group to remove monitor from
         * @param {number} index Index of monitor to remove
         * @returns {void}
         */
        removeMonitor(groupIndex, index) {
            this.$root.publicGroupList[groupIndex].monitorList.splice(index, 1);
        },

        /**
         * Should a link to the monitor be shown?
         * Attempts to guess if a link should be shown based upon if
         * sendUrl is set and if the URL is default or not.
         * @param {object} monitor Monitor to check
         * @param {boolean} ignoreSendUrl Should the presence of the sendUrl
         * property be ignored. This will only work in edit mode.
         * @returns {boolean} Should the link be shown
         */
        showLink(monitor, ignoreSendUrl = false) {
            // We must check if there are any elements in monitorList to
            // prevent undefined errors if it hasn't been loaded yet
            if (this.$parent.editMode && ignoreSendUrl && Object.keys(this.$root.monitorList).length) {
                return (
                    this.$root.monitorList[monitor.element.id].type === "http" ||
                    this.$root.monitorList[monitor.element.id].type === "keyword" ||
                    this.$root.monitorList[monitor.element.id].type === "json-query"
                );
            }
            return monitor.element.sendUrl && monitor.element.url && monitor.element.url !== "https://";
        },

        /**
         * Returns formatted certificate expiry or Bad cert message
         * @param {object} monitor Monitor to show expiry for
         * @returns {string} Certificate expiry message
         */
        formattedCertExpiryMessage(monitor) {
            if (monitor?.element?.validCert && monitor?.element?.certExpiryDaysRemaining) {
                return this.$t("days", monitor.element.certExpiryDaysRemaining);
            } else if (monitor?.element?.validCert === false) {
                return this.$t("noOrBadCertificate");
            } else {
                return this.$t("unknownDays");
            }
        },

        /**
         * Returns the status of the last heartbeat
         * @param {number} monitorId Id of the monitor to get status for
         * @returns {number} Status of the last heartbeat
         */
        statusOfLastHeartbeat(monitorId) {
            let heartbeats = this.$root.heartbeatList[monitorId] ?? [];
            let lastHeartbeat = heartbeats[heartbeats.length - 1];
            return lastHeartbeat?.status;
        },

        /**
         * Returns certificate expiry color based on days remaining
         * @param {object} monitor Monitor to show expiry for
         * @returns {string} Color for certificate expiry
         */
        certExpiryColor(monitor) {
            if (monitor?.element?.validCert && monitor.element.certExpiryDaysRemaining > 7) {
                return "#059669";
            }
            return "#DC2626";
        },

        /**
         * Update group properties
         * @param {number} groupIndex Index of group to update
         * @param {object} updates Object with properties to update
         * @returns {void}
         */
        updateGroup(groupIndex, updates) {
            Object.assign(this.$root.publicGroupList[groupIndex], updates);
        },

        /**
         * Get unique identifier for a group
         * @param {object} group object
         * @returns {string} group identifier
         */
        getGroupIdentifier(group) {
            // Use the name directly if available
            if (group.name) {
                // Only remove spaces and use encodeURIComponent for URL safety
                const cleanName = group.name.replace(/\s+/g, "");
                return cleanName;
            }
            // Fallback to ID or index
            return group.id ? `group${group.id}` : `group${this.$root.publicGroupList.indexOf(group)}`;
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars";

.extra-info {
    display: flex;
    margin-bottom: 0.5rem;
}

.extra-info > div > div:first-child {
    margin-left: 0 !important;
}

.no-monitor-msg {
    position: absolute;
    width: 100%;
    top: 20px;
    left: 0;
}

// Group Card - like maintenance page
.group-card {
    background: white;
    border: 1px solid $zinc-100;
    border-radius: 0.5rem;
    overflow: hidden;

    .dark & {
        background: $dark-bg;
        border-color: $dark-border-color;
    }
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.625rem 0.75rem;
    border-bottom: 1px solid $zinc-100;

    .dark & {
        border-bottom-color: $dark-border-color;
    }
}

.group-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: $zinc-800;

    .dark & {
        color: $zinc-200;
    }
}

.group-body {
    padding: 0.75rem;
}

.monitor-list {
    min-height: 36px;
}

// Compact monitor items
.item {
    padding: 0.625rem 0.75rem;
    background: $zinc-50;
    border-radius: 0.375rem;
    margin-bottom: 0.5rem;

    &:last-child {
        margin-bottom: 0;
    }

    .dark & {
        background: $zinc-800;
    }
}

.monitor-header .row {
    --bs-gutter-y: 0;
}

.item-name {
    padding-left: 4px;
    padding-right: 4px;
    margin: 0;
    display: inline-block;
    font-size: 0.8125rem;
    font-weight: 500;
}

.btn-link {
    color: #bbbbbb;
    margin-left: 5px;
}

.link-active {
    color: $primary;
}

.flip-list-move {
    transition: transform 0.5s;
}

.no-move {
    transition: transform 0s;
}

.drag {
    color: #bbb;
    cursor: grab;
}

.remove {
    color: $danger;
}

.title-section {
    display: flex;
    align-items: center;
}

.mobile {
    .item {
        padding: 13px 0 10px;
    }

    .group-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

// Health Check Entries
.bar-column {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.main-uptime-pill {
    flex-shrink: 0;
    font-size: 0.5625rem;
    font-weight: 600;
    letter-spacing: 0.02em;

    &.bg-success {
        background: rgba($emerald-500, 0.1) !important;
        color: $emerald-500 !important;
    }

    &.bg-warning {
        background: rgba($warning, 0.1) !important;
        color: $warning !important;
    }

    &.bg-danger {
        background: rgba($danger, 0.1) !important;
        color: $danger !important;
    }

    &.bg-maintenance {
        background: rgba($maintenance, 0.1) !important;
        color: $maintenance !important;
    }

    &.bg-secondary {
        background: rgba($zinc-500, 0.1) !important;
        color: $zinc-500 !important;
    }
}

.monitor-header {
    &.clickable {
        cursor: pointer;
        
        &:hover {
            background: rgba($zinc-500, 0.03);
        }

        .dark &:hover {
            background: rgba($zinc-400, 0.05);
        }
    }
}

.expand-icon {
    width: 0.75rem;
    font-size: 0.625rem;
    color: $zinc-400;
    transition: transform 0.15s;

    .dark & {
        color: $zinc-500;
    }
}

.entries-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1rem;
    height: 1rem;
    padding: 0 0.25rem;
    margin-left: 0.375rem;
    font-size: 0.5625rem;
    font-weight: 600;
    color: $zinc-500;
    background: $zinc-100;
    border-radius: 999px;

    .dark & {
        color: $zinc-400;
        background: $zinc-800;
    }
}

.health-entries-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0 0.25rem 0;
    margin-top: 0.375rem;
    border-top: 1px solid $zinc-50;

    .dark & {
        border-top-color: $zinc-800;
    }
}

.health-entry-row {
    align-items: center;
    padding: 0.25rem 0;

    .entry-info {
        display: flex;
        align-items: center;
        gap: 0.375rem;
    }

    .entry-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;

        &.dot-up { background: #10b981; }
        &.dot-down { background: #ef4444; }
        &.dot-pending { background: $zinc-400; }
    }

    .entry-name {
        font-size: 0.75rem;
        font-weight: 500;
        color: $zinc-600;

        .dark & {
            color: $zinc-400;
        }
    }

    .entry-uptime-pill {
        font-size: 0.5625rem;
        font-weight: 600;
        padding: 0.125rem 0.375rem;
        min-width: 36px;
        letter-spacing: 0.02em;

        &.pill-success {
            background: rgba($emerald-500, 0.1);
            color: $emerald-500;
        }

        &.pill-warning {
            background: rgba($warning, 0.1);
            color: $warning;
        }

        &.pill-danger {
            background: rgba($danger, 0.1);
            color: $danger;
        }
    }
}

.bg-maintenance {
    background-color: $maintenance;
}
</style>
