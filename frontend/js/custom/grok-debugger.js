///////////////////
// Grok debugger //
///////////////////

// Launch the grok debugger process
function launchGrokDebugger() {
    body = {}
    body.line = $('#line_sample_input').val()
    body.grok_pattern = $('#grok_pattern_input').val()

    $.ajax({
        url: api_url + "/grok_tester",
        type: "POST",
        data: JSON.stringify(body),
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            if (data.succeed) {
                if (data.results.length == 0) {
                    $('#grok_output').text("Nothing was received :(")
                } else {
                    steps = data.results.reverse()
                    res = ""
                    alreadySucceed = false
                    mark_theme = ""

                    for (i in steps) {
                        step = steps[i]
                        if (step.result != null) {
                            val = jsonSyntaxHighlight(step.result) + "<br/>"
                            mark_theme = "mark-success"
                            alreadySucceed = true
                        } else {
                            text_color = ""
                            if (alreadySucceed) {
                                mark_theme = "mark-warning"
                                val = "<p class='text-warning'>Doesn't seems to match here, probably not important <br/>as it succeed in the following steps</p>"
                            } else {
                                mark_theme = "mark-danger"
                                val = "<p class='text-danger'>Doesn't seems to match here :(</p>"
                            }
                        }

                        diffValue = step.pattern
                        if (i < steps.length - 1) {
                            var lastPattern = steps[parseInt(i, 10) + 1]
                            diffValue = step.pattern.slice(lastPattern.pattern.length)
                        }

                        title = "<p><ins>Step " + (steps.length - i) + "</ins></p>"
                        pattern = "<p style='margin-bottom: 0px'>\"" + escapeHtml(step.pattern) + "\"</p><br/>"
                        diff = "Diff : <mark class='" + mark_theme + "'>" + escapeHtml(diffValue) + "</mark><br/><br/>"
                        res += title + pattern + diff + val + "<br/>"
                    }
                    $('#grok_output').html(res)
                }
            } else {
                toastr.error('There was an error while doing doing this process', 'Error')
            }
        },
        error: function () {
            jobFailed()
        }
    });
}

// Set a trigger on click on guess
$('#launch_grok_debugger').click(launchGrokDebugger);
