<template>
    <div data-testid="incident-group">
        <div v-if="loading && incidents.length === 0" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-secondary" role="status">
                <span class="visually-hidden">{{ $t("Loading...") }}</span>
            </div>
        </div>

        <div v-else-if="incidents.length === 0" class="text-center py-4 text-muted small">
            {{ $t("No incidents recorded") }}
        </div>

        <div v-else>
            <div
                v-for="incident in incidents"
                :key="incident.id"
                class="incident-item"
            >
                <span class="incident-dot" :class="dotClass(incident)"></span>
                <div class="incident-info">
                    <div class="incident-header-row">
                        <span class="incident-title">{{ incident.title }}</span>
                        <span class="incident-status" :class="statusClass(incident)">
                            {{ incident.active ? $t("Active") : $t("Resolved") }}
                        </span>
                    </div>
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <div v-if="incident.content" class="incident-content" v-html="getIncidentHTML(incident.content)"></div>
                    <div class="incident-meta">
                        <span class="incident-time">{{ formatDateTime(incident.createdDate) }}</span>
                        <span v-if="incident.lastUpdatedDate" class="incident-updated">
                            · {{ $t("Updated") }} {{ formatDateTime(incident.lastUpdatedDate) }}
                        </span>
                    </div>
                    <div v-if="editMode" class="incident-actions">
                        <button
                            v-if="incident.active"
                            class="btn btn-xs btn-success"
                            @click="$emit('resolve-incident', incident)"
                        >
                            {{ $t("Resolve") }}
                        </button>
                        <button
                            class="btn btn-xs btn-outline-secondary"
                            @click="$emit('edit-incident', incident)"
                        >
                            {{ $t("Edit") }}
                        </button>
                        <button
                            class="btn btn-xs btn-outline-danger"
                            @click="$emit('delete-incident', incident)"
                        >
                            {{ $t("Delete") }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { marked } from "marked";
import DOMPurify from "dompurify";
import datetimeMixin from "../mixins/datetime";

export default {
    name: "IncidentHistory",
    mixins: [datetimeMixin],
    props: {
        incidents: {
            type: Array,
            default: () => [],
        },
        editMode: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["edit-incident", "delete-incident", "resolve-incident"],
    methods: {
        getIncidentHTML(content) {
            if (content != null) {
                return DOMPurify.sanitize(marked(content));
            }
            return "";
        },

        formatDateTime(value) {
            return this.datetimeFormat(value, "MMM D, YYYY [at] HH:mm");
        },

        dotClass(incident) {
            if (incident.active) {
                if (incident.style === "danger") {
                    return "dot-danger";
                }
                if (incident.style === "warning") {
                    return "dot-warning";
                }
                return "dot-primary";
            }
            return "dot-success";
        },

        statusClass(incident) {
            if (incident.active) {
                if (incident.style === "danger") {
                    return "status-danger";
                }
                if (incident.style === "warning") {
                    return "status-warning";
                }
                return "status-primary";
            }
            return "status-success";
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.incident-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
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

.incident-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-top: 0.375rem;

    &.dot-danger { background: $danger; }
    &.dot-warning { background: $warning; }
    &.dot-primary { background: $primary; }
    &.dot-success { background: $emerald-500; }
}

.incident-info {
    flex: 1;
    min-width: 0;
}

.incident-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
}

.incident-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: $zinc-800;

    .dark & {
        color: $zinc-200;
    }
}

.incident-status {
    flex-shrink: 0;
    font-size: 0.5625rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.03em;

    &.status-danger {
        background: rgba($danger, 0.1);
        color: $danger;
    }

    &.status-warning {
        background: rgba($warning, 0.1);
        color: $warning;
    }

    &.status-primary {
        background: rgba($primary, 0.1);
        color: $primary;
    }

    &.status-success {
        background: rgba($emerald-500, 0.1);
        color: $emerald-500;
    }
}

.incident-content {
    font-size: 0.75rem;
    color: $zinc-600;
    line-height: 1.4;
    margin-bottom: 0.25rem;

    .dark & {
        color: $zinc-400;
    }

    p {
        margin: 0;
    }
}

.incident-meta {
    font-size: 0.6875rem;
    color: $zinc-500;

    .dark & {
        color: $zinc-400;
    }
}

.incident-time {
    color: $zinc-500;

    .dark & {
        color: $zinc-400;
    }
}

.incident-updated {
    color: $zinc-400;

    .dark & {
        color: $zinc-500;
    }
}

.incident-actions {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.375rem;
}

.btn-xs {
    font-size: 0.6875rem;
    padding: 0.125rem 0.375rem;
}
</style>
