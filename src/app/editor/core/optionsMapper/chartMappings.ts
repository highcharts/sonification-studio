import { GenericObject } from '../utils/objects';

function parseCsvToMap(csvString: string, plotType: string): Map<string, Array<number | string | [number, number]>> {
    const rows = csvString.split('\r\n');
    const headers = rows[0].split(';');
    const map = new Map<string, Array<number | string | [number, number]>>();

    headers.forEach(header => map.set(header, []));

    if (plotType != "columnErrorbar") {
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(';');
            values.forEach((value, index) => {
                const key = headers[index];
                const numValue = parseFloat(value);
                map.get(key)?.push(isNaN(numValue) ? value : numValue);
            });
        }
    } else {
        // Assume "Low Value" and "High Value" are at fixed positions
        const lowIndex = headers.indexOf("Low Value");
        const highIndex = headers.indexOf("High Value");
        const errorBarData: Array<[number, number]> = [];
        
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(';');
            // Convert low and high values from string to number and store as pair
            const lowValue = parseFloat(values[lowIndex]);
            const highValue = parseFloat(values[highIndex]);
            errorBarData.push([lowValue, highValue]);

            // Populate other data into the map
            values.forEach((value, index) => {
                if (index !== lowIndex && index !== highIndex) { // Skip low and high values for normal columns
                    const key = headers[index];
                    const numValue = parseFloat(value);
                    map.get(key)?.push(isNaN(numValue) ? value : numValue);
                }
            });
        }

        // Add error bar data under a new key
        map.set("errorbardata", errorBarData);
    }

    return map;
}

export class ChartMappings {

    public static type(value: string): GenericObject {
        return { chart: { type: value } };
    }

    public static series(value: any, chart: GenericObject): GenericObject {
        const dataMap = parseCsvToMap(chart.options.data.csv,value);

        // Assume the first two columns are what we're interested in for this example
        const columnNames = Array.from(dataMap.keys());
        if (value === 'columnErrorbar') {
            const errorBarData = dataMap.get("errorbardata") || [];

            const columnSeries =  {
                name: columnNames[1],
                type: 'column',
                data: dataMap.get(columnNames[1]) || [],
            };
            const errorBarSeries = {
                name: columnNames[1]+' ErrorBar',
                type: 'errorbar',
                data: errorBarData
        };

            return [columnSeries,errorBarSeries];

        }
        // Handle other types as before
        

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
