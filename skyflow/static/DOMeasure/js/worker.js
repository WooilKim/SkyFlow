var i = 0; // 1씩 증가시켜서 전달할 변수

// 메시지 수신
self.onmessage = function (e) {
    console.log(e);
    // nba
    if (e.data.opt == 'nba') {
        for (let i = 0; i < e.data.year_data.length; i++)
            calculate_nba(i, e.data.data, e.data.year_data, e.data.columns, e.data.selected_columns)
    } else {
        // baseball
    }
};

function calculate_baseball(y, yearly_filtered, year_data, columns, selected_skyline) {
    // let year_data = d3.range(1980, 2018);
    let year_list = [];
    // let y = year_data.indexOf(year);
    for (pid in yearly_filtered[y]) {
        let answer = {};
        let dom_filtered = yearly_filtered[y].slice();
        dom_filtered = dom_filtered.filter(function (item) {
            let player = yearly_filtered[y][pid];
            let arr = [];
            selected_skyline.forEach(function (d) {
                let c = columns[d];
                arr.push(player[c] - item[c]);
            });
            return (arr.every(x => x >= 0) && arr.some(x => x > 0));
        });
        answer['dom'] = dom_filtered.slice();

        let domby_filtered = yearly_filtered[y].slice();
        domby_filtered = domby_filtered.filter(function (item) {
            let player = yearly_filtered[y][pid];
            let arr = [];
            selected_skyline.forEach(function (d) {
                let c = columns[d];
                arr.push(item[c] - player[c]);
            });
            return (arr.every(x => x >= 0) && arr.some(x => x > 0));
        });
        answer['dom_by'] = domby_filtered.slice();
        year_list.push(answer)
    }
    // console.log(y, testanswer);

    // yearly_dom[y] = testanswer;

    // console.log(year_list);

    // 1씩 증가시켜서 전달
    postMessage({'year': 1978 + i, 'data': year_list});

    // 1초뒤에 다시 실행

    // setTimeout(function () {
    //     loop();
    // }, 1000);

}

function calculate_nba(y, yearly_filtered, year_data, columns, selected_skyline) {
    // let year_data = d3.range(1980, 2018);
    let year_list = [];
    // let y = year_data.indexOf(year);
    for (pid in yearly_filtered[y]) {
        let answer = {};
        let dom_filtered = yearly_filtered[y].slice();
        dom_filtered = dom_filtered.filter(function (item) {
            let player = yearly_filtered[y][pid];
            let arr = [];
            selected_skyline.forEach(function (d) {
                let c = columns[d];
                arr.push(player[c] - item[c]);
            });
            return (arr.every(x => x >= 0) && arr.some(x => x > 0));
        });
        answer['dom'] = dom_filtered.slice();

        let domby_filtered = yearly_filtered[y].slice();
        domby_filtered = domby_filtered.filter(function (item) {
            let player = yearly_filtered[y][pid];
            let arr = [];
            selected_skyline.forEach(function (d) {
                let c = columns[d];
                arr.push(item[c] - player[c]);
            });
            return (arr.every(x => x >= 0) && arr.some(x => x > 0));
        });
        answer['dom_by'] = domby_filtered.slice();
        year_list.push(answer)
    }
    // console.log(y, testanswer);

    // yearly_dom[y] = testanswer;

    // console.log(year_list);

    // 1씩 증가시켜서 전달
    postMessage({'year': 1978 + y, 'data': year_list});

    // 1초뒤에 다시 실행

    // setTimeout(function () {
    //     loop();
    // }, 1000);

}