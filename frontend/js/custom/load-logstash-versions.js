////////////////////////////
// Load Logstash versions //
////////////////////////////

// Launch the grok debugger process
function loadLogstashVersions(callback) {
    $.ajax({
        url: api_url + "/logstash_versions",
        type: "GET",
        contentType: "application/json",
        success: function (data) {
            if (data.succeed) {
               
                if(data.versions.length == 0) {
                    toastr.error('No Logstash binaries were detected.</br>That`s a big problem.</br>We\'re unable to work.', 'Logstash(s) not found')
                } else {
                    opt = ""
                    for(var i in data.versions) {
                        version = data.versions[i]
                        opt = opt + '<option data-value="' + version + '" selected="selected">' + version + '</option>'
                    }
                    $('#logstash_version').html(opt)
                }

            } else {
                toastr.error('There was an error while doing doing this process', 'Error')
            }
            callback()
        },
        error: function () {
            jobFailed()
            callback()
        }
    });
}