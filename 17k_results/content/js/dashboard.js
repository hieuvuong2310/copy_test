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

    var data = {"OkPercent": 32.64941176470588, "KoPercent": 67.35058823529411};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.02123235294117647, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.057529411764705884, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.0, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.05647058823529412, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.046911764705882354, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.05141176470588235, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170000, 114496, 67.35058823529411, 22041.347258823364, 1, 107844, 14411.5, 68861.60000000003, 80000.0, 80001.0, 358.3859141686817, 155.03960551395176, 121.44158074078896], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 17000, 100.0, 17810.220588235257, 1, 80302, 14547.5, 39026.0, 52844.649999999994, 80000.0, 37.87726873699362, 15.933749349680717, 12.959659194400626], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 17000, 100.0, 15781.241058823403, 7, 92224, 8565.0, 43257.2, 57679.249999999985, 67971.50000000009, 56.2193480539838, 16.489672820962873, 20.20889208200088], "isController": false}, {"data": ["14 Register Request", 17000, 3137, 18.45294117647059, 43739.73117647063, 6, 107844, 36208.5, 103085.0, 105491.95, 106738.94, 106.24203184761143, 74.20460921485576, 23.519744808201885], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 17000, 100.0, 20152.0796470588, 4, 80300, 15341.0, 45189.09999999999, 55796.74999999999, 80001.0, 37.532565019649404, 16.752238241406147, 16.41080358325606], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 17000, 100.0, 25675.656470588277, 6, 80017, 21631.0, 52605.7, 56844.85, 80000.0, 36.72221802196852, 15.15859745428624, 12.876189674981369], "isController": false}, {"data": ["17 Add Money Request", 17000, 3078, 18.105882352941176, 15409.042941176473, 4, 80005, 11260.0, 35575.9, 46340.54999999997, 65116.14000000014, 43.6008114880444, 13.597271727310266, 17.21756171758985], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 3272, 19.24705882352941, 19438.905176470627, 3, 94343, 15211.5, 41377.0, 54806.799999999996, 70920.69000000005, 38.26768923935089, 12.897910545477773, 13.632182824166723], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 17000, 100.0, 20805.73505882351, 1, 80302, 16082.5, 43656.79999999999, 55459.7, 80000.0, 36.99520585655871, 15.769816424212056, 12.54352759692744], "isController": false}, {"data": ["15 Login Request", 17000, 3009, 17.7, 16931.847058823492, 14, 71956, 10382.5, 38134.49999999999, 48252.14999999996, 61659.81000000003, 74.62293470054256, 35.996383874093546, 18.813565811667075], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 17000, 100.0, 24669.013411764765, 3, 91506, 17859.0, 53029.9, 72876.04999999996, 80001.0, 36.79374939127988, 18.284654605441144, 12.340690758681701], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 39394, 34.40644214645053, 23.172941176470587], "isController": false}, {"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 136, 0.11878144214645053, 0.08], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5430, 4.7425237562884295, 3.1941176470588237], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 2893, 2.5267258244829516, 1.7017647058823528], "isController": false}, {"data": ["Assertion failed", 66643, 58.20552683063164, 39.201764705882354], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170000, 114496, "Assertion failed", 66643, "400/Bad Request", 39394, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5430, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 2893, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 136], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 17000, "Assertion failed", 13183, "400/Bad Request", 2892, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 586, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 339, "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 17000, "Assertion failed", 13988, "400/Bad Request", 3008, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1, "", ""], "isController": false}, {"data": ["14 Register Request", 17000, 3137, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2854, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 155, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 128, "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 17000, "400/Bad Request", 16247, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 510, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 243, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 17000, "Assertion failed", 13465, "400/Bad Request", 2801, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 424, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 310, "", ""], "isController": false}, {"data": ["17 Add Money Request", 17000, 3078, "400/Bad Request", 2933, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 79, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 66, "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 3272, "400/Bad Request", 2950, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 137, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 115, "Assertion failed", 66, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 4], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 17000, "Assertion failed", 13114, "400/Bad Request", 2841, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 629, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 416, "", ""], "isController": false}, {"data": ["15 Login Request", 17000, 3009, "400/Bad Request", 3009, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 17000, "Assertion failed", 12827, "400/Bad Request", 2713, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 785, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 674, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
