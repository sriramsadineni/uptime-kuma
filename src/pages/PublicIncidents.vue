<template>
    <div v-if="loadedTheme" class="col-12 col-lg-8 mx-auto mt-4 mb-5">
        <!-- Header -->
        <PublicHeader
            :slug="slug"
            :title="config.title"
            :logo-url="logoURL"
            active-tab="incidents"
            contact-url="mailto:support@example.com"
        />

        <!-- Page Title -->
        <div class="text-center mb-4">
            <h1 class="page-title">{{ $t("Previous Incidents") }}</h1>
            
            <!-- Month Navigation -->
            <div class="month-nav">
                <button class="month-nav-btn" @click="navigateMonths(-3)">
                    <span>‹</span>
                </button>
                <span class="month-range">{{ monthRangeText }}</span>
                <button class="month-nav-btn" @click="navigateMonths(3)">
                    <span>›</span>
                </button>
            </div>
        </div>

        <!-- Month Cards -->
        <div class="months-container">
            <div
                v-for="month in visibleMonths"
                :key="month.key"
                class="month-card"
            >
                <div class="month-header">{{ month.label }}</div>
                <div class="month-body">
                    <div v-if="loading && !loadedMonths[month.key]" class="no-incidents">
                        <div class="spinner-border spinner-border-sm text-secondary" role="status">
                            <span class="visually-hidden">{{ $t("Loading...") }}</span>
                        </div>
                    </div>
                    <div v-else-if="getIncidentsForMonth(month).length === 0" class="no-incidents">
                        <font-awesome-icon icon="check-circle" class="text-success me-2" />
                        <span>{{ $t("No incidents reported") }}</span>
                    </div>
                    <div v-else class="incidents-list">
                        <div
                            v-for="incident in getIncidentsForMonth(month)"
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import dayjs from "dayjs";
import { marked } from "marked";
import DOMPurify from "dompurify";
import datetimeMixin from "../mixins/datetime";
import PublicHeader from "../components/PublicHeader.vue";
import { getResBaseURL } from "../util-frontend";

export default {
    components: {
        PublicHeader,
    },
    mixins: [datetimeMixin],
    data() {
        return {
            slug: null,
            config: {},
            incidents: [],
            loadedTheme: false,
            loading: false,
            loadedMonths: {},
            startMonth: dayjs().startOf("month"),
        };
    },
    computed: {
        statusPageUrl() {
            return "/status/" + encodeURIComponent(this.slug || "default");
        },
        logoURL() {
            if (!this.config.icon) {
                return null;
            }
            if (this.config.icon.startsWith("data:")) {
                return this.config.icon;
            }
            return getResBaseURL() + this.config.icon;
        },
        visibleMonths() {
            const months = [];
            for (let i = 0; i < 3; i++) {
                const month = this.startMonth.subtract(i, "month");
                months.push({
                    key: month.format("YYYY-MM"),
                    label: month.format("MMMM YYYY"),
                    start: month.startOf("month"),
                    end: month.endOf("month"),
                });
            }
            return months;
        },
        monthRangeText() {
            const first = this.startMonth.subtract(2, "month");
            const last = this.startMonth;
            if (first.year() === last.year()) {
                return `${first.format("MMM")} ${first.year()} to ${last.format("MMM")} ${last.year()}`;
            }
            return `${first.format("MMM YYYY")} to ${last.format("MMM YYYY")}`;
        },
    },
    async created() {
        this.slug = this.$route.params.slug;
        await this.loadConfig();
        await this.loadIncidents();
    },
    methods: {
        async loadConfig() {
            try {
                const res = await axios.get(`/api/status-page/${this.slug}`);
                this.config = res.data.config || {};
                
                // Apply theme
                if (this.config.theme) {
                    document.body.classList.add(this.config.theme);
                }
                this.loadedTheme = true;
            } catch (error) {
                console.error("Failed to load status page config:", error);
                this.loadedTheme = true;
            }
        },
        async loadIncidents() {
            this.loading = true;
            try {
                const res = await axios.get(`/api/status-page/${this.slug}/incident-history`);
                this.incidents = res.data.incidents || [];
                // Mark all months as loaded
                this.visibleMonths.forEach(month => {
                    this.loadedMonths[month.key] = true;
                });
            } catch (error) {
                console.error("Failed to load incidents:", error);
            }
            this.loading = false;
        },
        navigateMonths(offset) {
            this.startMonth = this.startMonth.add(offset, "month");
        },
        getIncidentsForMonth(month) {
            return this.incidents.filter(incident => {
                const date = dayjs(incident.createdDate);
                return date.isSame(month.start, "month");
            });
        },
        shortDate(value) {
            return this.datetimeFormat(value, "MMM D, HH:mm");
        },
        formatDateTime(value) {
            return this.datetimeFormat(value, "MMM D, YYYY [at] HH:mm");
        },
        getIncidentHTML(content) {
            if (content != null) {
                return DOMPurify.sanitize(marked(content));
            }
            return "";
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

// Page title
.page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: $zinc-900;
    margin-bottom: 1rem;

    .dark & {
        color: $zinc-100;
    }
}

// Month navigation
.month-nav {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.375rem;
    background: $zinc-100;
    border-radius: 0.5rem;

    .dark & {
        background: $zinc-800;
    }
}

.month-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    background: white;
    color: $zinc-600;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 1.25rem;
    line-height: 1;

    &:hover {
        background: $zinc-50;
        color: $zinc-800;
    }

    .dark & {
        background: $zinc-700;
        color: $zinc-400;

        &:hover {
            background: $zinc-600;
            color: $zinc-200;
        }
    }
}

.month-range {
    font-size: 0.875rem;
    font-weight: 500;
    color: $zinc-700;
    min-width: 160px;
    text-align: center;

    .dark & {
        color: $zinc-300;
    }
}

// Month cards
.months-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.month-card {
    background: white;
    border: 1px solid $zinc-100;
    border-radius: 0.5rem;
    overflow: hidden;

    .dark & {
        background: $dark-bg;
        border-color: $dark-border-color;
    }
}

.month-header {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: $zinc-800;
    border-bottom: 1px solid $zinc-100;

    .dark & {
        color: $zinc-200;
        border-bottom-color: $dark-border-color;
    }
}

.month-body {
    padding: 0.75rem;
}

.no-incidents {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem;
    font-size: 0.8125rem;
    color: $zinc-500;

    .dark & {
        color: $zinc-400;
    }
}

// Incidents list
.incidents-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.incident-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    background: $zinc-50;
    border-radius: 0.375rem;

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
</style>
