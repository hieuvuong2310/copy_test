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

    var data = {"OkPercent": 22.27, "KoPercent": 77.73};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.008243333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [3.0E-4, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.009433333333333334, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.03213333333333333, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.02033333333333333, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [8.0E-4, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.004833333333333334, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0036666666666666666, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [4.6666666666666666E-4, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.009833333333333333, 500, 1500, "15 Login Request"], "isController": false}, {"data": [6.333333333333333E-4, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 116595, 77.73, 10447.896513333426, 0, 77210, 6.0, 411.0, 1067.0, 2756.9900000000016, 842.1572700629933, 267.45310083184086, 245.471304763031], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14841, 98.94, 1465.106866666669, 0, 66773, 8.0, 777.8999999999996, 2030.949999999999, 50610.96, 100.35525761194629, 22.212055154413292, 29.184778961272908], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 10073, 67.15333333333334, 17030.81413333332, 0, 71851, 10603.0, 50155.0, 52720.95, 57771.99, 90.88870980446809, 34.805458633897246, 24.506525193971655], "isController": false}, {"data": ["14 Register Request", 15000, 3850, 25.666666666666668, 21519.002000000008, 21, 77210, 21145.5, 44966.6, 51367.59999999999, 60136.95, 113.59419609387425, 27.705868477326597, 30.841830021431438], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 13080, 87.2, 5604.378666666696, 0, 73212, 77.0, 25423.799999999992, 50057.0, 53201.65999999999, 89.11332244170502, 28.49791836848359, 36.80462600252488], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 13936, 92.90666666666667, 5722.477800000031, 0, 64392, 26.0, 25506.699999999997, 50117.95, 54072.99, 89.86340762041696, 25.57258669946681, 26.007716318071534], "isController": false}, {"data": ["17 Add Money Request", 15000, 11521, 76.80666666666667, 12579.249133333298, 0, 71829, 2220.0, 50006.9, 51887.19999999998, 57293.97, 88.11193740527968, 27.10306558869054, 27.483455607003137], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 12772, 85.14666666666666, 10405.936733333372, 0, 64465, 485.0, 50010.9, 51379.74999999999, 56802.799999999996, 88.4475682815227, 25.256260705841076, 24.59136071792891], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14705, 98.03333333333333, 2418.96233333334, 0, 64377, 10.0, 1589.3999999999978, 20628.949999999997, 51740.94, 94.27084642650645, 21.2238904124978, 27.23829062798524], "isController": false}, {"data": ["15 Login Request", 15000, 7379, 49.193333333333335, 24183.481733333378, 1, 73068, 22168.5, 50755.9, 53086.949999999975, 57770.97, 94.52987143937484, 63.78195675849193, 19.577247152287622], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 14438, 96.25333333333333, 3549.5557333333268, 0, 64505, 16.0, 4406.0, 32715.69999999997, 52893.17999999998, 92.30712426385068, 21.253444930723504, 27.177687320001105], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1180, 1.0120502594450878, 0.7866666666666666], "isController": false}, {"data": ["503/Service Unavailable", 98293, 84.30292894206441, 65.52866666666667], "isController": false}, {"data": ["504/Gateway Time-out", 10925, 9.370041596981002, 7.283333333333333], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 5593, 4.796946695827437, 3.728666666666667], "isController": false}, {"data": ["Assertion failed", 604, 0.5180325056820618, 0.4026666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 116595, "503/Service Unavailable", 98293, "504/Gateway Time-out", 10925, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 5593, "400/Bad Request", 1180, "Assertion failed", 604], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14841, "503/Service Unavailable", 14501, "504/Gateway Time-out", 245, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 92, "Assertion failed", 3, "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 10073, "503/Service Unavailable", 7426, "504/Gateway Time-out", 1582, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 803, "400/Bad Request", 262, "", ""], "isController": false}, {"data": ["14 Register Request", 15000, 3850, "503/Service Unavailable", 3323, "504/Gateway Time-out", 527, "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 13080, "503/Service Unavailable", 11807, "504/Gateway Time-out", 903, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 287, "400/Bad Request", 83, "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 13936, "503/Service Unavailable", 12478, "504/Gateway Time-out", 966, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 252, "Assertion failed", 224, "400/Bad Request", 16], "isController": false}, {"data": ["17 Add Money Request", 15000, 11521, "503/Service Unavailable", 8920, "504/Gateway Time-out", 1497, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 706, "400/Bad Request", 398, "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 12772, "503/Service Unavailable", 10244, "504/Gateway Time-out", 1548, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 546, "Assertion failed", 249, "400/Bad Request", 185], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14705, "503/Service Unavailable", 14185, "504/Gateway Time-out", 379, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 126, "Assertion failed", 15, "", ""], "isController": false}, {"data": ["15 Login Request", 15000, 7379, "504/Gateway Time-out", 2764, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 2679, "503/Service Unavailable", 1702, "400/Bad Request", 234, "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 14438, "503/Service Unavailable", 13707, "504/Gateway Time-out", 514, "Assertion failed", 113, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 102, "400/Bad Request", 2], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
