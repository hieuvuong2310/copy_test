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

    var data = {"OkPercent": 65.26, "KoPercent": 34.74};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.49585, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1135, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.571, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.9815, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.9405, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0555, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.5455, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.591, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.1125, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.9785, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.069, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10000, 3474, 34.74, 704.9589999999996, 3, 5318, 296.0, 2080.0, 2711.949999999999, 4298.98, 402.67375372473225, 153.25059174166466, 156.76038111812434], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 848, 84.8, 686.0059999999995, 3, 5193, 272.5, 2083.9, 2700.85, 4141.010000000001, 51.419169066227894, 15.40968222953517, 20.583786330856643], "isController": false}, {"data": ["16 Get Stock Prices Request", 1000, 0, 0.0, 1082.4810000000023, 3, 5300, 678.5, 2715.6, 3560.7499999999995, 4912.96, 52.46589716684155, 23.312483604407138, 20.849097012722982], "isController": false}, {"data": ["14 Register Request", 1000, 0, 0.0, 135.10399999999998, 4, 845, 81.0, 343.0, 449.94999999999993, 698.7500000000002, 66.76904587033451, 17.14869049208787, 18.370029357514856], "isController": false}, {"data": ["19 Place Stock Order Request", 1000, 0, 0.0, 231.62300000000022, 7, 1637, 142.0, 546.9, 755.8499999999998, 1318.4500000000005, 50.279048720398215, 40.602344967695714, 26.65776504914777], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 889, 88.9, 929.7890000000001, 6, 4856, 609.5, 2226.7, 2798.8999999999996, 4262.89, 50.24873121953671, 18.33720471019044, 20.262457367092107], "isController": false}, {"data": ["17 Add Money Request", 1000, 0, 0.0, 1108.2269999999996, 6, 5093, 719.5, 2616.2, 3577.549999999998, 4405.96, 49.99000199960008, 13.180957558488302, 21.769132501624675], "isController": false}, {"data": ["18 Get Wallet Balance Request", 1000, 0, 0.0, 1015.7270000000007, 5, 5205, 604.0, 2530.3999999999996, 3331.7, 4337.76, 50.32206119162641, 14.005651796497585, 20.09545662552838], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 848, 84.8, 816.4729999999994, 3, 5318, 451.5, 2199.2, 2881.0499999999975, 4461.31, 50.7330931966922, 14.112519659073614, 20.259596878012278], "isController": false}, {"data": ["15 Login Request", 1000, 0, 0.0, 138.2990000000001, 4, 790, 84.0, 348.9, 475.94999999999993, 675.8400000000001, 67.10508656556168, 33.007904245235544, 16.666177358743795], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 889, 88.9, 905.8610000000008, 3, 5086, 560.5, 2260.6, 2833.85, 4336.620000000001, 50.57401507105649, 16.20640361857078, 20.44301454319021], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 3474, 100.0, 34.74], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10000, 3474, "Assertion failed", 3474, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 848, "Assertion failed", 848, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 889, "Assertion failed", 889, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 848, "Assertion failed", 848, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 889, "Assertion failed", 889, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
