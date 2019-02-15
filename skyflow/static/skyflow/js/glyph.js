let svg = d3.select('body').append('svg')
    .attr('width', 1000)
    .attr('height', 1000);
let glyph = svg.append('g')
    .attr('class', 'glyph')
    .attr('transform', 'translate(250, 250)');

const SKYLINE_COLOR = '#4A6FE3',
    NON_SKYLINE_COLOR = '#D33F6A';
const column_scale = d3.scaleOrdinal(["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"])
let arr = d3.range(0, 40).map(d => column_scale(d))
let colorscale = d3.scaleOrdinal(d3.schemeCategory10);
let glyphdata = [];
let columns = [30, 20, 50, 70, 10, 40, 90, 100, 15, 25, 10, 21];
let outerscale = d3.scaleLinear().domain([0, 100]).range([0.5, 150]);
let radius = 10;
glyphdata.push({'dom': radius});

glyph.selectAll('rect')
    .data(arr)
    .enter()
    .append('rect')
    .attr('width', '5px')
    .attr('height', '5px')
    .attr('x', function (d, i) {
        return 500 + i * 5;
    })
    .attr('fill', (d, i) => arr[i]);

let pie = d3.pie().sort(null)
    .value(function () {
        return 100 / columns.length;
    });

glyph.selectAll("path")
    .data(function (d, i) {
        let pd = pie(columns);
        return pd;
    })
    .enter()
    .append('path')
    .attr("fill", function (d, i) {
        return column_scale(i);
    })
    .attr('stroke', 'white')
    .style('opacity', 0.9)
    .attr('stroke-width', '2px')
    .attr("d", function (d, i) {
        let arc = d3.arc()
            .outerRadius(function (d) {
                console.log(d);
                return radius + outerscale(d.data);
            })
            .innerRadius(radius);
        return arc(d);
    });
glyph.selectAll('circle')
    .data(glyphdata)
    .enter()
    .append('circle')
    .attr('r', function (d) {
        return radius;
    })
    .attr('fill', SKYLINE_COLOR)
    .style('opacity', 0.9)
    .attr('stroke', 'white')
    .attr('stroke-width', '2px');

let colormax = 20;
let cs1 = d3.scaleLinear()
    .domain([0, colormax / 2 - 1])
    .range([d3.rgb('#4A6FE3'), d3.rgb('#DADEEE')])
    .interpolate(d3.interpolateRgb);

let cs2 = d3.scaleLinear()
    .domain([colormax / 2, colormax - 1])
    .range([d3.rgb('#F1D8DD'), d3.rgb('#D33F6A')])
    .interpolate(d3.interpolateRgb);

let rectsize = 15;


let colorbar_svg = d3.select('body')
    .append('svg')
    .attr('class', 'colorbar')
    .attr('width', 500)
    .attr('height', 500);

colorbar_svg.append('g')
    .attr('class', 'colorbar')
    .attr('transform', 'translate(0, 0)');


colorbar_svg.select('g').selectAll('rect')
    .data(d3.range(0, colormax))
    .enter()
    .append('rect')
    .attr('y', (d, i) => {
        if (i < colormax / 2)
            return 10;
        else
            return 30;
    })
    .attr('x', (d, i) => {
        if (i < colormax / 2)
            return 100 + i * rectsize;
        else
            return 100 + (i - (colormax / 2)) * rectsize;
    })
    .attr('width', rectsize)
    .attr('height', rectsize)
    .attr('stroke', 'black')
    .style('fill', (d, i) => {
        if (i < colormax / 2)
            return cs1(d);
        else
            return cs2(d);
    });
colorbar_svg.select('g')
    .append('text')
    .attr('x', 60)
    .attr('y', 20)
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'middle')
    .style('font-size', '12px')
    .text('Skyline');

colorbar_svg.select('g')
    .append('text')
    .attr('x', 60)
    .attr('y', 40)
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'middle')
    .style('font-size', '12px')
    .text('Non-skyline');


colorbar_svg.select('g')
    .append('text')
    .attr('x', 180)
    .attr('y', 65)
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'middle')
    .style('font-size', '12px')
    .text('Dominance');

let axis = d3.axisBottom(d3.scaleOrdinal().domain(['high', 'low']).range([0, rectsize * colormax / 2]));
colorbar_svg.select('g')
    .append('g')
    .attr('transform', 'translate(99.5,50)')
    .call(axis);

let sankey_svg = d3.select('body').append('svg')
    .attr('width', '500px')
    .attr('height', '500px');

sankey_svg.append('g');
let keys = ['skyline', 'non-skyline', 'bench'];
let stack = d3.stack().keys(keys);
// let layers = stack(sky_filtered_length);

let sankey_data = [
    {'skyline': 30, 'non-skyline': 20, 'bench': 10},
    {'skyline': 30, 'non-skyline': 20, 'bench': 10},
    {'skyline': 30, 'non-skyline': 20, 'bench': 10}
];
var lineGenerator = d3.line()
    .curve(d3.curveCardinal);

var points = [
    [0, 80],
    [100, 100],
    // [200, 30],
    // [300, 50],
    // [400, 40],
    // [500, 80]
];

var pathData = lineGenerator(points);

d3.select('path')
    .attr('d', pathData)
    .attr('stroke', 'black');


// Also draw points for reference

let sankey_paths = [
    {},
    {}
];
let z = d3.scaleOrdinal()
    .range([SKYLINE_COLOR, NON_SKYLINE_COLOR, 'yellow']);
