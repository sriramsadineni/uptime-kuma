<template>
    <div v-if="loadedTheme">
        <!-- Header -->
       

        <div class="col-12 col-lg-8 mx-auto mt-3 mb-4 px-3">
            <PublicHeader
            :slug="slug"
            :title="config.title"
            :logo-url="logoURL"
            active-tab="status"
            contact-url="mailto:support@example.com"
        />
            <!-- Back link -->
            <a :href="statusPageUrl" class="back-link" data-testid="back-to-status">
                <span>←</span>
                <span>{{ $t("Back to status page") }}</span>
            </a>

            <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <template v-else-if="monitor">
            <!-- Hero section -->
            <div class="hero-section">
                <div class="hero-title">
                    <span class="status-dot" :class="statusDotClass"></span>
                    <h1>{{ monitor.name }}</h1>
                </div>
                <p class="hero-status">{{ statusMessage }}</p>
            </div>

            <!-- Uptime stats -->
            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-label">{{ $t("hours", 24) }}</div>
                    <div class="stat-value">
                        <Uptime :monitor="monitor" type="24" class="uptime-value" />
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">{{ $t("days", 30) }}</div>
                    <div class="stat-value">
                        <Uptime :monitor="monitor" type="720" class="uptime-value" />
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">{{ $t("years", 1) }}</div>
                    <div class="stat-value">
                        <Uptime :monitor="monitor" type="1y" class="uptime-value" />
                    </div>
                </div>
            </div>

            <!-- Main heartbeat bar -->
            <div class="section-card">
                <HeartbeatBar size="big" :monitor-id="monitor.id" />
            </div>

            <!-- Response time chart -->
            <div class="section-card">
                <h2 class="section-title">{{ $t("Ping") }}</h2>
                <PingChart :monitor-id="monitor.id" />
            </div>

            <!-- Health check entries -->
            <div v-if="monitor.healthCheckEntries && monitor.healthCheckEntries.length > 0" class="section-card">
                <h2 class="section-title">{{ $t("Health Check Entries") }}</h2>
                <div class="entries-list">
                    <div
                        v-for="entry in monitor.healthCheckEntries"
                        :key="entry.key"
                        class="entry-item"
                    >
                        <div class="entry-info">
                            <span class="entry-dot" :class="entryDotClass(entry)"></span>
                            <span class="entry-name">{{ entry.key }}</span>
                            <span
                                v-if="entryUptimePercent(entry) !== null"
                                class="entry-uptime"
                                :class="entryUptimePillClass(entry)"
                            >
                                {{ entryUptimePercent(entry) }}%
                            </span>
                        </div>
                        <div class="entry-bar">
                            <HeartbeatBar size="mid" :heartbeat-list="entry.beats" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent events -->
            <div class="section-card">
                <h2 class="section-title">{{ $t("Recent Events") }}</h2>
                <div v-if="displayedHeartbeats.length === 0" class="empty-state">
                    {{ $t("No important events") }}
                </div>
                <div v-else class="events-list">
                    <div
                        v-for="(beat, index) in displayedHeartbeats.slice(0, 10)"
                        :key="index"
                        class="event-item"
                    >
                        <Status :status="beat.status" />
                        <span class="event-time">
                            <Datetime :value="beat.time" />
                        </span>
                        <span class="event-msg">{{ beat.msg || "—" }}</span>
                    </div>
                </div>
            </div>
        </template>

            <div v-else-if="!loading" class="empty-state">
                {{ $t("notAvailableShort") }}
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { defineAsyncComponent } from "vue";
import HeartbeatBar from "../components/HeartbeatBar.vue";
import Uptime from "../components/Uptime.vue";
import Status from "../components/Status.vue";
import Datetime from "../components/Datetime.vue";
import PublicHeader from "../components/PublicHeader.vue";
import { getResBaseURL } from "../util-frontend";

const PingChart = defineAsyncComponent(() => import("../components/PingChart.vue"));

export default {
    components: {
        HeartbeatBar,
        Uptime,
        Status,
        Datetime,
        PingChart,
        PublicHeader,
    },
    data() {
        return {
            slug: null,
            monitorId: null,
            config: {},
            monitor: null,
            loadedTheme: false,
            loading: true,
            error: null,
        };
    },
    computed: {
        statusPageUrl() {
            const s = this.slug || "default";
            return "/status/" + encodeURIComponent(s);
        },
        logoURL() {
            if (!this.config.icon) {
                return null;
            }
            if (this.config.icon.startsWith("http")) {
                return this.config.icon;
            }
            return getResBaseURL() + this.config.icon;
        },
        displayedHeartbeats() {
            if (!this.monitor || !this.$root.heartbeatList) {
                return [];
            }
            const list = this.$root.heartbeatList[this.monitor.id] || [];
            return [...list].reverse();
        },
        lastHeartbeatStatus() {
            if (!this.monitor || !this.$root.lastHeartbeatList) {
                return 2;
            }
            const beat = this.$root.lastHeartbeatList[this.monitor.id];
            return beat ? beat.status : 2;
        },
        statusDotClass() {
            const s = this.lastHeartbeatStatus;
            if (s === 1) {
                return "bg-success";
            }
            if (s === 0) {
                return "bg-danger";
            }
            if (s === 3) {
                return "bg-secondary";
            }
            return "bg-warning";
        },
        statusMessage() {
            const s = this.lastHeartbeatStatus;
            if (s === 1) {
                return this.$t("All Systems Operational");
            }
            if (s === 0) {
                return this.$t("Degraded Service");
            }
            if (s === 3) {
                return this.$t("statusMaintenance");
            }
            return this.$t("Pending");
        },
    },
    async mounted() {
        this.slug = this.$route.params.slug || "default";
        this.monitorId = parseInt(this.$route.params.id, 10);

        if (isNaN(this.monitorId)) {
            this.error = this.$t("Invalid monitor ID");
            this.loading = false;
            this.applyTheme("auto");
            return;
        }

        try {
            const res = await axios.get(
                "/api/status-page/" + encodeURIComponent(this.slug) + "/monitor/" + this.monitorId
            );
            this.config = res.data.config || {};
            this.monitor = res.data.monitor || null;
            this.$root.heartbeatList = res.data.heartbeatList || {};
            this.$root.uptimeList = res.data.uptimeList || {};
            if (this.monitor && this.monitor.id && !(this.monitor.id in this.$root.heartbeatList)) {
                this.$root.heartbeatList[this.monitor.id] = [];
            }
            if (this.monitor && this.$root.heartbeatList[this.monitor.id]?.length) {
                this.$root.lastHeartbeatList = this.$root.lastHeartbeatList || {};
                const list = this.$root.heartbeatList[this.monitor.id];
                this.$root.lastHeartbeatList[this.monitor.id] = list[list.length - 1];
            }
            this.applyTheme(this.config.theme || "auto");
        } catch (err) {
            this.error = err.response?.data?.message || err.message || this.$t("notAvailableShort");
        } finally {
            this.loading = false;
        }
    },
    methods: {
        applyTheme(theme) {
            this.$root.statusPageTheme = theme || "auto";
            this.loadedTheme = true;
        },
        entryUptimePercent(entry) {
            const beats = entry.beats;
            if (!beats || beats.length === 0) {
                return null;
            }
            const up = beats.filter((b) => b.status === 1).length;
            return String(Math.round((up / beats.length) * 10000) / 100);
        },
        entryUptimePillClass(entry) {
            if (entry.status === 0) {
                return "pill-danger";
            }
            if (entry.status === 2 || entry.status === null) {
                return "pill-warning";
            }
            return "pill-success";
        },
        entryDotClass(entry) {
            if (entry.status === 1) {
                return "dot-success";
            }
            if (entry.status === 0) {
                return "dot-danger";
            }
            return "dot-warning";
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

// Back link
.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: $zinc-500;
    text-decoration: none;
    margin-bottom: 1rem;

    &:hover { color: $primary; }
    .dark & { color: $zinc-400; }
}

// Hero section
.hero-section {
    text-align: center;
    margin-bottom: 1rem;
}

.hero-title {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;

    h1 {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0;
        color: $zinc-800;
        .dark & { color: $zinc-200; }
    }
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.hero-status {
    font-size: 0.75rem;
    color: $zinc-500;
    margin: 0;
    .dark & { color: $zinc-400; }
}

// Stats row
.stats-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.stat-card {
    flex: 1;
    background: white;
    border: 1px solid $zinc-100;
    border-radius: 0.5rem;
    padding: 0.625rem;
    text-align: center;

    .dark & {
        background: $dark-bg;
        border-color: $dark-border-color;
    }
}

.stat-label {
    font-size: 0.625rem;
    color: $zinc-500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 0.125rem;
    .dark & { color: $zinc-400; }
}

.stat-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: $zinc-800;
    .dark & { color: $zinc-200; }
}

.uptime-value {
    font-size: 0.875rem;
    font-weight: 600;
}

// Section card
.section-card {
    background: white;
    border: 1px solid $zinc-100;
    border-radius: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.75rem;

    .dark & {
        background: $dark-bg;
        border-color: $dark-border-color;
    }
}

.section-title {
    font-size: 0.6875rem;
    font-weight: 600;
    color: $zinc-500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 0 0 0.625rem 0;
    .dark & { color: $zinc-400; }
}

// Entries list
.entries-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.entry-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.625rem;
    background: $zinc-50;
    border-radius: 0.375rem;

    .dark & { background: $zinc-800; }
}

.entry-info {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-width: 140px;
    flex-shrink: 0;
}

.entry-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;

    &.dot-success { background: $emerald-500; }
    &.dot-danger { background: $danger; }
    &.dot-warning { background: $warning; }
}

.entry-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: $zinc-700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .dark & { color: $zinc-300; }
}

.entry-uptime {
    font-size: 0.5625rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    border-radius: 999px;
    letter-spacing: 0.02em;
    flex-shrink: 0;

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

.entry-bar {
    flex: 1;
    min-width: 0;
}

// Events list
.events-list {
    display: flex;
    flex-direction: column;
}

.event-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid $zinc-100;

    &:last-child { border-bottom: none; }
    .dark & { border-bottom-color: $dark-border-color; }
}

.event-time {
    font-size: 0.6875rem;
    color: $zinc-500;
    flex-shrink: 0;
    .dark & { color: $zinc-400; }
}

.event-msg {
    font-size: 0.75rem;
    color: $zinc-700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .dark & { color: $zinc-300; }
}

// Empty state
.empty-state {
    text-align: center;
    padding: 1.5rem;
    color: $zinc-500;
    font-size: 0.75rem;
    .dark & { color: $zinc-400; }
}

// Mobile adjustments
@media (max-width: 576px) {
    .stats-row {
        flex-direction: column;
    }

    .entry-item {
        flex-direction: column;
        align-items: stretch;
    }

    .entry-info {
        margin-bottom: 0.375rem;
    }
}
</style>
