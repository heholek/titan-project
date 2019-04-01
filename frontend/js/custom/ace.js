/////////////////////
// Init ACE editor //
/////////////////////

// We want to incldue externals languages
ace.require("ace/ext/language_tools");

// Find and replace text in editor

function findAndReplaceTextEditor(ed, pattern, value) {
    logstash_filter = ed.getValue()
    lines = logstash_filter.split('\n')

    for (var i = 0; i < lines.length; i++) {
        line = lines[i]

        lines[i] = line.replace(pattern, value)

    }

    logstash_filter = lines.join('\n')
    ed.setValue(logstash_filter, -1)
}

// Format logstash filter code
function formatLogstashFilter() {

    // As '#' are start of comment, with need to add // before them
    findAndReplaceTextEditor(editor, /(#[^{}\[\]"']*)$/, "//$1")

    // Then we beautify using js language syntax
    logstash_filter = editor.getValue()
    logstash_filter = js_beautify(logstash_filter, {
        "indent_size": "2",
        "indent_char": " ",
        "max_preserve_newlines": "5",
        "preserve_newlines": true,
        "keep_array_indentation": false,
        "break_chained_methods": false,
        "indent_scripts": "normal",
        "brace_style": "collapse,preserve-inline",
        "space_before_conditional": true,
        "unescape_strings": false,
        "jslint_happy": false,
        "end_with_newline": false,
        "wrap_line_length": "0",
        "indent_inner_html": false,
        "comma_first": false,
        "e4x": false
    })
    editor.setValue(logstash_filter, -1)

    // And finaly we remove the '//'
    findAndReplaceTextEditor(editor, /\/\/(#[^{}\[\]"']*)$/, "$1")

    console.log("Code formatted")
}

// Build the ACE editor to edit configuration
function buildInputDataEditor() {
    var editor = ace.edit("input_data_textarea");
    editor.session.setMode("ace/mode/elixir");

    editor.setOptions({
        fontSize: "12pt",
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        indentedSoftWrap: false,
        useSoftTabs: false,
        showPrintMargin: false,
        enableSnippets: false,
        navigateWithinSoftTabs: false,
        keyboardHandler: "ace/keyboard/sublime"
    })

    return editor
}

// Build the ACE editor to edit the Logstash configuration
function buildFilterEditor() {
    var editor = ace.edit("logstash_filter_textarea");
    editor.session.setMode("ace/mode/logstash");
    editor.session.setTabSize(2);

    editor.setOptions({
        fontSize: "12pt",
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        indentedSoftWrap: true,
        useSoftTabs: true,
        showPrintMargin: false,
        enableSnippets: false,
        navigateWithinSoftTabs: true,
        keyboardHandler: "ace/keyboard/sublime"
    })

    // Editor save and open behavior

    editor.commands.addCommand({
        name: 'save',
        bindKey: { win: "Ctrl-S", "mac": "Cmd-S" },
        exec: function (editor) {
            data = editor.session.getValue()
            saveToFile(data, "logstash_filter.conf")
        }
    })

    editor.commands.addCommand({
        name: 'open',
        bindKey: { win: "Ctrl-O", "mac": "Cmd-O" },
        exec: function (editor) {
            $('#filter_input_loading').trigger("click")
        }
    })

    editor.commands.addCommand({
        name: 'autoident',
        bindKey: { win: "Ctrl-I", "mac": "Cmd-I" },
        exec: function (editor) {
            formatLogstashFilter()
        }
    })

    return editor
}

// Meta function to read file content
function readSingleFile(e, callback) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        callback(contents)
    };
    reader.readAsText(file);
}

// Read the content of a single file, and put it into the editor
function loadConfEditor(e) {
    readSingleFile(e, (contents) => {
        editor.session.setValue(contents);
    })
}

// We create a callback when user click on the input loading
document.getElementById('filter_input_loading').addEventListener('change', loadConfEditor, false);

// Save a string to file
function saveToFile(data, filename, filetype) {

    if (filetype == undefined) {
        filetype = 'text/plain'
    }

    var blob = new Blob([data], { type: filetype }),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}

// Create the editor that will be used by others files
var editor = buildFilterEditor()
var inputEditor = buildInputDataEditor()