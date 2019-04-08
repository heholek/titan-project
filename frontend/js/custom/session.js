////////////////////////
// Session management //
////////////////////////

// Check if the file still is on the server
function checkRemoteFile() {
    remoteLogExists(remote_file_hash, (exists) => {
        if (!exists) {
            var notif = toastr.warning('Your file is no more on the server, you need to upload it again', 'File uploaded')
            fileUploadDisabledClean()
            redirectToastrClick(notif, "input_data_title")
        }
    })
}

// Save current user session
function saveSession() {
    console.log("Saving session into cookie")
    var session = {
        minimalist: ($('#css_theme_minimalist').attr('href').indexOf('nominimalist.css') != -1 ? false : true),
        theme: ($('#css_theme_bootstrap').attr('href').indexOf('bootstrap.min.css') != -1 ? "white" : "black"),
        fullscreen: ($('#main_container').hasClass("container")? false : true),
        input_data: inputEditor.getValue(),
        logstash_filter: editor.getValue(),
        input_fields: getFieldsAttributesValues(),
        custom_logstash_patterns: $('#custom_logstash_patterns_input').val(),
        custom_codec: ($('#enable_custom_codec').is(':checked') ? $('#custom_codec_field').val() : ""),
        remote_file_hash: remote_file_hash,
        filter_regex_enabled: $('#filter_regex_enabled').is(':checked'),
        filter_display: $('#filter_display').val(),
        number_lines_display: $("#number_lines_display").val()
    }
    store.set('session', session);

    if (JSON.stringify(store.get('session')) != JSON.stringify(session)) {
        toastr.warning('There was a problem while saving your work', 'Save problem')
    }
}

// Load session for user
function loadSession(session) {
    if(session == undefined) {
        var session = store.get('session');
    }
    if (session != undefined) {
        console.log("Loading user session")
        session.theme == "white" ? enableWhiteTheme() : enableBlackTheme()
        inputEditor.setValue(session.input_data, -1)
        $('#custom_logstash_patterns_input').val(session.custom_logstash_patterns)
        $('#filter_regex_enabled').prop('checked', session.filter_regex_enabled)
        $('#filter_display').val(session.filter_display)
        editor.setValue(session.logstash_filter, -1)
        applyFieldsAttributes(session.input_fields)
        $("#number_lines_display option[data-value='" + session.number_lines_display +"']").attr("selected","selected");
        if (session.custom_codec != "") {
            enableMultilineCodec(session.custom_codec)
        } else {
            disableMultilineCodec()
        }
        if (session.minimalist) {
            enableMinimalistMode()
        } else {
            disableMinimalistMode()
        }
        if(session.fullscreen) {
            enableFullscreenMode()
        } else {
            disableFullscreenMode()
        }
        if (session.remote_file_hash != undefined) {
            fileUploadEnabled(session.remote_file_hash)
            checkRemoteFile()
        } else {
            fileUploadDisabled()
        }
    } else {
        console.log("No cookie for session found")
    }
}

// User specific

// Read the content of a single file, and put it into the editor
function loadUserSession(e) {
    readSingleFile(e, (sessionString) => {
        try {
            session = JSON.parse(sessionString)
            loadSession(session)
            toastr.success('Successfully loaded your saved session', 'Success')
        } catch (e) {
            toastr.error('Your session backup should be a JSON file, is that the right file ?', 'Error')
        }  
    })
}

// We create a callback when user click on the input loading
document.getElementById('session_input_loading').addEventListener('change', loadUserSession, false);

// Function to save current user session to a file

function saveSessionToFile() {
    saveSession()
    var session = store.get('session');
    var sessionString = JSON.stringify(session)
    saveToFile(sessionString, "titan-project-session.json", "application/json")
}