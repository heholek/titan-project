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
        if (line.startsWith("[")) {
            return true;
        }
    }

    return false
}

// Display logstash log with formatting

function refreshLogstashLogDisplay() {
    filter_value = $('#filter_display').val()
    filter_regex_enabled = $('#filter_regex_enabled').is(':checked')
    if (filter_regex_enabled && filter_value != "") {
        filter_regex = new RegExp(filter_value)
        console.log(filter_value)
    }

    res = ""
    lines = logstash_output.split('\n')

    for (var i = 0; i < lines.length; i++) {
        line = lines[i]

        if (filter_value == "" || ((filter_regex_enabled && line.match(filter_regex)) || (!filter_regex_enabled && line.indexOf(filter_value) != -1))) {

            if (line.startsWith("[")) {
                line = line.replace(/\\r\\n/g, '\n')
                line = line.replace(/\\n/g, '\n')
                line = line.replace(/\\t/g, '  ')
                line = escapeHtml(line)
            } else if (line.startsWith("{") && line.endsWith("}")) {
                obj = JSON.stringify(JSON.parse(line), null, 2);
                line = jsonSyntaxHighlight(obj)
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
    $('#input_data_textarea').val("");
    editor.setValue("", -1);
    $('#output').text("The Logstash output will be shown here !");
    $('#fields_attributes_number').val(0);
    $('#filter_regex_enabled').attr('checked', false)
    $('#filter_display').val("")
    applyFieldsAttributes()
    disableMultilineCodec()
    fileUploadDisabled()
    saveSession();
});

// The main process, that will send data to backend

$('#start_process').click(function () {

    saveSession()

    if (userInputValid()) {

        var body = {
            logstash_filter: editor.getValue(),
            input_extra_fields: getFieldsAttributesValues()
        };

        if (remote_file_hash == undefined) {
            body.input_data = $('#input_data_textarea').val()
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

                refreshLogstashLogDisplay(data.job_result.stdout)
                $("#start_process").removeClass('disabled');
            },
            error: function () {
                jobFailed()
            }
        });

    }

});
