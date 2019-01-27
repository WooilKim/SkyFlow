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
    console.log(d3.range(1978, 2016))
    builder.column(LineUpJS.buildCategoricalColumn('year', d3.range(1978, 2016)).color('red'))
    columns = data.columns.slice(6, 15);
    columns.forEach(function (c, c_i) {
        builder.column(LineUpJS.buildNumberColumn(c, d3.extent(data.map(x => x[c]))).color(g(c_i)))
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