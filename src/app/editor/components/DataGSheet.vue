<template>
    <div class="data-g-sheet-container">
        <div class="gsheet-header">
            <h3>Link with Google Sheets</h3>
            <div class="topBlock">
                <div class="introText">
                    <img
                        alt=""
                        :src="gsheetIcon"
                    >
                    <p>
                        Linking a Google Sheet will collect the data from there, and when you make changes in the Google Sheet they will be
                        reflected in the data here as well.
                    </p>
                </div>
                <div class="stepIndicator">
                    <div class="stepIndicatorInner">
                        <div class="stepLine">
                            <div class="stepLineInner" />
                        </div>
                        <ol>
                            <li
                                class="completedStep"
                                :aria-current="currentStep === 'apikey' ? 'step' : false"
                            >
                                <div
                                    class="stepIcon"
                                    aria-hidden="true"
                                >
                                    {{ currentStep !== 'apikey' ? '✓' : '1' }}
                                </div>
                                API key
                            </li>
                            <li
                                :class="{ completedStep: currentStep === 'sharesettings' || currentStep === 'sheeturl' || currentStep === 'confirmation'}"
                                :aria-current="currentStep === 'sharesettings' ? 'step' : false"
                            >
                                <div
                                    class="stepIcon"
                                    aria-hidden="true"
                                >
                                    {{ currentStep === 'sheeturl' || currentStep === 'confirmation' ? '✓' : '2' }}
                                </div>
                                Share settings
                            </li>
                            <li
                                :class="{ completedStep: currentStep === 'sheeturl' || currentStep === 'confirmation' }"
                                :aria-current="currentStep === 'sheeturl' ? 'step' : false"
                            >
                                <div
                                    class="stepIcon"
                                    aria-hidden="true"
                                >
                                    {{ currentStep === 'confirmation' ? '✓' : '3' }}
                                </div>
                                Sheet URL
                            </li>
                            <li
                                :class="{ completedStep: currentStep === 'confirmation' }"
                                :aria-current="currentStep === 'confirmation' ? 'step' : false"
                            >
                                <div
                                    class="stepIcon"
                                    aria-hidden="true"
                                >
                                    {{ currentStep === 'confirmation' ? '✓' : '4' }}
                                </div>
                                Confirmation
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <div class="stepContentOuter">
            <div class="stepContent">
                <div
                    v-show="currentStep === 'apikey'"
                    class="apikeyContent"
                >
                    <h4>Enter Google API Key</h4>
                    <div class="columns">
                        <div class="rightcolumn">
                            <p class="notebox">
                                For detailed step-by-step instructions, see this
                                <a href="https://handsondataviz.org/google-sheets-api-key.html">Hands-On Data Visualization tutorial</a>.
                            </p>
                            <p class="notebox">
                                <b>Note</b> that you need a personal Google Account for this to work, not a Google Suite account from your company
                                or school.
                            </p>

                            <div class="inputRow">
                                <SEInputbox
                                    id="apiKeyInput"
                                    v-model="apiKey"
                                    aria-label="Google API key"
                                />
                                <SEButton
                                    dark
                                    @click="currentStep = 'sharesettings'"
                                >
                                    Next
                                </SEButton>
                            </div>
                        </div>
                        <div class="leftcolumn">
                            <p>
                                For security reasons, Google requires that you generate an API key. This is so that Google can keep track
                                of how much your sheet is being accessed, to avoid overuse.
                            </p>

                            <h5>Reuse an existing API key</h5>
                            <p>
                                If you already have an API key generated, you can reuse it. Note, though, that a spreadsheet can only
                                be accessed roughly once per second using the same API key.
                            </p>

                            <h5>Create a new API key</h5>
                            <p>
                                Creating a new API key is done at
                                <a href="https://console.cloud.google.com/apis/credentials">API Services / Credentials</a> in your Google Account.
                                To create a new API key, click "Create project". Once it has been created, click "Enable APIs and Services",
                                and enable Google Sheets. Then, in the Credentials sidebar, you can create an API key for this project.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    v-show="currentStep === 'sharesettings'"
                    class="shareSettingsContent"
                >
                    <h4>Prepare your Google Sheet</h4>
                    <p>
                        The Google Sheet you want to link needs to be publicly accessible in order for this to work. This is done in two steps:
                        <ol>
                            <li>Click the "Share" button in Google Sheets, and click "Change to anyone with the link", then click "Done".</li>
                            <li>Go to "File > Publish to the Web" in Google Sheets, and click the "Publish" button.</li>
                        </ol>
                    </p>
                    <p>
                        When you are done, click Next below to continue the setup.
                    </p>

                    <div class="navbuttons">
                        <SEButton
                            dark
                            @click="currentStep = 'apikey'"
                        >
                            Previous
                        </SEButton>
                        <SEButton
                            dark
                            @click="currentStep = 'sheeturl'"
                        >
                            Next
                        </SEButton>
                    </div>
                </div>

                <div
                    v-show="currentStep === 'sheeturl'"
                    class="sheetURLContent"
                >
                    <h4>Sheet URL</h4>
                    <p>Paste a link here to the sheet you want to load data from.</p>
                    <p>Then click Finish below to link your sheet.</p>

                    <SEInputbox
                        id="sheetURLInput"
                        v-model="spreadsheetURL"
                        aria-label="Google Sheet URL"
                    />

                    <div class="navbuttons">
                        <SEButton
                            dark
                            @click="currentStep = 'sharesettings'"
                        >
                            Previous
                        </SEButton>
                        <SEButton
                            dark
                            @click="onFinishClick"
                        >
                            Finish
                        </SEButton>
                    </div>
                </div>

                <div
                    v-show="currentStep === 'confirmation'"
                    class="confirmationContent"
                >
                    <div
                        v-if="googleSheetStatus === statuses.Loading"
                        class="loading"
                    >
                        <img
                            alt=""
                            :src="spinnerIcon"
                        >
                        <p>Loading data...</p>
                        <SEButton
                            dark
                            @click="onStartOver"
                        >
                            Cancel
                        </SEButton>
                    </div>

                    <div
                        v-if="googleSheetStatus === statuses.Success"
                        class="success"
                    >
                        <div class="successbox">
                            <h4>Success!</h4>
                            <p>Your spreadsheet has been successfully linked.</p>
                        </div>
                        <div v-if="false">
                            <p style="color:red">
                                NOTE: Changing this dynamically is not currently supported in Highcharts!
                            </p>
                            <p>
                                Sonification Studio can automatically refresh and update the data when changes are made in the
                                Google Sheet. If you enable this below, Sonification Studio will look for changes in the data every few seconds.
                            </p>
                            <SEControl
                                v-slot="slotProps"
                                label="Automatically refresh data on changes"
                                :horizontal="true"
                            >
                                <SECheckbox
                                    :id="slotProps.controlId"
                                    v-model="autoUpdateEnabled"
                                />
                            </SEControl>
                        </div>

                        <p>Want to link a different spreadsheet or change your settings? Click below to start over.</p>
                        <SEButton
                            dark
                            @click="onStartOver"
                        >
                            Start over
                        </SEButton>
                    </div>

                    <div
                        v-if="googleSheetStatus === statuses.Error"
                        class="error"
                    >
                        <div class="errorbox">
                            <h4>Something went wrong</h4>
                            <p>{{ humanReadableErrorMessage }}</p>
                        </div>

                        <p>
                            We were not able to link your Google Sheet. Please click below to start over.
                        </p>

                        <SEButton
                            dark
                            @click="onStartOver"
                        >
                            Start over
                        </SEButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import SEControl from './basic/SEControl.vue';
import SEButton from './basic/SEButton.vue';
import SEInputbox from './basic/SEInputbox.vue';
import SECheckbox from './basic/SECheckbox.vue';
import gsheetIcon from '../assets/Google_Sheets_logo.svg';
import spinnerIcon from '../assets/circle-notch-solid.svg';
import { GoogleSheetStatus } from '../store/modules/data';

export default {
    components: {
        SEControl, SEButton, SEInputbox, SECheckbox
    },
    data() {
        return {
            gsheetIcon,
            spinnerIcon,
            statuses: GoogleSheetStatus,
            currentStep: 'apikey'
        };
    },
    computed: {
        spreadsheetURL: {
            get() { return (this as any).$store.state.dataStore.googleSpreadsheetURL; },
            set(val) { return this.$store.commit('dataStore/setGoogleSpreadsheetURL', val); }
        },
        apiKey: {
            get() { return (this as any).$store.state.dataStore.googleApiKey; },
            set(val) { return this.$store.commit('dataStore/setGoogleApiKey', val); }
        },
        autoUpdateEnabled: {
            get() { return (this as any).$store.state.dataStore.googleAutoUpdateEnabled; },
            set(val) { return this.$store.commit('dataStore/setGoogleAutoUpdateEnabled', val); }
        },
        googleSheetStatus: {
            get() { return (this as any).$store.state.dataStore.googleSheetStatus; },
            set(val) { return this.$store.commit('dataStore/setGoogleSheetStatus', val); }
        },
        googleSheetErrorMessage: {
            get() { return (this as any).$store.state.dataStore.googleSheetErrorMessage; },
            set(val) { return this.$store.commit('dataStore/setGoogleSheetErrorMessage', val); }
        },
        humanReadableErrorMessage() {
            const src = this.googleSheetErrorMessage;
            if (
                src.indexOf('API key not valid. Please pass a valid API key') > -1 ||
                src.indexOf('The request is missing a valid API key.') > -1
            ) {
                return 'The API key is not valid. Please try again and submit a valid API key.';
            }
            if (src.indexOf('Requested entity was not found') > -1) {
                return 'We could not find the submitted spreadsheet. Please try again and verify that you are pasting the correct link.';
            }
            if (src.indexOf('The caller does not have permission') > -1) {
                return 'No access to spreadsheet. Please ensure you have followed the sharing steps before attempting to link your Google Sheet.';
            }
            return 'Please try again.';
        }
    },
    methods: {
        onStartOver() {
            this.currentStep = 'apikey';
            this.$store.commit('dataStore/setSpreadsheetSetupComplete', false);
            this.$store.commit('dataStore/setGoogleSheetStatus', GoogleSheetStatus.Loading);
        },
        onFinishClick() {
            this.$store.commit('dataStore/setSpreadsheetSetupComplete', true);
            this.currentStep = 'confirmation';

            if (!this.spreadsheetURL) {
                this.$store.commit('dataStore/setGoogleSheetErrorMessage', 'Requested entity was not found');
                this.$store.commit('dataStore/setGoogleSheetStatus', GoogleSheetStatus.Error);
            }
        }
    }
};
</script>

<style lang="less">
@import "../colors";

.data-g-sheet-container {
    height: 100%;
    padding: 0 15px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

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

    .topBlock {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;
    }

    @media screen and (max-width: 800px) {
        .introText {
            flex: 2;
        }
        .stepIndicator {
            flex: 3;
        }
    }

    @media screen and (max-width: 1100px) {
        .topBlock {
            flex-direction: column;
            align-items: stretch;
        }
        .introText {
            margin-bottom: 10px;
        }
        .stepIndicator {
            margin-left: 0px !important;
        }
    }

    @media screen and (max-width: 1700px) {
        .leftcolumn {
            flex: 2;
        }
        .rightcolumn {
            flex: 3;
        }
    }

    .introText {
        display: flex;
        width: 100%;
        img {
            margin-right: 15px;
            height: 40px;
        }
        p {
            margin-bottom: 0;
        }
        align-items: center;
        margin-top: 25px;
        margin-right: 40px;
        font-size: 1.1rem;
        max-width: 800px;
    }

    .se-control-label {
        font-weight: bold;
    }

    .stepIndicator {
        margin-left: 20px;
        width: 100%;
        .stepIndicatorInner {
            margin: 0 auto;
            max-width: 800px;
        }
        .stepLine {
            position: relative;
            max-width: 800px;
            width: 100%;
        }
        .stepLineInner {
            position: absolute;
            z-index: 1;
            left: 0;
            right: 0;
            height: 30px;
            margin-right: 2.2rem;
            margin-left: 1rem;
            border-bottom: 1px solid @dark-blue-5;
            box-sizing: border-box;
        }
        ol {
            display: flex;
            justify-content: space-between;
            max-width: 800px;
        }
        li {
            margin-left: 0;
            list-style: none;
            z-index: 2;
            font-weight: bold;
            color: #333;
        }
        li .stepIcon {
            display: block;
            background-color: #fff;
            border-radius: 50%;
            border: 1px solid @dark-blue-5;
            width: 50px;
            height: 50px;
            margin: 0 auto;
            text-align: center;
            line-height: 50px;
            font-weight: bold;
            font-size: 19px;
            margin-bottom: 5px;
        }
        li.completedStep .stepIcon {
            background-color: @dark-blue-5;
            color: #fff;
        }
    }

    .stepContentOuter {
        position: relative;
        flex: 1;
    }

    .stepContent {
        overflow-y: auto;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 2px 0;
    }

    .notebox {
        background-color: #ebebeb;
        max-width: 800px;
        padding: 20px;
    }

    .se-button {
        margin: 0;
        margin-left: 15px;
        border-radius: 3px;
        height: 2.4rem;
        padding: 5px 25px;
        font-size: 1rem;
    }

    .se-inputbox {
        margin: 0;
        border: 1px solid @dark-blue-5;
        line-height: 1.3rem;
        font-size: 1.1rem;
    }

    .inputRow {
        display: flex;
        max-width: 600px;
        justify-items: center;
        margin-top: 20px;
        margin-bottom: 20px;
    }

    .columns {
        display: flex;
    }

    .leftcolumn {
        max-width: 800px;
        padding-left: 20px;
        margin: 0 auto;
    }

    .navbuttons {
        display: flex;
        max-width: 800px;
        margin-top: 25px;
        .se-button:first-child {
            margin-left: 0px;
        }
    }

    h3 {
        margin-top: 10px;
        font-size: 1.9rem;
        color: @dark-blue-5;
    }

    h4 {
        font-size: 1.3rem;
        margin-top: 25px;
        margin-bottom: 8px;
        color: @dark-gray-4;
    }

    h4:first-child {
        margin-top: -5px;
    }

    h5 {
        font-size: 1rem;
    }

    p {
        margin-bottom: 10px;
    }

    ol {
        margin-top: 10px;
        li {
            margin-left: 30px;
            margin-bottom: 5px;
        }
    }

    .shareSettingsContent {
        h4 {
            margin-bottom: 20px;
        }
        p {
            margin-bottom: 15px;
        }
    }

    .sheetURLContent {
        max-width: 700px;
        h4 {
            margin-bottom: 20px;
        }
        .navbuttons {
            margin-top: 30px;
        }
        .se-inputbox {
            margin-top: 10px;
        }
    }

    .confirmationContent .success {
        max-width: 700px;
        .successbox {
            padding: 25px;
            background-color: @green-9;
            margin-bottom: 20px;
            h4 {
                margin-bottom: 15px;
            }
            p {
                margin-bottom: 0;
            }
        }
        .se-control {
            margin-bottom: 20px;
        }
        .se-button {
            margin-left: 0;
        }
    }

    .confirmationContent .error {
        max-width: 700px;
        .errorbox {
            padding: 25px;
            background-color: @red-9;
            margin-bottom: 20px;
            h4 {
                margin-bottom: 15px;
            }
            p {
                margin-bottom: 0;
            }
        }
        .se-control {
            margin-bottom: 20px;
        }
        .se-button {
            margin-left: 0;
        }
    }

    .confirmationContent .loading {
        img {
            width: 30px;
            height: $width;
            float: left;
            margin-right: 20px;
            display: block;
            opacity: 0.7;
            animation: hc-spin 1s linear infinite;
        }
        p {
            line-height: 30px;
            vertical-align: middle;
        }
        .se-button {
            margin-left: 0;
            margin-top: 20px;
        }
    }

    @keyframes hc-spin {
        from {
            transform: rotate(0);
        }

        to {
            transform: rotate(360deg);
        }
    }
}


</style>
