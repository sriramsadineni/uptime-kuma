<template>
    <div
        class="shadow-box alert mb-4 p-4 incident"
        role="alert"
        data-testid="incident-edit"
    >
        <strong>{{ $t("Title") }}:</strong>
        <Editable
            :model-value="modelValue.title"
            tag="h4"
            :contenteditable="true"
            :noNL="true"
            class="alert-heading"
            data-testid="incident-title"
            @update:model-value="updateField('title', $event)"
        />

        <strong>{{ $t("Content") }}:</strong>
        <Editable
            :model-value="modelValue.content"
            tag="div"
            :contenteditable="true"
            class="content"
            data-testid="incident-content-editable"
            @update:model-value="updateField('content', $event)"
        />
        <div class="form-text">
            {{ $t("markdownSupported") }}
        </div>

        <div v-if="monitors && monitors.length > 0" class="mt-3">
            <strong>{{ $t("Affected Monitors") }}:</strong>
            <VueMultiselect
                :model-value="selectedAffectedMonitors"
                :options="monitors"
                track-by="id"
                label="name"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                :placeholder="$t('Pick Affected Monitors...')"
                :preselect-first="false"
                :max-height="400"
                :taggable="false"
                class="mt-1"
                @update:model-value="updateAffectedMonitors"
            />
        </div>
        <div class="mt-2">
            <strong>{{ $t("Affected Areas") }}:</strong>
            <input
                type="text"
                class="form-control form-control-sm mt-1"
                :value="modelValue.affectedAreas"
                :placeholder="$t('Comma separated areas')"
                @input="updateField('affectedAreas', $event.target.value)"
            />
        </div>

        <div class="mt-3">
            <button class="btn btn-light me-2" data-testid="post-incident-button" @click="$emit('post')">
                <font-awesome-icon icon="bullhorn" />
                {{ $t("Post") }}
            </button>

            <button class="btn btn-light me-2" @click="$emit('cancel')">
                <font-awesome-icon icon="times" />
                {{ $t("Cancel") }}
            </button>

            <div class="dropdown d-inline-block me-2">
                <button
                    id="dropdownMenuButton1"
                    class="btn btn-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {{ $t("Style") }}: {{ $t(modelValue.style) }}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li>
                        <a class="dropdown-item" href="#" @click.prevent="updateField('style', 'info')">
                            {{ $t("info") }}
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" @click.prevent="updateField('style', 'warning')">
                            {{ $t("warning") }}
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" @click.prevent="updateField('style', 'danger')">
                            {{ $t("danger") }}
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" @click.prevent="updateField('style', 'primary')">
                            {{ $t("primary") }}
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" @click.prevent="updateField('style', 'light')">
                            {{ $t("light") }}
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" @click.prevent="updateField('style', 'dark')">
                            {{ $t("dark") }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import VueMultiselect from "vue-multiselect";

export default {
    name: "IncidentEditForm",
    components: {
        VueMultiselect,
    },
    props: {
        modelValue: {
            type: Object,
            required: true,
        },
        monitors: {
            type: Array,
            default: () => [],
        },
    },
    emits: ["update:modelValue", "post", "cancel"],
    computed: {
        selectedAffectedMonitors() {
            const ids = (this.modelValue.affectedMonitors || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            return this.monitors.filter((m) => ids.includes(String(m.id)));
        },
    },
    methods: {
        updateField(field, value) {
            this.$emit("update:modelValue", {
                ...this.modelValue,
                [field]: value,
            });
        },
        updateAffectedMonitors(val) {
            const ids = (val || []).map((m) => m.id).join(",");
            this.updateField("affectedMonitors", ids);
        },
    },
};
</script>

<style lang="scss" scoped>
.incident {
    .content {
        &[contenteditable="true"] {
            min-height: 60px;
        }
    }
}
</style>
