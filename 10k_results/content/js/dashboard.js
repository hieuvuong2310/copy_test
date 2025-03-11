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

    var data = {"OkPercent": 91.886, "KoPercent": 8.114};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.113905, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1141, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.03685, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.11725, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.54715, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0354, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.01665, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.01875, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0858, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.1071, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.06, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 8114, 8.114, 7454.74044999991, 2, 73703, 3117.5, 13738.500000000051, 60075.75, 64760.98, 844.7729672650474, 378.1723369852165, 323.5298145459345], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 738, 7.38, 5433.143600000028, 2, 69816, 4479.0, 9796.599999999999, 12208.0, 25982.359999999986, 98.22410812509823, 36.56574676719904, 38.848402139321074], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 0, 0.0, 12288.28009999999, 15, 72317, 8810.0, 20603.79999999997, 43019.95, 64263.12999999998, 91.9777046044039, 43.02472705616159, 36.10843481540075], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 5838.9931000000215, 10, 29771, 4997.0, 12528.099999999997, 15703.599999999991, 19287.949999999997, 180.2321389950256, 50.51428114411362, 47.293159683422246], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 1464.8436000000006, 4, 8640, 672.5, 4045.0, 5239.899999999998, 6745.99, 90.13556388808769, 74.46746782160369, 47.35638024588982], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 3196, 31.96, 8442.07219999997, 2, 69298, 7306.5, 13165.8, 16651.249999999985, 58156.08999999996, 90.66840750009067, 62.491854010263665, 36.125693613317374], "isController": false}, {"data": ["17 Add Money Request", 10000, 15, 0.15, 10951.45939999999, 12, 73703, 7902.0, 17166.5, 37470.49999999977, 63522.73999999999, 90.17539113575906, 25.89482343940214, 38.83530028405249], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 10, 0.1, 9869.563999999993, 3, 68361, 7659.5, 15355.999999999996, 25165.249999999964, 62686.88, 89.6571510543681, 27.05439555390188, 35.37254787691866], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 959, 9.59, 6615.635099999987, 2, 71687, 5579.0, 11414.699999999999, 14490.649999999992, 32471.819999999996, 94.10436173716651, 28.31342009069308, 37.127111466616476], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 6041.253700000033, 8, 23702, 5391.5, 12363.9, 15393.0, 18259.57999999999, 181.3433918468011, 92.44262748440447, 42.85654377629479], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 3196, 31.96, 7602.159700000001, 2, 69170, 6803.5, 12395.299999999997, 15868.399999999987, 37708.96999999998, 91.56251430664287, 40.4101857574509, 36.571355811930594], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 15, 0.18486566428395365, 0.015], "isController": false}, {"data": ["Assertion failed", 8099, 99.81513433571605, 8.099], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 8114, "Assertion failed", 8099, "504/Gateway Time-out", 15, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 738, "Assertion failed", 738, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 3196, "Assertion failed", 3196, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 15, "504/Gateway Time-out", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 10, "Assertion failed", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 959, "Assertion failed", 959, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 3196, "Assertion failed", 3196, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
