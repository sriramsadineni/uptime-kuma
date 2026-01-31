<template>
    <div v-if="entries.length > 0" class="health-check-entries">
        <h4 class="mb-3">{{ $t("Health Check Entries") }}</h4>
        <div class="entries-list">
            <div
                v-for="entry in entries"
                :key="entry.key"
                class="entry-item"
                :class="{ 'entry-up': entry.status === 1, 'entry-down': entry.status === 0, 'entry-pending': entry.status === 2 }"
            >
                <div class="entry-header">
                    <span class="entry-name">{{ entry.key }}</span>
                    <span
                        class="entry-status badge"
                        :class="{
                            'bg-success': entry.status === 1,
                            'bg-danger': entry.status === 0,
                            'bg-warning': entry.status === 2
                        }"
                    >
                        {{ getStatusText(entry.status) }}
                    </span>
                </div>
                <div v-if="entry.msg" class="entry-message">
                    {{ entry.msg }}
                </div>
                <div v-if="entry.time" class="entry-time">
                    {{ formatTime(entry.time) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import dayjs from "dayjs";

export default {
    props: {
        /** @type {number} Monitor ID */
        monitorId: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            entries: [],
        };
    },
    mounted() {
        // Listen for entry heartbeats
        this.$root.getSocket().on("heartbeatEntry", this.onHeartbeatEntry);

        // Fetch initial entry data
        this.fetchEntryHeartbeats();
    },
    beforeUnmount() {
        this.$root.getSocket().off("heartbeatEntry", this.onHeartbeatEntry);
    },
    methods: {
        /**
         * Handle incoming entry heartbeat
         * @param {object} data Heartbeat data
         */
        onHeartbeatEntry(data) {
            if (data.monitorID !== this.monitorId) {
                return;
            }

            // Update or add entry
            const existingIndex = this.entries.findIndex(e => e.key === data.entryKey);
            if (existingIndex >= 0) {
                this.entries[existingIndex] = {
                    key: data.entryKey,
                    status: data.status,
                    msg: data.msg,
                    time: data.time,
                };
            } else {
                this.entries.push({
                    key: data.entryKey,
                    status: data.status,
                    msg: data.msg,
                    time: data.time,
                });
            }
        },

        /**
         * Fetch latest entry heartbeats from server
         */
        async fetchEntryHeartbeats() {
            this.$root.getSocket().emit("getEntryHeartbeats", this.monitorId, (res) => {
                if (res.ok) {
                    this.entries = res.entries;
                }
            });
        },

        /**
         * Get status text
         * @param {number} status Status code
         * @returns {string} Status text
         */
        getStatusText(status) {
            switch (status) {
                case 1:
                    return this.$t("Up");
                case 0:
                    return this.$t("Down");
                case 2:
                    return this.$t("Pending");
                default:
                    return this.$t("Unknown");
            }
        },

        /**
         * Format timestamp
         * @param {string} time Time string
         * @returns {string} Formatted time
         */
        formatTime(time) {
            return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.health-check-entries {
    margin-top: 1rem;

    h4 {
        font-weight: 600;
        color: $zinc-900;

        .dark & {
            color: $zinc-100;
        }
    }
}

.entries-list {
    display: grid;
    gap: 0.5rem;
}

.entry-item {
    padding: 0.75rem 1rem;
    border-radius: $border-radius;
    border: 1px solid $zinc-200;
    background-color: white;
    transition: all 0.15s ease-in-out;

    .dark & {
        border-color: $dark-border-color;
        background-color: $dark-bg;
    }

    &.entry-up {
        border-left: 3px solid $emerald-500;
    }

    &.entry-down {
        border-left: 3px solid $red-500;
    }

    &.entry-pending {
        border-left: 3px solid $amber-500;
    }
}

.entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.entry-name {
    font-weight: 500;
    color: $zinc-900;

    .dark & {
        color: $zinc-100;
    }
}

.entry-status {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}

.entry-message {
    font-size: 0.875rem;
    color: $zinc-600;
    margin-top: 0.25rem;

    .dark & {
        color: $zinc-400;
    }
}

.entry-time {
    font-size: 0.75rem;
    color: $zinc-500;
    margin-top: 0.25rem;

    .dark & {
        color: $zinc-500;
    }
}
</style>
