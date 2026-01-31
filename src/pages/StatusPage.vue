<template>
    <div v-if="loadedTheme" class="col-12 col-lg-8 mx-auto mt-3">
        <!-- Sidebar for edit mode -->
        <div v-if="enableEditMode" class="sidebar" data-testid="edit-sidebar">
            <div class="sidebar-body">
                <div class="my-3">
                    <label for="slug" class="form-label">{{ $t("Slug") }}</label>
                    <div class="input-group">
                        <span id="basic-addon3" class="input-group-text">/status/</span>
                        <input id="slug" v-model="config.slug" type="text" class="form-control" />
                    </div>
                </div>

                <div class="my-3">
                    <label for="title" class="form-label">{{ $t("Title") }}</label>
                    <input id="title" v-model="config.title" type="text" class="form-control" />
                </div>

                <!-- Description -->
                <div class="my-3">
                    <label for="description" class="form-label">{{ $t("Description") }}</label>
                    <textarea
                        id="description"
                        v-model="config.description"
                        class="form-control"
                        data-testid="description-input"
                    ></textarea>
                    <div class="form-text">{{ $t("markdownSupported") }}</div>
                </div>

                <!-- Footer Text -->
                <div class="my-3">
                    <label for="footer-text" class="form-label">{{ $t("Footer Text") }}</label>
                    <textarea
                        id="footer-text"
                        v-model="config.footerText"
                        class="form-control"
                        data-testid="footer-text-input"
                    ></textarea>
                    <div class="form-text">{{ $t("markdownSupported") }}</div>
                </div>

                <div class="my-3">
                    <label for="auto-refresh-interval" class="form-label">{{ $t("Refresh Interval") }}</label>
                    <input
                        id="auto-refresh-interval"
                        v-model="config.autoRefreshInterval"
                        type="number"
                        class="form-control"
                        :min="5"
                        data-testid="refresh-interval-input"
                    />
                    <div class="form-text">
                        {{ $t("Refresh Interval Description", [config.autoRefreshInterval]) }}
                    </div>
                </div>

                <div class="my-3">
                    <label for="switch-theme" class="form-label">{{ $t("Theme") }}</label>
                    <select id="switch-theme" v-model="config.theme" class="form-select" data-testid="theme-select">
                        <option value="auto">{{ $t("Auto") }}</option>
                        <option value="light">{{ $t("Light") }}</option>
                        <option value="dark">{{ $t("Dark") }}</option>
                    </select>
                </div>

                <div class="my-3 form-check form-switch">
                    <input
                        id="showTags"
                        v-model="config.showTags"
                        class="form-check-input"
                        type="checkbox"
                        data-testid="show-tags-checkbox"
                    />
                    <label class="form-check-label" for="showTags">{{ $t("Show Tags") }}</label>
                </div>

                <!-- Show Powered By -->
                <div class="my-3 form-check form-switch">
                    <input
                        id="show-powered-by"
                        v-model="config.showPoweredBy"
                        class="form-check-input"
                        type="checkbox"
                        data-testid="show-powered-by-checkbox"
                    />
                    <label class="form-check-label" for="show-powered-by">{{ $t("Show Powered By") }}</label>
                </div>

                <!-- Show certificate expiry -->
                <div class="my-3 form-check form-switch">
                    <input
                        id="show-certificate-expiry"
                        v-model="config.showCertificateExpiry"
                        class="form-check-input"
                        type="checkbox"
                        data-testid="show-certificate-expiry-checkbox"
                    />
                    <label class="form-check-label" for="show-certificate-expiry">
                        {{ $t("showCertificateExpiry") }}
                    </label>
                </div>

                <!-- Show only last heartbeat -->
                <div class="my-3 form-check form-switch">
                    <input
                        id="show-only-last-heartbeat"
                        v-model="config.showOnlyLastHeartbeat"
                        class="form-check-input"
                        type="checkbox"
                    />
                    <label class="form-check-label" for="show-only-last-heartbeat">
                        {{ $t("showOnlyLastHeartbeat") }}
                    </label>
                </div>

                <!-- Domain Name List -->
                <div class="my-3">
                    <label class="form-label">
                        {{ $t("Domain Names") }}
                        <button
                            class="p-0 bg-transparent border-0"
                            :aria-label="$t('Add a domain')"
                            @click="addDomainField"
                        >
                            <font-awesome-icon icon="plus-circle" class="action text-primary" />
                        </button>
                    </label>

                    <ul class="list-group domain-name-list">
                        <li v-for="(domain, index) in config.domainNameList" :key="index" class="list-group-item">
                            <input
                                v-model="config.domainNameList[index]"
                                type="text"
                                class="no-bg domain-input"
                                placeholder="example.com"
                            />
                            <button
                                class="p-0 bg-transparent border-0"
                                :aria-label="$t('Remove domain', [domain])"
                                @click="removeDomain(index)"
                            >
                                <font-awesome-icon icon="times" class="action remove ms-2 me-3 text-danger" />
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Analytics -->

                <div class="my-3">
                    <label for="analyticsType" class="form-label">{{ $t("Analytics Type") }}</label>
                    <select
                        id="analyticsType"
                        v-model="config.analyticsType"
                        class="form-select"
                        data-testid="analytics-type-select"
                    >
                        <option>{{ $t("None") }}</option>
                        <option value="google">{{ $t("Google") }}</option>
                        <option value="umami">{{ $t("Umami") }}</option>
                        <option value="plausible">{{ $t("Plausible") }}</option>
                        <option value="matomo">{{ $t("Matomo") }}</option>
                    </select>
                </div>

                <div v-if="!!config.analyticsType" class="my-3">
                    <label for="analyticsId" class="form-label">{{ $t("Analytics ID") }}</label>
                    <input
                        id="analyticsId"
                        v-model="config.analyticsId"
                        type="text"
                        class="form-control"
                        data-testid="analytics-id-input"
                    />
                </div>

                <div v-if="!!config.analyticsType && config.analyticsType !== 'google'" class="my-3">
                    <label for="analyticsScriptUrl" class="form-label">{{ $t("Analytics Script URL") }}</label>
                    <input
                        id="analyticsScriptUrl"
                        v-model="config.analyticsScriptUrl"
                        type="url"
                        class="form-control"
                        data-testid="analytics-script-url-input"
                    />
                </div>

                <!-- RSS Title -->
                <div class="my-3">
                    <label for="rss-title" class="form-label">{{ $t("RSS Title") }}</label>
                    <input
                        id="rss-title"
                        v-model="config.rssTitle"
                        type="text"
                        class="form-control"
                        data-testid="rss-title-input"
                    />
                    <div class="form-text">
                        {{ $t("Leave blank to use status page title") }}
                    </div>
                </div>

                <!-- Custom CSS -->
                <div class="my-3">
                    <div class="mb-1">{{ $t("Custom CSS") }}</div>
                    <prism-editor
                        v-model="config.customCSS"
                        class="css-editor"
                        data-testid="custom-css-input"
                        :highlight="highlighter"
                        line-numbers
                    ></prism-editor>
                </div>

                <div class="danger-zone">
                    <button class="btn btn-danger me-2" @click="deleteDialog">
                        <font-awesome-icon icon="trash" />
                        {{ $t("Delete") }}
                    </button>
                </div>
            </div>

            <!-- Sidebar Footer -->
            <div class="sidebar-footer">
                <button class="btn btn-success me-2" :disabled="loading" data-testid="save-button" @click="save">
                    <font-awesome-icon icon="save" />
                    {{ $t("Save") }}
                </button>

                <button class="btn btn-danger me-2" @click="discard">
                    <font-awesome-icon icon="undo" />
                    {{ $t("Discard") }}
                </button>
            </div>
        </div>

        <!-- Main Status Page -->
        <div :class="{ edit: enableEditMode }" class="main">
            <!-- Header -->
            <PublicHeader
                v-if="!enableEditMode"
                :slug="slug"
                :title="config.title"
                :logo-url="logoURL"
                active-tab="status"
                contact-url="mailto:support@example.com"
            />

            <!-- Edit Mode: Logo & Title -->
            <h1 v-if="enableEditMode" class="mb-4 title-flex">
                <!-- Logo -->
                <span class="logo-wrapper" @click="showImageCropUploadMethod">
                    <button
                        v-if="editMode"
                        type="button"
                        class="p-0 bg-transparent border-0 small-reset-btn reset-top-left"
                        @click.stop="resetToDefaultImage"
                    >
                        <font-awesome-icon icon="times" class="text-danger" />
                    </button>
                    <img :src="logoURL" alt class="logo me-2" :class="logoClass" />
                    <font-awesome-icon v-if="enableEditMode" class="icon-upload" icon="upload" />
                </span>

                <!-- Uploader -->
                <ImageCropUpload
                    v-model="showImageCropUpload"
                    field="img"
                    :width="128"
                    :height="128"
                    :langType="$i18n.locale"
                    img-format="png"
                    :noCircle="true"
                    :noSquare="false"
                    @crop-success="cropSuccess"
                />

                <!-- Title -->
                <Editable v-model="config.title" tag="span" :contenteditable="editMode" :noNL="true" />
            </h1>

            <!-- Hidden nav for edit mode (keeps the old structure) -->
            <nav v-if="false" class="status-nav mb-4">
                <a
                    :href="statusPageBaseUrl"
                    class="status-nav-link"
                    :class="{ active: activeTab === 'status' }"
                >
                    {{ $t("Status") }}
                </a>
                <a
                    v-if="maintenanceList.length > 0"
                    :href="maintenancePageUrl"
                    class="status-nav-link"
                    :class="{ active: activeTab === 'maintenance' }"
                >
                    {{ $t("Maintenance") }}
                    <span class="nav-badge">{{ maintenanceList.length }}</span>
                </a>
                <a
                    :href="incidentsPageUrl"
                    class="status-nav-link"
                    :class="{ active: activeTab === 'incidents' }"
                >
                    {{ $t("Previous Incidents") }}
                </a>
            </nav>

            <!-- Admin functions -->
            <div v-if="hasToken" class="mb-2">
                <div v-if="!enableEditMode">
                    <button class="btn btn-primary mb-2 me-2" data-testid="edit-button" @click="edit">
                        <font-awesome-icon icon="edit" />
                        {{ $t("Edit Status Page") }}
                    </button>

                    <a href="/manage-status-page" class="btn btn-primary mb-2">
                        <font-awesome-icon icon="tachometer-alt" />
                        {{ $t("Go to Dashboard") }}
                    </a>
                </div>

                <div v-else>
                    <button
                        class="btn btn-primary btn-add-group me-2"
                        data-testid="create-incident-button"
                        @click="createIncident"
                    >
                        <font-awesome-icon icon="bullhorn" />
                        {{ $t("Create Incident") }}
                    </button>
                </div>
            </div>

            <!-- Incident Edit Form -->
            <IncidentEditForm
                v-if="
                    editIncidentMode &&
                    incident !== null &&
                    (!incident.id || !activeIncidents.some((i) => i.id === incident.id))
                "
                v-model="incident"
                @post="postIncident"
                @cancel="cancelIncident"
            />

            <!-- Active Pinned Incidents -->
            <template v-for="activeIncident in activeIncidents" :key="activeIncident.id">
                <!-- Edit mode for this specific incident -->
                <IncidentEditForm
                    v-if="editIncidentMode && incident !== null && incident.id === activeIncident.id"
                    v-model="incident"
                    @post="postIncident"
                    @cancel="cancelIncident"
                />

                <!-- Display mode for this incident -->
                <div
                    v-else
                    class="active-incident mb-4"
                    role="alert"
                    data-testid="incident"
                >
                    <div class="incident-header">
                        <span class="incident-dot" :class="'incident-dot-' + activeIncident.style"></span>
                        <span class="incident-status-label">{{ $t("Ongoing Incident") }}</span>
                    </div>
                    <h4 class="incident-title" data-testid="incident-title">{{ activeIncident.title }}</h4>
                    <!-- eslint-disable vue/no-v-html -->
                    <div
                        class="incident-content"
                        data-testid="incident-content"
                        v-html="getIncidentHTML(activeIncident.content)"
                    ></div>
                    <!-- eslint-enable vue/no-v-html -->

                    <!-- Incident Date -->
                    <div class="incident-meta">
                        <span>{{ dateFromNow(activeIncident.createdDate) }}</span>
                        <span v-if="activeIncident.lastUpdatedDate" class="text-muted">
                            · Updated {{ dateFromNow(activeIncident.lastUpdatedDate) }}
                        </span>
                    </div>

                    <div v-if="editMode" class="incident-actions">
                        <button class="btn btn-sm btn-outline-success" @click="resolveIncident(activeIncident)">
                            <font-awesome-icon icon="check" class="me-1" />
                            {{ $t("Resolve") }}
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" @click="editIncident(activeIncident)">
                            <font-awesome-icon icon="edit" class="me-1" />
                            {{ $t("Edit") }}
                        </button>
                        <button
                            class="btn btn-sm btn-outline-danger"
                            @click="$refs.incidentManageModal.showDelete(activeIncident)"
                        >
                            <font-awesome-icon icon="trash" class="me-1" />
                            {{ $t("Delete") }}
                        </button>
                    </div>
                </div>
            </template>

            <!-- Overall Status -->
            <div class="overall-status">
                <div v-if="Object.keys($root.publicMonitorList).length === 0 && loadedData" class="status-badge text-secondary">
                    <font-awesome-icon icon="question-circle" class="status-icon" />
                    <span>{{ $t("No Services") }}</span>
                </div>

                <template v-else>
                    <div v-if="allUp" class="status-badge text-success">
                        <font-awesome-icon icon="check-circle" class="status-icon" />
                        <span>{{ $t("All Systems Operational") }}</span>
                    </div>

                    <div v-else-if="partialDown" class="status-badge text-warning">
                        <font-awesome-icon icon="exclamation-circle" class="status-icon" />
                        <span>{{ $t("Partially Degraded Service") }}</span>
                    </div>

                    <div v-else-if="allDown" class="status-badge text-danger">
                        <font-awesome-icon icon="times-circle" class="status-icon" />
                        <span>{{ $t("Degraded Service") }}</span>
                    </div>

                    <div v-else-if="isMaintenance" class="status-badge text-info">
                        <font-awesome-icon icon="wrench" class="status-icon" />
                        <span>{{ $t("maintenanceStatus-under-maintenance") }}</span>
                    </div>

                    <div v-else class="status-badge text-muted">
                        <font-awesome-icon icon="question-circle" class="status-icon" />
                    </div>
                </template>
            </div>

            <!-- Maintenance -->
            <template v-if="maintenanceList.length > 0">
                <div id="maintenance" class="maintenance-section mb-4">
                    <div
                        v-for="maintenance in maintenanceList"
                        :key="maintenance.id"
                        class="maintenance-card"
                    >
                        <span class="maintenance-icon">
                            <font-awesome-icon icon="wrench" />
                        </span>
                        <div class="maintenance-body">
                            <div class="maintenance-header">
                                <span class="maintenance-title">{{ maintenance.title }}</span>
                            </div>
                            <!-- eslint-disable-next-line vue/no-v-html -->
                            <div v-if="maintenance.description" class="maintenance-desc" v-html="maintenanceHTML(maintenance.description)"></div>
                            <div class="maintenance-time"><MaintenanceTime :maintenance="maintenance" /></div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Description -->
            <strong v-if="editMode">{{ $t("Description") }}:</strong>
            <Editable
                v-if="enableEditMode"
                v-model="config.description"
                :contenteditable="editMode"
                tag="div"
                class="mb-4 description"
                data-testid="description-editable"
            />
            <!-- eslint-disable vue/no-v-html-->
            <div
                v-if="!enableEditMode"
                class="alert-heading p-2"
                data-testid="description"
                v-html="descriptionHTML"
            ></div>
            <!-- eslint-enable vue/no-v-html-->

            <div v-if="editMode" class="mb-4">
                <div>
                    <button class="btn btn-primary btn-add-group me-2" data-testid="add-group-button" @click="addGroup">
                        <font-awesome-icon icon="plus" />
                        {{ $t("Add Group") }}
                    </button>
                </div>

                <div class="mt-3">
                    <div v-if="sortedMonitorList.length > 0 && loadedData">
                        <label>{{ $t("Add a monitor") }}:</label>
                        <VueMultiselect
                            v-model="selectedMonitor"
                            :options="sortedMonitorList"
                            :multiple="false"
                            :searchable="true"
                            :placeholder="$t('Add a monitor')"
                            label="name"
                            trackBy="name"
                            class="mt-3"
                            data-testid="monitor-select"
                        >
                            <template #option="{ option }">
                                <div class="d-inline-flex">
                                    <span>
                                        {{ option.pathName }}
                                        <Tag v-for="tag in option.tags" :key="tag" :item="tag" :size="'sm'" />
                                    </span>
                                </div>
                            </template>
                        </VueMultiselect>
                    </div>
                    <div v-else class="text-center">
                        {{ $t("No monitors available.") }}
                        <router-link to="/add">{{ $t("Add one") }}</router-link>
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <div v-if="$root.publicGroupList.length === 0 && loadedData" class="text-center">
                    <!-- 👀 Nothing here, please add a group or a monitor. -->
                    👀 {{ $t("statusPageNothing") }}
                </div>

                <PublicGroupList
                    :edit-mode="enableEditMode"
                    :slug="slug"
                    :show-tags="config.showTags"
                    :show-certificate-expiry="config.showCertificateExpiry"
                    :show-only-last-heartbeat="config.showOnlyLastHeartbeat"
                />
            </div>

            <!-- Past Incidents -->
            <div v-if="pastIncidentCount > 0" class="past-incidents-section mt-5 pt-4">
                <div class="section-header">
                    <h2 class="section-title">{{ $t("Past Incidents") }}</h2>
                    <a :href="incidentsPageUrl" class="section-link">
                        {{ $t("View All") }} →
                    </a>
                </div>

                <div class="incidents-list">
                    <div
                        v-for="group in groupedIncidentHistory"
                        :key="group.dateKey"
                        class="incident-card"
                    >
                        <div class="incident-card-header">{{ group.dateKey }}</div>
                        <div class="incident-card-body">
                            <IncidentHistory
                                :incidents="group.incidents"
                                :edit-mode="enableEditMode"
                                :loading="incidentHistoryLoading"
                                @edit-incident="$refs.incidentManageModal.showEdit($event)"
                                @delete-incident="$refs.incidentManageModal.showDelete($event)"
                                @resolve-incident="resolveIncident"
                            />
                        </div>
                    </div>

                    <div v-if="incidentHistoryHasMore" class="text-center mt-4">
                        <a :href="incidentsPageUrl" class="view-all-btn">
                            {{ $t("View All Incidents") }}
                        </a>
                    </div>
                </div>
            </div>

            <!-- Incident Manage Modal -->
            <IncidentManageModal
                v-if="enableEditMode"
                ref="incidentManageModal"
                :slug="slug"
                @incident-updated="loadIncidentHistory"
            />

            <footer class="mt-5 mb-4">
                <div class="custom-footer-text text-start">
                    <strong v-if="enableEditMode">{{ $t("Custom Footer") }}:</strong>
                </div>
                <Editable
                    v-if="enableEditMode"
                    v-model="config.footerText"
                    tag="div"
                    :contenteditable="enableEditMode"
                    :noNL="false"
                    class="alert-heading p-2"
                    data-testid="custom-footer-editable"
                />
                <!-- eslint-disable vue/no-v-html-->
                <div
                    v-if="!enableEditMode"
                    class="alert-heading p-2"
                    data-testid="footer-text"
                    v-html="footerHTML"
                ></div>
                <!-- eslint-enable vue/no-v-html-->

                <p v-if="config.showPoweredBy" data-testid="powered-by">
                    {{ $t("Powered by") }}
                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/louislam/uptime-kuma">
                        {{ $t("Uptime Kuma") }}
                    </a>
                </p>

                <div class="refresh-info mb-2">
                    <div>{{ $t("lastUpdatedAt", { date: lastUpdateTimeDisplay }) }}</div>
                    <div data-testid="update-countdown-text">
                        {{ $t("statusPageRefreshIn", [updateCountdownText]) }}
                    </div>
                </div>
            </footer>
        </div>

        <Confirm
            ref="confirmDelete"
            btn-style="btn-danger"
            :yes-text="$t('Yes')"
            :no-text="$t('No')"
            @yes="deleteStatusPage"
        >
            {{ $t("deleteStatusPageMsg") }}
        </Confirm>

        <component is="style" v-if="config.customCSS" type="text/css">
            {{ config.customCSS }}
        </component>
    </div>
</template>

<script>
import axios from "axios";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Favico from "favico.js";
// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-css";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles
import ImageCropUpload from "vue-image-crop-upload";
// import Prism Editor
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
import { useToast } from "vue-toastification";
import { marked } from "marked";
import DOMPurify from "dompurify";
import Confirm from "../components/Confirm.vue";
import PublicGroupList from "../components/PublicGroupList.vue";
import MaintenanceTime from "../components/MaintenanceTime.vue";
import IncidentHistory from "../components/IncidentHistory.vue";
import IncidentManageModal from "../components/IncidentManageModal.vue";
import PublicHeader from "../components/PublicHeader.vue";
import IncidentEditForm from "../components/IncidentEditForm.vue";
import { getResBaseURL } from "../util-frontend";
import {
    STATUS_PAGE_ALL_DOWN,
    STATUS_PAGE_ALL_UP,
    STATUS_PAGE_MAINTENANCE,
    STATUS_PAGE_PARTIAL_DOWN,
    UP,
    MAINTENANCE,
} from "../util.ts";
import Tag from "../components/Tag.vue";
import VueMultiselect from "vue-multiselect";

const toast = useToast();
dayjs.extend(duration);

const leavePageMsg = "Do you really want to leave? you have unsaved changes!";

// eslint-disable-next-line no-unused-vars
let feedInterval;

const favicon = new Favico({
    animation: "none",
});

export default {
    components: {
        PublicGroupList,
        ImageCropUpload,
        Confirm,
        PrismEditor,
        MaintenanceTime,
        Tag,
        VueMultiselect,
        IncidentHistory,
        IncidentManageModal,
        IncidentEditForm,
        PublicHeader,
    },

    // Leave Page for vue route change
    beforeRouteLeave(to, from, next) {
        if (this.editMode) {
            const answer = window.confirm(leavePageMsg);
            if (answer) {
                next();
            } else {
                next(false);
            }
        }
        next();
    },

    props: {
        /** Override for the status page slug */
        overrideSlug: {
            type: String,
            required: false,
            default: null,
        },
    },

    data() {
        return {
            slug: null,
            enableEditMode: false,
            enableEditIncidentMode: false,
            hasToken: false,
            config: {},
            selectedMonitor: null,
            incident: null,
            previousIncident: null,
            showImageCropUpload: false,
            imgDataUrl: "/icon.svg",
            loadedTheme: false,
            loadedData: false,
            baseURL: "",
            clickedEditButton: false,
            maintenanceList: [],
            lastUpdateTime: dayjs(),
            updateCountdown: null,
            updateCountdownText: null,
            loading: true,
            incidentHistory: [],
            incidentHistoryLoading: false,
            incidentHistoryNextCursor: null,
            incidentHistoryHasMore: false,
        };
    },
    computed: {
        logoURL() {
            if (this.imgDataUrl.startsWith("data:")) {
                return this.imgDataUrl;
            } else {
                return this.baseURL + this.imgDataUrl;
            }
        },

        incidentsPageUrl() {
            return "/status/" + encodeURIComponent(this.slug || "default") + "/incidents";
        },

        maintenancePageUrl() {
            return "/status/" + encodeURIComponent(this.slug || "default") + "/maintenance";
        },

        statusPageBaseUrl() {
            return "/status/" + encodeURIComponent(this.slug || "default");
        },

        activeTab() {
            // Check URL hash or path to determine active tab
            if (window.location.hash === "#maintenance") {
                return "maintenance";
            }
            return "status";
        },

        /**
         * If the monitor is added to public list, which will not be in this list.
         * @returns {object[]} List of monitors
         */
        sortedMonitorList() {
            let result = [];

            for (let id in this.$root.monitorList) {
                if (this.$root.monitorList[id] && !(id in this.$root.publicMonitorList)) {
                    let monitor = this.$root.monitorList[id];
                    result.push(monitor);
                }
            }

            result.sort((m1, m2) => {
                if (m1.active !== m2.active) {
                    if (m1.active === 0) {
                        return 1;
                    }

                    if (m2.active === 0) {
                        return -1;
                    }
                }

                if (m1.weight !== m2.weight) {
                    if (m1.weight > m2.weight) {
                        return -1;
                    }

                    if (m1.weight < m2.weight) {
                        return 1;
                    }
                }

                return m1.pathName.localeCompare(m2.pathName);
            });

            return result;
        },

        editMode() {
            return this.enableEditMode && this.$root.socket.connected;
        },

        editIncidentMode() {
            return this.enableEditIncidentMode;
        },

        isPublished() {
            return this.config.published;
        },

        logoClass() {
            if (this.editMode) {
                return {
                    "edit-mode": true,
                };
            }
            return {};
        },

        incidentClass() {
            return "bg-" + this.incident.style;
        },

        maintenanceClass() {
            return "bg-maintenance";
        },

        overallStatus() {
            if (Object.keys(this.$root.publicLastHeartbeatList).length === 0) {
                return -1;
            }

            let status = STATUS_PAGE_ALL_UP;
            let hasUp = false;

            for (let id in this.$root.publicLastHeartbeatList) {
                let beat = this.$root.publicLastHeartbeatList[id];

                if (beat.status === MAINTENANCE) {
                    return STATUS_PAGE_MAINTENANCE;
                } else if (beat.status === UP) {
                    hasUp = true;
                } else {
                    status = STATUS_PAGE_PARTIAL_DOWN;
                }
            }

            if (!hasUp) {
                status = STATUS_PAGE_ALL_DOWN;
            }

            return status;
        },

        allUp() {
            return this.overallStatus === STATUS_PAGE_ALL_UP;
        },

        partialDown() {
            return this.overallStatus === STATUS_PAGE_PARTIAL_DOWN;
        },

        allDown() {
            return this.overallStatus === STATUS_PAGE_ALL_DOWN;
        },

        isMaintenance() {
            return this.overallStatus === STATUS_PAGE_MAINTENANCE;
        },

        incidentHTML() {
            if (this.incident && this.incident.content != null) {
                return DOMPurify.sanitize(marked(this.incident.content));
            } else {
                return "";
            }
        },

        descriptionHTML() {
            if (this.config.description != null) {
                return DOMPurify.sanitize(marked(this.config.description));
            } else {
                return "";
            }
        },

        footerHTML() {
            if (this.config.footerText != null) {
                return DOMPurify.sanitize(marked(this.config.footerText));
            } else {
                return "";
            }
        },

        lastUpdateTimeDisplay() {
            return this.$root.datetime(this.lastUpdateTime);
        },

        /**
         * Get all active pinned incidents for display at the top
         * @returns {object[]} List of active pinned incidents
         */
        activeIncidents() {
            return this.incidentHistory.filter((i) => i.active && i.pin);
        },

        /**
         * Count of past incidents (non-active or unpinned)
         * @returns {number} Number of past incidents
         */
        pastIncidentCount() {
            return this.incidentHistory.filter((i) => !(i.active && i.pin)).length;
        },

        /**
         * Group past incidents (non-active or unpinned) by date for display.
         * Returns an array of { dateKey, incidents } sorted newest date first.
         * Active+pinned incidents are shown separately at the top, not in this section.
         * @returns {{ dateKey: string, incidents: object[] }[]} Date groups, newest first
         */
        groupedIncidentHistory() {
            const groups = {};
            const pastIncidents = this.incidentHistory.filter((i) => !(i.active && i.pin));
            for (const incident of pastIncidents) {
                const dateKey = this.formatDateKey(incident.createdDate);
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(incident);
            }
            // Sort date groups newest first (by first incident's createdDate in each group)
            return Object.entries(groups)
                .map(([dateKey, incidents]) => ({
                    dateKey,
                    incidents,
                }))
                .sort((a, b) => {
                    const dateA = a.incidents[0]?.createdDate ? new Date(a.incidents[0].createdDate) : new Date(0);
                    const dateB = b.incidents[0]?.createdDate ? new Date(b.incidents[0].createdDate) : new Date(0);
                    return dateB - dateA;
                });
        },
    },
    watch: {
        /**
         * If connected to the socket and logged in, request private data of this statusPage
         * @param {boolean} loggedIn Is the client logged in?
         * @returns {void}
         */
        "$root.loggedIn"(loggedIn) {
            if (loggedIn) {
                this.$root.getSocket().emit("getStatusPage", this.slug, (res) => {
                    if (res.ok) {
                        this.config = res.config;

                        if (!this.config.customCSS) {
                            this.config.customCSS = "body {\n" + "  \n" + "}\n";
                        }
                    } else {
                        this.$root.toastError(res.msg);
                    }
                });
            }
        },

        /**
         * Selected a monitor and add to the list.
         * @param {object} monitor Monitor to add
         * @returns {void}
         */
        selectedMonitor(monitor) {
            if (monitor) {
                if (this.$root.publicGroupList.length === 0) {
                    this.addGroup();
                }

                const firstGroup = this.$root.publicGroupList[0];

                firstGroup.monitorList.push(monitor);
                this.selectedMonitor = null;
            }
        },

        // Set Theme
        "config.theme"() {
            this.$root.statusPageTheme = this.config.theme;
            this.loadedTheme = true;
        },

        "config.title"(title) {
            document.title = title;
        },

        "$root.monitorList"() {
            let count = Object.keys(this.$root.monitorList).length;

            // Since publicGroupList is getting from public rest api, monitors' tags may not present if showTags = false
            if (count > 0) {
                for (let group of this.$root.publicGroupList) {
                    for (let monitor of group.monitorList) {
                        if (monitor.tags === undefined && this.$root.monitorList[monitor.id]) {
                            monitor.tags = this.$root.monitorList[monitor.id].tags;
                        }
                    }
                }
            }
        },
    },
    async created() {
        this.hasToken = "token" in this.$root.storage();

        // Browser change page
        // https://stackoverflow.com/questions/7317273/warn-user-before-leaving-web-page-with-unsaved-changes
        window.addEventListener("beforeunload", (e) => {
            if (this.editMode) {
                (e || window.event).returnValue = leavePageMsg;
                return leavePageMsg;
            } else {
                return null;
            }
        });

        // Special handle for dev
        this.baseURL = getResBaseURL();
    },
    async mounted() {
        this.slug = this.overrideSlug || this.$route.params.slug;

        if (!this.slug) {
            this.slug = "default";
        }

        this.getData()
            .then((res) => {
                this.config = res.data.config;

                if (!this.config.domainNameList) {
                    this.config.domainNameList = [];
                }

                if (this.config.icon) {
                    this.imgDataUrl = this.config.icon;
                }

                this.maintenanceList = res.data.maintenanceList;
                this.$root.publicGroupList = res.data.publicGroupList;

                this.loading = false;

                feedInterval = setInterval(
                    () => {
                        this.updateHeartbeatList();
                    },
                    Math.max(5, this.config.autoRefreshInterval) * 1000
                );

                this.incident = res.data.incident;
                this.maintenanceList = res.data.maintenanceList;
                this.$root.publicGroupList = res.data.publicGroupList;

                this.loading = false;

                // Configure auto-refresh loop
                feedInterval = setInterval(
                    () => {
                        this.updateHeartbeatList();
                    },
                    Math.max(5, this.config.autoRefreshInterval) * 1000
                );

                this.updateUpdateTimer();
            })
            .catch(function (error) {
                if (error.response.status === 404) {
                    location.href = "/page-not-found";
                }
                console.log(error);
            });

        this.updateHeartbeatList();
        this.loadIncidentHistory();

        // Go to edit page if ?edit present
        // null means ?edit present, but no value
        if (this.$route.query.edit || this.$route.query.edit === null) {
            this.edit();
        }
    },
    methods: {
        /**
         * Get status page data
         * It should be preloaded in window.preloadData
         * @returns {Promise<any>} Status page data
         */
        getData: function () {
            if (window.preloadData) {
                return new Promise((resolve) =>
                    resolve({
                        data: window.preloadData,
                    })
                );
            } else {
                return axios.get("/api/status-page/" + this.slug);
            }
        },

        /**
         * Provide syntax highlighting for CSS
         * @param {string} code Text to highlight
         * @returns {string} Highlighted CSS
         */
        highlighter(code) {
            return highlight(code, languages.css);
        },

        /**
         * Update the heartbeat list and update favicon if necessary
         * @returns {void}
         */
        updateHeartbeatList() {
            // If editMode, it will use the data from websocket.
            if (!this.editMode) {
                axios.get("/api/status-page/heartbeat/" + this.slug).then((res) => {
                    const { heartbeatList, uptimeList } = res.data;

                    this.$root.heartbeatList = heartbeatList;
                    this.$root.uptimeList = uptimeList;

                    const heartbeatIds = Object.keys(heartbeatList);
                    const downMonitors = heartbeatIds.reduce((downMonitorsAmount, currentId) => {
                        const monitorHeartbeats = heartbeatList[currentId];
                        const lastHeartbeat = monitorHeartbeats.at(-1);

                        if (lastHeartbeat) {
                            return lastHeartbeat.status === 0 ? downMonitorsAmount + 1 : downMonitorsAmount;
                        } else {
                            return downMonitorsAmount;
                        }
                    }, 0);

                    favicon.badge(downMonitors);

                    this.loadedData = true;
                    this.lastUpdateTime = dayjs();
                    this.updateUpdateTimer();
                });
            }
        },

        /**
         * Setup timer to display countdown to refresh
         * @returns {void}
         */
        updateUpdateTimer() {
            clearInterval(this.updateCountdown);

            this.updateCountdown = setInterval(() => {
                // rounding here as otherwise we sometimes skip numbers in cases of time drift
                const countdown = dayjs.duration(
                    Math.round(
                        this.lastUpdateTime.add(Math.max(5, this.config.autoRefreshInterval), "seconds").diff(dayjs()) /
                            1000
                    ),
                    "seconds"
                );

                if (countdown.as("seconds") < 0) {
                    clearInterval(this.updateCountdown);
                } else {
                    this.updateCountdownText = countdown.format("mm:ss");
                }
            }, 1000);
        },

        /**
         * Enable editing mode
         * @returns {void}
         */
        edit() {
            if (this.hasToken) {
                this.$root.initSocketIO(true);
                this.enableEditMode = true;
                this.clickedEditButton = true;

                // Try to fix #1658
                this.loadedData = true;
            }
        },

        /**
         * Save the status page
         * @returns {void}
         */
        save() {
            this.loading = true;
            let startTime = new Date();
            this.config.slug = this.config.slug.trim().toLowerCase();

            const payload = (this.$root.publicGroupList || []).map((g) => ({
                ...g,
                monitorList: g.monitorList || [],
            }));
            this.$root
                .getSocket()
                .emit("saveStatusPage", this.slug, this.config, this.imgDataUrl, payload, (res) => {
                    if (res.ok) {
                        this.enableEditMode = false;
                        this.$root.publicGroupList = res.publicGroupList;

                        // Add some delay, so that the side menu animation would be better
                        let endTime = new Date();
                        let time = 100 - (endTime - startTime) / 1000;

                        if (time < 0) {
                            time = 0;
                        }

                        setTimeout(() => {
                            this.loading = false;
                            location.href = "/status/" + this.config.slug;
                        }, time);
                    } else {
                        this.loading = false;
                        toast.error(res.msg);
                    }
                });
        },

        /**
         * Show dialog confirming deletion
         * @returns {void}
         */
        deleteDialog() {
            this.$refs.confirmDelete.show();
        },

        /**
         * Request deletion of this status page
         * @returns {void}
         */
        deleteStatusPage() {
            this.$root.getSocket().emit("deleteStatusPage", this.slug, (res) => {
                if (res.ok) {
                    this.enableEditMode = false;
                    location.href = "/manage-status-page";
                } else {
                    this.$root.toastError(res.msg);
                }
            });
        },

        /**
         * Returns label for a specified monitor
         * @param {object} monitor Object representing monitor
         * @returns {string} Monitor label
         */
        monitorSelectorLabel(monitor) {
            return `${monitor.name}`;
        },

        /**
         * Add a group to the status page
         * @returns {void}
         */
        addGroup() {
            let groupName = this.$t("Untitled Group");

            if (this.$root.publicGroupList.length === 0) {
                groupName = this.$t("Services");
            }

            this.$root.publicGroupList.unshift({
                name: groupName,
                monitorList: [],
            });
        },

        /**
         * Add a domain to the status page
         * @returns {void}
         */
        addDomainField() {
            this.config.domainNameList.push("");
        },

        /**
         * Discard changes to status page
         * @returns {void}
         */
        discard() {
            location.href = "/status/" + this.slug;
        },

        /**
         * Set URL of new image after successful crop operation
         * @param {string} imgDataUrl URL of image in data:// format
         * @returns {void}
         */
        cropSuccess(imgDataUrl) {
            this.imgDataUrl = imgDataUrl;
        },

        /**
         * Show image crop dialog if in edit mode
         * @returns {void}
         */
        showImageCropUploadMethod() {
            if (this.editMode) {
                this.showImageCropUpload = true;
            }
        },

        /**
         * Reset logo image to default (public/icon.svg)
         * @returns {void}
         */
        resetToDefaultImage() {
            if (!this.editMode) {
                return;
            }

            this.imgDataUrl = "/icon.svg";
            this.config.icon = this.imgDataUrl;
            toast.success(this.$t("imageResetConfirmation"));
        },

        /**
         * Create an incident for this status page
         * @returns {void}
         */
        createIncident() {
            this.enableEditIncidentMode = true;

            if (this.incident) {
                this.previousIncident = this.incident;
            }

            this.incident = {
                title: "",
                content: "",
                style: "primary",
            };
        },

        /**
         * Post the incident to the status page
         * @returns {void}
         */
        postIncident() {
            if (this.incident.title === "" || this.incident.content === "") {
                this.$root.toastError("Please input title and content");
                return;
            }

            this.$root.getSocket().emit("postIncident", this.slug, this.incident, (res) => {
                if (res.ok) {
                    this.enableEditIncidentMode = false;
                    this.incident = null;
                    this.loadIncidentHistory();
                } else {
                    this.$root.toastError(res.msg);
                }
            });
        },

        /**
         * Edit an incident inline
         * @param {object} incident - The incident to edit
         * @returns {void}
         */
        editIncident(incident) {
            this.previousIncident = this.incident;
            this.incident = { ...incident };
            this.enableEditIncidentMode = true;
        },

        /**
         * Cancel creation or editing of incident
         * @returns {void}
         */
        cancelIncident() {
            this.enableEditIncidentMode = false;

            if (this.previousIncident) {
                this.incident = this.previousIncident;
                this.previousIncident = null;
            }
        },

        /**
         * Unpin the incident
         * @returns {void}
         */
        unpinIncident() {
            this.$root.getSocket().emit("unpinIncident", this.slug, () => {
                this.incident = null;
            });
        },

        /**
         * Get HTML for incident content
         * @param {string} content - Markdown content
         * @returns {string} Sanitized HTML
         */
        getIncidentHTML(content) {
            if (content != null) {
                return DOMPurify.sanitize(marked(content));
            }
            return "";
        },

        /**
         * Get the relative time difference of a date from now
         * @param {any} date Date to get time difference
         * @returns {string} Time difference
         */
        dateFromNow(date) {
            return dayjs.utc(date).fromNow();
        },

        /**
         * Remove a domain from the status page
         * @param {number} index Index of domain to remove
         * @returns {void}
         */
        removeDomain(index) {
            this.config.domainNameList.splice(index, 1);
        },

        /**
         * Generate sanitized HTML from maintenance description
         * @param {string} description Text to sanitize
         * @returns {string} Sanitized HTML
         */
        maintenanceHTML(description) {
            if (description) {
                return DOMPurify.sanitize(marked(description));
            } else {
                return "";
            }
        },

        /**
         * Load incident history for the status page
         * @returns {void}
         */
        loadIncidentHistory() {
            this.loadIncidentHistoryWithCursor(null);
        },

        /**
         * Load incident history using cursor-based pagination
         * @param {string|null} cursor - Cursor for pagination (created_date of last item)
         * @param {boolean} append - Whether to append to existing list
         * @returns {void}
         */
        loadIncidentHistoryWithCursor(cursor, append = false) {
            this.incidentHistoryLoading = true;

            if (this.enableEditMode) {
                this.$root.getSocket().emit("getIncidentHistory", this.slug, cursor, (res) => {
                    this.incidentHistoryLoading = false;
                    if (res.ok) {
                        if (append) {
                            this.incidentHistory = [...this.incidentHistory, ...res.incidents];
                        } else {
                            this.incidentHistory = res.incidents;
                        }
                        this.incidentHistoryNextCursor = res.nextCursor;
                        this.incidentHistoryHasMore = res.hasMore;
                    } else {
                        console.error("Failed to load incident history:", res.msg);
                        this.$root.toastError(res.msg);
                    }
                });
            } else {
                const url = cursor
                    ? `/api/status-page/${this.slug}/incident-history?cursor=${encodeURIComponent(cursor)}`
                    : `/api/status-page/${this.slug}/incident-history`;
                axios
                    .get(url)
                    .then((res) => {
                        this.incidentHistoryLoading = false;
                        if (res.data.ok) {
                            if (append) {
                                this.incidentHistory = [...this.incidentHistory, ...res.data.incidents];
                            } else {
                                this.incidentHistory = res.data.incidents;
                            }
                            this.incidentHistoryNextCursor = res.data.nextCursor;
                            this.incidentHistoryHasMore = res.data.hasMore;
                        }
                    })
                    .catch((error) => {
                        this.incidentHistoryLoading = false;
                        console.error("Failed to load incident history:", error);
                    });
            }
        },

        /**
         * Load more incident history using cursor-based pagination
         * @returns {void}
         */
        loadMoreIncidentHistory() {
            if (this.incidentHistoryHasMore && this.incidentHistoryNextCursor) {
                this.loadIncidentHistoryWithCursor(this.incidentHistoryNextCursor, true);
            }
        },

        /**
         * Format date key for grouping (e.g., "December 8, 2025")
         * Uses the same timezone as the datetime display for consistency
         * @param {string} dateStr - ISO date string
         * @returns {string} Formatted date key
         */
        formatDateKey(dateStr) {
            if (!dateStr) {
                return this.$t("Unknown");
            }
            // Use dayjs with the app's timezone for consistent date grouping
            return this.$root.datetimeFormat(dateStr, "MMMM D, YYYY");
        },

        /**
         * Resolve an incident
         * @param {object} incident - The incident to resolve
         * @returns {void}
         */
        resolveIncident(incident) {
            this.$root.getSocket().emit("resolveIncident", this.slug, incident.id, (res) => {
                this.$root.toastRes(res);
                if (res.ok) {
                    this.loadIncidentHistory();
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

// =============================================================================
// Status Page Styles - Bootstrap Enhanced
// =============================================================================

// Header
h1 {
    img {
        vertical-align: middle;
        height: 48px;
        width: 48px;
        border-radius: 0.5rem;
    }
}

// Main layout
.main {
    transition: all 0.2s ease;
    &.edit { margin-left: 300px; }
}

// Sidebar - clean and minimal
.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 300px;
    height: 100vh;
    background: white;
    border-right: 1px solid $zinc-100;
    z-index: 100;

    .danger-zone {
        border-top: 1px solid $zinc-100;
        padding-top: 1rem;
        margin-top: 1rem;
    }

    .sidebar-body {
        padding: 1rem;
        overflow-x: hidden;
        overflow-y: auto;
        height: calc(100% - 64px);
    }

    .sidebar-footer {
        border-top: 1px solid $zinc-100;
        padding: 0.75rem 1rem;
        width: 300px;
        height: 64px;
        position: fixed;
        left: 0;
        bottom: 0;
        background-color: white;
        display: flex;
        align-items: center;
    }

    .dark & {
        background-color: $dark-bg;
        border-right-color: $dark-border-color;

        .danger-zone,
        .sidebar-footer { border-color: $dark-border-color; }
        .sidebar-footer { background-color: $dark-bg; }
    }
}

.title-flex {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

// Logo controls - subtle
.logo-wrapper {
    display: inline-block;
    position: relative;

    &:hover .icon-upload { opacity: 1; }

    .icon-upload {
        transition: all 0.2s ease;
        position: absolute;
        bottom: 4px;
        left: -12px;
        background-color: white;
        padding: 4px;
        border-radius: 0.375rem;
        cursor: pointer;
        opacity: 0.8;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .reset-top-left,
    .small-reset-btn {
        width: 20px;
        height: 20px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 0.75rem;

        &:hover {
            background-color: $zinc-100;
        }
    }

    .reset-top-left {
        background: white;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    }

    .small-reset-btn { background: transparent; }
}

.logo {
    transition: all 0.2s ease;
    &.edit-mode {
        cursor: pointer;
        &:hover { transform: scale(1.05); }
    }
}

// Overall Status - Pill badge, moderate size
.overall-status {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.375rem 0.875rem;
    border-radius: 999px;
    background: rgba($emerald-500, 0.1);

    &.text-success {
        background: rgba($emerald-500, 0.1);
        color: $emerald-500;
    }

    &.text-warning {
        background: rgba($warning, 0.1);
        color: $warning;
    }

    &.text-danger {
        background: rgba($danger, 0.1);
        color: $danger;
    }

    &.text-info {
        background: rgba($blue-500, 0.1);
        color: $blue-500;
    }

    &.text-secondary, &.text-muted {
        background: rgba($zinc-500, 0.1);
        color: $zinc-500;
    }
}

.status-icon {
    font-size: 1rem;
}

// Active Incident - Compact style
.active-incident {
    background: rgba($danger, 0.04);
    border: 1px solid rgba($danger, 0.12);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;

    .incident-header {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        margin-bottom: 0.375rem;
    }

    .incident-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        animation: pulse 2s infinite;

        &-danger { background: $danger; }
        &-warning { background: $warning; }
        &-info { background: $blue-500; }
        &-primary { background: $primary; }
    }

    .incident-status-label {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: $danger;
    }

    .incident-title {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: $zinc-900;

        .dark & { color: $zinc-100; }
    }

    .incident-content {
        font-size: 0.8125rem;
        color: $zinc-600;
        margin-bottom: 0.375rem;
        line-height: 1.4;

        .dark & { color: $zinc-400; }
    }

    .incident-meta {
        font-size: 0.75rem;
        color: $zinc-500;
    }

    .incident-actions {
        display: flex;
        gap: 0.375rem;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid rgba($danger, 0.08);
    }

    .dark & {
        background: rgba($danger, 0.08);
        border-color: rgba($danger, 0.2);
    }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

// Maintenance - Compact style with description
.maintenance-section {
    margin-top: 0.5rem;
}

.maintenance-card {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: rgba($blue-500, 0.04);
    border: 1px solid rgba($blue-500, 0.1);
    border-radius: 0.375rem;
    padding: 0.625rem 0.75rem;
    margin-bottom: 0.375rem;

    &:last-child { margin-bottom: 0; }

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
        font-size: 0.625rem;
        margin-top: 0.125rem;
    }

    .maintenance-body {
        flex: 1;
        min-width: 0;
    }

    .maintenance-header {
        margin-bottom: 0.25rem;
    }

    .maintenance-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: $zinc-800;

        .dark & { color: $zinc-200; }
    }

    .maintenance-desc {
        font-size: 0.75rem;
        color: $zinc-600;
        line-height: 1.4;
        margin-bottom: 0.25rem;

        .dark & { color: $zinc-400; }

        p { margin: 0; }
    }

    .maintenance-time {
        font-size: 0.6875rem;
        color: $zinc-500;

        .dark & { color: $zinc-400; }
    }

    .dark & {
        background: rgba($blue-500, 0.08);
        border-color: rgba($blue-500, 0.15);
    }
}

// Past Incidents Section - Compact
.past-incidents-section {
    border-top: 1px solid $zinc-100;

    .dark & { border-top-color: $dark-border-color; }
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.section-title {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: $zinc-500;
    margin: 0;
}

.section-link {
    font-size: 0.75rem;
    font-weight: 500;
    color: $primary;
    text-decoration: none;

    &:hover { text-decoration: underline; }
}

// Incident cards - matching incident page design
.incident-card {
    background: white;
    border: 1px solid $zinc-100;
    border-radius: 0.5rem;
    overflow: hidden;
    margin-bottom: 1rem;

    &:last-child { margin-bottom: 0; }

    .dark & {
        background: $dark-bg;
        border-color: $dark-border-color;
    }
}

.incident-card-header {
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

.incident-card-body {
    padding: 0.75rem;
}

.view-all-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: $zinc-600;
    background: white;
    border: 1px solid $zinc-200;
    border-radius: 0.375rem;
    text-decoration: none;
    transition: all 0.15s ease;

    &:hover {
        background: $zinc-50;
        border-color: $zinc-300;
        color: $zinc-800;
    }

    .dark & {
        background: $dark-bg;
        border-color: $dark-border-color;
        color: $zinc-400;

        &:hover {
            background: $zinc-800;
            color: $zinc-200;
        }
    }
}

// Legacy Incidents (keep for compatibility)
.incident {
    border-radius: 0.75rem;
    
    .alert-heading {
        font-weight: 600;
    }

    .content {
        line-height: 1.6;
        &[contenteditable="true"] { min-height: 48px; }
    }

    .date {
        font-size: 0.75rem;
        opacity: 0.7;
    }
}

// Maintenance
.maintenance-icon {
    font-size: 1.5rem;
    vertical-align: middle;
}

.status-maintenance {
    color: $maintenance;
    margin-right: 0.375rem;
}

// Domain list - minimal
.domain-name-list li {
    display: flex;
    align-items: center;
    padding: 0.5rem;

    .domain-input {
        flex-grow: 1;
        background-color: transparent;
        border: none;
        outline: none;
        font-size: 0.875rem;
        &::placeholder { color: $zinc-400; }
    }
}


// Description area
.description {
    line-height: 1.6;
    color: $zinc-600;

    .dark & { color: $zinc-400; }
}

// Footer
footer {
    font-size: 0.8125rem;
    color: $zinc-400;
}

.refresh-info {
    font-size: 0.75rem;
    opacity: 0.7;
}

// Mobile - responsive adjustments
.mobile {
    h1 { font-size: 1.25rem; }
    .status-badge { font-size: 0.8125rem; }
    .status-icon { font-size: 0.8125rem; }
    
    h1 img {
        max-width: 200px;
    }
}
</style>
