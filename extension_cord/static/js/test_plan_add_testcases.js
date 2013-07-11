/*
*
*   Copyright (c) 2013, Rearden Commerce Inc. All Rights Reserved.
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*
*/
var plan = {
    onselectall_listener:function(selector) {
        $(selector).click(function(event) {
            if(this.checked) {
                // Iterate each checkbox
                $('td :checkbox').each(function() {
                    this.checked = true;
                });
            } else {
                $('td :checkbox').each(function() {
                    this.checked = false;
                });
            }
        });
    },
    initialize:function(){
        $("#addtests").live("click",function() {
            var data1=[];
            $("#id_table td input:checked").each(function(){
                data1.push(this.value);
            });
            var stringed =  "&add="+data1;
            var url = "/ajax_addtests/"+state.planid+"/";
            $.ajax({
                type: "GET",
                url: url,
                data: stringed,
                dataType: 'json',
                cache: false,
                success: function(data){
                    common.fireAlert(data["message"], data["alertType"]);
                    plan.stateChangeCallback();
                    plan.fetchPlanCaseCount();
                }
            });
        });
        $('[rel=tooltip]').tooltip();
    },
    updatePlanCaseCount: function(data){
        $("#totaltests").text(data["testplan_testcase_count"]);
        $("#foldertests").text(data["folder_testcase_count"]);
    },
    fetchPlanCaseCount:function(){
        paramMap = {
            key: foldertree.getActiveKey()||-100,
            testplan_id: state.planid
        };
        $.ajax({
            type: "GET",
            url: "/ajax_plan_details/",
            data: paramMap,
            dataType: 'json',
            cache: false,
            success:plan.updatePlanCaseCount
        });
    },
    stateChangeCallback:function () {
        $("#select-all").attr("checked", false);

        var State = History.getState();
        testcase.deserialize();

        $("#root").dynatree("getTree").activateKey(state.key);
        $.ajax({
            type: "GET",
            url: "/ajax_tests/",
            data: testcase.serialize(),
            dataType: 'json',
            cache: false,
            success: plan.renderTestsTable
        });
        plan.fetchPlanCaseCount();
    },

    // refresh Icons at load page
    renderTestsTable:function (data){
        var noOfTests = JSON.parse(data['tests']).length;
        $("#id_table").empty();
        if (noOfTests != 0) {
            var firstheader = '<th><input class="checkbox" id="select-all" type="checkbox"></th>'
            var secondheader = '<th> ID </th>';
            var thirdheader = '<th> Name </th>';
            var fourthheader = '<th> # of Steps </th>';
            var fifthheader = '<th> Priority </th>';
            $("#id_table").append("<thead></thead>");
            $("#id_table").append("<tbody></tbody>");
            $("#id_table thead").append('<tr></tr>');
            $("#id_table thead tr").append(firstheader);
            $("#id_table thead tr").append(secondheader);
            $("#id_table thead tr").append(thirdheader);
            $("#id_table thead tr").append(fourthheader);
            $("#id_table thead tr").append(fifthheader);
            common.makeRowsWithData(data['tests']);
            common.updatePaginate(data);
            $("#select-all").attr("checked", false);
            plan.onselectall_listener('#select-all');
        }
        else {
            $("#id_table").append("<p>Either all tests have already been added or this folder is empty</p>");
            $("#prevpage").addClass("disabled");
            $("#nextpage").addClass("disabled");
            $("#currpage a").empty();
            $("#currpage a").append("0");
        }
    }
};

$(function(){
    plan.initialize();
    testcase.initialize();
    foldertree.initialize(testcase.onFolderChange);
    window.History.Adapter.bind(window,'statechange',plan.stateChangeCallback);
    plan.stateChangeCallback();
});

