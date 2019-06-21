///////////////////////////
// Backend communication //
///////////////////////////

// Escape a string to html
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// A function to display beautiful json

function jsonSyntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else if (/"(?:(?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z))|(?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:[+-][0-2]\d:[0-5]\d|Z))|(?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d(?:[+-][0-2]\d:[0-5]\d|Z)))"/.test(match)) {
                cls = 'date';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// We clean useless lines at start of the Logstash stdout

function cleanLogstashStdout(stdout) {
    stdout_splitted = stdout.split("\n")
    stdout_cleaned = []
    for (var i = 0; i < stdout_splitted.length; i++) {
        line = stdout_splitted[i]
        if (!/^Sending Logstash.*logs.*configured.*log4j2\.properties$/.test(line)
            && !/^\[\d+.*WARN.*logstash\.config\.source.*Ignoring.*pipelines.yml.*$/.test(line)
            && !/^\[\d+.*WARN.*logstash\.agent.*stopping pipeline.*$/.test(line)) {
            stdout_cleaned.push(line)
        }
    }
    return stdout_cleaned
}

// We check if logstash met a problems during the process

function logstashParsingProblem() {
    for (var i = 0; i < logstash_output.length; i++) {
        line = logstash_output[i]
        if (line.startsWith("[ERROR]")) {
            return { isProblem: true, cause: "logstash", filter: "[ERROR]" }
        }
        if (/^\[\d+.*\[ERROR\s*\].*$/.test(line)) {
            return { isProblem: true, cause: "logstash", filter: "[ERROR" }
        }
        if (line.startsWith("{")) {
            values = JSON.parse(line)
            if ("tags" in values) {
                for (j in values.tags) {
                    tag = values.tags[j]
                    if (tag.indexOf("failure") != -1) {
                        return { isProblem: true, cause: "failure", filter: "failure" }
                    }
                }
            }
        }
    }

    return { isProblem: false }
}

// Guess a value type

function guessStringType(str) {

    if (/^[0-9]+$/.test(str)) {
        return "integer"
    }

    if (/^[0-9]+\.[0-9]+$/.test(str)) {
        return "float"
    }

    if (str == "true" || str == "false") {
        return "boolean"
    }

    return "string"
}

// Find a value type

function getValueType(value) {
    if (Number(value) === value) {
        if (value % 1 === 0) {
            return "integer"
        } else {
            return "float"
        }
    }

    if (Array.isArray(value)) {
        return "array"
    }
    if (typeof value == "boolean") {
        return "boolean"
    }

    if (typeof value == "string") {
        if (/^(?:(?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z))|(?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:[+-][0-2]\d:[0-5]\d|Z))|(?:\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d(?:[+-][0-2]\d:[0-5]\d|Z)))$/.test(value)) {
            return "date"
        }

        return "string"
    }

    return "object"
}

// Try do find some advices / problem in current parsing

function findParsingOptimizationAdvices() {

    var keys = {}

    var fieldsToSkip = ["@timestamp", "@version", "host", "message"]

    for (var i = 0; i < logstash_output.length; i++) {
        line = logstash_output[i]
        if (line.startsWith("{")) {
            obj = JSON.parse(line)
            for (var key in obj) {
                if (!fieldsToSkip.includes(key)) {
                    if (!(key in keys)) {
                        keys[key] = {
                            "types": [],
                            "guessType": []
                        }
                    }

                    valueType = getValueType(obj[key])

                    if (valueType == "string") {
                        valueTypeGuessed = guessStringType(obj[key])
                        if (!keys[key]["guessType"].includes(valueTypeGuessed)) {
                            keys[key]["guessType"].push(valueTypeGuessed)
                        }
                    }

                    if (!keys[key]["types"].includes(valueType)) {
                        keys[key]["types"].push(valueType)
                    }
                }
            }
        }
    }

    numberOfDateFields = 0
    dateFields = []
    for (var key in keys) {
        if(keys[key]["types"].includes("date")) {
            numberOfDateFields += 1
            dateFields.push(key)
        }
    }

    $("#parsing_advices").empty()
    $("#parsing_advices").append("<h5>Parsing advices:</h5>")
    $("#parsing_advices").append("<ul>")

    var advicesShouldBeShown = false

    for (key in keys) {
        if (keys[key]["types"].length > 1) {
            advicesShouldBeShown = true
            str = '<li>Field <a href="#output" onclick="applyFilter(\'' + key + '\')">' + key + "</a>"
            str += " got <b>multiple types</b> : " + keys[key]["types"].join(", ") + "</li>"
            $("#parsing_advices").append(str);
        } else if (keys[key]["types"].length == 1 && keys[key]["guessType"].length == 1 && keys[key]["types"][0] != keys[key]["guessType"][0]) {
            advicesShouldBeShown = true
            str = '<li>Field <a href="#output" onclick="applyFilter(\'' + key + '\')">' + key + "</a>"
            str += " of type " + keys[key]["types"][0] + " could probably be <b>convert</b> into " + keys[key]["guessType"][0] + "</li>"
            $("#parsing_advices").append(str);
        }
    }

    if (numberOfDateFields != 0 && !("TIMESTAMP" in keys)) {
        advicesShouldBeShown = true
        str = "<li>No field <b>TIMESTAMP</b> found, while you got <b>" + numberOfDateFields + "</b> others date field(s) (" + dateFields.join(", ") + ")"
        $("#parsing_advices").append(str);
    }

    $("#parsing_advices").append("</ul>")


    if (advicesShouldBeShown) {
        $("#parsing_advices").removeClass("d-none")
    }
}

// Escape string characters to build a Regex

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Set background color to pattern in string

function hightlightMatch(str, pattern, value) {
    return str.replace(new RegExp(pattern, 'g'), "<span class='background-highlight'>" + value + "</span>");
}

// Sort a dictionary by key.

function sortDictionary(dict) {

    var sorted = [];
    for (var key in dict) {
        sorted[sorted.length] = key;
    }
    sorted.sort();

    var tempDict = {};
    for (var i = 0; i < sorted.length; i++) {
        tempDict[sorted[i]] = dict[sorted[i]];
    }

    return tempDict;
}

// Display logstash log with formatting

function refreshLogstashLogDisplay() {
    filter_value = $('#filter_display').val()
    filter_regex_enabled = $('#filter_regex_enabled').is(':checked')
    filter_reverse_match_enabled = $('#filter_reverse_match_enabled').is(':checked')

    if (filter_regex_enabled && filter_value != "") {
        filter_regex = new RegExp(filter_value)
    } else {
        filter_regex = new RegExp(escapeRegExp(filter_value))
    }

    number_lines_display = $("#number_lines_display").val()
    if (number_lines_display == "unlimited") {
        number_lines_display = 100000;
    } else {
        number_lines_display = parseInt(number_lines_display, 10)
    }


    logstash_output_stderr_arr = logstash_output_stderr.split('\n')
    logstash_output_stderr_arr.shift() // We want to remove the first line of the stderr
    logstash_output_stderr_arr.pop() // We remove the last linen as well
    lines = logstash_output_stderr_arr.concat(logstash_output)

    stderr_errors_lines = logstash_output_stderr_arr.length
    matchNumber = 0
    res = ""

    for (var i = 0; i < lines.length; i++) {

        if (matchNumber >= number_lines_display) {
            break;
        }

        line = lines[i]

        if (filter_value == "" || (!filter_reverse_match_enabled && line.match(filter_regex)) || (filter_reverse_match_enabled && !line.match(filter_regex))) {
            matchNumber += 1

            if (line.startsWith("[")) {
                line = line.replace(/\\r\\n/g, '\n')
                line = line.replace(/\\n/g, '\n')
                line = line.replace(/\\t/g, '  ')
                line = escapeHtml(line)
            } else if (line.startsWith("{") && line.endsWith("}")) {
                jsonDic = JSON.parse(line)
                jsonDic = sortDictionary(jsonDic)
                obj = JSON.stringify(jsonDic, null, 2);
                line = jsonSyntaxHighlight(obj)
            }

            if (i < stderr_errors_lines) {
                line = "<span class='text-danger'>" + line + "</span>"
            }

            if (filter_value != "" && filter_value.length > 1 && !filter_regex_enabled) {
                line = hightlightMatch(line, filter_regex, filter_value)
            }

            res += line + "\n"
        }

    }

    if (res.length == 0) {
        if (logstash_output.length == 0) {
            res = "No data received :("
        } else {
            res = "Nothing match your filter :("
        }
    }

    $('#output').html(res);
}

// Manage if backend fail to treat user input

function jobFailed() {
    $("#start_process").removeClass('disabled');
    $('#failModal').modal('show');
    $('#failModalReason').html("Unable to obtain a response from the backend server.<br/>You cannot do anything to solve it, please contact the maintainer of this project.");

    $("#start_process").removeClass('disabled');
    $('#output').text('No data was receive from backend server :(');
}

$('#clear_form').click(function () {
    inputEditor.getSession().setValue("", -1)
    editor.getSession().setValue("", -1);
    $('#output').text("The Logstash output will be shown here !");
    $('#fields_attributes_number').val(0);
    $('#filter_regex_enabled').prop('checked', false)
    $('#filter_display').val("")
    $('#backend_response_time').text("0")
    applyFieldsAttributes()
    disableMultilineCodec()
    fileUploadDisabled()
    saveSession();
    toastr.success("Successfully cleaned your workspace", "Success")
});

// Remove the previous alert status from latest run container

function removeLatestRunStatus() {
    $("#latest_run_container").removeClass(function (index, className) {
        return (className.match(/(^|\s)alert-\S+/g) || []).join(' ');
    });
    $("#latest_run_container").removeClass("d-none")
}

// Apply a custom filter

function applyFilter(filter) {
    $('#filter_regex_enabled').prop('checked', false)
    $('#filter_reverse_match_enabled').prop('checked', false)
    $('#filter_display').val(filter)

    refreshLogstashLogDisplay()
}

// Manage result of Logstash process

function manageResultLogstashProcess(code, type, message) {
    var notif = null;

    if (code == "error") {
        notif = toastr.error(message, type)

        removeLatestRunStatus()
        $("#latest_run_container").addClass("alert-danger")
    } else if (code == "warning") {
        notif = toastr.warning(message, type)

        removeLatestRunStatus()
        $("#latest_run_container").addClass("alert-warning")
    } else if (code == "success") {
        notif = toastr.success(message, type)

        removeLatestRunStatus()
        $("#latest_run_container").addClass("alert-success")
    }

    $("#latest_run_status").html(type)
    $("#latest_run_message").html(message)

    return notif
}

// The main process, that will send data to backend

$('#start_process').click(function () {

    $('#backend_response_time').text("0")
    saveSession()

    if (userInputValid()) {

        var body = {
            logstash_filter: editor.getSession().getValue(),
            input_extra_fields: getFieldsAttributesValues(),
            logstash_version: $('#logstash_version :selected').text()
        };

        if (remote_file_hash == undefined) {
            body.input_data = inputEditor.getSession().getValue()
        } else {
            body.filehash = remote_file_hash
        }

        if ($('#enable_custom_codec').is(':checked')) {
            body.custom_codec = $('#custom_codec_field').val();
        }

        if ($('#custom_logstash_patterns_input').val() != "") {
            body.custom_logstash_patterns = $('#custom_logstash_patterns_input').val();
        }

        $('#output').html('<div style="padding-top: 1em; padding-bottom: 1em"><div class="spinner-border" style="display: block; margin: auto;" role="status><span class="sr-only"></span></div></div>');
        $("#start_process").addClass('disabled');
        $("#latest_run_container").addClass("d-none")
        $("#parsing_advices").addClass("d-none")

        $.ajax({
            url: api_url + "/start_process",
            type: "POST",
            data: JSON.stringify(body),
            contentType: "application/json",
            dataType: "json",
            timeout: 60000,
            success: function (data) {
                logstash_output = cleanLogstashStdout(data.job_result.stdout)
                logstash_output_stderr = data.job_result.stderr

                if(enableParsingAdvices) {
                    findParsingOptimizationAdvices()
                }

                parsingResult = logstashParsingProblem()

                if (data.job_result.status == -1) {
                    manageResultLogstashProcess('error', 'Error', 'Unable to execute the process on remote server.')
                } else if (data.job_result.status != 0 || parsingResult.isProblem) {
                    if (data.job_result.status != 0 || parsingResult.cause == "logstash") {
                        var notif = manageResultLogstashProcess('error', 'Error', 'There was a problem in <a class="alert-link" href="#output" onclick="applyFilter(\'' + parsingResult.filter + '\')">your configuration</a>.')
                        redirectToastrClick(notif, "logstash_filter_textarea")
                    } else {
                        var notif = manageResultLogstashProcess('warning', 'Parsing problems', 'Logstash <a class="alert-link" href="#output" onclick="applyFilter(\'' + parsingResult.filter + '\')">failed to parse</a> some of your events')
                        redirectToastrClick(notif, "logstash_filter_textarea")
                    }
                } else {
                    var notif = manageResultLogstashProcess('success', 'Success', 'Configuration parsing is done !')
                    redirectToastrClick(notif, "output")
                }

                if (!data.config_ok) {
                    var notif = manageResultLogstashProcess('error', 'Informations missings', 'All fields need to be fill !')
                    redirectToastrClick(notif, "input_extra_attributes")
                }

                var response_time_formatted = (data.job_result.response_time / 1000).toFixed(1)

                refreshLogstashLogDisplay()
                $("#backend_response_time").text(response_time_formatted)
                $("#start_process").removeClass('disabled');
            },
            error: function () {
                jobFailed()
            }
        });

    }

});
