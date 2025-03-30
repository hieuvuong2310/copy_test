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

    var data = {"OkPercent": 20.28, "KoPercent": 79.72};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.015546666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0081, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.009666666666666667, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.055266666666666665, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.012366666666666666, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.005233333333333334, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0107, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0085, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0067666666666666665, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.03306666666666667, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0058, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 119580, 79.72, 15835.030906666578, 0, 84617, 345.0, 73287.10000000003, 80000.0, 80650.0, 470.6694488460754, 292.8909547137545, 124.43771547835705], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14774, 98.49333333333334, 5835.216133333337, 0, 83962, 61.0, 6890.5999999999985, 57593.74999999997, 81589.97, 50.317841029167575, 16.542815765418226, 14.73271005602053], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 12464, 83.09333333333333, 27995.204533333377, 0, 84298, 7679.5, 80269.0, 83670.0, 83899.0, 60.456080672594055, 60.42985942197941, 12.079774348938392], "isController": false}, {"data": ["14 Register Request", 15000, 5007, 33.38, 27029.02833333329, 5, 84280, 10750.5, 80351.9, 82312.9, 83883.99, 100.07672548954199, 86.40662268155586, 20.116750967408347], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 12837, 85.58, 6516.99293333332, 0, 84301, 149.5, 12381.599999999999, 78773.39999999988, 83497.59, 48.785406008410604, 20.41062917623403, 20.206029027519847], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 14396, 95.97333333333333, 15537.772266666689, 1, 84293, 530.5, 80102.0, 81435.0, 83681.99, 48.85372867941857, 30.32230713158589, 12.466975388305721], "isController": false}, {"data": ["17 Add Money Request", 15000, 11776, 78.50666666666666, 19109.625466666697, 0, 84296, 2593.0, 80070.0, 81970.69999999997, 83820.93, 48.878881390506415, 33.9132944142029, 12.811002065947388], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 12757, 85.04666666666667, 11375.710866666694, 0, 84617, 358.5, 79956.9, 80083.0, 83750.0, 48.728669025134245, 23.478624331808128, 13.03687001444805], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14737, 98.24666666666667, 6673.067133333346, 0, 84246, 49.0, 9208.299999999997, 79513.95, 81837.99, 49.38352894697855, 17.168183838417093, 14.230461869742712], "isController": false}, {"data": ["15 Login Request", 15000, 6218, 41.45333333333333, 28360.85899999997, 0, 84288, 11614.5, 80511.8, 83520.0, 83857.0, 64.70397929472662, 67.28446329397175, 11.792565613879004], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 14614, 97.42666666666666, 9916.832400000001, 0, 84270, 137.5, 60492.69999999996, 80002.0, 81771.98, 49.213082805933134, 21.107158001883217, 13.819200258696771], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 3154, 2.6375648101689246, 2.1026666666666665], "isController": false}, {"data": ["503/Service Unavailable", 86571, 72.3958855995986, 57.714], "isController": false}, {"data": ["502/Bad Gateway", 61, 0.05101187489546747, 0.04066666666666666], "isController": false}, {"data": ["504/Gateway Time-out", 1, 8.362602441879914E-4, 6.666666666666666E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 22627, 18.922060545241678, 15.084666666666667], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 422, 0.3529018230473323, 0.2813333333333333], "isController": false}, {"data": ["Assertion failed", 6744, 5.6397390868038135, 4.496], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 119580, "503/Service Unavailable", 86571, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 22627, "Assertion failed", 6744, "400/Bad Request", 3154, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 422], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 14774, "503/Service Unavailable", 12215, "Assertion failed", 1043, "400/Bad Request", 836, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 641, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 34], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 12464, "503/Service Unavailable", 5390, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4420, "Assertion failed", 2526, "400/Bad Request", 92, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 34], "isController": false}, {"data": ["14 Register Request", 15000, 5007, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3895, "503/Service Unavailable", 1112, "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 12837, "503/Service Unavailable", 11852, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 737, "400/Bad Request", 211, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 31, "502/Bad Gateway", 5], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 14396, "503/Service Unavailable", 10328, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2250, "Assertion failed", 1145, "400/Bad Request", 505, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 131], "isController": false}, {"data": ["17 Add Money Request", 15000, 11776, "503/Service Unavailable", 8726, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2942, "400/Bad Request", 86, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 19, "502/Bad Gateway", 3], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 12757, "503/Service Unavailable", 10909, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1616, "400/Bad Request", 126, "Assertion failed", 78, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 25], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 14737, "503/Service Unavailable", 12253, "Assertion failed", 955, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 778, "400/Bad Request", 715, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 35], "isController": false}, {"data": ["15 Login Request", 15000, 6218, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4157, "503/Service Unavailable", 2044, "400/Bad Request", 17, "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 14614, "503/Service Unavailable", 11742, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1191, "Assertion failed", 997, "400/Bad Request", 566, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:4000 failed to respond", 113], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
