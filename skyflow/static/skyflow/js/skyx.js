let original_dataset, histogram_data;
let selected_column_idx = [];
let columns, filter_columns;
let year_date;
let column_svg, project_svg, compare_svg, selected_svg, timeline_svg, list_head_svg;
let project_detail;
let year_data, dom_data;
let radius_scale = d3.scaleLinear().range([3, 10]).domain([0, 1]);
let tsne_scale = d3.scaleLinear().range([0, 450]).domain([-1, 1]);
let new_scaleX = d3.scaleLinear().range([0, 450]).domain([-1, 1]);
let new_scaleY = d3.scaleLinear().range([0, 450]).domain([-1, 1]);
let colorscale = d3.scaleOrdinal(d3.schemeCategory10);
let draw_data;
let current_dataset = '';
let a = "";
let filtered_data = [];
let skyline_cal_btn;
let filter_selected = [];
let current_year = 1978;
let selected_years = [current_year];
let current_order = 'dominance';
let calculating_year = 1978;
let selected_players = [];
let selected_columns = ['0', 'Year', 'G', 'ORB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'TOV%'];
let skyline_columns = [];
let yearly_filtered = [];
let timeline_sorted = [];
let selected_path_players = [];
let selected_filter_players = {};
let sky_filtered = [];
let yearly_dom = [];
let tsne_calculated = [];
let tsne_worker;

let selected_bars = [];
let selected_paths = [];
let title_div_height = 30;
let tsnexrange = [0, 100];
let tsneyrange = [0, 100];
let timeline_data = [1978, 1979, 1980];
let window_width = window.innerWidth;
let project_div = document.getElementById('project_div');
let filter_div = document.getElementById('filter_div');
let compare_div = document.getElementById('compare_div');
let sky_filtered_length = [];
let list_div = document.getElementById('list_div')
let list_svg;
let players = [];
let players_filter_dic = {};
let final_filtered_players = [];

let zoom = d3.zoom()
    .on("zoom", zoomed);

//sizes
let project_div_width = window_width / 5;
let compare_div_width = window_width / 2;
let filter_div_width = window_width * 3 / 20;
let list_div_width = window_width * 3 / 20;
let timeline_div_width = window_width * 9 / 10;
let info_div_width = window_width / 10;
let each_filter_height = 100;

let title_height = 30;
let slider_div_height = 50;
let project_div_height = project_div_width;
let compare_div_height = project_div_width;
let filter_div_height = project_div_width;
let list_div_height = project_div_width;
let timeline_div_height = project_div_width;
let info_div_height = project_div_width;

let progress_bar;

let compare_label_width = 30;
let compare_detail_height = 50;
let filter_ranges = {};
default_setting();

function default_setting() {
    // sizes
    set_layout();
    set_svg();
    set_progress_bar();
    // read_data();

    // histogram();

}

function set_svg() {
    console.log('set_svg', window_width);

    d3.select('div#title').append('svg')
        .attr('width', window_width + 'px')
        .attr('height', '30px');
    column_svg = d3.select('div#columns').append('svg')
        .attr('width', window_width + 'px')
        .attr('height', '30px');

    project_svg = d3.select('div#project').append('svg')
        .attr('width', function () {
            console.log('project_div width ', project_div.clientWidth);
            return project_div.clientWidth
        })
        .attr('height', project_div.clientWidth - slider_div_height)
        .call(zoom);


    project_svg.append('g')
        .attr('class', 'projectg');
    project_detail = project_svg.append('g')
        .attr('class', 'projectdetail');
    // slider svg
    d3.select("div#project_slider").append("svg")
        .attr("width", project_div_width)
        .attr("height", 50)

    d3.select("div#compare_detail").append("svg")
        .attr("width", compare_div_width)
        .attr("height", compare_detail_height);
    list_head_svg = d3.select('div#list_column')
        .append('svg')
        .attr('height', 20)
        .attr('width', list_div.clientWidth);
    list_svg = d3.select('div#list_content')
        .append('svg')
        .attr('width', list_div.clientWidth);


    timeline_svg = d3.select("div#timeline").append('svg')
        .attr('width', 2000)
        .attr('height', 490);
    compare_svg = d3.select("div#compare")
        .append('svg');
    compare_svg.append('g')
        .attr('class', 'yearlabel');
    compare_svg.append('g')
        .attr('class', 'stacks');
    compare_svg.append('g')
        .attr('class', 'paths');
    compare_svg.append('g')
        .attr('class', 'comparedetail');
}

function set_layout() {
    console.log('set_layout', window_width);
    // project view
    d3.select('div#project_div').style('width', project_div_width + 'px');
    d3.select('div#project_div').style('height', project_div_height + title_height + 'px');
    d3.select('div#project_title').style('width', project_div_width + 'px');
    d3.select('div#project_title').style('height', title_height + 'px');
    d3.select('div#project_slider').style('width', project_div_width + 'px');
    d3.select('div#project_slider').style('height', slider_div_height + 'px');
    d3.select('div#project').style('width', project_div_width + 'px');
    d3.select('div#project').style('height', project_div_width - slider_div_height + 'px');
    // compare view
    d3.select('div#compare_div').style('width', compare_div_width + 'px');
    d3.select('div#compare_div').style('height', compare_div_height + title_height + 'px');
    d3.select('div#compare_title').style('width', compare_div_width + 'px');
    d3.select('div#compare_title').style('height', title_height + 'px');
    d3.select('div#compare_wrapper').style('width', compare_div_width + 'px');
    d3.select('div#compare_wrapper').style('height', compare_div_height + 'px');
    d3.select('div#compare_label').style('width', compare_label_width + 'px');
    d3.select('div#compare_label').style('height', compare_div_height - compare_detail_height + 'px');
    d3.select('div#compare_main').style('width', compare_div_width - compare_label_width + 'px');
    d3.select('div#compare_main').style('height', compare_div_height + 'px');
    d3.select('div#compare').style('width', compare_div_width - compare_label_width + 'px');
    d3.select('div#compare').style('height', compare_div_height - compare_detail_height + 'px');
    d3.select('div#compare_detail').style('width', compare_label_width + 'px');
    d3.select('div#compare_detail').style('height', compare_detail_height + 'px');

    // filter view
    d3.select('div#filter_div').style('width', filter_div_width + 'px');
    d3.select('div#filter_div').style('height', filter_div_height + title_height + 'px');

    //list view
    d3.select('div#list_div').style('width', list_div_width + 'px');
    d3.select('div#list_div').style('height', list_div_height + title_height + 'px');
    d3.select('div#list_content').style('width', list_div_width + 'px');
    d3.select('div#list_content').style('height', list_div_height + 'px');
    //timeline view
    d3.select('div#timeline_div').style('width', timeline_div_width + 'px');
    d3.select('div#timline_div').style('height', timeline_div_height + title_height + 'px');

    // info view
    d3.select('div#info_div').style('width', info_div_width + 'px');
    d3.select('div#info_div').style('height', info_div_height + title_height + 'px');
}


/*
******      READING DATA      ******
 */

function read_data(opt) {
    d3.csv("/static/skyflow/data/processed/" + opt + ".csv").then(function (data) {
        original_dataset = data;
        let tmp = {};
        switch (opt) {
            case "MLB":
                current_year = 1985;
                year_data = d3.range(1985, 2016);
                year_date = d3.range(1985, 2016).map(function (d) {
                    return new Date(d, 1, 1);
                });
                original_dataset.forEach(function (p) {
                    if (Object.keys(tmp).indexOf(p['PlayerID']) < 0) {

                        tmp[p['PlayerID']] = p['PlayerID']
                    }
                });
                Object.keys(tmp).forEach(function (key) {
                    players.push([key, tmp[key]])
                })
                break;
            case "NBA":
                current_year = 1978;
                year_data = d3.range(1978, 2016);
                year_date = d3.range(1978, 2016).map(function (d) {
                    return new Date(d, 1, 1);
                });
                original_dataset.forEach(function (p) {
                    if (Object.keys(tmp).indexOf(p['PlayerID']) < 0) {

                        tmp[p['PlayerID']] = p['Player']
                    }
                });
                Object.keys(tmp).forEach(function (key) {
                    players.push([key, tmp[key]])
                })
                break;
        }
        year_data.forEach(function (d) {
            yearly_filtered.push(original_dataset.filter(x => x['Year'] == d))
        });
        columns = original_dataset.columns.slice(6,);
        filter_columns = original_dataset.columns.slice(4,);
        filter_columns.splice(0, 0, 'Year');


        // players = Array.from(new Set(original_dataset.map(x => [x['PlayerID'], x['Player']])));
        // players.forEach(function (d) {
        //     players_filter_dic[d] = {};
        // });

        set_columnsvg();
        update_selected();
        draw_slider();
        for (let i in year_data) {
            tsne_calculated.push(0)
        }
        histogram();
        draw_timeline();
        draw_list();
    });
}

function histogram() {
    d3.json("/static/skyflow/data/processed/" + current_dataset + "_histogram.json").then(function (data) {
        histogram_data = data;
        drawfilter();
    });
}


/*
******      SET COLUMNS      ******
 */
function set_progress_bar() {

    let dataset_select = d3.select('div#title').append('select')
        .attr('id', 'data-selection')
        .style('width', '130px')
        .on('change', function () {
            let selected = d3.select('div#title>select').property('value');
            console.log(selected);
            current_dataset = selected;
            read_data(selected);
        });
    dataset_select.selectAll('option')
        .data(['NBA', 'MLB'])
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        });

    progress_bar = d3.select('div#title').select('svg')
        .append('g')
        .attr('transform', function () {
            return 'translate(' + (window_width - 450) + ',0)';
        });

    progress_bar.append('rect')
        .attr('width', 250)
        .attr('height', 20)
        .attr('fill', 'silver');

    progress_bar.append('rect')
        .attr('id', 'progress')
        .attr('width', 0)
        .attr('height', 20)
        .attr('fill', 'black');

    skyline_cal_btn = d3.select('div#title').select('svg')
        .append('g')
        .attr('transform', function () {
            return 'translate(' + (window_width - 150) + ',0)';
        })
        .on('click', function () {
            console.log('start');
            calculate_skyline();
        });
    skyline_cal_btn.append('rect')
        .attr('width', 130)
        .attr('height', 20)
        .attr('fill', 'silver');
    skyline_cal_btn.append('text')
        .text('skyline calculate')
        .attr('x', 10)
        .attr('y', 10)
        .attr('fill', 'black')
        .style('font-size', '15px')
        .style('font-weight', 'bold')
        .style('alignment-baseline', 'central');
}

function set_columnsvg() {
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
                .attr('fill', 'white');
            d3.select(this).select('text')
                .attr('fill', 'black');
        })
        .on('mouseout', function (d, i) {
            d3.select(this).select('rect')
                .attr('fill', function () {
                    if (skyline_columns.indexOf(i) > -1)
                        return 'yellowgreen';
                    else
                        return 'grey';
                });

            d3.select(this).select('text')
                .attr('fill', 'white')
        })
        .on('click', function (d, i) {
            if (skyline_columns.indexOf(i) > -1) {
                let idx = skyline_columns.indexOf(i)
                skyline_columns.splice(idx, 1);
            } else {
                skyline_columns.push(i)
            }
            update_selected();
        });

    column_g.append('rect')
        .attr('width', column_each - 1)
        .attr('height', 14)
        .attr('fill', function (d, i) {
            if (skyline_columns.indexOf(i) > 0)
                return 'yellowgreen';
            else
                return 'grey';
        })
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.5)
        .attr('opacity', 1);

    column_g.append('text')
        .text(function (d) {
            return d;
        })
        .attr('x', column_each / 2)
        .attr('y', 10)
        .attr('fill', function (d) {
            if (selected_columns.indexOf(d) > 0)
                return 'white';
            else
                return 'white';
        })
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold');

    selected_svg = d3.select('div#selected_columns').append('svg')
        .attr('width', window_width);
}

function update_selected() {
    let select_each = window_width / skyline_columns.length;
    d3.select('div#columns').select('svg').selectAll('.selected').remove();
    let selectsG = d3.select('div#columns').select('svg').selectAll('.selected')
        .data(skyline_columns)
        .enter()
        .append('g')
        .attr('class', 'selected')
        .attr('transform', function (d, i) {
            return 'translate(' + (i * select_each) + ',15)'
        });

    selectsG.append('rect')
        .attr('width', select_each - 1)
        .attr('height', 14)
        .attr('fill', function (d, i) {
            return colorscale(i)
        });

    selectsG.append('text')
        .text(function (d) {
            return columns[d];
        })
        .attr('x', select_each / 2)
        .attr('y', 10)
        .attr('fill', 'white')
        .style('font-weight', 'bold')
        .style('text-anchor', 'middle');
}

/*
******      PROJECT VIEW      ******
 */

function draw_project_view() {
    draw_slider();
}

function draw_project(year, data) {
    console.log('draw');
    let year_i = year_data.indexOf(year);
    d3.selectAll('.point').remove();
    let project_points = d3.select('div#project').select('svg')
        .select('.projectg')
        .selectAll('.point')
        .data(data)
        .enter()
        .append('g')
        .attr('class', function (d, i) {
            return 'point year-' + yearly_filtered[year_i][i]['Year'] + ' point-' + yearly_filtered[year_i][i]['PlayerID'] + ' pointid-' + yearly_filtered[year_i][i]['id'];
        })
        .attr('transform', function (d) {
            return 'translate(' + new_scaleX(d.x) + ',' + new_scaleY(d.y) + ')';
        });
    project(yearly_filtered[year_i]);
}

function project(draw_data) {
    // console.log('draw_data', draw_data)
    // d3.selectAll('.point').remove();
    let year = draw_data[0].Year;

    let y_i = year_data.indexOf(+year);
    let project_points = d3.select('div#project').select('svg')
        .select('.projectg')
        .selectAll('.point');
    let detail_info = project_points.append('g')
        .attr('class', 'detail');
    let circles = project_points.append('circle')
        .attr('class', function (d) {
            return 'circlecenter ' + 'cc-' + d['id'];
        })
        .attr('fill', 'white')
        // .attr('stroke', 'white')
        // .attr('stroke-width', 1)
        .attr('r', function (d, i) {
            // console.log('radius', year, y_i, yearly_dom[y_i]);
            let tmp = d3.max(yearly_dom[y_i].map(x => x['dom'].length))
            return radius_scale(yearly_dom[y_i][i]['dom'].length / tmp);
            // return 3;
        });
    let radius = 10;

    let pie = d3.pie().sort(null)
        .value(function () {
            return 100 / skyline_columns.length;
        });
    project_points
        .style('stroke', 'silver')
        .style('stroke-width', 0.2);
    project_points
        .on('mouseover', function (d) {
            // console.log(d3.select(this).select('.pie'))
            d3.select(this).moveToFront();
            d3.select(this).select('.pie')
                .attr('transform', function (d) {
                    return 'scale(4)';
                });
            d3.select(this).select('circle')
                .attr('transform', function (d) {
                    return 'scale(4)';
                });
            let detail = d3.select('.projectdetail')
                .append('g')
                .attr('class', 'detail-' + d[0])
                .attr('transform', 'translate(' + new_scaleX(d.x) + ',' + new_scaleY(d.y) + ')');

            detail.append('rect')
                .attr('width', 150)
                .attr('height', 50)
                .attr('fill', '#292B2C')
                .attr('x', -75)
                .attr('y', 70)
                .attr('rx', 6)
                .attr('ry', 6)

            detail.append('text')
                .attr('x', 0)
                .attr('y', 105)
                .text(function () {
                    return d.Player
                })
                .style('text-anchor', 'middle')
                .style('alignment-baseline', 'ideographic')
                .style('font-size', 15)
                .attr('fill', 'white');
        })
        .on('mouseout', function (d) {
            d3.select('.projectdetail').select('rect').remove();
            d3.select('.projectdetail').select('text').remove();
            d3.select(this).moveToBack();
            d3.select(this).select('.pie')
                .attr('transform', function (d) {
                    return 'scale(1)';
                })
            d3.select(this).select('circle')
                .attr('transform', function (d) {
                    return 'scale(1)';
                });
        })
        .on('click', function (d, i) {
            let y_i = year_data.indexOf(current_year);
            console.log(d, i);
            if (selected_players.indexOf(d['PlayerID']) < 0) {
                selected_players.push(d['PlayerID']);
                // d3.select(this).selectAll('path')
                //     .attr('stroke', 'red')
                //     .attr('stroke-width', '1px');
                d3.selectAll('.point').selectAll('circle')
                    .attr('fill', 'white');

                yearly_dom[y_i][i].dom.forEach(function (d) {
                    d3.select('.pointid-' + d.id).select('circle')
                        .attr('fill', 'red')
                });
                yearly_dom[y_i][i].dom_by.forEach(function (d) {
                    d3.select('.pointid-' + d.id).select('circle')
                        .attr('fill', 'blue')
                })
            } else {
                let idx = selected_players.indexOf(d['PlayerID'])
                selected_players.splice(idx, 1);
                // d3.select(this).selectAll('path')
                //     .attr('stroke', 'silver')
                //     .attr('stroke-width', '0.2px');
                d3.selectAll('.point').selectAll('circle')
                    .attr('fill', 'white');
            }
            d3.selectAll('.point').classed('selected', false);
            selected_players.forEach(function (p) {
                d3.select('.point-' + p).classed('selected', true);
            })
            console.log('selected_players', selected_players);
            update_list_content('');
        });

    project_points.append('g')
        .attr('class', 'pie')
        .selectAll("path")
        .data(function (d, i) {
            let pd = pie(skyline_columns.map(x => d[columns[x]]));
            pd.forEach(function (k) {
                let tmp = d3.max(yearly_dom[y_i].map(x => x['dom'].length))
                k['inner'] = yearly_dom[y_i][i]['dom'].length / tmp;
            });
            return pd;
        })
        .enter()
        .append("path")
        .attr("fill", function (d, i) {
            return colorscale(i);
        })
        .attr("d", function (d, i) {
            let arc = d3.arc()
                .outerRadius(function (d) {
                    return radius_scale(d.inner) + d3.scaleLinear().domain([0, 100]).range([3, 30])(parseFloat(d.data));
                })
                .innerRadius(radius_scale(d.inner));
            return arc(d);
        });
}

function update_project(year, tsne_coord) {
    // console.log('update');
    let year_i = year_data.indexOf(year);
    d3.select('div#project').select('svg')
        .select('.projectg')
        .selectAll('.point')
        .attr('transform', function (d) {
            return 'translate(' + new_scaleX(d.x) + ',' + new_scaleY(d.y) + ')';
        });
}


function draw_slider() {
    let slider = d3.sliderHorizontal()
        .min(d3.min(year_date))
        .max(d3.max(year_date))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(project_div.clientWidth - 60)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(year_date)
        .on('onchange', val => {
            draw_data = yearly_filtered[year_data.indexOf(val.getFullYear())];
            current_year = val.getFullYear();
            // if(tsne_calculated[year_data.indexOf(current_year)])
            draw_project(current_year, yearly_filtered[year_data.indexOf(current_year)])
        });

    let slider_g = d3.select("div#project_slider").select("svg")
        .append("g")
        .attr("transform", "translate(30,10)");

    slider_g.call(slider);
    slider_g.select('.axis')
        .selectAll('.tick')
        .selectAll('text')
        .attr('fill', 'white');

}

function zoomed() {
// create new scale ojects based on event
    new_scaleX = d3.event.transform.rescaleX(tsne_scale);
    new_scaleY = d3.event.transform.rescaleY(tsne_scale);

    // update axes
    d3.selectAll('.point')
        .attr('transform', function (d) {
            // console.log(tsne_scale(d.tsne_x));
            return 'translate(' + new_scaleX(+d.x) + ',' + new_scaleY(+d.y) + ')';
        });
}

/*
******      COMPARE VIEW      ******
 */
function draw_compare() {
    let compare_height = project_div.clientWidth - 30;

    compare_svg = d3.select("div#compare")
        .select('svg')
        .attr('width', function () {
            return 2000;
        })
        .attr('height', project_div.clientWidth);
    let gap_between_bars = 50;
    let width_of_bars = 10;
    let padding_left = 30;
    let detail_height = 50;
    compare_svg.select('.yearlabel').selectAll('g').remove();
    compare_svg.select('.stacks').selectAll('g').remove();
    compare_svg.select('.paths').selectAll('g').remove();
    compare_svg.selectAll('svg').remove();

    compare_svg.select('.comparedetail')
        .attr('transform', function () {
            return 'translate(0,' + (project_div.clientWidth - detail_height) + ')'
        });
    // if (true) {
    sky_filtered = [];
    for (let y_i in year_data) {
        sky_filtered.push({});
        sky_filtered[y_i]['skyline'] = [];
        sky_filtered[y_i]['non-skyline'] = [];
        yearly_dom[y_i].forEach(function (d, i) {
            // console.log(y_i, d, i);
            if (d.dom_by.length === 0)
                sky_filtered[y_i]['skyline'].push(yearly_filtered[y_i][i]['PlayerID']);
            else
                sky_filtered[y_i]['non-skyline'].push(yearly_filtered[y_i][i]['PlayerID']);
        });
    }
    // yearly_filtered.forEach(function (d, i) {
    //
    //     sky_filtered[i]['skyline'] = d.filter(x => yearly_dom[i][x.id].dom_by.length === 0).map(x => x['nameid']);
    //     sky_filtered[i]['non-skyline'] = d.filter(x => dom_data[x[0]].dom_by.length !== 0).map(x => x['nameid']);
    // });

    for (let i = 0; i < sky_filtered.length - 1; i++) {
        // sky_filtered[i]['new'] = sky_filtered[i + 1]['skyline'].filter(x => sky_filtered[i]['skyline'].indexOf(x) < 0 && sky_filtered[i]['non-skyline'].indexOf(x) < 0);
        sky_filtered[i]['bench'] = yearly_filtered[i + 1].map(x => x['PlayerID']).filter(x => yearly_filtered[i].map(x => x['PlayerID']).indexOf(x) < 0);
        // sky_filtered[i]['new'].concat(sky_filtered[i + 1]['non-skyline'].filter(x => sky_filtered[i]['skyline'].indexOf(x) < 0 && sky_filtered[i]['non-skyline'].indexOf(x) < 0))
    }
    sky_filtered[sky_filtered.length - 1]['bench'] = [];
    for (let i = 1; i < sky_filtered.length; i++) {
        // sky_filtered[i]['out'] = sky_filtered[i - 1]['skyline'].filter(x => sky_filtered[i]['skyline'].indexOf(x) < 0 && sky_filtered[i]['non-skyline'].indexOf(x) < 0)
        // sky_filtered[i]['out'].concat(sky_filtered[i - 1]['non-skyline'].filter(x => sky_filtered[i]['skyline'].indexOf(x) < 0 && sky_filtered[i]['non-skyline'].indexOf(x) < 0))
        let tmp = yearly_filtered[i - 1].map(x => x['PlayerID']).filter(x => yearly_filtered[i].map(x => x['PlayerID']).indexOf(x) < 0);
        tmp.forEach(function (d) {
            if (sky_filtered[i]['bench'].indexOf(d) < 0)
                sky_filtered[i]['bench'].push(d);
        })
    }
    // sky_filtered[0]['out'] = [];
    // sky_filtered[sky_filtered.length - 1]['new'] = [];
    // console.log(sky_filtered);
    sky_filtered_length = [];
    sky_filtered.forEach(function (d, i) {
        sky_filtered_length.push({
            'skyline': d['skyline'].length,
            'non-skyline': d['non-skyline'].length,
            'bench': d['bench'].length,
            'year_idx': i,
            'total': d['skyline'].length + d['non-skyline'].length + d['bench'].length
        })
    });
    // console.log(sky_filtered_length);
    let keys = ['skyline', 'non-skyline', 'bench'];
    let stack = d3.stack().keys(keys);
    let layers = stack(sky_filtered_length);
    console.log(layers);

    let z = d3.scaleOrdinal()
        .range(['skyblue', 'pink', 'yellow']);
    // ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]);
    let label_svg = d3.select('div#compare_label').append('svg')
        .attr('width', 15)
        .attr('height', compare_div_height - compare_detail_height);
    let labelG = label_svg.append('g')
        .attr('class', 'label');
    let yearlabelG = compare_svg.select('g.yearlabel');
    let yl = yearlabelG.selectAll('g')
        .data(year_data)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(' + (i * gap_between_bars + 20) + ',0)';
        });
    yl.append('text')
        .text(function (d) {
            return d;
        })
        .attr('y', 10);
    let lb = labelG.selectAll('g')
        .data(keys)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(0,' + ((project_div.clientWidth + title_div_height) / keys.length * i) + ')'
        });
    lb.append('rect')
        .attr('fill', function (d, i) {
            return z(i);
        })
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', (project_div.clientWidth + title_div_height) / 4);
    lb.append('text')
        .text(function (d) {
            return d;
        })
        .attr('fill', 'black')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', 15)
        .attr('font-weight', 'bold')
        .style('text-anchor', 'start')
        .attr('transform', 'rotate(90 0 0)');

    let yearG = compare_svg.select('.stacks').selectAll('.stack')
        .data(layers)
        .enter()
        .append('g')
        .attr('transform', 'translate(' + padding_left + ',30)')
        .attr('class', function (d, i) {
            return 'stack stack-' + keys[i];
        })

    console.log('range', project_div.clientWidth, d3.max(yearly_filtered.map(x => x.length)));

    paths = [];
    // console.log('sf', sky_filtered);
    for (let y = 0; y < sky_filtered.length - 1; y++) {
        // paths.push([]);
        let s_idxs = [];
        let t_idxs = [];
        s_idxs.push(0);
        t_idxs.push(0);
        let keys = ['skyline', 'non-skyline', 'bench'];
        for (let c = 1; c < keys.length; c++) {
            // console.log(s_idxs[c - 1], sky_filtered[y][c - 1].length)
            s_idxs.push(s_idxs[c - 1] + sky_filtered[y][keys[c - 1]].length)
            t_idxs.push(t_idxs[c - 1] + sky_filtered[y + 1][keys[c - 1]].length)
        }
        // console.log('st', s_idxs, t_idxs);
        for (c1 in keys) {
            for (c2 in keys) {
                // console.log('c1c2', c1, c2)
                // console.log(sky_filtered[y][keys[c1]], sky_filtered[y + 1][keys[c2]])
                let con = sky_filtered[y][keys[c1]].filter(function (d) {
                    return sky_filtered[y + 1][keys[c2]].indexOf(d) > -1
                });
                if (con.length > 0)
                // console.log(sky_filtered[y][keys[c1]], sky_filtered[y + 1][keys[c2]], con)
                // console.log('len', con)
                    if (con.length > 0) {
                        let p1 = {
                            'x': 0,
                            'y0': s_idxs[c1],
                            'y1': s_idxs[c1] + con.length,
                            'info': 's',
                            'year': year_data[y],
                            'values': con,
                            'key': c1
                        };
                        let p2 = {
                            'x': 1,
                            'y0': t_idxs[c2],
                            'y1': t_idxs[c2] + con.length,
                            'info': 't',
                            'year': year_data[y] + 1,
                            'values': con,
                            'key': c2
                        };
                        s_idxs[c1] += con.length;
                        t_idxs[c2] += con.length;
                        paths.push([p1, p2]);
                    }
            }
        }
    }

    paths.sort(function (a, b) {
        return (b[0]['y1'] - b[0]['y0']) - (a[0]['y1'] - a[0]['y0']);
    });
    paths.forEach(function (d, i) {
        d['id'] = i;
    });
    let y = d3.scaleLinear()
        .range([0, project_div.clientWidth - 30]).domain([0, d3.max(sky_filtered_length.map(x => x.total))]);

    yearG.selectAll('rect')
        .data(function (d) {
            return d;
        })
        .enter()
        .append("rect")
        .attr('class', function (d, i) {
            return 'bar-' + i;
        })
        .attr('fill', function () {
            return z(d3.select(this.parentNode).datum().key);
        })
        .attr("x", function (d, i) {
            // if (selected_players.length == 0)
            return (i * gap_between_bars);
        })
        .attr("y", function (d, i) {
            // console.log(d, i, d3.select(this.parentNode).datum());
            // if (d3.select(this.parentNode).datum().key === 'new')
            //     return project_div.clientWidth - 30 - y(d.data.out) - y((d[1] - d[0]));
            // if (d3.select(this.parentNode).datum().key === 'bench')
            //     return project_div.clientWidth - 30 - y((d[1] - d[0]));
            // else
            let idx = keys.indexOf(d3.select(this.parentNode).datum().key);
            console.log('rect', d);
            return idx * 10 + y(d[0]);
            // console.log('d', d3.select(this.parentNode).datum().key);

            // return y(d[0] / d.data.total);
        })
        .attr("height", function (d) {
            return y((d[1] - d[0]));
            // return y((d[1] - d[0]) / d.data.total);
        })
        .attr("width", width_of_bars)
        .on('click', function (d) {
            // console.log(d, keys.indexOf(d3.select(this.parentNode).datum().key));
            let tmp = d.data['year_idx'] + '_' + d3.select(this.parentNode).datum().key;
            let idx = selected_bars.indexOf(tmp);
            if (idx < 0)
                selected_bars.push(tmp);
            else
                selected_bars.splice(idx, 1);
            d3.selectAll('.bar-selected').classed('bar-selected', false);
            selected_bars.forEach(function (d) {
                let arr = d.split('_');
                let y_i = arr[0];
                let opt = arr[1];
                // console.log(y_i, opt);
                // console.log(d3.select('.stack-' + opt).selectAll('rect')['_groups']);
                d3.select(d3.select('.stack-' + opt).selectAll('rect')['_groups'][0][y_i]).classed('bar-selected', true)
            });
            // console.log(selected_bars);
            filter_selected_players();
        })
        .on('mouseover', function (d, i) {
            d3.select(this)
                .attr('stroke-width', '2px')
                .attr('stroke', 'white');

            let parentClass = d3.select(this.parentNode).attr('class');
            let opt = parentClass.slice(12,);
            // console.log(sky_filtered[d.data.year_idx][opt]);
            let temp = [];
            let data = [];
            if (selected_bars.length > 0 || selected_paths.length > 0) {
                data = sky_filtered[d.data.year_idx][opt].filter(x => selected_path_players.indexOf(x) > -1)
            } else {
                data = sky_filtered[d.data.year_idx][opt];
            }
            paths.forEach(function (p) {
                data.forEach(function (player_id) {
                    if (p[0].values.indexOf(player_id) > -1) {
                        if (temp.indexOf(p.id) < 0)
                            temp.push(p.id)
                    }
                })
            });
            temp.forEach(function (d) {
                d3.select('.edge-' + d).classed('hovered', true)
            })
            d3.select("div#compare_detail")
                .select('svg').select('text').remove()
            d3.select("div#compare_detail")
                .select('svg')
                .append('text')
                .attr('x', 50)
                .attr('y', 10)
                .text(function () {
                    return selected_path_players.length;
                })
            // console.log(d, i);
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr('stroke-width', '0px')
            // let val = d[1] - d[0];
            // let keys = ['skyline', 'non-skyline', 'new', 'out'];
            // let find = keys.filter(x => d.data[x] == val);
            // if (find.length > 1)
            //     console.log('find error', find);
            // let fed = yearly_filtered[year_data.indexOf(current_year)].filter(x => sky_filtered[i][find[0]].indexOf(x.nameid) > -1).map(x => x[0])
            d3.selectAll('path.hovered')
                .classed('hovered', false)
            d3.selectAll('.point')
                .select('.pie')
                .selectAll('path')
                .attr('stroke-width', '0.2px');
            compare_svg.select('g.comparedetail')
                .select('text').remove();
            // console.log(d, i);
        })

    let areaGenerator = d3.area()
        .x(function (d, i) {
            if (d.info === 's')
                return gap_between_bars * (year_data.indexOf(d.year)) + padding_left + 10 + 20 * d.x;
            else
                return gap_between_bars * (year_data.indexOf(d.year)) + padding_left + width_of_bars - 10 - 20 * d.x;

        })
        .y0(function (d) {
            // console.log(d)
            // if (+d.key < 2)

            return d.key * 10 + y(d.y0);
        })
        .y1(function (d) {
            // if (+d.key < 2)
            return d.key * 10 + y(d.y1);
        });

    compare_svg.select('.paths')
        .attr('transform', 'translate(10,30)')
        .selectAll('.edge')
        .data(paths)
        .enter()
        .append('path')
        .attr('class', function (d, i) {
            return 'edge edge-' + i;
        })
        .attr('d', areaGenerator)
        .attr('fill', 'blue')
        .style('opacity', 0.15)
        .on('mouseover', function (d) {
            d3.select(this).classed('hovered', true);
            let temp = [];
            let data = [];
            if (selected_bars.length > 0 || selected_paths.length > 0) {
                data = d[0].values.filter(x => selected_path_players.indexOf(x) > -1)
            } else {
                data = d[0].values;
            }
            paths.forEach(function (p, p_i) {
                data.forEach(function (player_id) {
                    if (p[0].values.indexOf(player_id) > -1) {
                        if (temp.indexOf(p.id) < 0)
                            temp.push(p.id)
                    }
                })
            });
            // console.log('temp', temp);
            temp.forEach(function (d) {
                d3.select('.edge-' + d).classed('hovered', true)
            })
        })
        .on('mouseout', function (d) {
            d3.selectAll('path.hovered')
                .classed('hovered', false)
            d3.select(this).classed('hovered', false)
        })
        .on('click', function (d) {
            console.log(d);
            if (selected_paths.indexOf(d.id) < 0) {
                selected_paths.push(d.id);
            } else {
                let idx = selected_paths.indexOf(d.id);
                selected_paths.splice(idx, 1);
            }
            d3.selectAll('.edge-selected').classed('edge-selected', false);
            selected_paths.forEach(function (d) {
                d3.select('path.edge-' + d).classed('edge-selected', true);
            });
            console.log(selected_paths);
            filter_selected_players();
        });

    let selected_ids = [13, 56, 78, 22];
    let selected_g = compare_svg.append('svg')
        .attr('class', 'selected')
        .attr('x', function () {
            return year_data.indexOf(current_year) * 30 + 10;
        })
        .attr('y', 30)
        // .attr('transform', function () {
        //     return 'translate(' + year_data.indexOf(current_year) * 30 + ',0)';
        // })
        .attr('width', 400)
        .attr('height', 500);

    function dragstarted(d) {
        if (!d3.event.active) force.alphaTarget(0.5).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) force.alphaTarget(0.5);
        d.fx = null;
        d.fy = null;
    }

    // // radar
    // let force = d3.forceSimulation()
    //     .force("charge", d3.forceManyBody().strength(-700).distanceMin(100).distanceMax(1000))
    //     .force("link", d3.forceLink().id(function (d) {
    //         return d.index
    //     }))
    //     .force("center", d3.forceCenter(200, 200))
    //     .force("y", d3.forceY(0.001))
    //     .force("x", d3.forceX(0.001));
    // // let nodes = selected_ids.map(x => original_dataset[x]);
    // // let links = [];
    // let nodes = [];
    // let links = [];
    // if (selected_players.length == 0) {
    //
    // } else if (selected_players.length == 1) {
    //     nodes = selected_players.map(x => original_dataset[x]);
    //     console.log(nodes);
    //     nodes[0]['opt'] = 'player'
    //
    // } else if (selected_players.length == 2) {
    //     nodes = selected_players.map(x => original_dataset[x]);
    //
    //     nodes[0]['opt'] = 'player';
    //
    //     nodes[0]['fx'] = 200;
    //     nodes[0]['fy'] = 20;
    //     nodes[0]['fixed'] = true;
    //     nodes[1]['opt'] = 'player';
    //
    //     nodes[1]['fixed'] = true;
    //     nodes[1]['fx'] = 200;
    //     nodes[1]['fy'] = 380;
    //     console.log('nodes', nodes)
    //     // sky_filtered[i]['dominating ' + 'A'] = dom_data[ids[i][0]].dom;
    //     // sky_filtered[i]['dominated by ' + 'A'] = dom_data[ids[i][0]].dom_by;
    //     // sky_filtered[i]['dominating ' + 'A'] = dom_data[ids[i][0]].dom.filter(x => dom_data[ids[i][1]].dom.indexOf(x) < 0);
    //     // sky_filtered[i]['dominated by ' + 'A'] = dom_data[ids[i][0]].dom_by.filter(x => dom_data[ids[i][1]].dom_by.indexOf(x) < 0);
    //     // sky_filtered[i]['dominating ' + 'B'] = dom_data[ids[i][1]].dom.filter(x => dom_data[ids[i][0]].dom.indexOf(x) < 0);
    //     // sky_filtered[i]['dominated by ' + 'B'] = dom_data[ids[i][1]].dom_by.filter(x => dom_data[ids[i][0]].dom_by.indexOf(x) < 0);
    //     // sky_filtered[i]['dominating ' + 'AB'] = dom_data[ids[i][0]].dom.filter(x => dom_data[ids[i][1]].dom.indexOf(x) > -1);
    //     // sky_filtered[i]['dominated by ' + 'AB'] = dom_data[ids[i][0]].dom_by.filter(x => dom_data[ids[i][1]].dom_by.indexOf(x) > -1);
    //     nodes.push({
    //         'name': 'A-B',
    //         'opt': 'dom',
    //         'domA': dom_data[selected_players[0]].dom.length,
    //         'dombyA': dom_data[selected_players[0]].dom_by.length,
    //         'domB': dom_data[selected_players[1]].dom.length,
    //         'dombyB': dom_data[selected_players[1]].dom_by.length,
    //     });
    //     links.push({'source': 0, 'target': 2});
    //     links.push({'source': 1, 'target': 2});
    // } else {
    //     let nodes = selected_ids.map(x => original_dataset[x]);
    // }
    //
    // // console.log(nodes, links);
    // force.nodes(nodes)
    //     .force("link").links(links);
    //
    // var link = selected_g.selectAll(".link")
    //     .data(links)
    //     .enter()
    //     .append("line")
    //     .attr("class", "link")
    //     .attr('stroke', 'black');
    //
    // var node = selected_g.selectAll(".node")
    //     .data(nodes)
    //     .enter().append("g")
    //     .attr("class", function (d, i) {
    //         if (d.opt == 'player')
    //             return "node fixed node-" + i;
    //         else
    //             return "node";
    //     })
    //     .call(d3.drag()
    //         .on("start", dragstarted)
    //         .on("drag", dragged)
    //         .on("end", dragended));
    //
    // var color = d3.scaleOrdinal()
    //     .range(["#98abc5", "#8a89a6", "#7b6888"]);
    //
    //
    // var arc = d3.arc()
    //     .outerRadius(20)
    //     .innerRadius(0);
    //
    // // var labelArc = d3.arc()
    // //     .outerRadius(radius - 40)
    // //     .innerRadius(radius - 40);
    //
    // var pie = d3.pie()
    //     .sort(null)
    //     .value(function (d) {
    //         return d;
    //     });
    // let chart = RadarChart.chart();
    // let config = {
    //     w: 100,
    //     h: 100,
    //     maxValue: 100,
    //     levels: 5,
    //     ExtraWidthX: 300
    // }
    // let sels = ['G', '3PAr', 'ORB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'TOV%'];
    // if (selected_players.length > 0) {
    //     let rd = [];
    //     sels.forEach(function (f) {
    //         rd.push({area: f, value: original_dataset[selected_players[0]][f]})
    //     });
    //     let d1 = [rd];
    //     RadarChart.draw(".node-0", d1, config);
    // }
    // if (selected_players.length > 1) {
    //     rd = [];
    //     sels.forEach(function (f) {
    //         rd.push({axis: f, value: original_dataset[selected_players[1]][f]})
    //     });
    //     let d2 = [rd];
    //     RadarChart.draw(".node-1", d2, config);
    // }
    // d3.select('.node-0')
    //     .datum(d1)
    //     .call(chart);
    // node.append('g')
    //     .datum(function (d) {
    //         console.log(d);
    //         if (d.opt == 'player') {
    //             let sels = ['G', '3PAr', 'ORB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'TOV%'];
    //             let rd = [];
    //             sels.forEach(function (f) {
    //                 rd.push({axis: f, value: d[f]})
    //             });
    //             console.log(rd);
    //             return {className: d.id, axes: rd};
    //         }
    //         else return [];
    //     })
    //     .attr('class', 'radar')
    //     .call(chart);
    //
    // node.append('g')
    //     .attr('class', 'pie')
    //     .selectAll('path')
    //     .data(function (d) {
    //         if (d.opt == 'dom') {
    //             // console.log([d.domA, d.domB, d.dombyA, d.dombyB])
    //             return pie([d.domA, d.domB, d.dombyA, d.dombyB]);
    //         }
    //         else return [];
    //     })
    //     .enter()
    //     .append('path')
    //     .attr('d', arc)
    //     .style('fill', function (d, i) {
    //         return color(i);
    //     });
    //
    // node.append('circle')
    //     .attr('r', function (d) {
    //         if (d.opt == 'player')
    //             return 0;
    //         else return 0;
    //     })
    //     .attr('fill', function (d) {
    //         return 'black';
    //     });

    // node.append("text")
    //     .attr("dx", -18)
    //     .attr("dy", 8)
    //     .style("font-family", "overwatch")
    //     .style("font-size", "18px")
    //
    //     .text(function (d) {
    //         return d.Player
    //     });
    //
    // force.on("tick", function () {
    //     link.attr("x1", function (d) {
    //         return d.source.x;
    //     })
    //         .attr("y1", function (d) {
    //             return d.source.y;
    //         })
    //         .attr("x2", function (d) {
    //             return d.target.x;
    //         })
    //         .attr("y2", function (d) {
    //             return d.target.y;
    //         });
    //     node.attr("transform", function (d) {
    //         return "translate(" + d.x + "," + d.y + ")";
    //     });
    // });
}

let sc = ['G', '3PAr', 'ORB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'TOV%'];


/*
******      LIST VIEW      ******
 */

function draw_list() {

    list_head_svg
        .attr('width', d3.max([list_div.clientWidth, 100 * filter_selected.length]));

    let default_column = ['Player', 'Flow'];
    list_head_svg.selectAll('text')
        .data(default_column.concat(filter_selected))
        .enter()
        .append('text')
        .text(function (d) {
            return d;
        })
        .style('font-weight', 'bold')
        .style('text-anchor', 'middle')
        .style('font-size', '15px')
        .attr('x', function (d, i) {
            return i * 130 + 20;
        })
        .attr('y', 15)
        .on('click', function (d) {
            console.log('click');
            console.log(players);
            // players.sort(function (a, b) {
            //     if (a[0] < b[0]) {
            //         return -1;
            //     }
            //     else if (a[0] === b[0])
            //         return 0;
            //     else
            //         return 1;
            // });
            // console.log(players);
            // list_order_by = d;
            update_list_content(d);

        });

    list_svg
        .attr('height', players.length * 15)
        .attr('width', d3.max([list_div.clientWidth, 200 + 50 * filter_selected.length]));
    list_svg.selectAll('.player').remove();

    let list_g = list_svg.selectAll('.player')
        .data(players)
        .enter()
        .append('g')
        .attr('class', function (d) {
            return 'player player-' + d[0]
        })
        .attr('transform', function (d, i) {
            return 'translate(0,' + i * 25 + ')';
        })
        .on('click', function (d) {
            if (selected_players.indexOf(d[0]) < 0) {
                selected_players.push(d[0])
                // d3.select(this).classed('selected', true);
            } else {
                let idx = selected_players.indexOf(d[0])
                selected_players.splice(idx, 1);
                // d3.select(this).classed('selected', false);
            }

            update_list_content('');
            console.log(selected_players);


        })

    list_g.append('text')
        .text(function (d) {
            return d[1]
        })
        .attr('y', 15)
        .style('font-size', '15px')
}

function update_list_content(key) {
    update_selected_years();
    d3.selectAll('.player').classed('selected', false);
    selected_players.forEach(function (p) {
        d3.select('.player-' + p).classed('selected', true)
    });
    // let key = list_order_by;
    console.log('update', key, list_svg.selectAll('.player'));
    console.log(list_svg.selectAll('.player'))
    list_svg.selectAll('.player')
        .sort(function (a, b) {
            // console.log(a,b);
            // console.log(a, b, d3.ascending(a[0], b[0]));
            // return d3.ascending(a[1], b[1]);
            let boolA, boolB;
            // console.log(key);
            if (key === 'Player') {
                boolA = selected_players.indexOf(a[0]) > -1;
                boolB = selected_players.indexOf(b[0]) > -1;
                if (boolA) return 1;
                if (boolB) return 1;
                return d3.ascending(a[1], b[1]);
            } else if (key === 'Flow') {
                boolA = selected_players.indexOf(a[0]) > -1 || selected_path_players.indexOf(a[0]) > -1;
                boolB = selected_players.indexOf(b[0]) > -1 || selected_path_players.indexOf(b[0]) > -1;
                return d3.descending(boolA, boolB);
            } else if (key === '') {
                boolA = selected_players.indexOf(a[0]) > -1;
                boolB = selected_players.indexOf(b[0]) > -1;
                return d3.descending(boolA, boolB);
            } else {
                boolA = selected_players.indexOf(a[0]) > -1 || selected_filter_players[key].indexOf(a[0]) > -1
                boolB = selected_players.indexOf(b[0]) > -1 || selected_filter_players[key].indexOf(b[0]) > -1
                // console.log(boolA, boolB, boolA-boolB);
                return d3.descending(boolA, boolB);
            }
        })
        .transition(1000)
        .attr('transform', function (d, i) {
            return 'translate(0,' + i * 25 + ')';
        })

    console.log(list_svg.selectAll('.player'))
    // console.log(players)
    // let list_g = list_svg.selectAll('.player')
    //     .data(players)
    //     .order()
    //     .merge(list_svg.selectAll('.player'))
    //     .attr('class', function (d) {
    //         return 'player player-' + d[0]
    //     })
    //     .attr('transform', function (d, i) {
    //         return 'translate(0,' + i * 15 + ')';
    //     });
    //
    // list_g.select('text')
    //     .text(function (d) {
    //         return d[1]
    //     })
    //     .attr('y', 10)
}

function update_filter_mark(key) {
    console.log('i[date', list_svg.selectAll('.player')
        .selectAll('.mark-' + filter_columns.indexOf(key)), filter_columns.indexOf(key))
    list_svg.selectAll('.player')
        .selectAll('.mark-' + filter_columns.indexOf(key))
        .text(function (d, i) {
            if (selected_filter_players[key].indexOf(d[0]) > -1) {
                return 'O';
            } else {
                return ''
            }
        })
        .style('text-anchor', 'middle')
    // .style('fill', function (d) {
    //     if (selected_filter_players[key].indexOf(d[0]) > -1) {
    //         return 'red'
    //     } else {
    //         return 'black'
    //     }
    // })
}

function draw_flow_mark() {
    list_svg.selectAll('.player').selectAll('.mark-flow').remove();
    list_svg.selectAll('.player')
        .append('text')
        .attr('class', function (d, i) {
            return 'mark-flow'
        })
        .text(function (d, i) {
            if (selected_path_players.indexOf(d[0]) > -1) {
                return 'O';
            } else {
                return ''
            }
        })
        .style('text-anchor', 'middle')
        // .style('fill', function (d) {
        //     if (selected_path_players.indexOf(d[0]) > -1) {
        //         return 'red'
        //     } else {
        //         return 'black'
        //     }
        // })
        .attr('y', 10)
        .attr('x', function (d, i) {
            return 150;
        });
}

function draw_filter_mark() {
    list_svg
        .attr('width', d3.max([list_div.clientWidth, 200 + 50 * filter_selected.length]));
    list_head_svg.selectAll('.header')
        .data(filter_selected)
        .enter()
        .append('text')
        .attr('class', 'header')
        .text(function (d) {
            return d;
        })
        .style('font-weight', 'bold')
        .style('text-anchor', 'middle')
        .style('font-size', '15px')
        .attr('x', function (d, i) {
            return 200 + i * 50;
        })
        .attr('y', 15)
        .on('click', function (d) {
            // console.log('click');
            // console.log(players);
            // players.sort(function (a, b) {
            //     if (a[0] < b[0]) {
            //         return -1;
            //     }
            //     else if (a[0] === b[0])
            //         return 0;
            //     else
            //         return 1;
            // });
            // console.log(players);
            // list_order_by = d;
            update_list_content(d);
        })


    list_svg.selectAll('.player').selectAll('.mark').remove();

    Object.keys(selected_filter_players).forEach(function (key, ki) {
        list_svg.selectAll('.player')
        // .data(Object.keys(selected_filter_players))
        // .enter()
            .append('text')
            .attr('class', function (d, i) {
                return 'mark mark-' + filter_columns.indexOf(key);
            })
            .text(function (d) {
                return 'O';
            })
            .style('text-anchor', 'middle')
            .style('fill', function (d) {
                if (selected_filter_players[key].indexOf(d) > -1) {
                    return 'red'
                } else {
                    return 'black'
                }
            })
            .attr('y', 10)
            .attr('x', function (d, i) {
                return 200 + 50 * ki;
            });
    })


    // Object.keys(selected_filter_players).forEach(function (key, i) {
    //     list_svg.selectAll('.player')
    //         .append('text')
    //         .attr('class', 'mark mark-' + key)
    //         .text(key)
    //         .attr('y', 10)
    //         .attr('x', 100 + i * 20);
    //
    //     //
    //     // selected_filter_players[key].forEach(function (p) {
    //     //     d3.select(' player-' + p).append('text')
    //     //         .text(key)
    //     //         .attr('class', 'playertext')
    //     //         .attr('x', 30)
    //     //         .attr('y', 10)
    //     // })
    // })
}

/*
******      FILTER VIEW      ******
 */

function filter_set() {
    // filter_selected = list column selected by filter
    filter_selected.forEach(function (column) {
        switch (column) {
            case 'Pos':
                let cardi = ['PF', 'SG', 'PG', 'SF', 'C', 'PF-C', 'SF-SG', 'SG-PG', 'SG-SF', 'C-PF', 'SF-PF', 'PG-SG', 'PF-SF', 'PG-SF', 'SG-PF', 'C-SF'];

                break;

            default:
                console.log('filter_set' + column);
                let filter_g = d3.select('g.filter-' + filter_columns.indexOf(column));
                let data = histogram_data[column];
                console.log(data);
                console.log(d3.min(data['histogram']), d3.max(data['histogram']));

                let yaxis_width = 20;
                let xaxis_height = 20;
                let padding_right = 20;
                let padding_left = 20;
                let padding_top = 25;

                let x = d3.scaleLinear()
                    .domain([d3.min(data['bins']), d3.max(data['bins'])])
                    .range([padding_left, filter_div_width - yaxis_width - padding_right]);

                let y = d3.scaleLinear()
                    .domain([0, d3.max(data['histogram'])])
                    .range([each_filter_height - xaxis_height, padding_top]);

                let axisX = d3.axisBottom(x).tickFormat(function (d) {
                        if (d > 1000000)
                            return Math.floor(d / 1000000) + 'M';
                        else if (d > 1000)
                            return Math.floor(d / 1000) + 'k';
                        else return d;
                    }),
                    axisY = d3.axisRight(y).ticks(4).tickFormat(function (d) {
                        return d + "%";
                    });

                let area = d3.area()
                    .curve(d3.curveBasis)
                    .x(function (d, i) {
                        return x(data['bins'][i]);
                    })
                    .y0(y(0))
                    .y1(d => y(d));

                let brush = d3.brushX()
                    .extent([[padding_left, padding_top], [filter_div_width - padding_right - yaxis_width, each_filter_height - xaxis_height]])
                    .on("start brush", function () {
                        console.log('brushed');
                        console.log(d3.event.selection.map(x.invert));
                        filter_ranges[column] = d3.event.selection.map(x.invert)

                        //filter players
                        selected_filter_players[column] = Array.from(new Set(original_dataset.filter(p => p[column] >= filter_ranges[column][0] && p[column] <= filter_ranges[column][1]).map(p => p['PlayerID'])));
                        players.forEach(function (d, i) {
                            if (selected_filter_players[column].indexOf(d) > -1) {
                                players[i][column] = true;
                            }
                        })
                        // selected_filter_players[column].forEach(function (p) {
                        //     players_filter_dic[p][column] = true;
                        // })
                        console.log(selected_filter_players)
                        d3.select('.filter-num-' + filter_columns.indexOf(column))
                            .text(selected_filter_players[column].length);

                        update_filter_mark(column);
                        // var extent = d3.event.selection.map(x.invert, x);
                    });
                filter_g.append('g')
                    .attr('transform', 'translate(0,0)')
                    .append('text')
                    .text(column)
                    .style('font-weight', 'bold')
                    .attr('x', padding_left - 10)
                    .attr('y', 20)
                    .style('font-size', 20);

                filter_g.append('text')
                    .attr('class', function (d) {
                        return 'filter-num-' + filter_columns.indexOf(d);
                    })
                    .text(function () {
                        if (filter_ranges[column].length === 0)
                            return players.length;
                        else
                            return selected_filter_players[column].length;
                    })
                    .attr('x', function () {
                        return (padding_left + filter_div_width - padding_right - yaxis_width) / 2;
                    })
                    .attr('y', padding_top)
                    .attr('fill', 'black')
                    .style('font-size', '10px')


                filter_g.append('g')
                    .attr('transform', 'translate(0,' + (each_filter_height - xaxis_height) + ')')
                    .call(axisX);

                filter_g.append('g')
                    .call(axisY)
                    .attr('transform', 'translate(' + (filter_div_width - yaxis_width - padding_right) + ',0)');
                filter_g
                    .append('path')
                    .data(function () {
                        console.log(data['histogram'])
                        return [data['histogram']]
                    })
                    .attr("fill", "steelblue")
                    .attr("d", area);

                filter_g.append('g')
                    .attr('class', 'filter-brush')
                    .call(brush)
                    .call(brush.move, function () {
                        if (filter_ranges[column].length === 0)
                            return [padding_left, filter_div_width - padding_right - yaxis_width];
                        else
                            return [x(filter_ranges[column][0]), x(filter_ranges[column][1])]
                    })


                break;
        }
    })

}

function drawfilter() {
    // filter

    let selection = d3.select('div#filter').append('select')
        .attr('id', 'selection')
        .attr('class', 'selectpicker')
        .style('width', '130px')
        .on('change', function (d) {
            let selected = d3.select('div#filter>select').property('value');
            console.log(selected);
            // append to list and draw update
            // TODO : same height?

            // TODO : check if not in the list
            if (filter_selected.indexOf(selected) > -1) {
                // throw msg?
            } else {
                filter_selected.push(selected);
                filter_ranges[selected] = [];
            }
            draw_filter_list();
            draw_filter_mark();
        });
    let msg = d3.select('div#filter').append('text')
        .text('Add the filter ')
        .style('font-size', '15px');

    let options = selection.selectAll('option')
        .data(filter_columns)
        .enter()
        .append('option')
        .attr('class', 'filter-option')
        .text(function (d) {
            return d;
        });

    d3.select('div#filter_list').append('svg');
    // for (c in columns) {
    //     selection.append('option')
    //         .text(filter_columns[c])
    //         .attr('value', filter_columns[c]);
    // }

    // $('select').selectpicker();
    // $('.selectpicker').selectpicker('val', selected_columns);
    // let filters = d3.select('div#filter_div')
    //     .append('input')
    //     .attr('id', 'textinput')
    //     .attr('class', function (d) {
    //         return d;
    //     })
    //     .attr('type', 'text')
    //     .attr('name', 'textInput')
    //     .attr('value', 'Text goes here')
    //
    // d3.select('div#filter_div').append('button')
    //     .text('filter')
    //     .on('click', function () {
    //         let textinput = document.getElementById('textinput').value;
    //         draw_data = draw_data.filter(x => x[d3.select('#selection').property('value')] === textinput);
    //         project(draw_data);
    //     });
}

function draw_filter_list() {
    let filter_list_svg = d3.select('div#filter_list')
        .select('svg')
        .attr('height', each_filter_height * filter_selected.length)
        .attr('width', filter_div_width);
    filter_list_svg.selectAll('g').remove();

    filter_list_svg.selectAll('g')
        .data(filter_selected)
        .enter()
        .append('g')
        .attr('class', function (d, i) {
            return 'filter-' + filter_columns.indexOf(d);
        })
        .attr('width', filter_div_width)
        .attr('transform', function (d, i) {
            return 'translate(0,' + i * each_filter_height + ')';
        });
    filter_set();
}

// draw_compare();


// timeline
function draw_timeline() {
    let each_attribute_width = 200;
    let each_attribute_gap = 50;
    let year_padding = 150;
    let timeline_columns = selected_columns.slice(3);
    // console.log(timeline_columns);
    timeline_svg.attr('height', d3.max([project_div_width, selected_years.length * 50]))
    timeline_svg.select('g,timeline_column').remove();
    let columns_g = timeline_svg.append('g')
        .attr('class', 'timeline_column');
    timeline_sorted = yearly_filtered.slice();
    timeline_svg.selectAll('.row').remove();
    let rows = timeline_svg.selectAll('.row')
        .data(selected_years)
        .enter()
        .append('g')
        .attr('class', function (d) {
            return 'row row-' + d;
        })
        .attr('transform', function (d, i) {
            return 'translate(' + 0 + ',' + (i * 50) + ')'
        });
    rows.append('text')
        .text(function (d) {
            return d
        })
        .attr('y', 30);
    // console.log(rows);
    let attrs = rows.selectAll('.attr')
        .data(function (d, i, j) {
            return timeline_columns
        })
        .enter()
        .append('g')
        .attr('class', function (d, i, j) {
            return 'attr' + ' attr-' + d
        })
        .attr('transform', function (d, i) {
            return 'translate(' + (year_padding + i * (each_attribute_width + each_attribute_gap)) + ',0)';
        });


    let bars = attrs.selectAll('rect')
        .data(function (d) {
            console.log('d', d);
            let year = d3.select(this.parentNode).datum();
            let y_i = year_data.indexOf(year);
            return yearly_filtered[y_i].sort(function (a, b) {
                return a[d] - b[d]
            });
        })
        .enter()
        .append('rect')
        .attr('class', function (d, i) {
            return 'bar bar-' + d['PlayerID'];
        })
        .attr('x', function (d, i, j) {
            return i * (each_attribute_width / j.length);
        })
        .attr('y', function (d) {
            let attr = d3.select(this.parentNode).datum();
            if (d[attr] === '')
                return 50;
            else
                return 50 - d[attr]
        })
        .attr('height', function (d) {
            let attr = d3.select(this.parentNode).datum();
            // console.log(attr, d[attr], d);
            if (d[attr] === '')
                return 0;
            else
                return d[attr]
        })
        .attr('fill', function (d) {
            let attr = d3.select(this.parentNode).datum();
            return colorscale(selected_columns.indexOf(attr))
        })
        .attr('width', function (d, i, j) {
            return (each_attribute_width / j.length);
        })
        .on('mouseover', function (d) {
            console.log(d);
            d3.selectAll('.bar-' + d['PlayerID'])
                .attr('stroke', 'silver')
                .attr('stroke-width', 3)
        })
        .on("mouseout", function (d) {
            d3.selectAll('.bar-' + d['PlayerID'])
                .attr('stroke', 'transparent')
                .attr('stroke-width', 0)
        });


    d3.selectAll('.bar').classed('selected', false);
    selected_players.forEach(function (p) {
        d3.selectAll('.bar-' + p).classed('selected', true)
    });
    d3.selectAll('.bar.selected')
        .attr('height', 50)
        .attr('y', function (d) {
            return 0;
        });

    // columns name
    let columns = columns_g.selectAll('g')
        .data(timeline_columns)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(' + (year_padding + i * (each_attribute_width + each_attribute_gap)) + ',0)';
        });
    columns.append('rect')
        .attr('width', each_attribute_width)
        .attr('height', 20)
        .attr('fill', 'white');

    columns.append('text')
        .text(function (d) {
            return d;
        })
        .attr('fill', 'black')
        .style('font-weight', 'bold')
        .style('font-size', 15)
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'central')
        .attr('x', each_attribute_width / 2)
        .attr('y', 10);
    // .on('click', function (d) {
    //     // d : column name
    //     // TODO
    //     current_order = d;
    //     timeline_sorted.forEach(function (d) {
    //         d.sort(function (a, b) {
    //             if (current_order == 'dominance') {
    //
    //             } else {
    //                 // descending order
    //                 // if (b[current_order] === '') b[current_order] = 0;
    //                 // if (a[current_order] === '') a[current_order] = 0;
    //                 return a[current_order] - b[current_order];
    //             }
    //         })
    //     });
    //     draw_bars()
    //     // console.log(timeline_sorted[0].map(x => x[current_order]));
    //     // console.log(timeline_sorted);
    //     // let updated = d3.selectAll('.bar').data(timeline_sorted);
    //     // console.log(updated);
    //     // updated.enter()
    //     //     .append('rect')
    //     //     .attr('class', 'bar')
    //     //     .attr('y', function (d) {
    //     //         let attr = d3.select(this.parentNode).datum();
    //     //         if (d[attr] === '')
    //     //             return 50;
    //     //         else
    //     //             return 50 - d[attr]
    //     //     })
    //     //     .attr('height', function (d) {
    //     //         let attr = d3.select(this.parentNode).datum();
    //     //         // console.log(attr, d[attr], d);
    //     //         if (d[attr] === '')
    //     //             return 0;
    //     //         else
    //     //             return d[attr]
    //     //     })
    //     //     .attr('fill', 'black')
    //     //     .attr('width', function (d, i, j) {
    //     //         return (each_attribute_width / j.length);
    //     //     })
    //     //     .merge(updated)
    //     //     .attr('x', function (d, i, j) {
    //     //         return i * (each_attribute_width / j.length);
    //     //     });
    //     //
    //     // // sort the ascending order of
    //
    //
    // });


    // let year_labels = timeline_svg.append('g')
    //     .attr('class', 'timeline_year');
    // let minimap_g = timeline_svg.append('g')
    //     .attr('class', 'minimap');

    // let each = 2000 / year_data.length;
    // let year_label = year_labels.selectAll('.year_label')
    //     .data(year_data)
    //     .enter()
    //     .append('g')
    //     .attr('class', 'year_label')
    //     .attr('transform', function (d, i) {
    //         return 'translate(' + (each * i) + ',0)';
    //     })
    //
    // year_label.append('text')
    //     .attr('x', 0)
    //     .attr('y', 10)
    //     .text(function (d) {
    //         return d;
    //     })
    //
    // year_label.append('rect')
    //     .attr('x', 0)
    //     .attr('y', 0)
    //     .attr('width', each)
    //     .attr('height', 100)
    //     .attr('fill', 'transparent')
    //     .attr('opacity', 0.3);
    //
    // let brush = d3.brushX()
    //     .extent([[0, 0], [2000, 100]])
    //     .on("brush end", brushed);
    // var x = d3.scaleLinear().range([0, 300]).domain([1980, 2017]);
    //
    // minimap_g.append("g")
    //     .attr("class", "brush")
    //     .call(brush)
    //     .call(brush.move, x.range());

//     let detail_each = 300;
// // year_data
//     let details = timeline_svg.selectAll('.detail')
//         .data(year_data)
//         .enter()
//         .append('g')
//         .attr('class', function (d) {
//             return 'detail detail-' + d;
//         })
//         .attr('transform', function (d, i) {
//             return 'translate(' + ((detail_each + 30) * i) + ',100)';
//         });
//
// // columns = ['0', 'Year', 'G', '3PAr', 'ORB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'TOV%']
//
//     let units = details.selectAll('unit')
//         .data(function (d) {
//             let before = yearly_filtered[year_data.indexOf(d)];
//             let sorted = before.sort(function (a, b) {
//                 if (dom_data[parseInt(a[0])].dom.length > dom_data[parseInt(b[0])].dom.length) {
//                     // console.log(dom_data[parseInt(a[0])].dom.length, dom_data[parseInt(b[0])].dom.length)
//                     return -1;
//                 }
//                 if (dom_data[parseInt(a[0])].dom.length < dom_data[parseInt(b[0])].dom.length)
//                     return 1;
//                 return 0;
//             });
//             // let test = sorted.map(function (d) {
//             //     return dom_data[d[0]].dom.length
//             // });
//             // console.log('sorted', sorted, test);
//             return sorted
//         })
//         .enter()
//         .append('g')
//         .attr('class', function (d) {
//             return 'unit unit-' + d.nameid;
//         })
//         .attr('transform', function (d, i) {
//             return 'translate(0,' + (i * 30) + ')';
//         });
//
//     units.append('text')
//         .text(function (d) {
//             return d.Player;
//         })
//         .attr('x', 10)
//         .attr('y', 10);
//
//     units.selectAll('.unitrect')
//         .data(function (d) {
//             return sc.map(x => d[x])
//         })
//         .enter()
//         .append('rect')
//         .attr('class', 'unitrect')
//         .attr('x', function (d, i) {
//             return 10 + i * (300 / 8);
//         })
//         .attr('y', 15)
//         .attr('width', function (d, i) {
//             return d3.scaleLinear().domain([0, 100]).range([0, detail_each / 8])(parseFloat(d));
//         })
//         .attr('height', 10)
//         .attr('fill', function (d, i) {
//             return colorscale(i);
//         });
//
//
//     units.selectAll('.edge')
//         .data(function (d) {
//             return sc.map(x => d[x])
//         })
//         .enter()
//         .append('rect')
//         .attr('class', 'edge')
//         .attr('x', function (d, i) {
//             return 10 + i * (300 / 8);
//         })
//         .attr('y', 15)
//         .attr('stroke-width', 0.5)
//         .attr('stroke', 'black')
//         .attr('opacity', 0.2)
//         .attr('width', function (d, i) {
//             return (300 / 8);
//         })
//         .attr('height', 10)
//         .attr('fill', function (d, i) {
//             return 'transparent';
//         })
//

}

function draw_compare_detail() {
    compare_svg.select('.comparedetail').selectAll('g').remove();
    // let detailcompare_svg.
}

function filter_selected_players() {
    let data = players.map(x => x[0]);
    console.log(data);
    selected_bars.forEach(function (d) {
        let arr = d.split('_');
        let y_i = arr[0];
        let opt = arr[1];
        console.log(y_i, opt);
        data = data.filter(x => sky_filtered[y_i][opt].indexOf(x) > -1)
    });
    selected_paths.forEach(function (d) {
        data = data.filter(x => paths[d][0]['values'].indexOf(x) > -1)
    });
    console.log('filtered', data);
    selected_path_players = data;
    draw_flow_mark()
    // TODO
    // draw list view
}

function draw_bars() {
    let each_attribute_width = 200;
    let each_attribute_gap = 50;
    let timeline_columns = selected_columns.slice(3);
    let year_padding = 150;
    console.log(timeline_columns);
    // let columns_g = timeline_svg.append('g')
    //     .attr('class', 'timeline_column');
    // timeline_sorted = yearly_filtered.slice();

    let rows = timeline_svg.selectAll('.row')
        .data(selected_years);
    // .enter()
    // .append('g')
    // .attr('class', 'row')

    // console.log(rows);
    rows.append('text')
        .text(function (d) {
            return d
        })
        .attr('y', 10);
    let attrs = rows.selectAll('.attr')
    // .data(function (d, i, j) {
    //     // let y = year_data.indexOf(d);
    //     // yearly_filtered[y].map()
    //
    //     return timeline_columns
    // })
    // .enter()
    // .append('g')
    // .attr('class', function (d, i, j) {
    //     return 'attr' + ' attr-' + d
    // })
    // .attr('transform', function (d, i) {
    //     return 'translate(' + (i * (each_attribute_width + each_attribute_gap)) + ',0)';
    // })
    // .merge();

    let bars = attrs.selectAll('.bar')
        .data(function (d) {
            // console.log('d', d);
            let year = d3.select(this.parentNode).datum();
            let y_i = year_data.indexOf(year);
            // console.log(timeline_sorted[y_i]);
            return timeline_sorted[y_i];
        })
        // .enter()
        // .append('rect')
        // .attr('class', 'bar')
        .merge(attrs.selectAll('.bar'))
        .attr('x', function (d, i, j) {
            // console.log(d, i, j);
            return i * (each_attribute_width / j.length);
        })
        .attr('class', function (d, i) {
            return 'bar bar-' + d['PlayerID'];
        })

        .attr('y', function (d) {
            let attr = d3.select(this.parentNode).datum();
            return 50 - d[attr]
        })
        .attr('height', function (d) {
            let attr = d3.select(this.parentNode).datum();
            // console.log(attr, d[attr], d);
            if (d[attr] === '')
                return 0;
            else
                return d[attr]
        })
        .on('mouseover', function (d) {
            console.log(d);
            d3.selectAll('.bar-' + d['PlayerID'])
                .attr('stroke', 'silver')
                .attr('stroke-width', 3)
        })
        .on("mouseout", function (d) {
            d3.selectAll('.bar-' + d['PlayerID'])
                .attr('stroke', 'transparent')
                .attr('stroke-width', 0)
        });

    // .attr('fill', 'black')
    // .attr('width', function (d, i, j) {
    //     return (each_attribute_width / j.length);
    // });
    // console.log(attrs, bars);
}

function check_sky_filtered() {
    a = (sky_filtered[0]['non-skyline'].filter(x => sky_filtered[1]['skyline'].indexOf(x) > -1))
    b = (sky_filtered[0]['non-skyline'].filter(x => sky_filtered[1]['non-skyline'].indexOf(x) > -1))
    c = (sky_filtered[0]['non-skyline'].filter(x => sky_filtered[1]['new'].indexOf(x) > -1))
    d = (sky_filtered[0]['non-skyline'].filter(x => sky_filtered[1]['out'].indexOf(x) > -1))
    console.log(a.filter(x => b.indexOf(x) > -1))
    console.log(a.filter(x => c.indexOf(x) > -1))
    console.log(a.filter(x => d.indexOf(x) > -1))
    console.log(b.filter(x => c.indexOf(x) > -1))
    console.log(b.filter(x => d.indexOf(x) > -1))
    console.log(c.filter(x => d.indexOf(x) > -1))
}


function calculate_skyline() {
    let worker = new Worker("/static/skyflow/js/worker.js");
    let messages = [];
    progress_bar.select('#progress')
        .attr('width', 0);
    yearly_dom = [];
    let msg = {
        'data': yearly_filtered,
        'opt': current_dataset,
        'year_data': year_data,
        'selected_columns': skyline_columns,
        'columns': columns
    };
    console.log('post msg', msg);
    worker.postMessage(msg);  // 워커에 메시지를 보낸다.

    worker.onmessage = function (e) {
        // console.log(e);
        yearly_dom[year_data.indexOf(e.data.year)] = e.data.data;
        messages.push(e.data.year);
        progress_bar.select('#progress')
            .attr('width', 250 / year_data.length * yearly_dom.length);
        if (yearly_dom.length == year_data.length) {
            draw_compare();
            tsne_worker.postMessage({
                type: 'RUN',
            });
        }

    };
    tsne_worker = new Worker("/static/skyflow/js/worker_tsne.js");

    tsne_worker.postMessage({
        type: 'INPUT_DATA',
        year_data: year_data,
        yearly_filtered: yearly_filtered,
        skyline_columns: skyline_columns,
        columns: columns
        // data: tsne_input,
    });

    // tsne_worker.postMessage({
    //     type: 'RUN',
    // });
    tsne_worker.onmessage = function (e) {
        // console.log('tsne', e);
        let msg = e.data;
        let NEVER_CALCULATED = 0;
        let CALCULATING = 1;
        let DONE_CALCULATE = 2;
        switch (msg.type) {
            case 'PROGRESS_STATUS':
                // $('#progress-status').text(msg.data);
                break;
            case 'PROGRESS_ITER':
                // $('#progress-iter').text(msg.data[0] + 1);
                // $('#progress-error').text(msg.data[1].toPrecision(7));
                // $('#progress-gradnorm').text(msg.data[2].toPrecision(5));
                break;
            case 'PROGRESS_DATA':
                // drawUpdate(msg.data);
                if (tsne_calculated[year_data.indexOf(msg.year)] == NEVER_CALCULATED) {
                    msg.data.forEach(function (d, i) {
                        yearly_filtered[year_data.indexOf(msg.year)][i]['x'] = d[0];
                        yearly_filtered[year_data.indexOf(msg.year)][i]['y'] = d[1];
                    });
                    tsne_calculated[year_data.indexOf(msg.year)] = CALCULATING;
                    if (msg.year === current_year)
                        draw_project(msg.year, yearly_filtered[year_data.indexOf(msg.year)]);
                } else if (tsne_calculated[year_data.indexOf(msg.year)] == CALCULATING) {
                    msg.data.forEach(function (d, i) {
                        yearly_filtered[year_data.indexOf(msg.year)][i]['x'] = d[0];
                        yearly_filtered[year_data.indexOf(msg.year)][i]['y'] = d[1];
                    });
                    if (msg.year === current_year)
                        update_project(msg.year, yearly_filtered);

                } else {
                    // update_project(current_year, yearly_filtered);
                }
                break;

            case 'DONE':
                tsne_calculated[year_data.indexOf(msg.year)] = DONE_CALCULATE;
                // console.log(msg.year, msg.data);
                msg.data.forEach(function (d, i) {
                    yearly_filtered[year_data.indexOf(msg.year)][i]['x'] = d[0];
                    yearly_filtered[year_data.indexOf(msg.year)][i]['y'] = d[1];
                });
                // first year only


                if (msg.year == current_year)
                    update_project(msg.year, yearly_filtered);

                // run next year
                // calculating_year++;
                // let y_i = year_data.indexOf(calculating_year);
                // if (y_i == year_data.length - 1)
                //     break;
                // tsne_input = [];
                // for (let ri in yearly_filtered[y_i + 1]) {
                //     tsne_input.push(skyline_columns.map(x => +yearly_filtered[0][ri][columns[x]]));
                // }
                // console.log('tsne_input', y_i, tsne_input);
                // // tsne_worker.terminate()
                // // tsne_worker = new Worker("/static/skyflow/js/worker_tsne.js");
                // tsne_worker.postMessage({
                //     type: 'INPUT_DATA',
                //     data: tsne_input,
                // });

                break;
            default:
        }

        // for (y in year_data)
        //     tsne_calculate(yearly_filtered[y], columns)

    }

    //
    // let project_points = project_svg.selectAll('.point')
    //     .data(original_dataset)
    //     .enter()
    //     .append('g')
    //     .attr('class', function (d) {
    //         return 'point year-' + d['Year'] + ' point-' + d.nameid;
    //     })
    //     .attr('transform', function (d) {
    //         // console.log(tsne_scale(d.tsne_x));
    //         return 'translate(' + tsne_scale(+d.tsne_x) + ',' + tsne_scale(+d.tsne_y) + ')';
    //     });
    //
    // project_points.append('circle')
    //     .attr('r', function (d, i) {
    //         // console.log(d[0], dom_data[d[0]]);
    //         return radius_scale((dom_data[d[0]]['dom']).length);
    //     });
}


function update_selected_years() {

    selected_years = [current_year];
    selected_players.forEach(function (p) {
        yearly_filtered.forEach(function (y, y_i) {
            if (selected_years.indexOf(year_data[y_i]) < 0) {
                let tmp = y.map(x => x['PlayerID']);
                if (tmp.indexOf(p) > -1) {
                    selected_years.push(year_data[y_i])
                }
            }
        })
    });
    selected_years = selected_years.sort();
    draw_timeline();
}

// etc

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        let firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};
