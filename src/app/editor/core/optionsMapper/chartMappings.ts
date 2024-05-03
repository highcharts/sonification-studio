import { GenericObject } from '../utils/objects';

function parseCsvToMap(csvString: string): Map<string, Array<number | string | [number, number]>> {
    const map = new Map<string, Array<number | string | [number, number]>>();
    const rows = csvString.split('\n').map(row => row.trim()).filter(row => row !== '');
    if (rows.length < 2) return map; // return empty map if there's no data or only headers
    console.log(rows);
    // Process headers
    const headers = rows[0].split(';').map(header =>
        header.toLowerCase().replace(/\s+/g, '')
    );

    // Initialize the map with empty arrays for each header
    headers.forEach(header => {
        map.set(header, []);
    });

    // Populate the map
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(';');
        values.forEach((value, index) => {
            const key = headers[index];
            map.get(key)?.push(parseFloat(value));
        });
    }

    // Special handling for error bars: identify pairs and group them
    const errorBarDataMap = new Map<string, Array<[number, number]>>();

    // Identify low and high pairs dynamically
    headers.filter(header => header.includes('lowvalue')).forEach(lowKey => {
        const suffix = lowKey.match(/\d+$/); // matches the trailing number in 'lowvalue1', 'lowvalue2', etc.
        if (suffix) {
            const highKey = `highvalue${suffix[0]}`;
            if (map.has(highKey)) {
                const errorBarData = [];
                for (let i = 0; i < map.get(lowKey)!.length; i++) {
                    errorBarData.push([map.get(lowKey)![i], map.get(highKey)![i]]);
                }
                const errorBarKey = `errorbardata${suffix[0]}`;
                errorBarDataMap.set(errorBarKey, errorBarData);
            }
        }});

    // Add error bar data to main map
    errorBarDataMap.forEach((data, key) => {
        map.set(key, data);
    });

    return map;
}



export class ChartMappings {

    public static type(value: string): GenericObject {
        return { chart: { type: value } };
    }

    public static series(value: any, chart: GenericObject): Array<GenericObject> | GenericObject {
        const dataMap = parseCsvToMap(chart.options.data.csv);
        const columnNames = Array.from(dataMap.keys()).filter((key, index) => index !== 0 && !key.startsWith('lowvalue') && !key.startsWith('highvalue'));
        if (value === 'Errorbar') {
            const seriesArray: Array<GenericObject> = [];
            // Loop through the map to handle error bar data and normal data\
            columnNames.forEach((columnName) => {
                if (columnName.startsWith('errorbardata')) {
                    // Handle error bar series
                    const errorBarData = dataMap.get(columnName) || [];
                    const errorBarSeries: GenericObject = {
                        name: columnName,
                        type: 'errorbar',
                        data: errorBarData
                    };
                    seriesArray.push(errorBarSeries);
                } else {
                    // Handle normal data series
                    const normalData = dataMap.get(columnName) || [];
                    const normalSeries: GenericObject = {
                        name: columnName,
                        type: 'column',
                        data: normalData
                    };
                    seriesArray.push(normalSeries);
                }});
            return seriesArray;
        }
        return { chart: { type: value } };
    }

    public static legendEnabled(value: boolean): GenericObject {
        return { legend: { enabled: value } };
    }

    public static sharedTooltipEnabled(value: boolean): GenericObject {
        return { tooltip: { shared: value } };
    }

    public static inverted(value: boolean): GenericObject {
        return { chart: { inverted: value } };
    }

    public static title(value: string): GenericObject {
        return { title: { text: value } };
    }

    public static subtitle(value: string): GenericObject {
        return { subtitle: { text: value || null } };
    }

    public static xAxisTitle(value: string): GenericObject {
        return { xAxis: { title: { text: value || null } } };
    }

    public static xAxisType(value: string): GenericObject {
        return { xAxis: { type: value || 'linear' } };
    }

    public static xAxisVisible(value: boolean): GenericObject {
        return { xAxis: { visible: value } };
    }

    public static xAxisMin(value: string): GenericObject {
        return { xAxis: { min: value ? parseFloat(value) : null } };
    }

    public static xAxisMax(value: string): GenericObject {
        return { xAxis: { max: value ? parseFloat(value) : null } };
    }

    public static yAxisTitle(value: string): GenericObject {
        return { yAxis: { title: { text: value || null } } };
    }

    public static yAxisType(value: string): GenericObject {
        return { yAxis: { type: value || 'linear' } };
    }

    public static yAxisVisible(value: boolean): GenericObject {
        return { yAxis: { visible: value } };
    }

    public static yAxisMin(value: string): GenericObject {
        return { yAxis: { min: value ? parseFloat(value) : null } };
    }

    public static yAxisMax(value: string): GenericObject {
        return { yAxis: { max: value ? parseFloat(value) : null } };
    }

    public static seriesLabelsEnabled(value: boolean): GenericObject {
        return { plotOptions: { series: { label: { enabled: value } } } };
    }

    public static zoomType(value: string): GenericObject {
        return { chart: { zoomType: value || null } };
    }

    public static dataGroupingType(value: string): GenericObject {
        return {
            plotOptions: {
                series: {
                    dataGrouping: {
                        enabled: value !== 'none',
                        approximation: value === 'default' ? null : value
                    }
                }
            }
        };
    }
}
