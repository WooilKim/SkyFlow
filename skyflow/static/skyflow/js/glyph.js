let colormax = 20;
let cs1 = d3.scaleLinear()
    .domain([0, colormax / 2 - 1])
    .range([d3.rgb('#4A6FE3'), d3.rgb('#DADEEE')])
    .interpolate(d3.interpolateRgb);

let cs2 = d3.scaleLinear()
    .domain([colormax / 2, colormax - 1])
    .range([d3.rgb('#F1D8DD'), d3.rgb('#D33F6A')])
    .interpolate(d3.interpolateRgb);

let svg = d3.select('body').append('svg')
    .attr('width', 800)
    .attr('height', 1000);

const SKYLINE_COLOR = '#4A6FE3',
    NON_SKYLINE_COLOR = '#D33F6A';
const column_scale = d3.scaleOrdinal(["#1f77b4", "#aec7e8",
    "#ff7f0e", "#ffbb78",
    "#2ca02c", "#98df8a",
    "#d62728", "#ff9896",
    "#9467bd", "#c5b0d5",
    "#8c564b", "#c49c94",
    "#e377c2", "#f7b6d2",
    "#7f7f7f", "#c7c7c7",
    "#bcbd22", "#dbdb8d",
    "#17becf", "#9edae5"])
let arr = d3.range(0, 40).map(d => column_scale(d))
let colorscale = d3.scaleOrdinal(d3.schemeCategory10);
let glyphdata = [];
let columns = [30, 20, 50, 70, 10, 40, 60, 33, 15, 25, 10, 21];
let outerscale = d3.scaleLinear().domain([0, 100]).range([0.5, 150]);
let radius = 15;
glyphdata.push({'dom': radius});

// glyph.selectAll('rect')
//     .data(arr)
//     .enter()
//     .append('rect')
//     .attr('width', '5px')
//     .attr('height', '5px')
//     .attr('x', function (d, i) {
//         return 500 + i * 5;
//     })
//     .attr('fill', (d, i) => arr[i]);
let glyph = svg.append('g')
    .attr('class', 'glyph')
    .attr('transform', 'translate(300, 250)');

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
    .attr('stroke-width', '1px')
    .attr("d", function (d, i) {
        let arc = d3.arc()
            .outerRadius(function (d) {
                console.log(d);
                return radius + outerscale(d.data / 2);
            })
            .innerRadius(radius);
        return arc(d);
    });
glyph.append('circle')
    .attr('r', function (d) {
        return radius;
    })
    .attr('fill', 'white')
    .style('opacity', 0.9)
    .attr('stroke', 'white')
    .attr('stroke-width', '1px');
glyph.append('circle')
    .attr('r', function (d) {
        return radius - 7;
    })
    .attr('fill', cs2(13))
    .style('opacity', 1)
    .attr('stroke', 'white')
    .attr('stroke-width', '4px');


let glyph2 = svg.append('g')
    .attr('class', 'glyph2')
    .attr('transform', 'translate(450, 250)');

// glyph2.selectAll('rect')
//     .data(arr)
//     .enter()
//     .append('rect')
//     .attr('width', '5px')
//     .attr('height', '5px')
//     .attr('x', function (d, i) {
//         return 500 + i * 5;
//     })
//     .attr('fill', (d, i) => arr[i]);

// let pie = d3.pie().sort(null)
//     .value(function () {
//         return 100 / columns.length;
//     });

glyph2.selectAll("path")
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
    .attr('stroke-width', '1px')
    .attr("d", function (d, i) {
        let arc = d3.arc()
            .outerRadius(function (d) {
                console.log(d);
                return radius + outerscale(d.data * 2 / 3);
            })
            .innerRadius(radius);
        return arc(d);
    });
glyph2.append('circle')
    .attr('r', function (d) {
        return radius;
    })
    .attr('fill', SKYLINE_COLOR)
    .style('opacity', 0.9)
    .attr('stroke', 'white')
    .attr('stroke-width', '2px');
glyph2.append('circle')
    .attr('r', function (d) {
        return radius - 7;
    })
    .attr('fill', cs1(2))
    .style('opacity', 1)
    .attr('stroke', 'white')
    .attr('stroke-width', '4px');


let glyph3 = svg.append('g')
    .attr('class', 'glyph3')
    .attr('transform', 'translate(300, 380)');


// glyph3.selectAll('rect')
//     .data(arr)
//     .enter()
//     .append('rect')
//     .attr('width', '5px')
//     .attr('height', '5px')
//     .attr('x', function (d, i) {
//         return 500 + i * 5;
//     })
//     .attr('fill', (d, i) => arr[i]);

// let pie = d3.pie().sort(null)
//     .value(function () {
//         return 100 / columns.length;
//     });

glyph3.selectAll("path")
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
    .attr('stroke-width', '1px')
    .attr("d", function (d, i) {
        let arc = d3.arc()
            .outerRadius(function (d) {
                console.log(d);
                return radius + outerscale(d.data / 4);
            })
            .innerRadius(radius);
        return arc(d);
    });
glyph3.append('circle')
    .attr('r', function (d) {
        return radius;
    })
    .attr('fill', NON_SKYLINE_COLOR)
    .style('opacity', 0.9)
    .attr('stroke', 'white')
    .attr('stroke-width', '2px');
glyph3.append('circle')
    .attr('r', function (d) {
        return radius - 7;
    })
    .attr('fill', cs2(19))
    .style('opacity', 1)
    .attr('stroke', 'white')
    .attr('stroke-width', '4px');

// let glyph4 = svg.append('g')
//     .attr('class', 'glyph2')
//     .attr('transform', 'translate(1150, 250)');
// glyph4.selectAll("path")
//     .data(function (d, i) {
//         let pd = pie(columns);
//         return pd;
//     })
//     .enter()
//     .append('path')
//     .attr("fill", function (d, i) {
//         return column_scale(i);
//     })
//     .attr('stroke', 'green')
//     .style('opacity', 1)
//     .attr('stroke-width', '2px')
//     .attr("d", function (d, i) {
//         let arc = d3.arc()
//             .outerRadius(function (d) {
//                 console.log(d);
//                 return radius + outerscale(d.data / 2);
//             })
//             .innerRadius(radius);
//         return arc(d);
//     });
// glyph4.append('circle')
//     .attr('r', function (d) {
//         return radius;
//     })
//     .attr('fill', 'white')
//     .style('opacity', 1)
//     .attr('stroke', 'white')
//     .attr('stroke-width', '2px');
// glyph4.append('circle')
//     .attr('r', function (d) {
//         return radius - 7;
//     })
//     .attr('fill', NON_SKYLINE_COLOR)
//     .style('opacity', 1)
//     .attr('stroke', 'white')
//     .attr('stroke-width', '4px');


let rectsize = 15;

//
let colorbar_svg = svg

colorbar_svg.append('g')
    .attr('class', 'colorbar')
    .attr('transform', 'scale(0.7) translate(490, 520)');


colorbar_svg.select('g.colorbar').selectAll('rect')
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
colorbar_svg.select('g.colorbar')
    .append('text')
    .attr('x', 90)
    .attr('y', 20)
    .style('text-anchor', 'end')
    .style('alignment-baseline', 'middle')
    .style('font-size', '12px')
    .text('Skyline');

colorbar_svg.select('g.colorbar')
    .append('text')
    .attr('x', 90)
    .attr('y', 40)
    .style('text-anchor', 'end')
    .style('alignment-baseline', 'middle')
    .style('font-size', '12px')
    .text('Non-skyline');


colorbar_svg.select('g.colorbar')
    .append('text')
    .attr('x', 180)
    .attr('y', 65)
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'middle')
    .style('font-size', '12px')
    .text('Dominance score');

let axis = d3.axisBottom(d3.scaleOrdinal().domain(['high', 'low']).range([0, rectsize * colormax / 2]));
colorbar_svg.select('g.colorbar')
    .append('g')
    .attr('transform', 'translate(99.5,50)')
    .call(axis);


let scatter_svg = d3.select('body').append('svg')
    .attr('width', '450px')
    .attr('height', '1000px');

// scatter_svg.append('g')
//     .attr('transform', 'translate(30,10)');

let scatter_data = [['A', 2, 3], ['B', 5, 8], ['C', 7, 2], ['D', 1, 5], ['E', 8, 7]];
let scatter_data2 = [['A', 6, 6], ['B', 4, 7], ['C', 7, 2], ['D', 1, 8], ['E', 4, 4]];

let skyline_data = [[0, 8], [5, 8], [5, 7], [8, 7], [8, 0]];
let skyline_points = [['B', 5, 8], ['E', 8, 7]]
let skyline_data2 = [[0, 8], [1, 8], [1, 7], [4, 7], [4, 6], [6, 6], [6, 2], [7, 2], [7, 0]];


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
    .text('The number of rebound')
scatter_svg.append('text')
    .attr('transform', 'translate(265,340)')
    .style('text-anchor', 'middle')
    .text('The number of score')
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
scatter_svg.append('text')
    .text('(a)')
    .attr('y', 15)
    .attr('x', 85)
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
    .attr('transform', 'translate(15,0), skewY(0)')
scatter_svg2.append('text')
    .text('(b)')
    .attr('y', 15);
let s2 = scatter_svg2.append("g")
    .attr('class', 's2')
    .attr('transform', 'translate(15,0), skewY(0)')
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

s1.append('text')
    .attr('transform', 'rotate(-90) translate(-150,10)')
    .style('text-anchor', 'middle')
    .text('The number of rebound')
s1.append('text')
    .attr('transform', 'translate(165,340)')
    .style('text-anchor', 'middle')
    .text('The number of score')
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

let detail_svg = d3.select('body').append('svg').attr('height', 500);
let detail_data = [10, 11, 13, 16, 17, 19, 19, 20, 21, 22, 22, 24, 25, 27, 28, 30, 36, 40, 46, 50];
let detail_data2 = [15, 16, 17, 18, 20, 22, 23, 24, 26, 27, 28, 29, 30, 31, 31, 31, 32, 33, 34, 34, 35, 35, 36, 37, 37, 38, 39, 40, 41, 41, 42, 45, 49, 54, 56, 59, 62, 68, 71, 75]
let detail_scale = d3.scaleLinear().domain([100, 0]).range([0, 50])
let detail_scale2 = d3.scaleLinear().domain([0, 100]).range([0, 50])
let detail_line = d3.line()
    .x(function (d, i) {
        return 30 + i * 10.5
    })
    .y(function (d) {
        return detail_scale(d * 1.5);
    })
    .curve(d3.curveMonotoneX)
// detail_svg.append('path')
//     .datum(detail_data)
//     .attr('class', 'line')
//     .attr('d', detail_line)
//     .attr('transform', 'translate(0,20)')
//     .attr('fill', 'transparent')
//     .attr('stroke', 'grey');

skys_data = [5, 10, 11, 13, 14, 15, 17, 19, 20, 23, 25, 27, 28, 30, 31, 33, 34, 35, 39, 40]
non_data = [1, 2, 3, 4, 6, 7, 8, 9, 12, 16, 18, 21, 22, 24, 26, 29, 32, 36, 37, 38]
detail_svg.selectAll('.skys')
    .data(skys_data)
    .enter()
    .append('rect')
    .attr('x', d => 30 + (d - 1) * 5)
    .attr('y', 15)
    .attr('height', 5)
    .attr('width', 5)
    .attr('fill', SKYLINE_COLOR)

detail_svg.selectAll('.nonskys')
    .data(non_data)
    .enter()
    .append('rect')
    .attr('x', d => 30 + (d - 1) * 5)
    .attr('y', 70)
    .attr('height', 5)
    .attr('width', 5)
    .attr('fill', NON_SKYLINE_COLOR)

detail_svg.selectAll('.bars')
    .data(detail_data2)
    .enter()
    .append('rect')
    .attr('class', 'bars')
    .attr('x', (d, i) => 30 + i * 5)
    .attr('y', function (d, i) {
        return 70 - detail_scale2(d);
    })
    .attr('fill', 'grey')
    .attr('width', 5)
    .style('opacity', 0.7)
    .attr('height', function (d, i) {
        return detail_scale2(d);
    })
    .attr('stroke', 'grey');

// detail_svg.selectAll('.barstext')
//     .data(detail_data2)
//     .enter()
//     .append('text')
//     .attr('class', 'bars')
//     .attr('x', (d, i) => 30 + i * 5)
//     .attr('y', function (d, i) {
//         return 70 - detail_scale2(d);
//     })
//     .style('font-size', 5)
//     .text(function (d) {
//         return d;
//     })

let detail_axis = d3.axisLeft(d3.scaleLinear().domain([100, 0]).range([0, 50])).tickValues([15, 75])
detail_svg.append('g')
    .attr('transform', 'translate(30,20)')
    .call(detail_axis);

let detail_axis2 = d3.axisLeft(d3.scaleLinear().domain([100, 0]).range([0, 50]))
detail_svg.append('g')
    .attr('transform', 'translate(30,20)')
    .call(detail_axis2.tickValues([0, 100]).tickFormat('').tickSize(-200))
    .style('opacity', 0.9)
// s2.append('g')
//     .attr('transform', 'translate(30,10)')
//     .call(yAxis.tickFormat(''))
//     .style('opacity', 0.9)

let detail_selected = [[10, 'orange'], [20, 'brown'], [32, 'green']]
detail_svg.selectAll('.selected')
    .data(detail_selected)
    .enter()
    .append('rect')
    .attr('x', (d, i) => (d[0] - 1) * 5)
    .attr('y', 20)
    .attr('width', 5)
    .attr('height', 50)
    .attr('fill', d => d[1])
    .style('opacity', 0.7);

let flow_svg = d3.select('body').append('svg');
let flow_data = [[10, 20, 5], [13, 18, 8], [11, 20, 6]];

let rect_width = 8;

// t1
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 2)
    .attr('y', 0)
    .attr('height', flow_data[0][0] * 2)
    .attr('fill', SKYLINE_COLOR)
    .style('opacity', 0.5)

flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 2)
    .attr('y', 25)
    .attr('height', flow_data[0][1] * 2)
    .attr('fill', NON_SKYLINE_COLOR)
    .style('opacity', 0.5)

flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 2)
    .attr('y', 70)
    .attr('height', flow_data[0][2] * 2)
    .attr('fill', 'grey')
    .style('opacity', 0.5)
// t2
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 52)
    .attr('y', 0)
    .attr('height', flow_data[1][0] * 2)
    .attr('fill', SKYLINE_COLOR)
    .style('opacity', 0.5)
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 52)
    .attr('y', 31)
    .attr('height', flow_data[1][1] * 2)
    .attr('fill', NON_SKYLINE_COLOR)
    .style('opacity', 0.9)
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 52)
    .attr('y', 72)
    .attr('height', flow_data[1][2] * 2)
    .attr('fill', 'grey')
    .style('opacity', 0.5)

// t3
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 102)
    .attr('y', 0)
    .attr('height', flow_data[2][0] * 2)
    .attr('fill', SKYLINE_COLOR)
    .style('opacity', 0.5)
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 102)
    .attr('y', 27)
    .attr('height', flow_data[2][1] * 2)
    .attr('fill', NON_SKYLINE_COLOR)
    .style('opacity', 0.5)
flow_svg.append('rect')
    .attr('width', rect_width)
    .attr('x', 102)
    .attr('y', 72)
    .attr('height', flow_data[2][2] * 2)
    .attr('fill', 'grey')
    .style('opacity', 0.5)
let link = d3.linkHorizontal()
    .x(function (d) {
        console.log(d);
        return d[0];
    })
    .y(function (d) {
        return d[1];
    });

let areagenerator = d3.area()
    .x(d => d.x)
    .y0(d => d.y0)
    .y1(d => d.y1)
    .curve(d3.curveBasis);
//let flow_data = [[10, 20, 5], [13, 18, 10], [11, 20, 7]];
let flow_x1 = 15;
let flow_x2 = 50;
let flow_x3 = 65;
let flow_x4 = 100;
let path_data = [
    // 0
    {source: [flow_x1, 0], target: [flow_x2, 0], w: 10, opt: 'ss', opac: 0.9},
    {source: [flow_x1, 10], target: [flow_x2, 31], w: 6, opt: 'sn', opac: 0.5},
    {source: [flow_x1, 16], target: [flow_x2, 72], w: 4, opt: 'sb', opac: 0.5},
    // 1
    {source: [flow_x1, 25], target: [flow_x2, 10], w: 11, opt: 'ns', opac: 0.5},
    {source: [flow_x1, 36], target: [flow_x2, 37], w: 25, opt: 'nn', opac: 0.5},
    {source: [flow_x1, 61], target: [flow_x2, 76], w: 4, opt: 'nb', opac: 0.5},
    // // 2
    {source: [flow_x1, 70], target: [flow_x2, 21], w: 5, opt: 'bs', opac: 0.5},
    {source: [flow_x1, 75], target: [flow_x2, 62], w: 5, opt: 'bn', opac: 0.5},

    // 0
    {source: [flow_x3, 0], target: [flow_x4, 0], w: 15, opt: 'ss', opac: 0.5},
    {source: [flow_x3, 15], target: [flow_x4, 27], w: 8, opt: 'sn', opac: 0.5},
    {source: [flow_x3, 23], target: [flow_x4, 72], w: 3, opt: 'sb', opac: 0.5},
    // 1
    {source: [flow_x3, 31], target: [flow_x4, 15], w: 7, opt: 'ns', opac: 0.9},
    {source: [flow_x3, 38], target: [flow_x4, 35], w: 20, opt: 'nn', opac: 0.5},
    {source: [flow_x3, 58], target: [flow_x4, 75], w: 9, opt: 'nb', opac: 0.1},
    // // 2
    {source: [flow_x3, 72], target: [flow_x4, 55], w: 12, opt: 'bn', opac: 0.5},
    // {source: [flow_x3, 77], target: [flow_x4, 35], w: 5, opt: 'bn', opac: 0.5},

    // // 3
    // {source: [15, 25], target: [50, 0], w: 10, opt: 'ss', opac: 0.2},
    // {source: [15, 30], target: [50, 35], w: 25, opt: 'sn', opac: 0.5},
    // {source: [15, 60], target: [50, 80], w: 5, opt: 'sb', opac: 0.9},

];

let paths = [];
for (pi in path_data) {
    let p = path_data[pi];
    let p1 = {
        x: p.source[0],
        y0: p.source[1],
        y1: p.source[1] + p.w,
        opt: p.opt,
        opac: p.opac
    };
    let p2 = {
        x: p.source[0] + (p.target[0] - p.source[0]) / 3,
        y0: (p.source[1]),
        y1: (p.source[1]) + p.w,
        opt: p.opt,
        opac: p.opac
    };
    let p3 = {
        x: p.source[0] + (p.target[0] - p.source[0]) * 2 / 3,
        y0: p.target[1],
        y1: p.target[1] + p.w,
        opt: p.opt,
        opac: p.opac
    }
    let p4 = {
        x: p.target[0],
        y0: p.target[1],
        y1: p.target[1] + p.w,
        opt: p.opt,
        opac: p.opac
    };
    paths.push([p1, p2, p3, p4]);
}

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
        else if (d.opt[0] == 'n')
            return NON_SKYLINE_COLOR
        else if (d.opt[0] == 'b')
            return 'grey'
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
    .data(paths)
    .enter()
    .append('path')
    // .attr('d', function (d) {
    //     console.log(d);
    //     return "M" + d.source[0] + "," + d.source[1]
    //         + "C" + (d.source[0] + d.target[0]) / 2 + "," + d.source[1]
    //         + " " + (d.source[0] + d.target[0]) / 2 + "," + d.target[1]
    //         + " " + d.target[0] + "," + d.target[1];
    // })
    .attr('d', areagenerator)
    .attr('stroke-width', function (d) {
        return 0;
    })
    // .attr('stroke', 'black')
    .attr('fill', function (d, i) {
        return 'url(#grad-' + i + ')';
    })
    .attr('stroke', 'transparent')
    .style('opacity', d => d[0].opac);

// selected
let selected_opac = 0.7;
// A
flow_svg.append('rect')
    .attr('x', 10)
    .attr('y', 0)
    .attr('width', 3)
    .attr('height', 10)
    .attr('fill', 'green')
    .style('opacity', selected_opac)

flow_svg.append('rect')
    .attr('x', 60)
    .attr('y', 0)
    .attr('width', 3)
    .attr('height', 13)
    .attr('fill', 'green')
    .style('opacity', selected_opac)

flow_svg.append('rect')
    .attr('x', 110)
    .attr('y', 27)
    .attr('width', 3)
    .attr('height', 40)
    .attr('fill', 'green')
    .style('opacity', selected_opac)
// B
flow_svg.append('rect')
    .attr('x', 10)
    .attr('y', 10)
    .attr('width', 3)
    .attr('height', 10)
    .attr('fill', 'brown')
    .style('opacity', selected_opac)

flow_svg.append('rect')
    .attr('x', 60)
    .attr('y', 31)
    .attr('width', 3)
    .attr('height', 36)
    .attr('fill', 'brown')
    .style('opacity', selected_opac)

flow_svg.append('rect')
    .attr('x', 110)
    .attr('y', 72)
    .attr('width', 3)
    .attr('height', 12)
    .attr('fill', 'brown')
    .style('opacity', selected_opac)
// C
flow_svg.append('rect')
    .attr('x', 10)
    .attr('y', 25)
    .attr('width', 3)
    .attr('height', 40)
    .attr('fill', 'orange')
    .style('opacity', selected_opac)

flow_svg.append('rect')
    .attr('x', 60)
    .attr('y', 13)
    .attr('width', 3)
    .attr('height', 13)
    .attr('fill', 'orange')
    .style('opacity', selected_opac)

flow_svg.append('rect')
    .attr('x', 110)
    .attr('y', 0)
    .attr('width', 3)
    .attr('height', 22)
    .attr('fill', 'orange')
    .style('opacity', selected_opac)


// new detail svg
let new_detail_svg = d3.select('body').append('svg')
    .attr('width', 1500)
    .attr('height', 500);

let new_detail_columns = ['column1', 'column2']
let row_height = 100;
let rows = new_detail_svg.selectAll('.row')
    .data(new_detail_columns)
    .enter()
    .append('g')
    .attr('class', 'row')
    .attr('transform', (d, i) => 'translate(0,' + i * row_height + ')');

rows.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 10)
    .attr('height', row_height)
    .attr('fill', (d, i) => colorscale(i))

rows.append('text')
    .attr('x', 30)
    .attr('y', 30)
    .text((d) => d);

let years_data = d3.range(1990, 2000)
let years = rows.selectAll('.year')
    .data(years_data)
    .enter()
    .append('g')
    .attr('class', 'year')
    .attr('transform', (d, i) => 'translate(' + (200 + i * 100) + ',0)');

years.append('text')
    .text(d => d)
    .attr('y', 20)

let detail_sample_svg = d3.select('body').append('svg');
detail_sample_svg.append('g')
detail_sample_svg.select('g')
    .append('text')
    .attr('y', 10)
    .text('year');

let sample_attr_values = [20, 40, 0, 50, 70, 90];

let attr_scale = d3.scaleLinear().domain([0, 100]).range([0, 10])
detail_sample_svg.select('g')
    .selectAll('.attr')
    .data(sample_attr_values)
    .enter()
    .append('rect')
    .attr('class', 'attr')
    .attr('x', (d, i) => i * 5)
    .attr('y', d => 30 + 10 - attr_scale(d))
    .attr('height', d => attr_scale(d))
    .attr('width', 5)
    .attr('fill', (d, i) => colorscale(i))