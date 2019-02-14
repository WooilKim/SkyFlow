let svg = d3.select('body').append('svg')
    .attr('width', 500)
    .attr('height', 500);
let glyph = svg.append('g')
    .attr('class', 'glyph')
    .attr('transform', 'translate(250,250)');
let colorscale = d3.scaleOrdinal(d3.schemeCategory10);
let glyphdata = [];
let columns = [30, 20, 50, 70, 10, 40, 90, 100, 15, 25, 10, 21];
let outerscale = d3.scaleLinear().domain([0, 100]).range([0.5, 150]);
let radius = 20;
glyphdata.push({'dom': radius});


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
        return colorscale(i);
    })
    .attr('stroke', 'skyblue')
    .style('opacity', 0.9)
    .attr('stroke-width', '1px')
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
    .attr('fill', 'skyblue')
    .style('opacity', 0.9)
    .attr('stroke', 'white')
    .attr('stroke-width', '0.5px');
