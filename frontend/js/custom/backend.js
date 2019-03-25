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

// We check if logstash met a problems during the process

function logstashParsingProblem() {
    lines = logstash_output.split('\n')

    for (var i = 0; i < lines.length; i++) {
        line = lines[i]
        if (line.startsWith("[ERROR]")) {
            return true;
        }
    }

    return false
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
    for(var key in dict) {
        sorted[sorted.length] = key;
    }
    sorted.sort();

    var tempDict = {};
    for(var i = 0; i < sorted.length; i++) {
        tempDict[sorted[i]] = dict[sorted[i]];
    }

    return tempDict;
}

// Display logstash log with formatting

function refreshLogstashLogDisplay() {
    filter_value = $('#filter_display').val()
    filter_regex_enabled = $('#filter_regex_enabled').is(':checked')
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

    res = ""
    lines = logstash_output.split('\n')
    matchNumber = 0

    for (var i = 0; i < lines.length; i++) {

        if (matchNumber >= number_lines_display) {
            break;
        }

        line = lines[i]

        if (filter_value == "" || line.match(filter_regex)) {
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

            if (filter_value != "" && filter_value.length > 1 && !filter_regex_enabled) {
                line = hightlightMatch(line, filter_regex, filter_value)
            }

            res += line + "\n"
        }

    }

    if (res.length == 0) {
        if (logstash_output.length == 0) {
            res = "No data to filter :("
        } else {
            res = "Nothing match :("
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
    inputEditor.setValue("", -1)
    editor.setValue("", -1);
    $('#output').text("The Logstash output will be shown here !");
    $('#fields_attributes_number').val(0);
    $('#filter_regex_enabled').prop('checked', false)
    $('#filter_display').val("")
    $('#backend_response_time').text("0")
    applyFieldsAttributes()
    disableMultilineCodec()
    fileUploadDisabled()
    saveSession();
});

// The main process, that will send data to backend

$('#start_process').click(function () {

    $('#backend_response_time').text("0")
    saveSession()

    if (userInputValid()) {

        var body = {
            logstash_filter: editor.getValue(),
            input_extra_fields: getFieldsAttributesValues()
        };

        if (remote_file_hash == undefined) {
            body.input_data = inputEditor.getValue()
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

        $.ajax({
            url: api_url + "/start_process",
            type: "POST",
            data: JSON.stringify(body),
            contentType: "application/json",
            dataType: "json",
            timeout: 60000,
            success: function (data) {
                logstash_output = data.job_result.stdout

                if (data.job_result.status == -1) {
                    toastr.error('Unable to execute the process on remote server.', 'Error')
                } else if (data.job_result.status != 0 || logstashParsingProblem()) {
                    toastr.error('There was a problem in your configuration.', 'Error')
                } else {
                    toastr.success('Configuration parsing is done !', 'Success')
                }

                if (!data.config_ok) {
                    toastr.error('All fields need to be fill !', 'Informations missings')
                }

                var response_time_formatted = (data.job_result.response_time / 1000).toFixed(1)

                refreshLogstashLogDisplay(data.job_result.stdout)
                $("#backend_response_time").text(response_time_formatted)
                $("#start_process").removeClass('disabled');
            },
            error: function () {
                jobFailed()
            }
        });

    }

});
