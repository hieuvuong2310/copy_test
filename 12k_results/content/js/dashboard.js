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

    var data = {"OkPercent": 38.94083333333333, "KoPercent": 61.05916666666667};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.05352916666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.015125, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.033, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.062625, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.22816666666666666, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.023375, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.038375, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.02925, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.015291666666666667, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.075125, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.014958333333333334, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 120000, 73271, 61.05916666666667, 9689.895950000022, 0, 54468, 2.0, 50162.0, 50850.0, 52532.990000000005, 756.3199989915734, 271.16467469573877, 256.01343334614876], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 12000, 11028, 91.9, 2987.027333333336, 0, 53823, 2.0, 5087.699999999999, 20433.85, 50538.93, 83.38023471536073, 18.91031560070248, 29.317842197694535], "isController": false}, {"data": ["16 Get Stock Prices Request", 12000, 5002, 41.68333333333333, 16674.74974999997, 0, 54468, 9883.5, 50160.9, 50557.95, 51592.86, 80.58883575995273, 39.612691944138504, 26.231961164995568], "isController": false}, {"data": ["14 Register Request", 12000, 1273, 10.608333333333333, 13905.654249999941, 5, 54410, 8846.5, 50013.0, 50265.85, 51595.88, 105.2927137442089, 26.312604607214304, 28.58620059468447], "isController": false}, {"data": ["19 Place Stock Order Request", 12000, 7750, 64.58333333333333, 3827.3165833333364, 0, 54341, 14.0, 20010.0, 20968.49999999999, 51205.0, 81.06191103455264, 38.83793713268822, 37.80197013164117], "isController": false}, {"data": ["20 Get Stock Transactions Request", 12000, 9536, 79.46666666666667, 9366.673166666666, 1, 54280, 5.0, 50059.0, 50452.95, 51730.95, 81.11670666170953, 31.304124013502552, 28.041467219555887], "isController": false}, {"data": ["17 Add Money Request", 12000, 6671, 55.59166666666667, 15505.88975000003, 0, 54318, 8139.0, 50160.9, 50626.95, 51791.94, 80.69451075590584, 29.54763345485142, 28.826577304500734], "isController": false}, {"data": ["18 Get Wallet Balance Request", 12000, 8366, 69.71666666666667, 11867.149416666647, 0, 54312, 3348.0, 50076.9, 50465.95, 51539.99, 80.83802081579036, 26.638489581579037, 26.76627917747314], "isController": false}, {"data": ["22 Get Wallet Balance Request", 12000, 10659, 88.825, 4149.842916666652, 0, 54310, 2.0, 11656.8, 50011.95, 50795.94, 82.0574538939681, 18.438372661789945, 28.733030507850163], "isController": false}, {"data": ["15 Login Request", 12000, 2645, 22.041666666666668, 13175.783999999992, 0, 52910, 8259.0, 43005.19999999999, 50162.799999999996, 51119.89, 80.52934623592414, 46.05556409548767, 18.72174919386769], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 12000, 10341, 86.175, 5438.872333333297, 0, 54309, 3.0, 20020.0, 50066.0, 51038.759999999995, 81.86153121994147, 21.263066400787235, 28.927105770641045], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 2169, 2.960243479685005, 1.8075], "isController": false}, {"data": ["503/Service Unavailable", 52040, 71.02400676939034, 43.36666666666667], "isController": false}, {"data": ["502/Bad Gateway", 1199, 1.6363909322924486, 0.9991666666666666], "isController": false}, {"data": ["504/Gateway Time-out", 12628, 17.23464945203423, 10.523333333333333], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 4257, 5.809938447680528, 3.5475], "isController": false}, {"data": ["Assertion failed", 978, 1.3347709189174435, 0.815], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 120000, 73271, "503/Service Unavailable", 52040, "504/Gateway Time-out", 12628, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 4257, "400/Bad Request", 2169, "502/Bad Gateway", 1199], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 12000, 11028, "503/Service Unavailable", 10359, "504/Gateway Time-out", 498, "502/Bad Gateway", 100, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 40, "Assertion failed", 22], "isController": false}, {"data": ["16 Get Stock Prices Request", 12000, 5002, "504/Gateway Time-out", 2100, "503/Service Unavailable", 1131, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 942, "400/Bad Request", 694, "502/Bad Gateway", 135], "isController": false}, {"data": ["14 Register Request", 12000, 1273, "504/Gateway Time-out", 1259, "502/Bad Gateway", 14, "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 12000, 7750, "503/Service Unavailable", 6547, "504/Gateway Time-out", 556, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 374, "400/Bad Request", 273, "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 12000, 9536, "503/Service Unavailable", 7129, "504/Gateway Time-out", 1672, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 309, "502/Bad Gateway", 147, "Assertion failed", 144], "isController": false}, {"data": ["17 Add Money Request", 12000, 6671, "503/Service Unavailable", 3037, "504/Gateway Time-out", 2061, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 868, "400/Bad Request", 406, "502/Bad Gateway", 299], "isController": false}, {"data": ["18 Get Wallet Balance Request", 12000, 8366, "503/Service Unavailable", 4882, "504/Gateway Time-out", 1754, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 632, "Assertion failed", 538, "502/Bad Gateway", 289], "isController": false}, {"data": ["22 Get Wallet Balance Request", 12000, 10659, "503/Service Unavailable", 9785, "504/Gateway Time-out", 667, "502/Bad Gateway", 95, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 54, "Assertion failed", 36], "isController": false}, {"data": ["15 Login Request", 12000, 2645, "504/Gateway Time-out", 1183, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 934, "400/Bad Request", 298, "503/Service Unavailable", 224, "502/Bad Gateway", 6], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 12000, 10341, "503/Service Unavailable", 8946, "504/Gateway Time-out", 878, "Assertion failed", 238, "502/Bad Gateway", 114, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 104], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
