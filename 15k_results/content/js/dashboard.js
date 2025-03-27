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

    var data = {"OkPercent": 32.118, "KoPercent": 67.882};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.028226666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0E-4, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.026466666666666666, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.07176666666666667, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.10063333333333334, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.004, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0128, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.006533333333333334, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [3.333333333333333E-4, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.0584, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0012333333333333332, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 101823, 67.882, 9738.958899999983, 0, 67299, 3.0, 155.0, 2652.0, 51303.0, 895.5651613211377, 277.3367883801913, 311.8621197206434], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14654, 97.69333333333333, 1809.5093333333173, 0, 63467, 6.0, 320.89999999999964, 10109.249999999984, 51243.73999999999, 103.25174151270684, 23.072912454139015, 36.63262890549712], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 7223, 48.153333333333336, 22291.624933333325, 0, 64356, 14891.0, 51178.9, 52472.0, 55076.88, 95.25926396342044, 39.45569873662401, 32.614911448575874], "isController": false}, {"data": ["14 Register Request", 15000, 1441, 9.606666666666667, 12842.719733333344, 14, 67299, 8237.5, 38288.89999999998, 50263.0, 58553.729999999996, 99.9486930042578, 25.111061478024613, 27.13695511304197], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 11798, 78.65333333333334, 3109.233466666641, 0, 64334, 21.0, 10060.399999999994, 21323.85, 50290.89, 96.49094593290664, 34.779552111141484, 46.3549225961693], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 13244, 88.29333333333334, 5647.312933333366, 1, 64461, 7.0, 20065.8, 50093.0, 53267.88, 96.54311293613353, 29.77148245168017, 34.22315704225692], "isController": false}, {"data": ["17 Add Money Request", 15000, 10029, 66.86, 18724.51420000003, 0, 65805, 13301.0, 51549.9, 53711.7, 59661.97, 95.32161512944676, 26.75494043987748, 36.235562498808484], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 12048, 80.32, 12354.42853333337, 0, 67292, 451.5, 50630.6, 52540.799999999996, 57773.66999999999, 95.84297087651592, 25.275164171022197, 33.3432454266929], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14395, 95.96666666666667, 2824.2396666666828, 0, 64718, 8.0, 2716.8999999999996, 20432.949999999997, 53800.95, 98.46266951989602, 22.250447902581033, 34.76963017421328], "isController": false}, {"data": ["15 Login Request", 15000, 3008, 20.053333333333335, 13468.412599999969, 0, 58868, 7848.0, 50003.0, 50193.0, 52169.99, 95.25623928367308, 50.75195994673589, 22.74916824434813], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 13983, 93.22, 4317.593599999995, 0, 65288, 10.0, 16371.999999999985, 37082.0999999997, 55518.319999999985, 97.75043661861689, 23.059156171392356, 35.06720546164273], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 917, 0.9005823831550829, 0.6113333333333333], "isController": false}, {"data": ["503/Service Unavailable", 80804, 79.35731612700471, 53.86933333333333], "isController": false}, {"data": ["502/Bad Gateway", 1996, 1.9602643803462871, 1.3306666666666667], "isController": false}, {"data": ["504/Gateway Time-out", 14845, 14.579220804729776, 9.896666666666667], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 2984, 2.9305756066900406, 1.9893333333333334], "isController": false}, {"data": ["Assertion failed", 277, 0.27204069807410897, 0.18466666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 101823, "503/Service Unavailable", 80804, "504/Gateway Time-out", 14845, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 2984, "502/Bad Gateway", 1996, "400/Bad Request", 917], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14654, "503/Service Unavailable", 14217, "504/Gateway Time-out", 307, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 94, "502/Bad Gateway", 36, "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 7223, "504/Gateway Time-out", 3974, "503/Service Unavailable", 1743, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 692, "502/Bad Gateway", 448, "400/Bad Request", 366], "isController": false}, {"data": ["14 Register Request", 15000, 1441, "504/Gateway Time-out", 1284, "502/Bad Gateway", 119, "503/Service Unavailable", 38, "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 11798, "503/Service Unavailable", 11289, "504/Gateway Time-out", 288, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 196, "400/Bad Request", 25, "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 13244, "503/Service Unavailable", 11823, "504/Gateway Time-out", 1078, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 216, "502/Bad Gateway", 89, "Assertion failed", 34], "isController": false}, {"data": ["17 Add Money Request", 15000, 10029, "503/Service Unavailable", 5796, "504/Gateway Time-out", 3024, "502/Bad Gateway", 655, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 442, "400/Bad Request", 112], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 12048, "503/Service Unavailable", 8944, "504/Gateway Time-out", 2174, "502/Bad Gateway", 367, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 339, "Assertion failed", 194], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14395, "503/Service Unavailable", 13715, "504/Gateway Time-out", 488, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 120, "502/Bad Gateway", 72, "", ""], "isController": false}, {"data": ["15 Login Request", 15000, 3008, "504/Gateway Time-out", 1514, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 792, "400/Bad Request", 379, "503/Service Unavailable", 202, "502/Bad Gateway", 121], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 13983, "503/Service Unavailable", 13037, "504/Gateway Time-out", 714, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 93, "502/Bad Gateway", 89, "Assertion failed", 49], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
