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


let scatter_svg = d3.select('body').append('svg')
    .attr('width', '500px')
    .attr('height', '500px');

// scatter_svg.append('g')
//     .attr('transform', 'translate(30,10)');

let scatter_data = [['A', 2, 3], ['B', 5, 8], ['C', 7, 2], ['D', 1, 5], ['E', 8, 7]];
let scatter_data2 = [['A', 6, 6], ['B', 4, 7], ['C', 7, 2], ['D', 1, 8], ['E', 4, 4]];

let skyline_data = [[0, 8], [5, 8], [5, 7], [8, 7], [8, 0]];
let skyline_points = [['B', 5, 8], ['E', 8, 7]]
let skyline_data2 = [[0, 8],[1,8],[1,7], [4, 7], [4, 6], [6, 6], [6, 2], [7, 2], [7, 0]];


const x = d3.scaleLinear()
    .range([0, 300])
    .domain([0, 10])
    .nice();

const y = d3.scaleLinear()
    .range([300, 0])
    .domain([0, 10]);


const xAxis = d3.axisBottom(x).ticks(12),
    yAxis = d3.axisLeft(y).ticks(12);

const xAxis2 = d3.axisBottom(x).ticks(12),
    yAxis2 = d3.axisLeft(y).ticks(12);


scatter_svg.append("g")
    .attr("class", "grid grid-x")
    .attr("transform", "translate(130," + 310 + ")")
    .call(xAxis2
        .tickSize(-300)
        .tickFormat(''));

scatter_svg.append("g")
    .attr("class", "grid grid-y")
    .attr("transform", "translate(130," + 10 + ")")
    // .attr('transform', 'skewY(-30)')
    .call(yAxis2
        .tickSize(-300)
        .tickFormat(''));

scatter_svg.selectAll('.grid')
    .selectAll('line')
    .attr('stroke', 'lightgray');
scatter_svg.append('text')
    .attr('transform', 'rotate(-90) translate(-150,110)')
    .style('text-anchor', 'middle')
    .text('rebound')
scatter_svg.append('text')
    .attr('transform', 'translate(265,340)')
    .style('text-anchor', 'middle')
    .text('score')
scatter_svg.append('g')
    .attr('transform', 'translate(130,310)')
    .call(xAxis)
scatter_svg.append('g')
    .attr('transform', 'translate(130,10)')
    .call(yAxis)
scatter_svg.append('g')
    .attr('transform', 'translate(130,10)')
    .selectAll('rect')
    .data(skyline_points)
    .enter()
    .append('rect')
    .attr('x', d => x(0))
    .attr('y', d => y(d[2]))
    .attr('fill', d => d3.schemeCategory10[['A', 'B', 'C', 'D', 'E'].indexOf(d[0])])
    .attr('width', d => x(d[1]))
    .attr('height', d => y(10 - d[2]))
    .style('opacity', 0.3)

let skyline_gen = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[1]))
scatter_svg.append('g')
    .attr('transform', 'translate(130,10)')
    .append('path')
    .attr('d', skyline_gen(skyline_data))
    .attr('fill', 'transparent')
    .attr('stroke', '#4A6FE3')
    .style('stroke-width', 3)
scatter_svg.append('g')
    .attr('transform', 'translate(130,10)')
    // .attr('transform', 'skewY(-30)')
    .selectAll('.dot')
    .data(scatter_data)
    .enter()
    .append('circle')
    .attr('class', '.dot')
    .attr('r', 5)
    .attr('stroke', (d, i) => {
        return d3.schemeCategory10[i];
    })
    .attr('fill', (d, i) => {
        return 'white'
        // return d3.schemeCategory10[i];
    })
    .attr('stroke-width', 3)
    .attr('cx', d => x(d[1]))
    .attr('cy', d => y(d[2]))

scatter_svg.append('g')
    .attr('transform', 'translate(130,10)')
    // .attr('transform', 'skewY(-30)')
    .selectAll('.dot')
    .data(scatter_data)
    .enter()
    .append('text')
    .attr('class', '.label')
    .text(d => d[0])
    .attr('x', d => x(d[1]) + 5)
    .attr('y', d => y(d[2]) - 5)


let scatter_svg2 = d3.select('body').append('svg')
    .attr('width', '1000px')
    .attr('height', '1000px');

let s1 = scatter_svg2.append("g")
    .attr('class', 's1')
    .attr('transform', 'translate(200,200), skewY(0)')
let s2 = scatter_svg2.append("g")
    .attr('class', 's2')
    .attr('transform', 'translate(200,200), skewY(0)')
// let s3 = scatter_svg2.append("g")
//     .attr('class', 's3')
//     .attr('transform', 'translate(240,240), skewY(0)')
s1.append("g")
    .attr("class", "grid grid-x")
    .attr("transform", "translate(30," + 310 + ")")
    .call(xAxis2
        .tickSize(-300)
        .tickFormat(''));

s1.append("g")
    .attr("class", "grid grid-y")
    .attr("transform", "translate(30," + 10 + ")")
    // .attr('transform', 'skewY(-30)')
    .call(yAxis2
        .tickSize(-300)
        .tickFormat(''));

s1.selectAll('.grid')
    .selectAll('line')
    .attr('stroke', 'lightgray');

// s1.append('g')
//     .attr('transform', 'translate(30,310)')
//     .call(xAxis.tickFormat(''))
//     .style('opacity', 0.6)
// s1.append('g')
//     .attr('transform', 'translate(30,10)')
//     .call(yAxis.tickFormat(''))
//     .style('opacity', 0.6)
s1.append('g')
    .attr('transform', 'translate(30,310)')
    .call(xAxis)
s1.append('g')
    .attr('transform', 'translate(30,10)')
    .call(yAxis)


s1.append('g')
    .attr('transform', 'translate(30,10)')
    .append('path')
    .attr('d', skyline_gen(skyline_data))
    .attr('fill', 'transparent')
        .attr('stroke', '#4A6FE3')
    .style('stroke-width', 3)
    .style('opacity', 0.4)
s1.append('g')
    .attr('transform', 'translate(30,10)')
    // .attr('transform', 'skewY(-30)')
    .selectAll('.dot')
    .data(scatter_data)
    .enter()
    .append('circle')
    .attr('class', '.dot')
    .attr('r', 5)
    .attr('stroke', (d, i) => {
        return d3.schemeCategory10[i];
    })
    .attr('fill', (d, i) => {
        return 'white'
        // return d3.schemeCategory10[i];
    })
    .attr('cx', d => x(d[1]))
    .attr('cy', d => y(d[2]))
    .style('opacity', 0.6)

// s2.append("g")
//     .attr("class", "grid grid-x")
//     .attr("transform", "translate(30," + 310 + ")")
//     .call(xAxis2
//         .tickSize(-300)
//         .tickFormat(''));
//
// s2.append("g")
//     .attr("class", "grid grid-y")
//     .attr("transform", "translate(30," + 10 + ")")
//     // .attr('transform', 'skewY(-30)')
//     .call(yAxis2
//         .tickSize(-300)
//         .tickFormat(''));
//
// s2.selectAll('.grid')
//     .selectAll('line')
//     .attr('stroke', 'lightgray');

s1.append('g')
    .attr('transform', 'translate(30,10)')
    // .attr('transform', 'skewY(-30)')
    .selectAll('.dot')
    .data(scatter_data)
    .enter()
    .append('text')
    .attr('class', 'label')
    .text(d => d[0])
    .attr('x', d => x(d[1]) + 5)
    .attr('y', d => y(d[2]) - 5)
    .style('opacity', 0.6)

s2.append('g')
    .attr('transform', 'translate(30,310)')
    .call(xAxis.tickFormat(''))
    .style('opacity', 0.9)
s2.append('g')
    .attr('transform', 'translate(30,10)')
    .call(yAxis.tickFormat(''))
    .style('opacity', 0.9)


s2.append('g')
    .attr('transform', 'translate(30,10)')
    .append('path')
    .attr('d', skyline_gen(skyline_data2))
    .attr('fill', 'transparent')
    .attr('stroke', '#4A6FE3')
    .style('stroke-width', 3)
    .style('opacity', 0.9)
s2.append('g')
    .attr('transform', 'translate(30,10)')
    // .attr('transform', 'skewY(-30)')
    .selectAll('.dot')
    .data(scatter_data2)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 5)
    .attr('fill', (d, i) => {
        return d3.schemeCategory10[i];
    })
    .attr('cx', d => x(d[1]))
    .attr('cy', d => y(d[2]))
    .style('opacity', 0.9)

s2.append('g')
    .attr('transform', 'translate(30,10)')
    // .attr('transform', 'skewY(-30)')
    .selectAll('.dot')
    .data(scatter_data2)
    .enter()
    .append('text')
    .attr('class', '.label')
    .text(d => d[0] + "'")
    .attr('x', d => x(d[1]) + 5)
    .attr('y', d => y(d[2]) - 5)
    .style('opacity', 0.9)