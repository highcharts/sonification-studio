<template>
    <footer>
        <div id="title">
            <a href="https://www.highcharts.com">
                <img
                    alt="Highcharts.com logo"
                    :src="highchartsIcon"
                >
            </a>
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
    margin-top: 8px;
    margin-bottom: 2px;
}

#title {
    margin-top: 15px;
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
