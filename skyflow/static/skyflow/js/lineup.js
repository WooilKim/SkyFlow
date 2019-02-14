let columns = [];
d3.csv("/static/skyflow/data/processed/NBA.csv").then(function (data) {
// arr from before
    const arr = [];
    // const cats = ['c1', 'c2', 'c3'];
    // for (let i = 0; i < 100; ++i) {
    //     arr.push({
    //         a: Math.random() * 10,
    //         d: 'Row ' + i,
    //         cat: cats[Math.floor(Math.random() * 3)],
    //         cat2: cats[Math.floor(Math.random() * 3)]
    //     })
    // }

    const builder = LineUpJS.builder(data);
    var g = d3.scaleOrdinal(d3.schemeCategory10);
// manually define columns
    console.log(data)
    // console.log(context)
    // console.log(d3.range(1978, 2016));
    // builder.column(LineUpJS.buildNumberColumn('Year', d3.extent(data.map(x => x['Year']))).color('red'));
    // builder.column(LineUpJS.buildNumberColumn('Year', d3.extent(data.map(x => x['Year']))).color('red'));
    builder.column(LineUpJS.buildStringColumn('Year').label('Year').width(100));
    builder.column(LineUpJS.buildStringColumn('Player').label('Name').width(100));
    // columns = data.columns.slice(6,);
    // columns = ["Salary", "2P", "PTS", "AST", "STL", "PER", "G", "FG", "BLK", "ORB", "DRB", "TRB", "ORB%", "DRB%", "TRB%", "AST%", "STL%", "BLK%", "FG%", "3P%", "PF", "PTS"];
    switch (qid) {

        case 6:
            columns = ["2P", "PTS", "AST", "STL", "PER"];
            break;
        case 7:
            columns = ["2P", "PTS", "AST", "STL"];
            break;
        case 8:
            columns = ["BLK", "ORB", "DRB", "TRB", "BLK%", "ORB%", "DRB%", "TRB%",];
            break;
        case 9:
            columns = ["AST%", "STL%", "BLK%", "FG","Salary"];
            break;
        case 10:
            columns = ["G", "PTS", "TRB", "AST", "Salary"];
            break;
        default:
            columns = ["Salary", "2P", "PTS", "AST", "STL", "PER", "G", "FG", "BLK", "ORB", "DRB", "TRB", "ORB%",
                "DRB%", "TRB%", "AST%", "STL%", "BLK%", "FG%", "3P%", "PF", "PTS"]
    }
    // set_columnsvg(columns);
    columns.forEach(function (c, c_i) {
        builder.column(LineUpJS.buildNumberColumn(c, d3.extent(data.map(x => +x[c]))).color(g(c_i)))
    });

    // builder
    //     .column(LineUpJS.buildStringColumn('d').label('Label').width(100))
    //     .column(LineUpJS.buildCategoricalColumn('cat', cats).color('green'))
    //     .column(LineUpJS.buildCategoricalColumn('cat2', cats).color('blue'))
    //     .column(LineUpJS.buildNumberColumn('a', [0, 10]).color('blue'));

// and two rankings
//     const ranking = LineUpJS.buildRanking()
//         .supportTypes()
//         .allColumns() // add all columns
//         .impose('a+cat', 'a', 'cat2') // create composite column
//         .groupBy('cat')
//         .sortBy('a', 'desc');
//
//
//     builder
//         .defaultRanking()
//         .ranking(ranking);

    const lineup = builder.build(document.body);
});


function set_columnsvg(columns) {
    column_svg.selectAll('g').remove();
    let column_each = window_width / columns.length;
    let column_g = column_svg.selectAll('.column')
        .data(columns)
        .enter()
        .append('g')
        .attr('class', function (d) {
            return 'column column-' + d;
        })
        .attr('transform', function (d, i) {
            return 'translate(' + (i * column_each) + ',0)'
        })
        .on('mouseover', function () {
            d3.select(this).select('rect')
                .attr('fill', 'grey');
            d3.select(this).select('text')
                .attr('fill', 'white');
        })
        .on('mouseout', function (d, i) {
            d3.select(this).select('rect')
                .attr('fill', function () {
                    if (skyline_columns.indexOf(i) > -1)
                        return 'yellowgreen';
                    else
                        return 'white';
                });

            d3.select(this).select('text')
                .attr('fill', 'black')
        })
        .on('click', function (d, i) {
            if (skyline_columns.indexOf(i) > -1) {
                let idx = skyline_columns.indexOf(i)
                skyline_columns.splice(idx, 1);
            } else {
                skyline_columns.push(i)
            }
            update_selected_column();
            draw_detail_header();
            draw_detail_projected(year_data.indexOf(current_year));
        });

    column_g.append('rect')
        .attr('width', column_each - 2)
        .attr('height', 14)
        .attr('fill', function (d, i) {
            if (skyline_columns.indexOf(i) > 0)
                return 'yellowgreen';
            else
                return 'white';
        })
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('stroke', 'grey')
        // .attr('stroke-width', 0.5)
        .attr('opacity', 1);

    column_g.append('text')
        .text(function (d) {
            return d;
        })
        .attr('x', column_each / 2)
        .attr('y', 11)
        .attr('fill', function (d) {
            if (skyline_columns.indexOf(d) > 0)
                return 'white';
            else
                return 'black';
        })
        .style('text-anchor', 'middle')
    // .style('font-weight', 'bold');

    selected_svg = d3.select('div#selected_columns').append('svg')
        .attr('width', window_width);
}