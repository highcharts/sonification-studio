<template>
    <footer>
        <div id="title">
            <img
                alt="Highcharts logo"
                :src="highchartsIcon"
            >
            Chart Sonification Studio
        </div>
        <div id="copyright">
            © Copyright {{ year }} Highsoft AS - designed in collaboration with Georgia Institue of Technology
        </div>
    </footer>
</template>

<script lang="ts">
import highchartsIcon from '../assets/highcharts-logo.svg';

export default {
    data: function () {
        return { highchartsIcon };
    },
    computed: {
        year: () => new Date().getFullYear()
    }
};
</script>

<style lang="less" scoped>
footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#copyright {
    font-size: 0.7em;
    margin: 8px;
}

#title {
    margin-top: 10px;
    font-size: 0.8em;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    img {
        width: 16px;
        height: $width;
        margin: 0 8px;
    }
}
</style>
