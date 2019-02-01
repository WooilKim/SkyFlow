let original_dataset, histogram_data;
let selected_column_idx = [];
let columns, filter_columns;
let column_extents = {};
let year_date;
let column_svg, project_svg, flow_svg, selected_svg,
    timeline_head_svg,
    timeline_projected_svg,
    timeline_svg,
    list_head_svg;
let yearly_playerID = [];
let project_detail;
let year_data, dom_data;
let radius_scale = d3.scaleLinear().range([3, 10]).domain([0, 1]);
let tsne_scale = d3.scaleLinear().range([0, 450]).domain([-1, 1]);
let new_scaleX = d3.scaleLinear().range([0, 450]).domain([-1, 1]);
let new_scaleY = d3.scaleLinear().range([0, 450]).domain([-1, 1]);
let colorscale = d3.scaleOrdinal(d3.schemeCategory10);
let selected_player_colorscale = d3.scaleOrdinal(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"].reverse())
let draw_data;
let current_dataset = '';
let a = "";
let filtered_data = [];
let skyline_cal_btn;
let filter_selected = [];
let current_year = 1978;
let selected_years = [];
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
let timeline_columns = [];
let selected_bars = [];
let selected_paths = [];
let title_div_height = 30;
let tsnexrange = [0, 100];
let tsneyrange = [0, 100];
let timeline_data = [1978, 1979, 1980];
let window_width = window.innerWidth;
let window_height = window.innerHeight;
let project_div = document.getElementById('project_div');
let filter_div = document.getElementById('filter_div');
let flow_div = document.getElementById('flow_div');
let sky_filtered_length = [];
let list_div = document.getElementById('list_div')
let list_svg;
let players = [];
let players_filter_dic = {};
let final_filtered_players = [];

let zoom = d3.zoom()
    .on("zoom", zoomed);

//sizes
let project_div_width = window_width / 5 - 2;
let flow_div_width = window_width / 2 - 2;
let filter_div_width = window_width * 3 / 20 - 2;
let list_div_width = window_width * 3 / 20 - 2;
let timeline_div_width = window_width - 320 - 4;
// let timeline_div_width = window_width * 9 / 10 - 2;
let info_div_width = 320;
// let info_div_width = window_width / 10 - 2;
let each_filter_height = 100;

let title_height = 15;
let slider_div_height = 50;
let project_div_height = project_div_width;
let flow_div_height = project_div_width;
let filter_div_height = project_div_width;
let list_div_height = project_div_width;
let timeline_div_height = d3.max([project_div_height + title_height, window_height - project_div_height - title_height - 35 - 25 - 25 - 15]);
let info_div_height = d3.max([project_div_height + title_height, window_height - project_div_height - title_height - 35 - 25 - 25 - 15]);

let timeline_head_height = 30;
let timeline_each_height = 70,
    timeline_each_width = 300,
    timeline_gap_width = 50,
    timeline_year_padding = 10;
let progress_bar;

let flow_label_width = 30;
let flow_detail_height = 40;
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

draw_info();

function draw_info() {
    d3.csv("/static/skyflow/data/processed/NBA_columns_extent.csv").then(function (data) {
        // console.log(data);
        let infosvg = d3.select('div#info').append('svg')
            .attr('height', function () {
                return data.length * 20
            })
            .attr('width', 320)

        let infog = infosvg.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', function (d, i) {
                return 'translate(0,' + i * 20 + ')';
            });
        infog.append('rect')
            .attr('width', 320)
            .attr('height', data.length * 20)
        infog.append('text')
            .text(function (d) {
                return d.column;
            })
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .style('font-size', '11px')
            .attr('x', 20)
            .attr('y', 10)
        infog.append('text')
            .text(function (d) {
                return d.detail;
            })
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .style('font-size', '11px')
            .attr('y', 10)
            .attr('x', 140)
        infog.append('text')
            .text(function (d) {
                return d.min + ' ~ ' + d.max;
            })
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .style('font-size', '11px')
            .attr('y', 10)
            .attr('x', 270)
    })
}

function set_svg() {
    // console.log('set_svg', window_width);


    column_svg = d3.select('div#columns').append('svg')
        .attr('width', window_width + 'px')
        .attr('height', '30px');

    project_svg = d3.select('div#project').append('svg')
        .attr('width', function () {
            // console.log('project_div width ', project_div.clientWidth);
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
        .attr("height", 50);
    d3.select("div#flow_detail").append("svg")
        .attr("width", flow_div_width)
        .attr("height", flow_detail_height);
    list_head_svg = d3.select('div#list_column')
        .append('svg')
        .attr('height', 20)
        .attr('width', list_div.clientWidth);
    list_svg = d3.select('div#list_content')
        .append('svg')
        .attr('id', 'list_content_svg')
        .attr('width', list_div.clientWidth);
    timeline_head_svg = d3.select("div#timeline_head").append('svg')
        .attr('width', timeline_div_width - 2)
        .attr('height', timeline_head_height);
    timeline_projected_svg = d3.select("div#timeline_projected").append('svg')
        .attr('width', timeline_div_width - 100 - 2)
        .attr('height', timeline_each_height);
    timeline_svg = d3.select("div#timeline").append('svg')
        .attr('width', timeline_div_width - 100 - 2)
        .attr('height', timeline_div_height - title_height - 30 - timeline_each_height);
    flow_svg = d3.select("div#flow")
        .append('svg');
    flow_svg.append('g')
        .attr('class', 'yearlabel');
    flow_svg.append('g')
        .attr('class', 'stacks');
    flow_svg.append('g')
        .attr('class', 'paths');
    d3.select('div#selected_year').append('svg')

}

function set_layout() {
    // console.log('set_layout', window_width);
    // project view
    d3.select('div#project_div').style('width', project_div_width + 'px');
    d3.select('div#project_div').style('height', project_div_height + title_height + 'px');
    d3.select('div#project_title').style('width', project_div_width - 2 + 'px');
    d3.select('div#project_title').style('height', title_height + 'px');
    d3.select('div#project_slider').style('width', project_div_width + 'px');
    d3.select('div#project_slider').style('height', slider_div_height + 'px');
    d3.select('div#project').style('width', project_div_width + 'px');
    d3.select('div#project').style('height', project_div_width - slider_div_height + 'px');
    // flow view
    d3.select('div#flow_div').style('width', flow_div_width + 'px');
    d3.select('div#flow_div').style('height', flow_div_height + title_height + 'px');
    d3.select('div#flow_title').style('width', flow_div_width - 2 + 'px');
    d3.select('div#flow_title').style('height', title_height + 'px');
    d3.select('div#flow_wrapper').style('width', flow_div_width + 'px');
    d3.select('div#flow_wrapper').style('height', flow_div_height + 'px');
    d3.select('div#flow_label').style('width', flow_label_width + 'px');
    d3.select('div#flow_label').style('height', flow_div_height - flow_detail_height + 'px');
    d3.select('div#flow_main').style('width', flow_div_width + 'px');
    d3.select('div#flow_main').style('height', flow_div_height - flow_detail_height + 'px');
    d3.select('div#flow').style('width', flow_div_width - flow_label_width + 'px');
    d3.select('div#flow').style('height', flow_div_height - flow_detail_height + 'px');
    d3.select('div#flow_detail').style('width', flow_label_width + 'px');
    d3.select('div#flow_detail').style('height', flow_detail_height + 'px');

    // filter view
    d3.select('div#filter_div').style('width', filter_div_width + 'px');
    d3.select('div#filter_div').style('height', filter_div_height + title_height + 'px');
    d3.select('div#filter_title').style('height', title_height + 'px');
    d3.select('div#filter_list').style('height', filter_div_height - 20 - 2 + 'px');
    //list view
    d3.select('div#list_div').style('width', list_div_width + 'px');
    d3.select('div#list_title').style('height', title_height + 'px');
    d3.select('div#list_div').style('height', list_div_height + title_height + 'px');
    d3.select('div#list_column').style('height', 20 + 'px');
    d3.select('div#list_content').style('width', list_div_width + 'px');
    d3.select('div#list_content').style('height', (list_div_height - 20) + 'px');
    //timeline view
    d3.select('div#timeline_div').style('width', timeline_div_width + 'px');
    d3.select('div#timeline_div').style('height', timeline_div_height + 'px');

    d3.select('div#timeline_title').style('width', timeline_div_width + 'px');
    d3.select('div#timeline_title').style('height', title_height + 'px');
    // d3.select('div#timeline_year').style('width', timeline_div_width + 'px');
    d3.select('div#timeline_year').style('height', timeline_div_height - title_height + 'px');
    d3.select('div#projected_year').style('width', 100 + 'px');
    d3.select('div#projected_year').style('height', 100 + 'px');
    d3.select('div#timeline_head').style('height', 30 + 'px');
    d3.select('div#timeline_head').style('width', timeline_div_width - 100 - 2 + 'px');
    d3.select('div#timeline_projected').style('width', timeline_div_width - 100 - 2 + 'px');
    d3.select('div#timeline_projected').style('height', timeline_each_height + 'px');
    d3.select('div#timeline').style('width', timeline_div_width - 100 - 2 + 'px');
    d3.select('div#timeline').style('height', timeline_div_height - title_height - 30 - timeline_each_height + 'px');
    d3.select('div#selected_year').style('height', timeline_div_height - title_height - 30 - timeline_each_height + 'px');
    // info view
    d3.select('div#info_div').style('width', info_div_width + 'px');
    d3.select('div#info_div').style('height', info_div_height + 'px');
    d3.select('div#info_title').style('width', info_div_width + 'px');
    d3.select('div#info_title').style('height', title_height + 'px');
    d3.select('div#info').style('width', info_div_width - 2 + 'px');
    d3.select('div#info').style('height', info_div_height - title_height - 2 + 'px');
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
                selected_years = [current_year];
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
                selected_years = [current_year];
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
            let arr = original_dataset.filter(x => x['Year'] == d)
            yearly_filtered.push(arr)
            yearly_playerID.push(arr.map(x => x['PlayerID']))
        });
        // yearly_filtered.forEach(function (y) {
        //     yearly_playerID.push(y.map(x => x[x['PlayerID']]))
        // });
        columns = original_dataset.columns.slice(6,);
        filter_columns = original_dataset.columns.slice(7,);
        filter_columns.splice(0, 0, 'Salary');
        filter_columns.forEach(function (d) {
            column_extents[d] = d3.extent(original_dataset.map(x => +x[d]));
        });
        column_extents['dominance'] = [0, 0];
        // players = Array.from(new Set(original_dataset.map(x => [x['PlayerID'], x['Player']])));
        // players.forEach(function (d) {
        //     players_filter_dic[d] = {};
        // });

        set_columnsvg();
        // update_selected_column();
        draw_slider();
        for (let i in year_data) {
            tsne_calculated.push(0)
        }
        histogram();

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
    let dataselectdiv = d3.select('div#dataselect').style('height', '25px')

    let dataset_select = dataselectdiv.append('select')
        .attr('id', 'data-selection')
        .style('width', '130px')
        .style('height', '20px')
        .style('margin-top', '2px')
        .style('margin-left', '10px')
        .style('padding', '0px')
        .style('display', 'block')
        .style('float', 'left')
        .on('change', function () {
            let selected = dataselectdiv.select('select').property('value');
            // console.log(selected);
            if (selected == 'Select Dataset')
                return;
            current_dataset = selected;
            read_data(selected);
        });
    dataset_select.selectAll('option')
        .data(['Select Dataset', 'NBA', 'MLB'])
        .enter()
        .append('option')
        .style('height', '20px')
        .text(function (d) {
            return d;
        });
    d3.select('div#dataselect').append('svg')
        .style('display', 'block')
        .style('float', 'left')
        .attr('width', (window_width - 145) + 'px')
        .attr('height', '25px');
    progress_bar = dataselectdiv.select('svg')
        .append('g')
        .attr('transform', function () {
            return 'translate(' + 70 + ',0)';
        });


    progress_bar.append('rect')
        .attr('class', 'progress-skyline')
        .attr('width', (window_width - 240) / 2)
        .attr('height', 18)
        .attr('rx', 2)
        .attr('x', 10)
        .attr('y', 3)
        .attr('stroke-width', 1)
        .attr('stroke', 'silver')
        .attr('fill', 'transparent');
    progress_bar.append('rect')
        .attr('class', 'skyline-bar')
        .attr('width', 0)
        .attr('height', 18)
        .attr('rx', 2)
        .attr('x', 10)
        .attr('y', 3)
        .attr('stroke-width', 1)
        .attr('stroke', 'silver')
        .attr('fill', 'silver');
    progress_bar.append('text')
        .text('skyline computation progress : not initiated')
        .attr('class', 'progress-skyline')
        .attr('width', (window_width - 240) / 2)
        .attr('height', 18)
        .attr('x', (window_width - 240) / 4)
        .attr('y', 17)
        .style('font-size', '14px')
        .attr('fill', 'black')
        .style('text-anchor', 'middle')


    progress_bar.append('rect')
        .attr('class', 'progress-tsne')
        .attr('width', (window_width - 240) / 2)
        .attr('height', 18)
        .attr('rx', 2)
        .attr('x', 20 + (window_width - 240) / 2)
        .attr('y', 3)
        .attr('stroke-width', 1)
        .attr('stroke', 'silver')
        .attr('fill', 'transparent');

    progress_bar.append('rect')
        .attr('class', 'tsne-bar')
        .attr('width', 0)
        .attr('height', 18)
        .attr('rx', 2)
        .attr('x', 20 + (window_width - 240) / 2)
        .attr('y', 3)
        .attr('stroke-width', 1)
        .attr('stroke', 'silver')
        .attr('fill', 'silver');

    progress_bar.append('text')
        .text('t-SNE computation progress : not initiated')
        .attr('class', 'progress-tsne')
        .attr('width', (window_width - 240) / 2)
        .attr('height', 18)
        .attr('x', (window_width - 240) / 4 + (window_width - 240) / 2)
        .attr('y', 17)
        .style('font-size', '14px')
        .attr('fill', 'black')
        .style('text-anchor', 'middle')

    progress_bar.append('rect')
        .attr('id', 'progress')
        .attr('width', 0)
        .attr('height', 20)
        .attr('fill', 'black');

    skyline_cal_btn = dataselectdiv.select('svg')
        .append('g')
        .attr('transform', function () {
            return 'translate(' + 10 + ',0)';
        })
        .on('mouseover', function () {
            d3.select(this).select('rect')
                .attr('fill', 'grey')
            d3.select(this).select('text')
                .attr('fill', 'white')
        })
        .on('mouseout', function () {
            d3.select(this).select('rect')
                .attr('fill', 'white')
            d3.select(this).select('text')
                .attr('fill', 'black')
        })
        .on('click', function () {
            // console.log('start');
            calculate_skyline();
        });
    skyline_cal_btn.append('rect')
        .attr('width', 60)
        .attr('height', 18)
        .attr('rx', 3)
        .attr('y', 3)
        .attr('fill', 'white')
        .attr('stroke', 'grey')
        .attr('stroke-width', 1);
    skyline_cal_btn.append('text')
        .text('Launch')
        .attr('x', 10)
        .attr('y', 13)
        .attr('fill', 'black')
        .style('font-size', '13px')
        // .style('font-weight', 'bold')
        .style('alignment-baseline', 'central');
}

function set_columnsvg() {
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

function update_selected_column() {
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
    // console.log('draw_project');
    let y_i = year_data.indexOf(year);
    // d3.select('div#project').select('svg')
    //     .select('.projectg').selectAll('.point').remove();

    let project_points = d3.select('div#project').select('svg')
        .select('.projectg')
        .selectAll('.point')
        .data(data);

    // console.log('enter', project_points)
    project_points.exit().remove();
    // console.log('exit', project_points)

    let new_points = project_points
        .enter()
        .append('g');
    // mouse-over시 이름 보여질 화면을 위해 미리 그려둠 (z-index 때문)
    new_points.append('g')
        .attr('class', 'detail');

    new_points.append('circle')
        .attr('class', function (d) {
            return 'circlecenter ' + 'cc-' + d['id'];
        });

    new_points.append('g')
        .attr('class', 'pie');

    new_points
        .merge(project_points)
        .attr('class', function (d, i) {
            return 'point year-' + yearly_filtered[y_i][i]['Year'] + ' point-' + yearly_filtered[y_i][i]['PlayerID'] + ' pointid-' + yearly_filtered[y_i][i]['id'];
        })
        .attr('transform', function (d) {
            return 'translate(' + new_scaleX(d.x) + ',' + new_scaleY(d.y) + ')';
        });

    project(yearly_filtered[y_i]);
}

function project(draw_data) {
    // console.log('draw_data', draw_data)
    // d3.select('div#project').select('svg')
    //     .select('.projectg').selectAll('.point').remove();
    let year = draw_data[0].Year;

    let y_i = year_data.indexOf(+year);
    // console.log('y_i', y_i);
    let project_points = d3.select('div#project').select('svg')
        .select('.projectg')
        .selectAll('.point');

    // let detail_info = project_points.append('g')
    //     .attr('class', 'detail');

    let circles = project_points.select('circle')
        .attr('class', function (d) {
            return 'circlecenter ' + 'cc-' + d['id'];
        })
        .attr('fill', 'white')
        // .attr('stroke', 'white')
        // .attr('stroke-width', 1)
        .attr('r', function (d, i) {
            // console.log('radius', year, y_i, yearly_dom[y_i]);
            let tmp = d3.max(yearly_dom[y_i].map(x => x['dom'].length))
            // console.log(i, yearly_dom[y_i][i]);
            return radius_scale(yearly_dom[y_i][i]['dom'].length / tmp);
            // return 3;
        });

    let pie = d3.pie().sort(null)
        .value(function () {
            return 100 / skyline_columns.length;
        });

    project_points
        .style('stroke', 'silver')
        .style('stroke-width', 0.2);
    project_points
        .on('mouseover', function (d) {
            project_points_mouseover(d['PlayerID'], d['Player']);
            detail_bar_mouseover(d['PlayerID'], d['Player']);
        })
        .on('mouseout', function (d) {
            project_points_mouseout(d['PlayerID']);
            detail_bar_mouseout(d['PlayerID']);
        })
        .on('click', function (d) {
            update_selected_players(d['PlayerID']);
            detail_bar_click();
            detail_bar_mouseout(d['PlayerID']);
            draw_detail_projected(year_data.indexOf(current_year));
            redraw_projected_selected_players();
        });

    let pie_charts = project_points.select('.pie')
        .selectAll("path")
        .data(function (d, i) {
            let pd = pie(skyline_columns.map(x => d[columns[x]]));
            pd.forEach(function (k) {
                let tmp = d3.max(yearly_dom[y_i].map(x => x['dom'].length))
                k['inner'] = yearly_dom[y_i][i]['dom'].length / tmp;
            });
            return pd;
        });
    pie_charts.exit().remove();

    let new_pie_charts = pie_charts.enter()
        .append("path");

    new_pie_charts
        .merge(pie_charts)
        .attr("fill", function (d, i) {
            return colorscale(i);
        })
        .attr("d", function (d,i) {
            let arc = d3.arc()
                .outerRadius(function (d) {
                    return radius_scale(d.inner) + d3.scaleLinear().domain(column_extents[columns[skyline_columns[i]]]).range([3, 30])(parseFloat(d.data));
                })
                .innerRadius(radius_scale(d.inner));
            return arc(d);
        });
}

function project_points_mouseover(player_id, player_name) {
    // console.log(d3.select(this).select('.pie'))
    // console.log(d, project_svg.select('g'), project_svg.select('g').select('.point-' + d['Player ID']))
    if (yearly_playerID[year_data.indexOf(current_year)].indexOf(player_id) < 0) {
        // check in
        return;
    }

    project_svg.select('g').select('.point-' + player_id).moveToFront();

    project_svg.select('g').select('.point-' + player_id).select('.pie')
        .attr('transform', function () {
            return 'scale(4)';
        });
    project_svg.select('g').select('.point-' + player_id).select('circle')
        .attr('transform', function () {
            return 'scale(4)';
        });
    // console.log('project_over', project_svg.select('g').select('.point-' + player_id).datum())

    let d = project_svg.select('g').select('.point-' + player_id).datum()
    let detail = d3.select('.projectdetail')
        .append('g')
        .attr('class', 'detail-' + player_id)
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
            if (current_dataset === "NBA")
                return player_name;
            else
                return d.PlayerID;
        })
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'ideographic')
        .style('font-size', 15)
        .attr('fill', 'white');
}

function project_points_mouseout(player_id) {
    d3.select('.projectdetail').select('rect').remove();
    d3.select('.projectdetail').select('text').remove();
    // project_svg.select('g').select('.point-' + d['PlayerID']).moveToBack();
    project_svg.select('g').select('.point-' + player_id).select('.pie')
        .attr('transform', function (d) {
            return 'scale(1)';
        })
    project_svg.select('g').select('.point-' + player_id).select('circle')
        .attr('transform', function (d) {
            return 'scale(1)';
        });
    // d3.select(this).moveToBack();
    // d3.select(this).select('.pie')
    //     .attr('transform', function (d) {
    //         return 'scale(1)';
    //     })
    // d3.select(this).select('circle')
    //     .attr('transform', function (d) {
    //         return 'scale(1)';
    //     });
}

function redraw_projected_selected_players() {
    let y_i = year_data.indexOf(current_year);
    // d3.selectAll('.point').classed('selected', false);
    project_svg.select('g').selectAll('.point').select('.pie').selectAll('path')
        .style('stroke-width', '0px');
    d3.selectAll('.point').selectAll('circle')
        .attr('fill', 'white');

    selected_players.forEach(function (p, p_i) {
        // project_svg.select('g').select('.point-' + p).classed('selected', true);
        project_svg.select('g').select('.point-' + p).select('.pie').selectAll('path')
            .style('stroke-width', '2px')
            .style('stroke', selected_player_colorscale(p_i));
        let yd = yearly_dom[y_i].filter(x => x.id == p);
        if (yd.length > 0) {
            yd[0].dom.forEach(function (d) {
                d3.select('.pointid-' + d.id).select('circle')
                    .attr('fill', 'red')
            });
            yd[0].dom_by.forEach(function (d) {
                d3.select('.pointid-' + d.id).select('circle')
                    .attr('fill', 'blue')
            });
        }
    });
}

function project_points_click(d) {
    let y_i = year_data.indexOf(current_year);
    // console.log(d, i);

    d3.selectAll('.point').selectAll('circle')
        .attr('fill', 'white');
    if (selected_players.indexOf(d['PlayerID']) < 0) {
        // d3.select(this).selectAll('path')
        //     .attr('stroke', 'red')
        //     .attr('stroke-width', '1px');
        d3.selectAll('.point').selectAll('circle')
            .attr('fill', 'white');
        let yd = yearly_dom[y_i].filter(x => x.id == d['PlayerID'])
        if (yd.length > 0) {
            yd[0].dom.forEach(function (d) {
                d3.select('.pointid-' + d.id).select('circle')
                    .attr('fill', 'red')
            });
            yd[0].dom_by.forEach(function (d) {
                d3.select('.pointid-' + d.id).select('circle')
                    .attr('fill', 'blue')
            });
        }
    } else {

        // d3.select(this).selectAll('path')
        //     .attr('stroke', 'silver')
        //     .attr('stroke-width', '0.2px');
        d3.selectAll('.point').selectAll('circle')
            .attr('fill', 'white');
    }
    d3.selectAll('.point').classed('selected', false);
    selected_players.forEach(function (p) {
        d3.select('.point-' + p).classed('selected', true);
    });
    // console.log('selected_players', selected_players);
    update_list_content('');
}

function relocate_project_points() {
    // console.log('update');

    d3.select('div#project').select('svg')
        .select('.projectg')
        .selectAll('.point')
        .attr('transform', function (d) {
            return 'translate(' + new_scaleX(d.x) + ',' + new_scaleY(d.y) + ')';
        });
}


function draw_slider() {
    d3.select("div#project_slider").select("svg").selectAll('g').remove();
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
            draw_detail_projected(year_data.indexOf(current_year))
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
******      flow VIEW      ******
 */
function draw_flow() {
    let flow_height = project_div.clientWidth - 30;

    flow_svg = d3.select("div#flow")
        .select('svg')
        .attr('width', function () {
            return 50 * year_data.length;
        })
        .attr('height', project_div.clientWidth);
    let gap_between_bars = 50;
    let width_of_bars = 10;
    let padding_left = 30;
    let detail_height = 50;
    flow_svg.select('.yearlabel').selectAll('g').remove();
    flow_svg.select('.stacks').selectAll('g').remove();
    flow_svg.select('.paths').selectAll('g').remove();
    flow_svg.selectAll('svg').remove();

    flow_svg.select('.flowdetail')
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


    let z = d3.scaleOrdinal()
        .range(['skyblue', 'pink', 'yellow']);
    // ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]);
    let label_svg = d3.select('div#flow_label').append('svg')
        .attr('width', 15)
        .attr('height', flow_div_height - flow_detail_height);
    let labelG = label_svg.append('g')
        .attr('class', 'label');
    let yearlabelG = flow_svg.select('g.yearlabel');
    let yl = yearlabelG.selectAll('g')
        .data(year_data)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(' + (i * gap_between_bars) + ',15)';
        });
    yl.append('text')
        .text(function (d) {
            return d;
        })
    // .style('baseline-alignment', 'middle')
    // .style('text-anchor', 'middle')
    // .attr('y', (project_div.clientWidth - title_div_height) / keys.length/2);
    let lb = labelG.selectAll('g')
        .data(keys)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(0,' + ((project_div.clientWidth - title_div_height) / keys.length * i) + ')'
        });
    lb.append('rect')
        .attr('fill', function (d, i) {
            return z(i);
        })
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', (project_div.clientWidth - title_div_height) / 3);
    lb.append('text')
        .text(function (d) {
            return d;
        })
        .attr('fill', 'black')
        .attr('y', 0)
        .attr('x', (project_div.clientWidth - title_div_height) / keys.length / 2)
        .style('font-size', 15)
        .attr('font-weight', 'bold')
        .style('text-anchor', 'middle')
        .style('baseline-alignment', 'middle')
        .attr('transform', 'rotate(90 0 0)');

    let yearG = flow_svg.select('.stacks').selectAll('.stack')
        .data(layers)
        .enter()
        .append('g')
        .attr('transform', 'translate(' + 5 + ',20)')
        .attr('class', function (d, i) {
            return 'stack stack-' + keys[i];
        })

    // console.log('range', project_div.clientWidth, d3.max(yearly_filtered.map(x => x.length)));

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
            // console.log('rect', d);
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
            let data = sky_filtered[d.data.year_idx][opt];
            // if (selected_bars.length > 0 || selected_paths.length > 0) {
            //     data = sky_filtered[d.data.year_idx][opt].filter(x => selected_path_players.indexOf(x) > -1)
            // } else {
            //     data = sky_filtered[d.data.year_idx][opt];
            // }
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
            });
            let tmp = {
                'hovered': data.length,
                'filtered': selected_path_players.filter(x => data.indexOf(x) > -1).length,
                'selected': selected_path_players.length
            };
            update_flow_detail(tmp);
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
            flow_svg.select('g.flowdetail')
                .select('text').remove();
            // console.log(d, i);
            let tmp = {
                'hovered': 0,
                'filtered': selected_path_players.length,
                'selected': selected_path_players.length

            };
            update_flow_detail(tmp)

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

    flow_svg.select('.paths')
        .attr('transform', 'translate(-15,20)')
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
            let data = d[0].values;

            // if (selected_bars.length > 0 || selected_paths.length > 0) {
            //     data = d[0].values.filter(x => selected_path_players.indexOf(x) > -1)
            // } else {
            //     data = d[0].values;
            // }
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
            let tmp = {
                'hovered': data.length,
                'filtered': selected_path_players.filter(x => data.indexOf(x) > -1).length,
                'selected': selected_path_players.length,
            }
            update_flow_detail(tmp)
        })
        .on('mouseout', function (d) {
            d3.selectAll('path.hovered')
                .classed('hovered', false)
            d3.select(this).classed('hovered', false)
            let tmp = {
                'hovered': 0,
                'filtered': selected_path_players.length,
                'selected': selected_path_players.length
            }
            update_flow_detail(tmp)
        })
        .on('click', function (d) {
            // console.log(d);
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
            // console.log(selected_paths);
            filter_selected_players();

        });

    let selected_ids = [13, 56, 78, 22];
    let selected_g = flow_svg.append('svg')
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

}

let sc = ['G', '3PAr', 'ORB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'TOV%'];

function update_flow_detail(data) {
    d3.select("div#flow_detail")
        .select('svg').selectAll('text').remove()

    d3.select("div#flow_detail")
        .select('svg')
        .selectAll('rect')
        .data([0, 1, 2])
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            return i * flow_div_width / 3
        })
        .attr('y', 10)
        .attr('width', flow_div_width / 3 - 10)
        .attr('height', 20)
        .attr('stroke', 'silver')
        .style('opacity', 0.5)
        .attr('fill', 'silver');

    d3.select("div#flow_detail")
        .select('svg')
        .selectAll('text.value')
        .data(Object.keys(data))
        .enter()
        .append('text')
        .attr('class', 'value')
        .attr('x', function (d, i) {
            return flow_div_width / 3 / 2 + flow_div_width / 3 * i
        })
        .attr('y', 25)
        .style('basement-alignment', 'middle')
        .style('font-size', '15px')
        .style('text-anchor', 'middle')
        .text(function (d) {
            return d + ' : ' + data[d];
        });

}

/*
******      LIST VIEW      ******
 */

function draw_list() {

    list_head_svg
        .attr('width', d3.max([list_div.clientWidth, 200 + 50 * filter_selected.length]));
    let default_column = ['Player', 'Flow'];
    list_head_svg.selectAll('.header').remove();
    list_head_svg.selectAll('.header')
        .data(default_column.concat(filter_selected))
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
            if (i == 0)
                return 50;
            else
                return 100 + i * 50;
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
    list_svg
        .attr('height', players.length * 20)
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
            return 'translate(0,' + i * 20 + ')';
        })
        .on('mouseover', function (d) {
            list_svg.select('.player-' + d[0])
                .classed('hovered', true)
            project_points_mouseover(d[0], d[1]);
            detail_bar_mouseover(d[0], d[1]);
        })
        .on('mouseout', function (d) {
            list_svg.selectAll('.player')
                .classed('hovered', false)
            project_points_mouseout(d[0]);
            detail_bar_mouseout(d[0]);
        })
        .on('click', function (d) {
            // console.log('click', d);
            update_selected_players(d[0]);
            draw_detail_projected(year_data.indexOf(current_year));
            detail_bar_mouseout(d[0]);
            detail_bar_click();
            redraw_projected_selected_players();
        })
    list_g.append('rect')
        .attr('height', 20)
        .attr('width', d3.max([list_div.clientWidth, 200 + 50 * filter_selected.length]));
    list_g.append('text')
        .text(function (d) {
            return d[1]
        })
        .attr('y', 15)
        .style('font-size', '12px')

}

function update_list_content(key) {
    update_selected_years();
    d3.selectAll('.player').classed('selected', false);
    list_svg.selectAll('.player').select('text').attr('fill', 'black').style('font-weight', '');
    selected_players.forEach(function (p, i) {
        list_svg.select('.player-' + p)
        // .classed('selected', true)
            .select('text').attr('fill', selected_player_colorscale(i))
            .style('font-weight', 'bold')
        // .style('opacity', 0.5)
        // list_svg.selectAll('.player')
        //         .classed('hovered', false)
    });
    // let key = list_order_by;
    // console.log('update', key, list_svg.selectAll('.player'));
    // console.log(list_svg.selectAll('.player'))
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
            return 'translate(0,' + i * 20 + ')';
        });

    // console.log(list_svg.selectAll('.player'))

}

function update_filter_mark(key) {
    // console.log('i[date', list_svg.selectAll('.player')
    //     .selectAll('.mark-' + filter_columns.indexOf(key)), filter_columns.indexOf(key))
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

function get_final_filtered_players() {
    final_filtered_players = selected_filter_players[filter_selected[0]].splice();
    if (filter_selected.length > 1) {
        filter_selected.slice(1,).forEach(function (key) {
            final_filtered_players = final_filtered_players.filter(x => filter_selected[key].indexOf(x) > -1)
        })
    }
}

function draw_filter_mark() {
    list_svg
        .attr('width', d3.max([list_div.clientWidth, 200 + 50 * filter_selected.length]));
    list_head_svg
        .attr('width', d3.max([list_div.clientWidth, 200 + 50 * filter_selected.length]));
    let default_column = ['Player', 'Flow'];
    list_head_svg.selectAll('.header').remove();
    list_head_svg.selectAll('.header')
        .data(default_column.concat(filter_selected))
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
            if (i == 0)
                return 50;
            else
                return 100 + i * 50;
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


let isSyncingColumnScroll = false;
let isSyncingContentScroll = false;
let columnDiv = document.getElementById('list_column');
let contentDiv = document.getElementById('list_content');

columnDiv.onscroll = function () {
    // console.log('column scroll')
    if (!isSyncingColumnScroll) {
        isSyncingContentScroll = true;
        contentDiv.scrollLeft = this.scrollLeft;
    }
    isSyncingColumnScroll = false;
}

contentDiv.onscroll = function () {
    // console.log('content scroll')
    if (!isSyncingContentScroll) {
        isSyncingColumnScroll = true;
        columnDiv.scrollLeft = this.scrollLeft;
    }
    isSyncingContentScroll = false;
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
                // console.log('filter_set' + column);
                let filter_g = d3.select('g.filter-' + filter_columns.indexOf(column));
                let data = histogram_data[column];
                // console.log(data);
                // console.log(d3.min(data['histogram']), d3.max(data['histogram']));

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
                        if (d >= 1000000)
                            return Math.floor(d / 1000000) + 'M';
                        else if (d >= 1000)
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
                        // console.log('brushed');
                        // console.log(d3.event.selection.map(x.invert));
                        filter_ranges[column] = d3.event.selection.map(x.invert)

                        //filter players
                        selected_filter_players[column] = Array.from(new Set(original_dataset.filter(p => p[column] >= filter_ranges[column][0] && p[column] <= filter_ranges[column][1]).map(p => p['PlayerID'])));
                        players.forEach(function (d, i) {
                            if (selected_filter_players[column].indexOf(d) > -1) {
                                players[i][column] = true;
                            }
                        });
                        // get_final_filtered_players();
                        // selected_filter_players[column].forEach(function (p) {
                        //     players_filter_dic[p][column] = true;
                        // })
                        // console.log(selected_filter_players)
                        d3.select('.filter-num-' + filter_columns.indexOf(column))
                            .text(selected_filter_players[column].length);

                        update_filter_mark(column);
                        // draw_detailview()
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
                    .style('font-size', '12px')


                filter_g.append('g')
                    .attr('transform', 'translate(0,' + (each_filter_height - xaxis_height) + ')')
                    .call(axisX);

                filter_g.append('g')
                    .call(axisY)
                    .attr('transform', 'translate(' + (filter_div_width - yaxis_width - padding_right) + ',0)');
                filter_g
                    .append('path')
                    .data(function () {
                        // console.log(data['histogram'])
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
    d3.select('div#filter').selectAll('select').remove()
    d3.select('div#filter').selectAll('text').remove()
    let selection = d3.select('div#filter').append('select')
        .attr('id', 'selection')
        .attr('class', 'selectpicker')
        .style('display', 'block')
        .style('width', (filter_div_width - 2) + 'px')
        .style('height', '20px')
        .style('margin-top', '2px')
        .on('change', function (d) {
            let selected = d3.select('div#filter>select').property('value');
            // console.log(selected);
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
            draw_detail_header();
            draw_detail_projected(year_data.indexOf(current_year));
            draw_detailview();
        });
    // let msg = d3.select('div#filter').append('text')
    //     .text('Add the filter ')
    //     .style('font-size', '15px');
    selection.append('option')
        .text('Filter Attribute')
    let options = selection.selectAll('.filter-option')
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

// draw_flow();


// timeline
function draw_detail_header() {
    timeline_columns = skyline_columns.map(x => columns[x]);
    timeline_columns = timeline_columns.concat(filter_selected.filter(x => timeline_columns.indexOf(x) < 0));
    timeline_columns.splice(0, 0, 'dominance');
    timeline_head_svg.attr('width', d3.max([timeline_div_width - 100 - 2, (timeline_year_padding + (timeline_each_width + timeline_gap_width) * timeline_columns.length)]))
    timeline_head_svg.selectAll('g').remove();
    let columns_g = timeline_head_svg.selectAll('g')
        .data(timeline_columns)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(' + (timeline_year_padding + (timeline_each_width + timeline_gap_width) * i) + ',0)';
        });

    columns_g.append('rect')
        .attr('width', timeline_each_width)
        .attr('height', 20)
        .attr('fill', 'white');

    columns_g.append('text')
        .text(function (d) {
            return d;
        })
        .attr('fill', 'black')
        .style('font-weight', 'bold')
        .style('font-size', 12)
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .attr('x', timeline_each_width / 2)
        .attr('y', 15);
}

function draw_detail_dominance() {

}

function draw_detail_projected(y_i) {
    timeline_projected_svg.attr('width', d3.max([timeline_div_width - 100 - 2, (timeline_year_padding + (timeline_each_width + timeline_gap_width) * timeline_columns.length)]))
    d3.select('div#projected_year').select('svg').remove();
    let yearsvg = d3.select('div#projected_year').append('svg')
        .attr('width', 100)
        .attr('height', 100);
    yearsvg.append('g').append('text')
        .text(year_data[y_i])
        .style('font-size', '12px')
        .attr('x', 30)
        .attr('y', 70);

    let old_details = timeline_projected_svg.selectAll('.attr')
        .data(timeline_columns);
    old_details.exit().remove();
    let new_details = old_details.enter()
        .append('g');
    let details = new_details.merge(old_details)
        .attr('class', function (d) {
            return 'attr ' + 'attr-' + columns.indexOf(d);
        })
        .attr('transform', function (d, i) {
            return 'translate(' + (timeline_year_padding + (timeline_each_width + timeline_gap_width) * i) + ',0)';
        });
    let axis_x = new_details.append('g')
        .attr('class', function (d) {
            return 'axis-x'
        })
        .attr('transform', 'translate(0,50)');
    // let axis_y = new_details.append('g')
    //     .attr('class', function (d) {
    //         console.log(d);
    //         return 'axis-y'
    //     });
    timeline_columns.forEach(function (column) {
        let c_i = columns.indexOf(column);
        let arr = yearly_filtered[y_i].map(x => +x[column]);
        // console.log(column, d3.extent(arr));
        let scaleX = d3.scaleLinear().domain(d3.extent(arr)).range([0, timeline_each_width]);
        let axis = d3.axisBottom(scaleX).tickValues(d3.extent(arr)).tickFormat(function (d) {
            if (d >= 1000000)
                return Math.floor(d / 1000000) + 'M';
            else if (d >= 1000)
                return Math.floor(d / 1000) + 'k';
            else
                return Math.round(d * 1000.0) / 1000.0;
        });
        d3.select('g.attr-' + c_i).select('g.axis-x').call(axis);
    });

    let bars = details.selectAll('rect')
        .data(function (d) {
            return yearly_filtered[y_i].sort(function (a, b) {
                return a[d] - b[d];
            });
        });

    bars.exit().remove();
    let new_bars = bars.enter()
        .append('rect');

    new_bars.merge(bars)
        .attr('class', function (d, i) {
            return 'bar bar-' + d['PlayerID'];
        })
        .attr('x', function (d, i, j) {
            return i * (timeline_each_width / j.length);
        })
        .attr('y', function (d) {
            let attr = d3.select(this.parentNode).datum();
            // console.log('extent', d3.extent(yearly_filtered[y_i].map(x => +x[attr])));
            // console.log('2047', attr, column_extents[attr])
            let scaleattr = d3.scaleLinear().domain(column_extents[attr]).range([0, 50]);
            if (d[attr] === '')
                return 50;
            else {
                return 50 - scaleattr(+d[attr]);
            }
        })
        .attr('height', function (d) {
            let attr = d3.select(this.parentNode).datum();
            let scaleattr = d3.scaleLinear().domain(column_extents[attr]).range([0, 50]);
            // console.log(attr, d[attr], d);
            if (d[attr] === '')
                return 0;
            else
                return scaleattr(+d[attr]);
        })
        .attr('fill', function (d) {
            let attr = d3.select(this.parentNode).datum();
            if (d['dom_by'] == 0)
                return 'skyblue';
            else return 'pink';
            // return colorscale(skyline_columns.indexOf(attr))
        })
        .attr('width', function (d, i, j) {
            return (timeline_each_width / j.length);
        })
        .on('mouseover', function (d) {
            project_points_mouseover(d['PlayerID'], d['Player']);
            detail_bar_mouseover(d['PlayerID'], d['Player']);
        })
        .on('mouseout', function (d) {
            project_points_mouseout(d['PlayerID']);
            detail_bar_mouseout(d['PlayerID']);
        })
        .on("click", function (d) {
            update_selected_players(d['PlayerID']);
            draw_detail_projected(year_data.indexOf(current_year));
            detail_bar_mouseout(d['PlayerID']);
            detail_bar_click();
            redraw_projected_selected_players();
            // project_points_click(d);
        });
    selected_players.forEach(function (p, p_i) {
        d3.selectAll('.bar-' + p)
            .attr('fill', selected_player_colorscale(p_i))
            .attr('height', 50)
            .attr('y', function (d) {
                return 0;
            });
    });

}

function update_selected_players(player_id) {
    if (selected_players.indexOf(player_id) < 0) {
        selected_players.push(player_id);
    } else {
        let idx = selected_players.indexOf(player_id)
        selected_players.splice(idx, 1);
    }
}

function detail_bars_mouseover(d) {

}

function detail_bars_mouseout(d) {

}

function detail_bars_click(d) {

}

function draw_detailview() {
    // console.log('columns', columns);

    // console.log(timeline_columns);
    timeline_svg.attr('height', d3.max([timeline_div_height - title_height - 30 - 20 - timeline_each_height, selected_years.length * timeline_each_height]))
    timeline_svg.attr('width', d3.max([timeline_div_width - 100 - 2, (timeline_year_padding + (timeline_each_width + timeline_gap_width) * timeline_columns.length)]))
    timeline_svg.select('g,timeline_column').remove();
    let yearsvg = d3.select('div#selected_year').select('svg')
        .attr('width', 100)
        .attr('height', d3.max([timeline_div_height - title_height - 30 - 20 - timeline_each_height, selected_years.length * timeline_each_height]));
    yearsvg.selectAll('g').remove();
    yearsvg.selectAll('g')
        .data(selected_years)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            return 'translate(0, ' + (i * timeline_each_height) + ')';
        })
        .append('text')
        .text(function (d) {
            return d;
        })
        .style('font-size', '12px')
        .style('alignment-baseline', 'middle')
        .attr('x', 30)
        .attr('y', 35);
    timeline_sorted = yearly_filtered.slice();
    timeline_svg.selectAll('.row').remove();
    let old_rows = timeline_svg.selectAll('.row')
        .data(selected_years);
    old_rows.exit().remove();
    let new_rows = old_rows.enter()
        .append('g');
    let rows = new_rows.merge(old_rows)
        .attr('class', function (d) {
            return 'row row-' + d;
        })
        .attr('transform', function (d, i) {
            return 'translate(' + 0 + ',' + (i * (timeline_each_height)) + ')'
        });
    // let bg = rows.append('rect')
    //     .attr('class', 'bg')
    //     .attr('height', timeline_each_height)
    //     .attr('width', d3.max([timeline_div_width - 100 - 2, (timeline_year_padding + (timeline_each_width + timeline_gap_width) * timeline_columns.length)]))
    let old_attrs = rows.selectAll('.attr')
        .data(function () {
            return timeline_columns
        });
    old_attrs.exit().remove();
    let new_attrs = old_attrs.enter()
        .append('g');
    let attrs = new_attrs.merge(old_attrs)
        .attr('class', function (d) {
            return 'attr' + ' attr-' + columns.indexOf(d);
        })
        .attr('transform', function (d, i) {
            return 'translate(' + (timeline_year_padding + i * (timeline_each_width + timeline_gap_width)) + ',0)';
        });

    let axis_x = attrs.append('g')
        .attr('class', function (d) {
            return 'axis-x'
        })
        .attr('transform', 'translate(0,50)');


    let old_bars = attrs.selectAll('rect')
        .data(function (d) {
            let year = d3.select(this.parentNode).datum();
            let y_i = year_data.indexOf(year);
            // console.log(year, y_i, yearly_filtered);
            return yearly_filtered[y_i].sort(function (a, b) {
                return a[d] - b[d]
            });
        });
    old_bars.exit().remove();
    let new_bars = old_bars
        .enter()
        .append('rect');
    let bars = new_bars.merge(old_bars)
        .attr('class', function (d, i) {
            return 'bar bar-' + d['PlayerID'];
        })
        .attr('x', function (d, i, j) {
            return i * (timeline_each_width / j.length);
        })
        .attr('y', function (d) {
            let attr = d3.select(this.parentNode).datum();
            let scaleattr = d3.scaleLinear().domain(column_extents[attr]).range([0, 50]);
            if (d[attr] === '')
                return 50;
            else
                return 50 - scaleattr(+d[attr]);
            // } catch (e) {
            //     console.log(d, e);
            // }

        })
        .attr('height', function (d) {
            let attr = d3.select(this.parentNode).datum();
            let scaleattr = d3.scaleLinear().domain(column_extents[attr]).range([0, 50]);
            // console.log(attr, d[attr], d);
            if (d[attr] === '')
                return 0;
            else
                return scaleattr(+d[attr]);
        })
        .attr('fill', function (d) {
            // let attr = d3.select(this.parentNode).datum();
            // if (selected_path_players.length > 0) {
            //     if (selected_path_players.indexOf(d['Player']) < 0)
            //         return 'silver';
            // }
            // if (filter_selected.length > 0) {
            //     if (final_filtered_players.indexOf(d['Player']) < 0)
            //         return 'silver';
            // }
            if (d['dom_by'] == 0)
                return 'skyblue';
            else return 'pink';
            // return colorscale(skyline_columns.indexOf(attr))
        })
        .attr('width', function (d, i, j) {
            return (timeline_each_width / j.length);
        })
        .on('mouseover', function (d) {
            project_points_mouseover(d['PlayerID'], d['Player']);
            detail_bar_mouseover(d['PlayerID'], d['Player']);
        })
        .on('mouseout', function (d) {
            project_points_mouseout(d['PlayerID']);
            detail_bar_mouseout(d['PlayerID']);
        })
        .on('click', function (d) {
            update_selected_players(d['PlayerID']);
            detail_bar_click();
            detail_bar_mouseout(d['PlayerID']);
            draw_detail_projected(year_data.indexOf(current_year));
            redraw_projected_selected_players();
        });
    selected_players.forEach(function (p, p_i) {
        d3.selectAll('.bar-' + p)
            .attr('fill', selected_player_colorscale(p_i))
            .attr('height', 50)
            .attr('y', function (d) {
                return 0;
            });
    });

    // d3.selectAll('.bar').classed('selected', false);


    // timeline_svg.selectAll('.row').selectAll('.attr')
    //     .select('g.axis-x')
    //     .call(function (d) {
    //         // console.log('d', d3.select(d.node().parentNode.parentNode).datum(), d.datum());
    //         let column = d.datum();
    //         let year = d3.select(d.node().parentNode.parentNode).datum();
    //         let y_i = year_data.indexOf(year);
    //         let c_i = columns.indexOf(column);
    //         let arr = yearly_filtered[y_i].map(x => +x[column]);
    //         // console.log(column, d3.extent(arr));
    //         let scaleX = d3.scaleLinear().domain(d3.extent(arr)).range([0, timeline_each_width]);
    //         let axis = d3.axisBottom(scaleX).tickValues(d3.extent(arr)).tickFormat(function (d) {
    //             if (d >= 1000000)
    //                 return Math.floor(d / 1000000) + 'M';
    //             else if (d >= 1000)
    //                 return Math.floor(d / 1000) + 'k';
    //             else
    //                 return Math.round(d * 1000.0) / 1000.0;
    //         });
    //         axis();
    //     })
    // timeline_svg.selectAll('.row').selectAll('.attr')
    //
    // .attr('text', function (d, i) {
    //     let column = d3.select(this.parentNode).datum();
    //     let year = d3.select(this.parentNode.parentNode).datum();
    //     console.log(d3.select(this.parentNode).datum(), )
    // })
    selected_years.forEach(function (y, y_i) {
        timeline_columns.forEach(function (column) {
            let c_i = columns.indexOf(column);
            let arr = yearly_filtered[y_i].map(x => +x[column]);
            // console.log(column, d3.extent(arr));
            let scaleX = d3.scaleLinear().domain(d3.extent(arr)).range([0, timeline_each_width]);
            let axis = d3.axisBottom(scaleX).tickValues(d3.extent(arr)).tickFormat(function (d) {
                if (d >= 1000000)
                    return Math.floor(d / 1000000) + 'M';
                else if (d >= 1000)
                    return Math.floor(d / 1000) + 'k';
                else
                    return Math.round(d * 1000.0) / 1000.0;
            });
            // console.log('y', timeline_svg.select('.row-' + y).select('.attr-' + c_i), timeline_svg.select('.row-' + y).select('attr-' + c_i).select('g.axis-x'))
            timeline_svg.select('.row-' + y).select('.attr-' + c_i).select('g.axis-x').call(axis);
        })
    })
}

function detail_bar_mouseover(player_id, player_name) {
    // console.log('over', d);
    d3.selectAll('.bar-' + player_id)
        .attr('stroke', 'silver')
        .attr('stroke-width', 3);

    // timeline_svg.selectAll('.row').selectAll('.attr')
    //     .append('text')
    //     .attr('text', function (d, i) {
    //         let c_i = d3.select(this.parentNode).attr('class').slice(10,)
    //         let year = d3.select(this.parentNode.parentNode).datum()
    //         console.log(d, c_i, year)
    //         let p = yearly_filtered[y_i].filter(x => x['PlayerID'] == d['PlayerID'])
    //     })

    timeline_columns.forEach(function (column) {
        let c_i = columns.indexOf(column);
        let y_i = year_data.indexOf(current_year)
        let p = yearly_filtered[y_i].filter(x => x['PlayerID'] == player_id)
        if (p.length > 0) {
            timeline_projected_svg.select('.attr-' + c_i).select('.axis-x')
                .append('text')
                .attr('class', 'detail')
                .text(function () {
                    // console.log(y_i, column, p[0][column]);
                    return p[0][column];
                })
                // .attr('width', 50)
                // .attr('height', 50)
                .attr('x', timeline_each_width / 2)
                .attr('y', 15)
                .style('text-anchor', 'middle')
                .style('font-size', '11px')
                .attr('fill', 'black')
        }
    });

    selected_years.forEach(function (y, y_i) {
        timeline_columns.forEach(function (column) {
            let c_i = columns.indexOf(column);
            let p = yearly_filtered[y_i].filter(x => x['PlayerID'] == player_id)
            if (p.length > 0) {
                // console.log(timeline_svg.select('.row-' + y).select('.attr-' + c_i))
                timeline_svg.select('.row-' + y).select('.attr-' + c_i).select('.axis-x')
                    .append('text')
                    .attr('class', 'detail')
                    .text(function () {
                        // console.log(y_i, column, p[0][column]);
                        return p[0][column];
                    })
                    // .attr('width', 50)
                    // .attr('height', 50)
                    .attr('x', timeline_each_width / 2)
                    .attr('y', 15)
                    .style('text-anchor', 'middle')
                    .style('font-size', '11px')
                    .attr('fill', 'black')
            }
        })
    })

    d3.select('div#projected_year').select('svg').append('text')
        .text(player_name)
        .attr('class', 'name')
        .attr('x', 100 / 2)
        .attr('y', 25)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
    // timeline_svg.selectAll('.row').selectAll('.attr')
    //     .append('text')
    //     .attr('class', 'detail')
    //     .attr('text', function () {
    //         console.log(d3.select(this.parentNode).datum(), d3.select(this.parentNode.parentNode).datum());
    //         return '';
    //     })


}

function detail_bar_mouseout(player_id) {
    timeline_svg.selectAll('.row').selectAll('.attr').select('.axis-x').selectAll('.detail').remove();
    // console.log('.bar-' + player_id)
    d3.selectAll('.bar-' + player_id)
        .attr('stroke', 'transparent')
        .attr('stroke-width', 0);
    d3.select('div#projected_year').select('svg').selectAll('.name').remove();
    timeline_projected_svg.selectAll('.attr').select('.axis-x').selectAll('.detail').remove();
}

function detail_bar_click() {
    update_list_content('');
    draw_detailview();
    // d3.selectAll('.bar')
    //     .attr('y', function (d) {
    //         let parentClass = d3.select(this.parentNode).attr('class');
    //         let attr = columns[+parentClass.slice(12,)];
    //         let scaleattr = d3.scaleLinear().domain(column_extents[attr]).range([0, 50]);
    //         // console.log(parentClass, attr)
    //         if (d[attr] === '')
    //             console.log('error with blank value', d);
    //         else
    //             return 50 - scaleattr(+d[attr]);
    //         // } catch (e) {
    //         //     console.log(d, e);
    //         // }
    //     })
    //     .attr('height', function (d) {
    //         let parentClass = d3.select(this.parentNode).attr('class');
    //         let attr = columns[+parentClass.slice(12,)];
    //         // console.log(attr, d[attr], d);
    //         let scaleattr = d3.scaleLinear().domain(column_extents[attr]).range([0, 50]);
    //         if (d[attr] === '')
    //             console.log('error with blank value', d);
    //         else
    //             return scaleattr(+d[attr]);
    //     })
    //     .attr('fill', function (d) {
    //         // let parentClass = d3.select(this.parentNode).attr('class');
    //         // let attr = columns[parentClass.slice(12,)];
    //         if (d['dom_by'] == 0)
    //             return 'skyblue';
    //         else return 'pink';
    //         // return colorscale(skyline_columns.indexOf(attr))
    //     })
    // selected_players.forEach(function (p, p_i) {
    //     d3.selectAll('.bar-' + p)
    //         .classed('selected', true)
    //         .attr('fill', colorscale(p_i))
    //         .attr('height', 50)
    //         .attr('y', function (d) {
    //             return 0;
    //         });
    // });
}

// detail view scroll sync

let isSyncingDetailColumnScroll = false;
let isSyncingDetailContentScroll = false;
let isSyncingDetailProjectedScroll = false;
let isSyncingDetailYearScroll = false;
let detailcolumnDiv = document.getElementById('timeline_head');
let detailprojectedDiv = document.getElementById('timeline_projected');
let detailcontentDiv = document.getElementById('timeline');
let selectedyearDiv = document.getElementById('selected_year');

detailcolumnDiv.onscroll = function () {
    if (!isSyncingDetailColumnScroll) {
        isSyncingDetailContentScroll = true;
        isSyncingDetailProjectedScroll = true;
        detailcontentDiv.scrollLeft = this.scrollLeft;
        detailprojectedDiv.scrollLeft = this.scrollLeft;
    }
    isSyncingDetailColumnScroll = false;
}
detailprojectedDiv.onscroll = function () {
    if (!isSyncingDetailProjectedScroll) {
        isSyncingDetailContentScroll = true;
        isSyncingDetailColumnScroll = true;
        detailcontentDiv.scrollLeft = this.scrollLeft;
        detailcolumnDiv.scrollLeft = this.scrollLeft;
    }
    isSyncingDetailProjectedScroll = false;
}
detailcontentDiv.onscroll = function () {
    if (!isSyncingDetailContentScroll) {
        isSyncingDetailColumnScroll = true;
        isSyncingDetailProjectedScroll = true;
        isSyncingDetailYearScroll = true;
        detailcolumnDiv.scrollLeft = this.scrollLeft;
        detailprojectedDiv.scrollLeft = this.scrollLeft;
        selectedyearDiv.scrollTop = this.scrollTop;
        selectedyearDiv.scrollBottom = this.scrollBottom;
    }
    isSyncingDetailContentScroll = false;
}
selectedyearDiv.onscroll = function () {
    if (!isSyncingDetailYearScroll) {
        isSyncingDetailColumnScroll = true;
        detailcontentDiv.scrollTop = this.scrollTop;
        detailcontentDiv.scrollBottom = this.scrollBottom;
    }
    isSyncingDetailYearScroll = false;
}

function draw_flow_detail() {
    flow_svg.select('.flowdetail').selectAll('g').remove();
    // let detailflow_svg.
}

function filter_selected_players() {
    if (selected_bars.length === 0 && selected_paths.length === 0) {
        selected_path_players = [];
    } else {
        let data = players.map(x => x[0]);
        selected_bars.forEach(function (d) {
            let arr = d.split('_');
            let y_i = arr[0];
            let opt = arr[1];
            data = data.filter(x => sky_filtered[y_i][opt].indexOf(x) > -1)
        });
        selected_paths.forEach(function (d) {
            data = data.filter(x => paths[d][0]['values'].indexOf(x) > -1)
        });
        // console.log('filtered', data);
        selected_path_players = data;

    }

    let tmp = {
        'hovered': 0,
        'filtered': 0,
        'selected': selected_path_players.length
    };
    update_flow_detail(tmp);
    draw_flow_mark()
    // TODO
    // draw list view
}

function draw_bars() {
    let each_attribute_width = 200;
    let each_attribute_gap = 50;
    let timeline_columns = selected_columns.slice(3);
    let year_padding = 150;
    // console.log(timeline_columns);
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
    let attrs = rows.selectAll('.attr');
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
            // console.log(d);
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
    // console.log(a.filter(x => b.indexOf(x) > -1))
    // console.log(a.filter(x => c.indexOf(x) > -1))
    // console.log(a.filter(x => d.indexOf(x) > -1))
    // console.log(b.filter(x => c.indexOf(x) > -1))
    // console.log(b.filter(x => d.indexOf(x) > -1))
    // console.log(c.filter(x => d.indexOf(x) > -1))
}


function calculate_skyline() {
    progress_bar.select('text.progress-skyline')
        .text('skyline computation progress : in progress');
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
    // console.log('post msg', msg);
    worker.postMessage(msg);  // 워커에 메시지를 보낸다.

    worker.onmessage = function (e) {
        // console.log(e);
        yearly_dom[year_data.indexOf(e.data.year)] = e.data.data;
        e.data.data.forEach(function (d, i) {
            yearly_filtered[year_data.indexOf(e.data.year)][i]['dominance'] = d.dom.length;
            yearly_filtered[year_data.indexOf(e.data.year)][i]['dom_by'] = d.dom_by.length;
        });
        messages.push(e.data.year);
        progress_bar.select('rect.skyline-bar')
            .attr('width', (window_width - 240) / 2 / year_data.length * yearly_dom.length);
        if (yearly_dom.length == year_data.length) {
            draw_flow();

            progress_bar.select('text.progress-skyline')
                .text('skyline computation progress : done');
            column_extents['dominance'] =
                [
                    0,
                    d3.max(
                        yearly_filtered.map(y => d3.max(y.map(p => p['dominance'])))
                    )
                ]
            draw_detail_projected(year_data.indexOf(current_year));
            detail_bar_click();
            tsne_worker.postMessage({
                type: 'RUN',
            });
            // draw_detailview();
            draw_list();
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
                if (tsne_calculated[year_data.indexOf(msg.year)] === NEVER_CALCULATED) {
                    msg.data.forEach(function (d, i) {
                        yearly_filtered[year_data.indexOf(msg.year)][i]['x'] = d[0];
                        yearly_filtered[year_data.indexOf(msg.year)][i]['y'] = d[1];
                    });
                    tsne_calculated[year_data.indexOf(msg.year)] = CALCULATING;
                    if (msg.year === current_year) {
                        draw_project(msg.year, yearly_filtered[year_data.indexOf(msg.year)]);
                    }
                } else if (tsne_calculated[year_data.indexOf(msg.year)] === CALCULATING) {
                    msg.data.forEach(function (d, i) {
                        yearly_filtered[year_data.indexOf(msg.year)][i]['x'] = d[0];
                        yearly_filtered[year_data.indexOf(msg.year)][i]['y'] = d[1];
                    });
                    if (msg.year === current_year)
                    // relocate_project_points(msg.year, yearly_filtered);
                        relocate_project_points();

                } else {
                    // relocate_project_points(current_year, yearly_filtered);
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
                if (msg.year === current_year) {
                    // relocate_project_points(msg.year, yearly_filtered);
                    relocate_project_points();
                }
                // console.log('year', msg.year);
                if (year_data.indexOf(msg.year) === year_data.length - 1) {
                    progress_bar.select('text.progress-tsne')
                        .text('skyline computation progress : done');
                }
                progress_bar.select('rect.tsne-bar')
                    .attr('width', (window_width - 310) / 2 / year_data.length * (year_data.indexOf(msg.year) + 1));
                break;
            default:
        }
    }
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
    draw_detailview();
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
