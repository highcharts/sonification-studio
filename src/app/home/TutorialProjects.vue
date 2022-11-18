<template>
    <div>
        <p>Under the Project menu you can manage your Sonification Studio project.</p>
        <img
            alt="Project button clicked, and project option list expanded."
            loading="lazy"
            :src="project"
        >
        <ul>
            <li><strong>New Project</strong> will reset the data, the visual, and the audio settings to default. This will allow you to start over on a new project.</li>
            <li><strong>Open Project</strong> will allow you to load a saved project, or a Highcharts Sonification Studio project sent to you by someone else.</li>
            <li><strong>Save Project As</strong> will allow you to download a project file to open later, or share with someone else.</li>
        </ul>
        <p class="xmargin">
            Note that current data and all settings are by default saved in your browser, unless you have disabled local storage in your browser settings, or you clear your browser data.
        </p>
    </div>
</template>

<script lang="ts">
import project from './tutorialImages/project.png';

export default {
    data() {
        return { project };
    }
};

</script>

<style lang="less" scoped>
    .xmargin {
        margin-top: 30px;
    }
</style>
