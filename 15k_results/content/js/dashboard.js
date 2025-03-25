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

    var data = {"OkPercent": 22.686666666666667, "KoPercent": 77.31333333333333};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.013993333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0019, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.021466666666666665, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.0385, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.041633333333333335, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [1.3333333333333334E-4, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.012533333333333334, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0071, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0010333333333333334, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.015133333333333334, 500, 1500, "15 Login Request"], "isController": false}, {"data": [5.0E-4, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 115970, 77.31333333333333, 10791.308486666507, 0, 62986, 3319.0, 33052.9, 50018.0, 50837.990000000005, 603.6241594533581, 208.91552018946757, 181.09048995795757], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14915, 99.43333333333334, 6918.171799999998, 0, 61453, 107.0, 23724.899999999987, 42735.99999999998, 50567.89, 64.68751617187904, 22.8533750981094, 18.599568675771078], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 9599, 63.99333333333333, 16630.58140000004, 0, 60567, 9924.5, 50489.0, 51555.95, 53749.829999999994, 79.50768839346766, 28.048707817858485, 23.18579294508404], "isController": false}, {"data": ["14 Register Request", 15000, 3476, 23.173333333333332, 19275.548733333297, 23, 62986, 11838.5, 51537.8, 54101.899999999994, 59632.95, 106.1150570191573, 25.69392338758171, 28.811177541101898], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 12383, 82.55333333333333, 3944.4200666666443, 0, 60035, 125.0, 20072.0, 22045.299999999985, 50229.96, 62.88148098464015, 24.97758045947498, 26.309189977792357], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 14860, 99.06666666666666, 7370.4591333333055, 0, 60054, 118.0, 24394.599999999995, 50010.0, 51663.869999999995, 63.082726687778354, 19.70093678506243, 18.758708373285728], "isController": false}, {"data": ["17 Add Money Request", 15000, 11556, 77.04, 12410.649466666646, 0, 60042, 1657.0, 50083.0, 51226.85, 53797.689999999995, 63.16294777266392, 17.15251529332873, 20.973343163505714], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 12850, 85.66666666666667, 9350.142133333307, 0, 61049, 386.5, 29690.399999999987, 50489.0, 53506.99, 63.22284789425768, 17.90853023738072, 18.668871420796524], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14909, 99.39333333333333, 7319.917600000006, 0, 61400, 118.0, 24549.1, 50002.0, 51422.96, 64.16563288702571, 22.597460745337298, 18.377793377304616], "isController": false}, {"data": ["15 Login Request", 15000, 6504, 43.36, 17314.360466666807, 0, 57803, 12080.0, 50382.9, 51378.95, 53383.95, 85.10348583877996, 47.390335958421275, 19.207596346010916], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 14918, 99.45333333333333, 7378.834066666648, 0, 61620, 125.0, 24478.699999999997, 50004.0, 51700.94, 64.01420261775414, 21.72956273231821, 18.832428288089517], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 12825, 11.058894541691817, 8.55], "isController": false}, {"data": ["503/Service Unavailable", 72002, 62.08674657238941, 48.001333333333335], "isController": false}, {"data": ["504/Gateway Time-out", 14476, 12.48253858756575, 9.650666666666666], "isController": false}, {"data": ["502/Bad Gateway", 1730, 1.4917651116668105, 1.1533333333333333], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 6918, 5.965335862723118, 4.612], "isController": false}, {"data": ["Assertion failed", 8019, 6.9147193239630935, 5.346], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 115970, "503/Service Unavailable", 72002, "504/Gateway Time-out", 14476, "400/Bad Request", 12825, "Assertion failed", 8019, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 6918], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14915, "503/Service Unavailable", 7929, "400/Bad Request", 2951, "Assertion failed", 2138, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 927, "504/Gateway Time-out", 611], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 9599, "503/Service Unavailable", 5799, "504/Gateway Time-out", 2723, "400/Bad Request", 558, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 486, "502/Bad Gateway", 33], "isController": false}, {"data": ["14 Register Request", 15000, 3476, "504/Gateway Time-out", 2922, "503/Service Unavailable", 554, "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 12383, "503/Service Unavailable", 10055, "400/Bad Request", 1482, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 616, "504/Gateway Time-out", 230, "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 14860, "503/Service Unavailable", 9510, "Assertion failed", 2008, "400/Bad Request", 1532, "504/Gateway Time-out", 877, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 614], "isController": false}, {"data": ["17 Add Money Request", 15000, 11556, "503/Service Unavailable", 8295, "504/Gateway Time-out", 1828, "400/Bad Request", 958, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 378, "502/Bad Gateway", 97], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 12850, "503/Service Unavailable", 9562, "504/Gateway Time-out", 1264, "400/Bad Request", 981, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 472, "Assertion failed", 373], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14909, "503/Service Unavailable", 8593, "400/Bad Request", 2474, "Assertion failed", 1737, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 979, "504/Gateway Time-out", 766], "isController": false}, {"data": ["15 Login Request", 15000, 6504, "503/Service Unavailable", 2466, "504/Gateway Time-out", 2452, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 1573, "400/Bad Request", 13, "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 14918, "503/Service Unavailable", 9239, "400/Bad Request", 1876, "Assertion failed", 1763, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:5000 failed to respond", 873, "504/Gateway Time-out", 803], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
