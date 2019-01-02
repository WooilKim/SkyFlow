'use strict';

importScripts("/static/DOMeasure/js/tsne.js");

function isBusy() {
    postMessage({
        type: 'STATUS',
        data: 'BUSY'
    });
}

function isReady() {
    postMessage({
        type: 'STATUS',
        data: 'READY'
    });
}

isBusy();

let model = new TSNE({
    dim: 2,
    perplexity: 30.0,
    earlyExaggeration: 4.0,
    learningRate: 1000.0,
    nIter: 100,
    metric: 'euclidean'
});


var firstRun = true;
let year_data = [];
let yearly_filtered = [];
let year = 0;
let columns = [];
let skyline_columns = [];
self.onmessage = function (e) {
    let msg = e.data;
    year_data = msg.year_data;
    yearly_filtered = msg.yearly_filtered;
    skyline_columns = msg.skyline_columns;
    columns = msg.columns;
    for (let yi in year_data) {
        let tsne_input = [];
        year = year_data[yi];
        for (let ri in yearly_filtered[yi]) {
            tsne_input.push(skyline_columns.map(x => +yearly_filtered[yi][ri][columns[x]]));
        }
        firstRun = true;
        isBusy();
        // model = new TSNE({
        //     dim: 2,
        //     perplexity: 30.0,
        //     earlyExaggeration: 4.0,
        //     learningRate: 1000.0,
        //     nIter: 300,
        //     metric: 'euclidean'
        // });
        model.init({
            data: tsne_input,
            type: 'dense'
        });
        isReady();
        isBusy();
        if (firstRun) {
            model.run();
            firstRun = false;
        } else {
            model.rerun();
        }
        postMessage({
            type: 'DONE',
            year: year,
            data: model.getOutputScaled(),
        });
        isReady();
    }
    // switch (msg.type) {
    //     case 'INPUT_DATA':
    //         isBusy();
    //         firstRun = true;
    //         model.init({
    //             data: msg.data,
    //             type: 'dense'
    //         });
    //         isReady();
    //         break;
    //     case 'RUN':
    //         isBusy();
    //         // model.perplexity = msg.data.perplexity;
    //         // model.earlyExaggeration = msg.data.earlyExaggeration;
    //         // model.learningRate = msg.data.learningRate;
    //         // model.nIter = msg.data.nIter;
    //         // model.metric = msg.data.metric;
    //         if (firstRun) {
    //             model.run();
    //             firstRun = false;
    //         } else {
    //             model.rerun();
    //         }
    //
    //         postMessage({
    //             type: 'DONE',
    //             data: model.getOutputScaled(),
    //         });
    //         isReady();
    //         break;
    //     default:
    // }
};

// emitted progress events

model.on('progressIter', function (iter) {
    // data: [iter, error, gradNorm]
    postMessage({
        type: 'PROGRESS_ITER',
        data: iter
    });
});

model.on('progressStatus', function (status) {
    postMessage({
        type: 'PROGRESS_STATUS',
        data: status
    });
});

model.on('progressData', function (data) {
    postMessage({
        type: 'PROGRESS_DATA',
        year: year,
        data: data
    });
});
//
// self.onmessage = function (e) {
//     console.log(e);
//     // nba
//     // let columns = e.data.columns;
//     let selected_columns = e.data.selected_columns;
//     let year_data = e.data.year_data;
//     let yearly_filtered = e.data.data;
//     for (y in year_data) {
//         console.log(y);
//         tsne_calculate(y, yearly_filtered[y], selected_columns)
//     }
//
// };
//
// function tsne_calculate(y, data, selected_columns) {
//
//     let opt = {epsilon: 10}; // epsilon is learning rate (10 = default)
//     let data_2darray = [];
//     data.forEach(function (d) {
//         data_2darray.push(selected_columns.map(x => Object.values(d)[x]));
//     });
//     // console.log(data);
//     let tsne = new tsnejs.tSNE(opt); // create a tSNE instance
//
// // initialize data. Here we have 3 points and some example pairwise dissimilarities
// //     let dists = [[1.0, 0.1, 0.2], [0.1, 1.0, 0.3], [0.2, 0.1, 1.0]];
//     // tsne.initDataDist(dists);
//     tsne.initDataDist(data);
//
//     for (var k = 0; k < 500; k++) {
//         tsne.step(); // every time you call this, solution gets better
//     }
//     var Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
//     // console.log(Y)
//     postMessage({'year': 1978 + y, 'data': Y});
// }