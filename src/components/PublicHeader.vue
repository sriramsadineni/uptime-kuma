<template>
    <header class="status-header">
        <!-- Logo & Title -->
        <a :href="statusPageUrl" class="header-brand">
            <img v-if="logoUrl" :src="logoUrl" alt="" class="header-logo" />
            <span class="header-title">{{ title || "Status" }}</span>
        </a>

        <!-- Navigation Tabs -->
        <nav class="status-nav">
            <a
                :href="statusPageUrl"
                class="status-nav-link"
                :class="{ active: activeTab === 'status' }"
            >
                {{ $t("Status") }}
            </a>
            <a
                :href="maintenancePageUrl"
                class="status-nav-link"
                :class="{ active: activeTab === 'maintenance' }"
            >
                {{ $t("Maintenance") }}
            </a>
            <a
                :href="incidentsPageUrl"
                class="status-nav-link"
                :class="{ active: activeTab === 'incidents' }"
            >
                {{ $t("Previous Incidents") }}
            </a>
        </nav>

        <!-- Right side - Get in Touch -->
        <div class="header-actions">
            <a
                v-if="contactUrl"
                :href="contactUrl"
                class="contact-link"
                target="_blank"
                rel="noopener noreferrer"
            >
                {{ contactLabel || $t("Get in Touch") }}
            </a>
        </div>
    </header>
</template>

<script>
export default {
    name: "PublicHeader",
    props: {
        slug: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            default: "",
        },
        logoUrl: {
            type: String,
            default: null,
        },
        activeTab: {
            type: String,
            default: "status",
            validator: (value) => ["status", "maintenance", "incidents"].includes(value),
        },
        contactUrl: {
            type: String,
            default: null,
        },
        contactLabel: {
            type: String,
            default: null,
        },
    },
    computed: {
        statusPageUrl() {
            return "/status/" + encodeURIComponent(this.slug || "default");
        },
        maintenancePageUrl() {
            return "/status/" + encodeURIComponent(this.slug || "default") + "/maintenance";
        },
        incidentsPageUrl() {
            return "/status/" + encodeURIComponent(this.slug || "default") + "/incidents";
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.status-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    margin-bottom: 2rem;
    border-bottom: 1px solid $zinc-100;

    .dark & {
        border-bottom-color: $dark-border-color;
    }
}

.header-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: inherit;
}

.header-logo {
    width: 32px;
    height: 32px;
    border-radius: 0.375rem;
    object-fit: contain;
}

.header-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: $zinc-900;

    .dark & {
        color: $zinc-100;
    }
}

.header-actions {
    min-width: 100px;
    text-align: right;
}

.contact-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
    background: $primary;
    text-decoration: none;
    border-radius: 0.375rem;
    transition: all 0.15s ease;

    &:hover {
        background: darken($primary, 8%);
        color: white;
    }

    .dark & {
        background: $primary;

        &:hover {
            background: lighten($primary, 5%);
        }
    }
}

.status-nav {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
    background: $zinc-100;
    border-radius: 0.5rem;

    .dark & {
        background: $zinc-800;
    }
}

.status-nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: $zinc-600;
    text-decoration: none;
    border-radius: 0.375rem;
    transition: all 0.15s ease;

    &:hover {
        color: $zinc-800;
        background: rgba(255, 255, 255, 0.5);
    }

    &.active {
        color: $zinc-900;
        background: white;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .dark & {
        color: $zinc-400;

        &:hover {
            color: $zinc-200;
            background: rgba(255, 255, 255, 0.05);
        }

        &.active {
            color: $zinc-100;
            background: $zinc-700;
        }
    }
}
</style>
