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
                        <h4 class="sr-only">
                            Progress
                        </h4>
                        <div class="stepLine">
                            <div class="stepLineInner" />
                        </div>
                        <ol>
                            <li
                                class="completedStep"
                                :aria-current="currentStep === 'apikey' ? 'step' : undefined"
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
                                :aria-current="currentStep === 'sharesettings' ? 'step' : undefined"
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
                                :aria-current="currentStep === 'sheeturl' ? 'step' : undefined"
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
                                :aria-current="currentStep === 'confirmation' ? 'step' : undefined"
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
                    <h4
                        ref="apikeyHeading"
                        tabindex="-1"
                    >
                        Enter Google API Key
                    </h4>
                    <div class="columns">
                        <div class="rightcolumn">
                            <p class="notebox">
                                For detailed step-by-step instructions, see this
                                <a href="https://support.google.com/googleapi/answer/6158862?hl=en">Google tutorial</a>.
                            </p>
                            <p class="notebox">
                                <b>Note</b> that you need a personal Google Account for this to work, not a Google Suite account from your company
                                or school.
                            </p>
                            <p class="notebox">
                                The API key is kept in this browser only. It is not saved in project files, so a project you share does not
                                share your key.
                            </p>

                            <div class="inputRow">
                                <SEInputbox
                                    id="apiKeyInput"
                                    v-model="apiKey"
                                    aria-label="Google API key"
                                />
                                <SEButton
                                    dark
                                    @click="goToStep('sharesettings')"
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
                    <h4
                        ref="sharesettingsHeading"
                        tabindex="-1"
                    >
                        Prepare your Google Sheet
                    </h4>
                    <p class="list-intro">
                        The Google Sheet you want to link needs to be publicly accessible in order for this to work. This is done in two steps:
                    </p>
                    <ol>
                        <li>Click the "Share" button in Google Sheets, and click "Change to anyone with the link", then click "Done".</li>
                        <li>Go to "File > Publish to the Web" in Google Sheets, and click the "Publish" button.</li>
                    </ol>
                    <p>
                        When you are done, click Next below to continue the setup.
                    </p>

                    <div class="navbuttons">
                        <SEButton
                            dark
                            @click="goToStep('apikey')"
                        >
                            Previous
                        </SEButton>
                        <SEButton
                            dark
                            @click="goToStep('sheeturl')"
                        >
                            Next
                        </SEButton>
                    </div>
                </div>

                <div
                    v-show="currentStep === 'sheeturl'"
                    class="sheetURLContent"
                >
                    <h4
                        ref="sheeturlHeading"
                        tabindex="-1"
                    >
                        Sheet URL
                    </h4>
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
                            @click="goToStep('sharesettings')"
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
                        v-show="googleSheetStatus === statuses.Loading"
                        class="loading"
                    >
                        <img
                            alt=""
                            :src="spinnerIcon"
                        >
                        <p
                            ref="loadingDataText"
                            tabindex="-1"
                        >
                            Loading data...
                        </p>
                        <SEButton
                            dark
                            @click="onStartOver"
                        >
                            Cancel
                        </SEButton>
                    </div>

                    <div
                        v-show="googleSheetStatus === statuses.Success"
                        class="success"
                    >
                        <div class="successbox">
                            <h4
                                ref="successHeading"
                                tabindex="-1"
                            >
                                Success!
                            </h4>
                            <p>Your spreadsheet has been successfully linked.</p>
                        </div>
                        <div class="autorefresh">
                            <h5>Automatic refresh</h5>
                            <p>
                                Sonification Studio can automatically refresh the data in the background, so that when changes are made in the
                                Google Sheet they are reflected in your chart without having to reload the page.
                            </p>
                            <p>
                                If you enable this below, Sonification Studio will look for changes in the data every few seconds. If not, you will have to
                                reload the page or switch between the Data and Chart tabs to see changes.
                            </p>
                            <p>Note that enabling this can cause slowdowns with large datasets.</p>
                            <SEControl
                                v-slot="slotProps"
                                label="Automatically refresh data in the background"
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
                        v-show="googleSheetStatus === statuses.Error"
                        class="error"
                    >
                        <div class="errorbox">
                            <h4
                                ref="errorHeading"
                                tabindex="-1"
                            >
                                Something went wrong
                            </h4>
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
import { defineComponent } from 'vue';
import SEControl from './basic/SEControl.vue';
import SEButton from './basic/SEButton.vue';
import SEInputbox from './basic/SEInputbox.vue';
import SECheckbox from './basic/SECheckbox.vue';
import gsheetIcon from '../assets/Google_Sheets_logo.svg';
import spinnerIcon from '../assets/circle-notch-solid.svg';
import { mapStores } from 'pinia';
import { GoogleSheetStatus, useDataStore } from '../store/modules/data';

export default defineComponent({
    components: {
        SEControl, SEButton, SEInputbox, SECheckbox
    },
    data() {
        return {
            gsheetIcon,
            spinnerIcon,
            statuses: GoogleSheetStatus,
            // A restored session or project may have the sheet linked
            currentStep: useDataStore().spreadsheetSetupComplete ? 'confirmation' : 'apikey'
        };
    },
    computed: {
        ...mapStores(useDataStore),
        spreadsheetURL: {
            get(): string { return this.dataStore.googleSpreadsheetURL; },
            set(val: string) { this.dataStore.setGoogleSpreadsheetURL(val); }
        },
        apiKey: {
            get(): string { return this.dataStore.googleApiKey; },
            set(val: string) { this.dataStore.setGoogleApiKey(val); }
        },
        autoUpdateEnabled: {
            get(): boolean { return this.dataStore.googleAutoUpdateEnabled; },
            set(val: boolean) { this.dataStore.setGoogleAutoUpdateEnabled(val); }
        },
        googleSheetStatus: {
            get(): GoogleSheetStatus { return this.dataStore.googleSheetStatus; },
            set(val: GoogleSheetStatus) { this.dataStore.setGoogleSheetStatus(val); }
        },
        googleSheetErrorMessage: {
            get(): string { return this.dataStore.googleSheetErrorMessage; },
            set(val: string) { this.dataStore.setGoogleSheetErrorMessage(val); }
        },
        humanReadableErrorMessage(): string {
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
    watch: {
        // A project opened or a new project: show the step the sheet's setup
        // is at, without moving the focus, which is elsewhere
        'dataStore.spreadsheetSetupComplete'(complete: boolean) {
            const linked = this.currentStep === 'confirmation';
            if (complete !== linked) {
                this.currentStep = complete ? 'confirmation' : 'apikey';
            }
        },
        googleSheetStatus(newStatus: GoogleSheetStatus) {
            if (this.currentStep !== 'confirmation') {
                return;
            }
            if (newStatus === GoogleSheetStatus.Success) {
                this.focusOnUpdate(this.$refs.successHeading as HTMLElement);
            } else if (newStatus === GoogleSheetStatus.Error) {
                this.focusOnUpdate(this.$refs.errorHeading as HTMLElement);
            }
        }
    },
    methods: {
        // Focus an element once the DOM is updated. The button that was
        // clicked may be hidden by then, and the browser would move the
        // focus to the page if it were not moved right away.
        focusOnUpdate(el: HTMLElement | undefined) {
            this.$nextTick(() => el?.focus());
        },
        // Show a step of the setup, and move the focus to it
        goToStep(step: string) {
            this.currentStep = step;
            const focusTargets: Record<string, string> = {
                apikey: 'apikeyHeading',
                sharesettings: 'sharesettingsHeading',
                sheeturl: 'sheeturlHeading'
            };
            if (focusTargets[step]) {
                this.focusOnUpdate(this.$refs[focusTargets[step]] as HTMLElement);
            } else if (step === 'confirmation') {
                const statusTargets: Record<number, string> = {
                    [GoogleSheetStatus.Loading]: 'loadingDataText',
                    [GoogleSheetStatus.Success]: 'successHeading',
                    [GoogleSheetStatus.Error]: 'errorHeading'
                };
                this.focusOnUpdate(this.$refs[statusTargets[this.googleSheetStatus]] as HTMLElement);
            }
        },
        onStartOver() {
            this.dataStore.setSpreadsheetSetupComplete(false);
            this.dataStore.setGoogleSheetStatus(GoogleSheetStatus.Loading);
            this.goToStep('apikey');
        },
        onFinishClick() {
            this.dataStore.setSpreadsheetSetupComplete(true);

            // No URL, or not a Google Sheets URL: there is no spreadsheet to
            // fetch, so the chart would neither load data nor report an error.
            if (!this.dataStore.googleSpreadsheetId) {
                this.dataStore.setGoogleSheetErrorMessage('Requested entity was not found');
                this.dataStore.setGoogleSheetStatus(GoogleSheetStatus.Error);
            }
            this.goToStep('confirmation');
        }
    }
});
</script>

<style lang="less">
@import "../colors";
@import "../sr-only";

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
        p, ol {
            margin-bottom: 15px;
        }
        // The list continues this sentence, so only the list's own 10px top
        // margin separates them
        .list-intro {
            margin-bottom: 0;
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
        h5 {
            margin-bottom: 5px;
            font-size: 1.1rem;
        }
        .se-control {
            margin-bottom: 30px;
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
