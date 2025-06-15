// Global variables
let mapData = null;
let exekuceData = null;
let currentGranularity = 'kraje';

let min_exekuci = null;
let max_exekuci = null;

// Initialize the visualizations
async function init() {
    // Load data
    try {
        // Load map data based on current granularity
        mapData = await d3.json(`Geojson/${currentGranularity}_paq.geojson`);
        
        // Load exekuce data
        exekuceData = await d3.csv('Open-Data-soudni-exekutori.csv', d => ({
            name: d.urad.replace(/^.+:/, "").replace(/(?:Mgr\.|JUDr\.|Ing\.|Ph\.\s?D\.|LL\.M\.|Et Mgr\.|Bc\.)(?:\s*,\s*(?:Mgr\.|JUDr\.|Ing\.|Ph\.D\.|LL\.M\.|Et Mgr\.|Bc\.))*\s*/g, "").replace(/,/, "").trim(),  // Remove prefix and academic titles
            count: +d.exekuci,
            district: d.obvod
        }));

        min_exekuci = d3.min(exekuceData, d => d.count);
        max_exekuci = d3.max(exekuceData, d => d.count);

        // Initialize slider range
        let default_value = 50000;
        d3.select('#min-exekuce').attr('min', min_exekuci).attr('max', max_exekuci).attr('value', default_value);
        d3.select('#min-exekuce-value').text(default_value);
        
        // Initialize visualizations
        initMap();
        initBarChart();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Map visualization
function initMap() {
    const width = document.getElementById('map').clientWidth;
    const height = 500;
    
    const svg = d3.select('#map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    // Create projection
    const projection = d3.geoMercator()
        .fitSize([width, height], mapData);
    
    const path = d3.geoPath().projection(projection);
    
    // Create color scale
    const colorScale = d3.scaleQuantize()
        .domain([0, d3.max(mapData.features, d => d.properties.KANDIDATU || 0)])
        .range(d3.schemeBlues[9]);
    
    // Draw map
    svg.append('g')
        .selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', d => colorScale(d.properties.KANDIDATU || 0))
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`Region: ${d.properties.NAZEV}<br/>Kandidáti: ${d.properties.KANDIDATU || 0}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // Add color legend
    addColorLegend(svg, colorScale, width, height);
}

// Add color legend to the map
function addColorLegend(svg, colorScale, width, height) {
    const legendWidth = 200;
    const legendHeight = 20;
    const legendMargin = 20;
    
    // Create legend group
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - legendWidth - legendMargin}, ${height - legendHeight - legendMargin})`);
    
    // Create gradient
    const gradient = legend.append('defs')
        .append('linearGradient')
        .attr('id', 'colorGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    // Add gradient stops
    const domain = colorScale.domain();
    const range = colorScale.range();
    const step = (domain[1] - domain[0]) / (range.length - 1);
    
    range.forEach((color, i) => {
        gradient.append('stop')
            .attr('offset', `${(i / (range.length - 1)) * 100}%`)
            .attr('stop-color', color);
    });
    
    // Add gradient rectangle
    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#colorGradient)')
        .style('stroke', '#000')
        .style('stroke-width', 0.5);
    
    // Add scale
    const xScale = d3.scaleLinear()
        .domain(domain)
        .range([0, legendWidth]);
    
    const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickValues([...d3.ticks(domain[0], domain[1], 3), domain[1]])  // Include domain endpoints and 3 intermediate ticks
        .tickFormat(d3.format(',.0f'));
    
    legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(xAxis);
    
    // Add title
    legend.append('text')
        .attr('x', legendWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .text('Počet kandidátů');
}

// Bar chart visualization
function initBarChart() {
    const width = document.getElementById('bar-chart').clientWidth;
    const height = 500;
    const margin = {top: 20, right: 30, bottom: 90, left: 60};
    
    const svg = d3.select('#bar-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    
    // Filter and sort data
    const filteredData = exekuceData
        .filter(d => d.count >= document.getElementById('min-exekuce').value)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Show top 20 exekutors
    
    // Create scales
    const x = d3.scaleBand()
        .domain(filteredData.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.count)])
        .range([height - margin.bottom, margin.top]);
    
    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    
    // Add bars
    svg.selectAll('rect')
        .data(filteredData)
        .enter()
        .append('rect')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.count))
        .attr('fill', '#3498db')
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`Exekutor: ${d.name}<br/>Počet exekucí: ${d.count.toLocaleString()}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
}

// Event listeners
function setupEventListeners() {
    // Map granularity buttons
    document.querySelectorAll('.granularity-btn').forEach(button => {
        button.addEventListener('click', async function() {
            document.querySelectorAll('.granularity-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentGranularity = this.dataset.granularity;
            
            // Reload map data
            try {
                mapData = await d3.json(`Geojson/${currentGranularity}_paq.geojson`);
                d3.select('#map').select('svg').remove();
                initMap();
            } catch (error) {
                console.error('Error loading map data:', error);
            }
        });
    });
    
    // Exekuce slider
    document.getElementById('min-exekuce').addEventListener('input', function() {
        document.getElementById('min-exekuce-value').textContent = this.value;
        d3.select('#bar-chart').select('svg').remove();
        initBarChart();
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init); 