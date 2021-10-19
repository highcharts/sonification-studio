<template>
    <div class="data-g-sheet-container">
        <div class="center-container">
            <h3>Link with Google Sheets</h3>
            <div class="columns">
                <div class="col">
                    <div class="imgAndText">
                        <img
                            alt=""
                            :src="gsheetIcon"
                        >
                        <p>
                            If you have a Google Sheet containing data, you can link it to the Sonification Studio to use the data here.
                            This will collect data from the Google Sheet, and when you make changes in the Google Sheet, they will be
                            reflected in the data here as well. Use the configuration options below to set up the link and get started
                            using your Google Sheet data.
                        </p>
                    </div>

                    <h4>Prepare your Google Sheet</h4>
                    <p>
                        The Google Sheet you want to link needs to be public in order for this to work. This is done in two steps:
                        <ol>
                            <li>Click the "Share" button in Google Sheets, and click "Change to anyone with the link", then click "Done".</li>
                            <li>Go to "File > Publish to the Web" in Google Sheets, and click the "Publish" button.</li>
                        </ol>
                    </p>

                    <h4>Auto updates</h4>
                    <p>
                        Sonification Studio can automatically refresh and update the data when changes are made in the
                        Google Sheet. If you enable this below, Sonification Studio will look for changes in the data every few seconds.
                    </p>
                    <SEControl
                        v-slot="slotProps"
                        label="Automatically refresh data on changes"
                        helpfor="Automatic refresh"
                        helptext="Automatically refresh the data when the Google Sheet changes."
                        :horizontal="true"
                    >
                        <SECheckbox
                            :id="slotProps.controlId"
                            v-model="autoUpdateEnabled"
                        />
                    </SEControl>
                </div>

                <div class="col">
                    <h4>Spreadsheet ID</h4>
                    <p>
                        In order to link a Google Sheet, a unique <em>spreadsheet ID</em> is required. This ID identifies your spreadsheet,
                        and ensures the correct sheet is loaded. Visit <a href="https://developers.google.com/sheets/api/guides/concepts">developers.google.com</a>
                        for instructions on where to find your Sheet's <em>spreadsheet ID</em>.
                    </p>
                    <SEControl
                        v-slot="slotProps"
                        label="Google Sheets spreadsheet ID"
                        helptext="The unique spreadsheet ID for your Google Sheet. See above for instructions."
                        :horizontal-reverse="true"
                        :expand-content="true"
                    >
                        <SEInputbox
                            :id="slotProps.controlId"
                            v-model="spreadsheetId"
                        />
                    </SEControl>

                    <h4>Google API Key</h4>
                    <p>
                        For security reasons, Google also requires that you generate an API key. This is so that Google can track
                        how much your sheet is being accessed to avoid overuse. Creating this key is done at
                        <a href="https://console.cloud.google.com/apis/credentials">API Services / Credentials</a> in your Google Account.
                    </p>
                    <p>
                        Note that you need a <em>personal</em> Google Account for this to work, not a Google Suite account from your company
                        or school. If you already have an API key generated, you can reuse it. Note, though, that a spreadsheet can only
                        be accessed roughly once per second using the same API key.
                    </p>
                    <p>
                        To create a new API key, click "Create project". Once it has been created, click "Enable APIs and Services",
                        and enable Google Sheets. Then, in the Credentials sidebar, you can create an API key for this project.
                        For detailed step-by-step instructions, see this
                        <a href="https://handsondataviz.org/google-sheets-api-key.html">Hands-On Data Visualization tutorial</a>.
                    </p>
                    <SEControl
                        v-slot="slotProps"
                        label="Google API Key"
                        helptext="The Google API Key for this project. See above for instructions."
                        :horizontal-reverse="true"
                        :expand-content="true"
                    >
                        <SEInputbox
                            :id="slotProps.controlId"
                            v-model="apiKey"
                        />
                    </SEControl>
                </div>
            </div>

            <p
                id="google-spreadsheet-error"
                :class="{ hidden: !(apiKey.length && spreadsheetId.length) }"
                class="error"
                style="display: none"
            />
        </div>
    </div>
</template>

<script lang="ts">
import SEControl from './basic/SEControl.vue';
import SEInputbox from './basic/SEInputbox.vue';
import SECheckbox from './basic/SECheckbox.vue';
import gsheetIcon from '../assets/Google_Sheets_logo.svg';

export default {
    components: {
        SEControl, SEInputbox, SECheckbox
    },
    data() {
        return {
            gsheetIcon
        };
    },
    computed: {
        spreadsheetId: {
            get() { return (this as any).$store.state.dataStore.googleSpreadsheetId; },
            set(val) { return this.$store.commit('dataStore/setGoogleSpreadsheetId', val); }
        },
        apiKey: {
            get() { return (this as any).$store.state.dataStore.googleApiKey; },
            set(val) { return this.$store.commit('dataStore/setGoogleApiKey', val); }
        },
        autoUpdateEnabled: {
            get() { return (this as any).$store.state.dataStore.googleAutoUpdateEnabled; },
            set(val) { return this.$store.commit('dataStore/setGoogleAutoUpdateEnabled', val); }
        }
    }
};
</script>

<style lang="less">
@import "../colors";

.data-g-sheet-container {
    height: 100%;
    overflow-y: auto;
    padding: 0 15px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;

    a {
        color: #1673B1;
        text-decoration: underline;
        &:hover {
            color: #063AA1;
        }
        &:visited {
            color: #974cb4;
        }
    }

    .center-container {
        height: 100%;
    }

    .se-control-label {
        font-weight: bold;
    }

    .columns {
        display: flex;
        justify-content: space-between;
        align-items: middle;
        max-width: 1420px;
        margin: 0 auto;
        box-sizing: border-box;
    }

    .col:first-child {
        padding-right: 40px;
    }

    .col {
        box-sizing: border-box;
        max-width: 700px;
    }

    h3 {
        margin-top: 0;
        text-align: center;
        margin-bottom: 25px;
        padding-bottom: 10px;
        border-bottom: 1px solid @green-5;
        font-size: 1.7rem;
        color: @dark-blue-5;
    }

    h4 {
        font-size: 1.3rem;
        margin-top: 25px;
        margin-bottom: 8px;
        color: @dark-blue-6;
    }

    h4:first-child {
        margin-top: -5px;
    }

    p {
        margin-bottom: 10px;
    }

    ol {
        margin-top: 5px;
        li {
            margin-left: 30px;
            margin-bottom: 5px;
        }
    }

    .imgAndText {
        display: flex;
        img {
            margin-right: 30px;
        }
        p {
            margin-bottom: 0;
        }
        margin-bottom: 30px;
        margin-top: 5px;
        font-size: 1.1rem;
    }

    .error {
        color: #8d0404;
        border: 1px solid #b62e2e;
        padding: 10px;
        max-width: 600px;
        margin: 30px auto 0;
        h4 {
            color: #8d0404;
        }
        p {
            margin: 5px 0;
            color: #333;
        }
        transition: opacity 0.2s;
        transition-delay: 2s;
        &.hidden {
            visibility: hidden;
            opacity: 0;
        }
    }
}


</style>
