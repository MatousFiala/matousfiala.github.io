
let castkaType = "total";
let oblast = "Vše";
let variable = "n"

let svg = null;
let svg_map = null;

const width = 700;
const height = 400;

let round = function(d, n=0) {
    return Math.round(d * (10**n)) / (10**n)
}

let valueFormat = function(castkaType, variable) {

    if (castkaType === "total") {
        if (variable === "n") {
            return (d, obyv) => d;
        }
        else if (variable === "total") {
            return (d, obyv) => round(d / (10**9), 2) + " mld. Kč"
        }
    }
    else if (castkaType === "per-capita") {

        if (variable === "n") {
            return (d, obyv) => round(1000*d/obyv, 2);
        }
        else if (variable === "total") {
            return (d, obyv) => round(d/obyv)  + " Kč"
        }
    }
}

let createIropPodporaVis = function() {

    d3.select("#irop-podpora").selectAll("svg").remove();

    svg = d3.select("#irop-podpora")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(200, 50)`);

    svg_map = d3.select("#irop-podpora")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    updateIropPodporaVis()
}

let updateIropPodporaVis = function() {

    Promise.all([
        d3.csv("oblasti.csv"),
        d3.json("kraje.geojson")
    ]).then(function ([csvData, topoData]) {
        // Join data based on kraj and nuts3_kod
        let data = csvData.map(d => ({
            ...d,
            geometry: topoData.features.find(g => g.properties.NUTS3_KOD === d.kraj)}))

        let data_filtered = castkaType === "total" ?
            data.filter(d => d.measure === variable).sort((a, b) => +b[oblast] - +a[oblast]) :
            data.filter(d => d.measure === variable).sort((a, b) => (+b[oblast] / +b.obyvatel) - (+a[oblast] / +a.obyvatel));


        let xScale = d3.scaleLinear()
            .domain([0, d3.max(data_filtered, function(d) { return castkaType === "total" ? +d[oblast] : +d[oblast] / +d.obyvatel })])
            .range([0, width - 200 - 100]);

        svg
            .selectAll("rect")
            .data(data_filtered, d => d.kraj)
            .join("rect")
            .attr("height", 18)
            .attr("x", 200)
            .attr("fill", "#b0b0b0")
            .transition().duration(1000)
            .attr("width", d => xScale(castkaType === "total" ? d[oblast] : d[oblast] / d.obyvatel))
            .attr("y", (d, i) => i*20 + 60 + 18);

        svg
            .selectAll("text.value")
            .data(data_filtered, d => d.kraj)
            .join("text")
            .classed("value", true)
            .attr("fill", "#999")
            .style("font-size", "12px")
            .text(d => valueFormat(castkaType, variable)(d[oblast], d.obyvatel))
            .transition().duration(1000)
            .attr("x", d => 200 + 10 + xScale(castkaType === "total" ? d[oblast] : d[oblast] / d.obyvatel))
            .attr("y", (d, i) => (i+0.5)*20 + 60 + 20);

        svg
            .selectAll("text.label")
            .data(data_filtered, d => d.kraj)
            .join("text")
            .classed("label", true)
            .attr("x", 0)
            .attr("fill", "#b0b0b0")
            .text(d => d.nazev)
            .transition().duration(1000)
            .attr("y", (d, i) => (i + 0.5) * 20 + 60 + 20);

        xAxis = d3.axisTop(xScale)
            .ticks(5)
            .tickFormat(d => valueFormat(castkaType, variable)(d, 1));

        svg.select(".x-axis")
            .selectAll(".axisLabel")
            .remove();

        svg.select(".x-axis")
            .call(xAxis)
            .append("text")
            .attr("class", "axisLabel")
            .text(castkaType === "total" ? variable === "n" ? "Počet projektů" : "Celková vyplacená částka" : variable === "n" ? "Projektů na 1 000 obyvatel" : "Podpora na obyvatele")
            .attr("fill", "#b0b0b0")
            .attr("x", (width - 200 - 75) / 2 )
            .attr("y", -35)
            .style("font-size", "12pt");


        console.log(data_filtered.map(d => d.geometry))
        let projection = d3.geoMercator()
            .fitSize([width, height], {
                type: "FeatureCollection",
                features: data_filtered.map(d => d.geometry)
            });
        let geoGenerator = d3.geoPath().projection(projection);
        let scaleColour = d3.scaleSequential()
            .domain([0, d3.max(data_filtered, d => castkaType === "total" ?  +d[oblast] : d[oblast] / d.obyvatel)])
            .interpolator(d3.interpolateViridis);

        // Create tooltip div if it doesn't exist
        let tooltip = d3.select("body").selectAll(".tooltip").data([0])
            .join("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("color", "black")
            .style("font-size", "12px")
            .style("opacity", "0.8");

        svg_map
            .selectAll("path")
            .data(data_filtered, d => d.kraj)
            .join("path")
            .attr("d", d => geoGenerator(d.geometry.geometry))
            .on("mouseover", function (event, d) {
                tooltip
                    .style("visibility", "visible")
                    .html(`Kraj: ${d.nazev}<br/>
                           Počet projektů v oblasti ${oblast}: ${d[oblast]}<br/>
                           Na 1000 obyvatel: ${(1000 * d[oblast] / d.obyvatel).toFixed(3)}`);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            })
            .transition()
            .duration(1000)
            .attr("fill", d => scaleColour(castkaType === "total" ? d[oblast] : d[oblast] / d.obyvatel))

    })
    .catch(function (error) {
        console.error("Error loading the data: ", error);
    });

}

createIropPodporaVis()

// make irop podpora buttons work
d3.selectAll(".irop-podpora-data-selector")
    .on("click", function(){
        d3.selectAll(".irop-podpora-data-selector")
            .classed("active", false);

        d3.select(this).classed("active", true);
        castkaType = d3.select(this).attr("value");

        updateIropPodporaVis()
    });


d3.selectAll(".irop-podpora-variable-selector")
    .on("click", function(){
        d3.selectAll(".irop-podpora-variable-selector")
            .classed("active", false);

        d3.select(this).classed("active", true);
        variable = d3.select(this).attr("value");

        updateIropPodporaVis()
    });

d3.select("#irop-podpora-oblast-selector")
    .on("change", function() {
        oblast = d3.select("#irop-podpora-oblast-selector option:checked").attr("value")

        updateIropPodporaVis()
    });

