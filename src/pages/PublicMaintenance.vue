<template>
    <div v-if="loadedTheme" class="col-12 col-lg-8 mx-auto mt-4 mb-5">
        <!-- Header -->
        <PublicHeader
            :slug="slug"
            :title="config.title"
            :logo-url="logoURL"
            active-tab="maintenance"
            contact-url="mailto:support@example.com"
        />

        <!-- Page Title -->
        <div class="text-center mb-4">
            <h1 class="page-title">{{ $t("Maintenance") }}</h1>
            
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
                    <div v-if="getMaintenanceForMonth(month).length === 0" class="no-maintenance">
                        <font-awesome-icon icon="check-circle" class="text-success me-2" />
                        <span>{{ month.isFuture ? $t("No maintenance scheduled") : $t("No maintenance") }}</span>
                    </div>
                    <div v-else class="maintenance-list">
                        <div
                            v-for="maintenance in getMaintenanceForMonth(month)"
                            :key="maintenance.id"
                            class="maintenance-item"
                        >
                            <span class="maintenance-icon">
                                <font-awesome-icon icon="wrench" />
                            </span>
                            <div class="maintenance-info">
                                <div class="maintenance-header-row">
                                    <span class="maintenance-title">{{ maintenance.title }}</span>
                                    <span class="maintenance-status" :class="getStatusClass(maintenance)">
                                        {{ getStatusText(maintenance) }}
                                    </span>
                                </div>
                                <!-- eslint-disable-next-line vue/no-v-html -->
                                <div v-if="maintenance.description" class="maintenance-desc" v-html="getMaintenanceHTML(maintenance.description)"></div>
                                <div class="maintenance-meta">
                                    <span class="maintenance-time">{{ formatMaintenanceTime(maintenance) }}</span>
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
            maintenanceList: [],
            loadedTheme: false,
            startMonth: dayjs().startOf("month"),
        };
    },
    computed: {
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
            const now = dayjs();
            for (let i = 0; i < 3; i++) {
                const month = this.startMonth.add(i, "month");
                months.push({
                    key: month.format("YYYY-MM"),
                    label: month.format("MMMM YYYY"),
                    start: month.startOf("month"),
                    end: month.endOf("month"),
                    isFuture: month.isAfter(now, "month"),
                    isCurrent: month.isSame(now, "month"),
                });
            }
            return months;
        },
        monthRangeText() {
            const first = this.startMonth;
            const last = this.startMonth.add(2, "month");
            if (first.year() === last.year()) {
                return `${first.format("MMM")} ${first.year()} to ${last.format("MMM")} ${last.year()}`;
            }
            return `${first.format("MMM YYYY")} to ${last.format("MMM YYYY")}`;
        },
    },
    async created() {
        this.slug = this.$route.params.slug;
        await this.loadConfig();
    },
    methods: {
        async loadConfig() {
            try {
                const res = await axios.get(`/api/status-page/${this.slug}`);
                this.config = res.data.config || {};
                this.maintenanceList = res.data.maintenanceList || [];
                
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
        navigateMonths(offset) {
            this.startMonth = this.startMonth.add(offset, "month");
        },
        getMaintenanceForMonth(month) {
            return this.maintenanceList.filter((m) => {
                const slots = this.getMaintenanceTimeslots(m);
                return slots.some((slot) => {
                    const start = dayjs(slot.startDate || slot.start);
                    const end = dayjs(slot.endDate || slot.end);
                    return start.isBefore(month.end) && end.isAfter(month.start);
                });
            });
        },
        getMaintenanceTimeslots(maintenance) {
            if (maintenance.timeslotList && maintenance.timeslotList.length > 0) {
                return maintenance.timeslotList;
            }
            const start = maintenance.dateRange?.[0] || maintenance.start_date || maintenance.startDate;
            const end = maintenance.dateRange?.[1] || maintenance.end_date || maintenance.endDate;
            if (start && end) {
                return [{ startDate: start, endDate: end }];
            }
            return [];
        },
        formatMaintenanceTime(maintenance) {
            if (maintenance.strategy === "manual") {
                return this.$t("strategyManual");
            }
            const slots = this.getMaintenanceTimeslots(maintenance);
            if (slots.length === 0) {
                return this.$t("No schedule");
            }
            const parts = slots.slice(0, 2).map((slot) => {
                const start = dayjs(slot.startDate || slot.start);
                const end = dayjs(slot.endDate || slot.end);
                return `${start.format("MMM D, HH:mm")} – ${end.format("MMM D, HH:mm")}`;
            });
            if (slots.length > 2) {
                parts.push("…");
            }
            return parts.join(" · ");
        },
        getMaintenanceHTML(content) {
            if (content != null) {
                return DOMPurify.sanitize(marked(content));
            }
            return "";
        },
        getStatusClass(maintenance) {
            const status = maintenance.status || "";
            if (status === "scheduled") {
                return "status-scheduled";
            }
            if (status === "under-maintenance") {
                return "status-ongoing";
            }
            if (status === "ended") {
                return "status-completed";
            }
            if (status === "inactive") {
                return "status-inactive";
            }
            return "status-scheduled";
        },
        getStatusText(maintenance) {
            const status = maintenance.status || "";
            if (status === "scheduled") {
                return this.$t("Scheduled");
            }
            if (status === "under-maintenance") {
                return this.$t("Ongoing");
            }
            if (status === "ended") {
                return this.$t("Completed");
            }
            if (status === "inactive") {
                return this.$t("Inactive");
            }
            return this.$t("Scheduled");
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

.no-maintenance {
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

// Maintenance list
.maintenance-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.maintenance-item {
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

.maintenance-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($blue-500, 0.1);
    border-radius: 0.25rem;
    color: $blue-500;
    font-size: 0.5625rem;
    margin-top: 0.125rem;
}

.maintenance-info {
    flex: 1;
    min-width: 0;
}

.maintenance-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
}

.maintenance-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: $zinc-800;

    .dark & {
        color: $zinc-200;
    }
}

.maintenance-desc {
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

.maintenance-meta {
    font-size: 0.6875rem;
}

.maintenance-time {
    color: $zinc-500;

    .dark & {
        color: $zinc-400;
    }
}

.maintenance-status {
    flex-shrink: 0;
    font-size: 0.5625rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.03em;

    &.status-scheduled {
        background: rgba($blue-500, 0.1);
        color: $blue-500;
    }

    &.status-ongoing {
        background: rgba($amber-500, 0.1);
        color: $amber-500;
    }

    &.status-completed {
        background: rgba($emerald-500, 0.1);
        color: $emerald-500;
    }

    &.status-inactive {
        background: rgba($zinc-500, 0.1);
        color: $zinc-500;
    }
}
</style>
