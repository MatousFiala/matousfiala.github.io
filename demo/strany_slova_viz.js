
let str_width = 700;
let str_height = 500;


let str_svg = d3
    .select("#strany-slova")
    .append("svg")
    .attr("width", str_width )
    .attr("height", str_height )


d3.csv("strany_slova.csv")
    .then(function(data) {

        let parties = data.columns.slice(1)
        console.log(parties)

        let maxTotal = d3.max(data, d => {
            return d3.sum(parties, party => +d[party]);
        });


        let scaleX = d3.scaleLinear()
            .domain(d3.extent(data, data => data.year))
            .range([0, str_width]);

        const electionYears = [1996, 1998, 2002, 2006, 2010, 2013, 2017, 2021];

        str_svg.append("g")
            .selectAll(".election-line")
            .data(electionYears)
            .join("line")
            .attr("class", "election-line")
            .attr("x1", d => scaleX(d))
            .attr("x2", d => scaleX(d))
            .attr("y1", 0)
            .attr("y2", str_height - 50)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.5);

        str_svg.append("g")
            .attr("transform", "translate(0," + (str_height - 50) + ")")
            .call(d3.axisBottom(scaleX).tickValues(electionYears));

        let scaleY = d3.scaleLinear()
            .domain([0, maxTotal])
            .range([ str_height / 2 , 0]);

        const color = d3.scaleOrdinal().domain([
                'SPR-RSČ',
                'KSČM',
                'HSD-SMS',
                'ANO',
                'ČMSS',
                'Other',
                'LSU',
                'LB',
                'LSNS',
                'ČMUS',
                'HSDMS',
                'KDU-ČSL',
                'Nezařazení',
                'SZ',
                'ODS',
                'ČSSD',
                'Piráti',
                'ODA',
                'KDS',
                'US',
                'TOP 09',
                'STAN',
                'VV',
                'Úsvit',
                'ONH',
                'SPD'
            ])
            .range([
                'rgb(139, 0, 0)',      // SPR-RSČ - Dark red
                'rgb(220, 20, 60)',    // KSČM - Crimson red
                'rgb(70, 130, 180)',   // HSD-SMS - Steel blue
                'rgb(135, 206, 235)',    // ANO - Royal blue
                'rgb(0, 100, 0)',      // ČMSS - Dark green
                'rgb(128, 128, 128)',  // Other - Gray
                'rgb(255, 140, 0)',    // LSU - Orange
                'rgb(178, 34, 34)',    // LB - Fire brick red
                'rgb(0, 0, 0)',        // LSNS - Black
                'rgb(0, 128, 0)',      // ČMUS - Green
                'rgb(100, 149, 237)',  // HSDMS - Cornflower blue
                'rgb(255, 215, 0)',    // KDU-ČSL - Gold
                'rgb(169, 169, 169)',  // Nezařazení - Dark gray
                'rgb(34, 139, 34)',    // SZ - Forest green
                'rgb(0, 0, 255)',      // ODS - Blue
                'rgb(255, 69, 0)',     // ČSSD - Orange red
                'rgb(0, 0, 0)',        // Piráti - Black
                'rgb(30, 144, 255)',   // ODA - Dodger blue
                'rgb(128, 0, 128)',    // KDS - Purple
                'rgb(65, 105, 225)',   // US - Royal blue
                'rgb(138, 43, 226)',   // TOP 09 - Blue violet
                'rgb(255, 20, 147)',    // STAN - Lime green
                'rgb(106, 90, 205)',    // VV - Orange
                'rgb(160, 82, 45)',   // Úsvit - Deep pink
                'rgb(72, 61, 139)',    // ONH - Dark slate blue
                'rgb(139, 69, 19)'     // SPD - Dark magenta
            ]);

        let tooltipElement = str_svg
            .append("g")
            .attr("id", "tooltip")
            .attr("transform", "translate(25, 50)")
            .attr("fill", "white")
        tooltipElement
            .append("text")
            .attr("id", "tooltip-year")
        tooltipElement
            .append("text")
            .attr("id", "tooltip-party")
            .attr("transform", "translate(0, 20)")
        tooltipElement
            .append("text")
            .attr("id", "tooltip-words")
            .attr("transform", "translate(0, 40)")



        let stackedData = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(parties)
            (data)

        let highlightedYear = 1993
        let highlightedParty = "All"
        tooltip(tooltipElement, highlightedYear, highlightedParty, data)
        
        str_svg
            .selectAll("path.stream")
            .data(stackedData)
            .join("path")
            .attr("class", "stream")
            .style("fill", d => color(d.key))
            .attr("d", d3.area()
                .curve(d3.curveBasis)
                .x(d => scaleX(d.data.year))
            .y0(d => scaleY(d[0]) )
            .y1(d => scaleY(d[1])) )
            .on("mouseenter", function(e, d) {
                d3.selectAll("path.stream").style("opacity", "0.25");
                d3.select(this).style("opacity", "1");
                highlightedParty = d.key

                tooltip(tooltipElement, highlightedYear, d.key, data);
            })
            .on("mouseleave", function(e, d) {
                d3.selectAll("path.stream").style("opacity", "1");
                highlightedParty = "All"
                tooltip(tooltipElement, highlightedYear, d.key, data);
            })



        let yearHighlightBar = str_svg
            .append("g")
            .attr("id", "yearHighlightBar")
            .append("path")
            .attr("d", `M0,0 L0,${str_height - 50}`)
            .attr("stroke", "black")
            .attr("opacity", "0.5")
            .attr("stroke-width", 1);

        str_svg
            .on("mousemove", function (event) {
                const hoverX = Math.round(scaleX.invert(d3.pointer(event)[0]))
                if (hoverX !== highlightedYear) {
                    highlightedYear = hoverX;
                    yearHighighter(yearHighlightBar, highlightedYear, scaleX)
                    console.log(highlightedYear, highlightedParty)
                    tooltip(tooltipElement, highlightedYear, highlightedParty, data)
                }
            });

        
    });

const yearHighighter = function(element, year, scaleX) {

    element.attr("transform", "translate(" + scaleX(year) + ",0)")

    return null
}

function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const tooltip = function(element, year, party, data) {

    const yearData = data.find(row => row.year == year);
    const total = d3.sum(data.columns.slice(1), party => +yearData[party]);
    let words
    let percent
    if (party === "All") {
        words = total
        percent = "100 %"
    }
    else {
        words = yearData[party];
        percent = ((words / total) * 100).toFixed(1) + " %";
    }

    d3.select("#tooltip-year").text("Rok: " + year);
    d3.select("#tooltip-party").text("Strana: " + party);
    d3.select("#tooltip-words").text("Počet slov: " + numberWithSpaces(words) + " (" + percent + ")");


}


