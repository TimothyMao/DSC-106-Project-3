import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let data; // Declare data in a broader scope
let svg;
let x;
let y;
let line;
let width;
let height;
const idToColor = {}; // Store color for each ID

document.addEventListener('DOMContentLoaded', async () => {
    data = await loadData(); // Load data and assign it
    createLineplot();
    document.getElementById('updatePlot').addEventListener('click', () => {
        const sex = document.getElementById('sex').value;
        const checkedIds = Array.from(document.querySelectorAll('#id-container input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        const dataType = document.getElementById('dataType').value;
        updatePlot(sex, checkedIds, dataType);
    });

    document.getElementById('selectAll').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('#id-container input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    });

    document.getElementById('clearAll').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('#id-container input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });
});

async function loadData() {
    return await d3.csv('mouse.csv', (row) => ({
        time: +row.time,
        day: +row.day,
        hour: +row.hour,
        is_night: row.is_night === '1',
        is_estrus: row.is_estrus === '1',
        m1_act: +row.m1_act,
        m2_act: +row.m2_act,
        m3_act: +row.m3_act,
        m4_act: +row.m4_act,
        m5_act: +row.m5_act,
        m6_act: +row.m6_act,
        m7_act: +row.m7_act,
        m8_act: +row.m8_act,
        m9_act: +row.m9_act,
        m10_act: +row.m10_act,
        m11_act: +row.m11_act,
        m12_act: +row.m12_act,
        m13_act: +row.m13_act,
        f1_act: +row.f1_act,
        f2_act: +row.f2_act,
        f3_act: +row.f3_act,
        f4_act: +row.f4_act,
        f5_act: +row.f5_act,
        f6_act: +row.f6_act,
        f7_act: +row.f7_act,
        f8_act: +row.f8_act,
        f9_act: +row.f9_act,
        f10_act: +row.f10_act,
        f11_act: +row.f11_act,
        f12_act: +row.f12_act,
        f13_act: +row.f13_act,
        m1_temp: +row.m1_temp,
        m2_temp: +row.m2_temp,
        m3_temp: +row.m3_temp,
        m4_temp: +row.m4_temp,
        m5_temp: +row.m5_temp,
        m6_temp: +row.m6_temp,
        m7_temp: +row.m7_temp,
        m8_temp: +row.m8_temp,
        m9_temp: +row.m9_temp,
        m10_temp: +row.m10_temp,
        m11_temp: +row.m11_temp,
        m12_temp: +row.m12_temp,
        m13_temp: +row.m13_temp,
        f1_temp: +row.f1_temp,
        f2_temp: +row.f2_temp,
        f3_temp: +row.f3_temp,
        f4_temp: +row.f4_temp,
        f5_temp: +row.f5_temp,
        f6_temp: +row.f6_temp,
        f7_temp: +row.f7_temp,
        f8_temp: +row.f8_temp,
        f9_temp: +row.f9_temp,
        f10_temp: +row.f10_temp,
        f11_temp: +row.f11_temp,
        f12_temp: +row.f12_temp,
        f13_temp: +row.f13_temp
    }));
}

async function createLineplot() {
    const margin = { top: 50, right: 30, bottom: 40, left: 50 };
    width = 800 - margin.left - margin.right;
    height = 400 - margin.top - margin.bottom;

    const totalWidth = width + margin.left + margin.right + 150; // Increased width for legend

    svg = d3.select("#lineplot-container").append("svg")
        .attr("width", totalWidth) // Set width to accommodate legend
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.time))
        .range([0, width]);

    y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(Object.values(data[0]).slice(3)))])
        .range([height, 0]);

    line = d3.line()
        .x(d => x(d.time))
        .y(d => d.value);

    // Add zoom functionality
    const zoom = d3.zoom()
        .scaleExtent([1, 20]) // Set zoom limits
        .translateExtent([[0, 0], [width, height]]) // Set pan limits
        .on("zoom", zoomed);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);

    function zoomed(event) {
        const transform = event.transform;
        x.range([0, width].map(d => transform.applyX(d)));
        y.range([height, 0].map(d => transform.applyY(d)));
        updatePlot(document.getElementById('sex').value, Array.from(document.querySelectorAll('#id-container input[type="checkbox"]:checked')).map(checkbox => checkbox.value), document.getElementById('dataType').value);
    }

    window.updatePlot = function(sex, ids, dataType) { // Make updatePlot globally accessible
        const maxValue = d3.max(data, d => {
            let maxVal = 0;
            ids.forEach(id => {
                const val = d[`m${id}_${dataType}`] || d[`f${id}_${dataType}`];
                if (val !== undefined && val > maxVal) {
                    maxVal = val;
                }
            });
            return maxVal;
        });

        let yDomain = [0, maxValue];
        if (dataType === 'temp') {
            yDomain = [0, maxValue * 1.1]; // Increase the maximum value by 10% for temperature
        }

        y = d3.scaleLinear()
            .domain(yDomain)
            .range([height, 0]);

        svg.selectAll(".line").remove();
        svg.selectAll(".axis").remove();
        svg.selectAll(".title").remove(); // Remove previous title
        svg.selectAll(".legend").remove(); // Remove previous legend

        // Add title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .attr("class", "title")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(`${sex.charAt(0).toUpperCase() + sex.slice(1)} ${dataType === 'act' ? 'Activity' : 'Temperature'} Data`);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

        ids.forEach(id => {
            if (!idToColor[id]) {
                idToColor[id] = `hsl(${Math.random() * 360}, 100%, 50%)`;
            }
            const filteredData = data.filter(d => {
                if (sex === 'male') {
                    return d[`m${id}_${dataType}`] !== undefined;
                } else if (sex === 'female') {
                    return d[`f${id}_${dataType}`] !== undefined;
                }
                return false;
            });

            const plotData = filteredData.map(d => ({
                time: d.time,
                value: d[`m${id}_${dataType}`] || d[`f${id}_${dataType}`]
            }));

            svg.append("path")
                .datum(plotData)
                .attr("fill", "none")
                .attr("stroke", idToColor[id]) // Use stored color
                .attr("stroke-width", 1.5)
                .attr("d", line.y(d => y(d.value))) // Update the y position based on the new scale
                .attr("class", `line line-${id}`); // Add a class to each line
        });

        // Add legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 50}, 20)`); // Adjust position

        ids.forEach((id, i) => {
            legend.append("rect")
                .attr("x", 0) // Position to the right of the plot
                .attr("y", i * 20)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", idToColor[id]);

            legend.append("text")
                .attr("x", 15) // Position to the right of the plot
                .attr("y", i * 20 + 9)
                .text(`ID ${id}`)
                .style("font-size", "12px")
                .attr("alignment-baseline", "middle");
        });

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));
    }

    // Initial plot
    updatePlot('male', ['1'], 'act');
}