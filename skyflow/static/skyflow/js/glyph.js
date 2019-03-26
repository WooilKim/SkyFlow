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
    .style('opacity', 0.9);

let detail_svg = d3.select('body').append('svg');
detail_svg.append('g');
let detail_data = [10, 11, 13, 16, 17, 19, 19, 20, 21, 22, 22, 24, 25, 27, 28, 30, 36, 40, 46, 50];
console.log(detail_data.length);
let detail_line = d3.line()

detail_svg.selectAll('rect')
    .data(detail_data)
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * 2)
    .attr('y', function (d, i) {
        if (i < 50)
            return 100 - d;
        else
            return 0;
    })
    .attr('fill', 'blue')
    .attr('width', 2)
    .attr('height', function (d, i) {
        if (i < 50)
            return d;
        else
            return 100 - d;
    });

let detail_axis = d3.axisLeft(d3.scaleLinear().domain([100, 0]).range([0, 100])).tickValues([10, 50])
detail_svg.append('g')
    .attr('transform', 'translate(30,0)')
    .call(detail_axis);

let detail_selected = [['orange'], ['blue'], ['green']]
detail_svg.selectAll('.selected')
    .data(detail_selected)
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * 100 / 3)
    .attr('y', 110)
    .attr('width', 100 / 3)
    .attr('height', 10)
    .attr('fill', d => d);

let flow_svg = d3.select('body').append('svg');
let flow_data = [[10, 20, 5], [13, 18, 10], [11, 20, 7]];

let rect_width = 10;

// t1
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', flow_data[0][0] * 2)
    .attr('fill', SKYLINE_COLOR)

flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 0)
    .attr('y', 25)
    .attr('height', flow_data[0][1] * 2)
    .attr('fill', NON_SKYLINE_COLOR)

flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 0)
    .attr('y', 70)
    .attr('height', flow_data[0][2] * 2)
    .attr('fill', 'grey')

// t2
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 50)
    .attr('y', 0)
    .attr('height', flow_data[1][0] * 2)
    .attr('fill', SKYLINE_COLOR)

flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 50)
    .attr('y', 31)
    .attr('height', flow_data[1][1] * 2)
    .attr('fill', NON_SKYLINE_COLOR)

flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 50)
    .attr('y', 72)
    .attr('height', flow_data[1][2] * 2)
    .attr('fill', 'grey')


// t3
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 100)
    .attr('y', 0)
    .attr('height', flow_data[2][0] * 2)
    .attr('fill', SKYLINE_COLOR)

flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 100)
    .attr('y', 27)
    .attr('height', flow_data[2][1] * 2)
    .attr('fill', NON_SKYLINE_COLOR)

flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 100)
    .attr('y', 72)
    .attr('height', flow_data[2][2] * 2)
    .attr('fill', 'grey')

let link = d3.linkHorizontal()
    .x(function (d) {
        console.log(d);
        return d[0];
    })
    .y(function (d) {
        return d[1];
    });
let path_data = [
    {source: [5, 20], target: [5, 45], w: 10, opt: 'ss'},
    {source: [12, 20], target: [35, 45], w: 5, opt: 'sn'},
    {source: [20, 20], target: [80, 45], w: 5, opt: 'sb'},
];
let grads = flow_svg.append('defs').selectAll('linearGradient')
    .data(path_data)
    .enter()
    .append('linearGradient')
    .attr('id', (d, i) => {
        return 'grad-' + i
    })
    .attr('gradientUnits', 'userSpaceOnUse');

grads.attr('x1', d => {
    return d.source[0]
})
    .attr('y1', d => {
        return d.source[1]
    })
    .attr('x2', d => {
        return d.target[0]
    })
    .attr('y2', d => {
        return d.target[1]
    });
grads.append("stop")
    .attr("offset", "30%")
    .attr("stop-color", function (d, i) {
        if (d.opt[0] == 's')
            return SKYLINE_COLOR;
        else
            return NON_SKYLINE_COLOR
    });
grads.append("stop")
    .attr("offset", "70%")
    .attr("stop-color", function (d) {
        if (d.opt[1] == 's')
            return SKYLINE_COLOR;
        else if (d.opt[1] == 'n')
            return NON_SKYLINE_COLOR
        else return 'grey'
    });

flow_svg.selectAll('path')
    .data(path_data)
    .enter()
    .append('path')
    .attr('d', function (d) {
        console.log(d);
        return "M" + d.source[1] + "," + d.source[0]
            + "C" + (d.source[1] + d.target[1]) / 2 + "," + d.source[0]
            + " " + (d.source[1] + d.target[1]) / 2 + "," + d.target[0]
            + " " + d.target[1] + "," + d.target[0];
    })
    .attr('stroke-width', function (d) {
        return d.w;
    })
    .attr('stroke', function (d, i) {
        return 'url(#grad-' + i + ')';
    })
    .attr('fill', 'transparent')
    .style('opacity', 0.7);

// selected
// A
flow_svg.append('rect')
    .attr('x', 10)
    .attr('y', 0)
    .attr('width', 3)
    .attr('height', 10)
    .attr('fill', 'green')
    .style('opacity', 0.7)

// B
flow_svg.append('rect')
    .attr('x', 10)
    .attr('y', 10)
    .attr('width', 3)
    .attr('height', 10)
    .attr('fill', 'pink')
    .style('opacity', 0.7)

// C
flow_svg.append('rect')
    .attr('x', 10)
    .attr('y', 25)
    .attr('width', 3)
    .attr('height', 40)
    .attr('fill', 'orange')
    .style('opacity', 0.7)