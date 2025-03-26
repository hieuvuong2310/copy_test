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

    var data = {"OkPercent": 20.946, "KoPercent": 79.054};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.020586666666666666, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [3.0E-4, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.019766666666666665, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.089, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.0298, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [4.6666666666666666E-4, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0098, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.004666666666666667, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [2.3333333333333333E-4, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.05146666666666667, 500, 1500, "15 Login Request"], "isController": false}, {"data": [3.6666666666666667E-4, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 118581, 79.054, 7095.480413333512, 0, 58314, 80.0, 2237.9000000000015, 45930.0, 47013.990000000005, 759.7398650701999, 230.90373569631424, 229.2730500326688], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14988, 99.92, 2028.0563999999927, 0, 57568, 24.0, 1454.699999999999, 3047.899999999998, 47023.95, 84.21761832575375, 19.19207121827803, 25.43829348787266], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 9748, 64.98666666666666, 14178.522066666683, 0, 55821, 6376.5, 50171.0, 50816.0, 52367.0, 107.56466429068274, 40.50471385334275, 30.303108820481746], "isController": false}, {"data": ["14 Register Request", 15000, 4301, 28.673333333333332, 15406.995866666675, 14, 58314, 8368.5, 50364.7, 51654.85, 54938.799999999996, 116.87522401084601, 28.10809570327718, 31.732658151657287], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 13301, 88.67333333333333, 1998.9919333333469, 0, 55847, 47.0, 3217.399999999987, 20024.949999999997, 49973.739999999365, 79.49968200127199, 23.55781572967458, 34.00999501470744], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 14871, 99.14, 3793.2639333333286, 0, 54551, 31.0, 11725.599999999999, 45977.19999999998, 51027.95, 79.86625065224105, 18.82814621447283, 24.19591740365468], "isController": false}, {"data": ["17 Add Money Request", 15000, 11731, 78.20666666666666, 9503.578533333335, 0, 55806, 344.0, 28311.49999999984, 50408.95, 52215.93, 80.10039249192322, 22.64479814701092, 25.873381095973624], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 13011, 86.74, 6486.936466666684, 0, 57756, 93.0, 21367.0, 50092.95, 51966.97, 79.04263559764136, 19.965315515147203, 23.274917120503133], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14972, 99.81333333333333, 2104.3169333333344, 0, 57688, 24.0, 1308.3999999999978, 16229.799999999996, 50050.0, 82.2882722754353, 18.787826890161615, 24.694089061968555], "isController": false}, {"data": ["15 Login Request", 15000, 6714, 44.76, 12817.556133333293, 0, 54260, 6601.5, 50013.0, 50508.74999999999, 51894.979999999996, 111.82596897202114, 74.91517243098474, 23.43041623256447], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 14944, 99.62666666666667, 2636.585866666673, 0, 55881, 27.0, 1689.8999999999996, 20339.899999999998, 50695.96, 80.97515682188705, 18.518422649493637, 24.66942946591486], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 4245, 3.579831507577099, 2.83], "isController": false}, {"data": ["503/Service Unavailable", 96153, 81.08634604194602, 64.102], "isController": false}, {"data": ["504/Gateway Time-out", 10004, 8.436427420919035, 6.669333333333333], "isController": false}, {"data": ["502/Bad Gateway", 1067, 0.8998068830588374, 0.7113333333333334], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 4517, 3.809210581796409, 3.0113333333333334], "isController": false}, {"data": ["Assertion failed", 2595, 2.1883775647026082, 1.73], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 118581, "503/Service Unavailable", 96153, "504/Gateway Time-out", 10004, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 4517, "400/Bad Request", 4245, "Assertion failed", 2595], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14988, "503/Service Unavailable", 12433, "400/Bad Request", 1437, "Assertion failed", 622, "502/Bad Gateway", 386, "504/Gateway Time-out", 74], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 9748, "503/Service Unavailable", 6615, "504/Gateway Time-out", 2383, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 729, "400/Bad Request", 16, "502/Bad Gateway", 5], "isController": false}, {"data": ["14 Register Request", 15000, 4301, "503/Service Unavailable", 2184, "504/Gateway Time-out", 2117, "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 13301, "503/Service Unavailable", 12661, "400/Bad Request", 346, "504/Gateway Time-out", 150, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 144, "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 14871, "503/Service Unavailable", 12732, "Assertion failed", 862, "504/Gateway Time-out", 648, "400/Bad Request", 409, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 111], "isController": false}, {"data": ["17 Add Money Request", 15000, 11731, "503/Service Unavailable", 9603, "504/Gateway Time-out", 1486, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 521, "400/Bad Request", 104, "502/Bad Gateway", 17], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 13011, "503/Service Unavailable", 11529, "504/Gateway Time-out", 976, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 284, "400/Bad Request", 165, "502/Bad Gateway", 45], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14972, "503/Service Unavailable", 12844, "400/Bad Request", 1063, "Assertion failed", 513, "502/Bad Gateway", 297, "504/Gateway Time-out", 182], "isController": false}, {"data": ["15 Login Request", 15000, 6714, "503/Service Unavailable", 2545, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 2535, "504/Gateway Time-out", 1634, "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 14944, "503/Service Unavailable", 13007, "400/Bad Request", 705, "Assertion failed", 586, "504/Gateway Time-out", 354, "502/Bad Gateway", 208], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
