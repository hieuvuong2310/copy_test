/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 91.118, "KoPercent": 8.882};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.20935, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4161, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0875, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.2338, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.6459, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0196, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0805, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0656, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.2725, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.1662, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.1058, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50000, 4441, 8.882, 4162.427240000001, 2, 36977, 2664.0, 8452.400000000009, 10502.900000000001, 16886.470000000085, 644.0477110544349, 285.74438380332714, 246.6579081209586], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 143, 2.86, 2719.565600000003, 2, 35912, 1443.0, 6959.800000000001, 8090.499999999998, 12098.879999999976, 81.43455105132006, 30.54916980020033, 32.20800114822717], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 0, 0.0, 4828.544599999997, 25, 29362, 5059.5, 7836.900000000001, 8435.849999999999, 10166.779999999995, 89.7778895013736, 41.995711983552695, 35.244835526906435], "isController": false}, {"data": ["14 Register Request", 5000, 0, 0.0, 4356.853600000001, 3, 13795, 4521.0, 8462.800000000001, 9600.95, 11198.639999999992, 191.5341888527102, 53.68194550852327, 50.263396918693736], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 0, 0.0, 862.9081999999984, 5, 7151, 543.5, 2133.0, 2689.7999999999993, 4918.759999999995, 69.69612489545582, 57.58097818511291, 36.61769061890159], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 1995, 39.9, 5161.279599999968, 3, 35790, 5266.0, 8597.0, 9954.599999999995, 14249.839999999975, 69.82265046781175, 45.18984669564307, 27.819962295768747], "isController": false}, {"data": ["17 Add Money Request", 5000, 0, 0.0, 5425.893200000008, 17, 36162, 5411.5, 8467.7, 10402.449999999997, 16510.439999999922, 69.90269544793647, 20.069719200872385, 30.104578801308577], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 0, 0.0, 5555.230000000021, 2, 36977, 5487.0, 8822.500000000004, 10595.95, 18032.699999999884, 69.10659000442281, 20.853453429068995, 27.26470933768244], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 308, 6.16, 3461.884000000009, 2, 35815, 2876.5, 7467.700000000002, 8801.499999999998, 11763.849999999997, 73.40419284749545, 22.083020600886723, 28.96024795936344], "isController": false}, {"data": ["15 Login Request", 5000, 0, 0.0, 4807.385400000001, 8, 12615, 4859.0, 8976.900000000001, 9642.849999999999, 10703.929999999998, 172.16445148405757, 87.76351921355278, 40.68730201088079], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 1995, 39.9, 4444.728199999995, 2, 35732, 4237.5, 8155.700000000002, 9603.849999999995, 14451.149999999981, 71.18957784580337, 31.370132412614794, 28.434118495052324], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 4441, 100.0, 8.882], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50000, 4441, "Assertion failed", 4441, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 143, "Assertion failed", 143, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 1995, "Assertion failed", 1995, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 308, "Assertion failed", 308, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 1995, "Assertion failed", 1995, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
