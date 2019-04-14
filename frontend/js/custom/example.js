//////////////////////////
// Example form filling //
//////////////////////////

// Factory method to generate examples
function exampleFactory(conf) {

    if (conf.input_data_filepath != undefined) {
        $.ajax({
            url: conf.input_data_filepath,
            success: function (data) {
                inputEditor.getSession().setValue(data, -1)
            }
        });
    }

    if (conf.filter_filepath != undefined) {
        $.ajax({
            url: conf.filter_filepath,
            success: function (data) {
                editor.getSession().setValue(data, -1);
            }
        });
    }

    if (conf.input_data_attributes != undefined) {
        applyFieldsAttributes(conf.input_data_attributes)
    }

    if (conf.custom_codec_filepath != undefined) {
        $.ajax({
            url: conf.custom_codec_filepath,
            success: function (data) {
                enableMultilineCodec(data)
            }
        });
    } else {
        disableMultilineCodec()
    }

    fileUploadDisabled()

}

// We define here the examples we want to show
var examples = [
    // Simple examples
    {
        category: "Simple examples",
        examples: [
            // Single Line (Syslog)
            {
                name: "Syslog",
                description: "A simple example on how to parse a basic syslog file format.",
                input_data_filepath: "./sample/simple/data.txt",
                filter_filepath: "./sample/simple/filter.conf",
                input_data_attributes: [
                    { attribute: "pilote", value: "system" },
                    { attribute: "type", value: "syslog" },
                    { attribute: "path", value: "/var/log/syslog" }
                ],
                custom_codec_filepath: undefined
            },
            // Multiline (Java Stack Trace)
            {
                name: "Multiline strack trace",
                description: "A sample on how to use a custom codec (here multiline) with this web tool.",
                input_data_filepath: "./sample/multiline/data.txt",
                filter_filepath: "./sample/multiline/filter.conf",
                input_data_attributes: [
                    { attribute: "type", value: "java-stack-trace" }
                ],
                custom_codec_filepath: "./sample/multiline/multiline.codec"
            },
        ]
    },

    // Simple examples
    {
        category: "Dissect",
        examples: [
            // Basic syslog
            {
                name: "Simple example",
                description: "An example to show how to parse a syslog file using dissect.",
                input_data_filepath: "./sample/dissect-simple/data.txt",
                filter_filepath: "./sample/dissect-simple/filter.conf",
                input_data_attributes: [
                    { attribute: "pilote", value: "system" },
                    { attribute: "type", value: "syslog" }
                ],
                custom_codec_filepath: undefined
            },
            // Basic csv
            {
                name: "CSV Parsing example",
                description: "An example on how to parse a CSV file using dissect.",
                input_data_filepath: "./sample/dissect-csv/data.txt",
                filter_filepath: "./sample/dissect-csv/filter.conf",
                input_data_attributes: [],
                custom_codec_filepath: undefined
            },
        ]
    },

    // Empty templates
    {
        category: "Templates",
        examples: [
            // Single line empty template
            {
                name: "Single line input",
                description: "This simple template is a base prototype that you may use for your single-lines input files. It will not override your current logfile data.",
                input_data_filepath: undefined,
                filter_filepath: "./sample/template-single-line/filter.conf",
                input_data_attributes: [
                    { attribute: "pilote", value: "my-pilote" },
                    { attribute: "type", value: "my-type" }
                ],
                custom_codec_filepath: undefined
            },
            // Multiline empty template
            {
                name: "Multiline input",
                description: "This simple template is a base prototype that you may use for your multiline input files. It will not override your current logfile data.",
                input_data_filepath: undefined,
                filter_filepath: "./sample/template-multiline/filter.conf",
                input_data_attributes: [
                    { attribute: "pilote", value: "my-pilote" },
                    { attribute: "type", value: "my-type" }
                ],
                custom_codec_filepath: "./sample/template-multiline/multiline.codec"
            }
        ]
    }

]

// Init display of examples
function initExamples() {
    $('#examples_select').empty();
    previousCategory = "None"
    for (categoryId in examples) {
        category = examples[categoryId].category
        $('#examples_select').append("<optgroup label='" + category + "'>")
        for (exampleId in examples[categoryId].examples) {
            example = examples[categoryId].examples[exampleId]
            $('#examples_select').append("<option>" + example.name + "</option>")
        }
        $('#examples_select').append("</optgroup>")
    }
    updateExamplesDescription()
}

// Get current selected example
function getSelectedExample() {
    selectedText = $('#examples_select :selected').text();

    for (categoryId in examples) {
        for (exampleId in examples[categoryId].examples) {
            example = examples[categoryId].examples[exampleId]
            if (example.name == selectedText) {
                return example
            }
        }
    }
    return undefined
}

// Show the current description of the example
function updateExamplesDescription() {
    example = getSelectedExample()

    if(example != undefined) {
        $("#example_description").text(example.description)
    } else {
        console.log("Unable to find the example")
    }
}

initExamples()

// We update the description on example change
$("#examples_select").change(function () {
    updateExamplesDescription()
});

// We set-up a trigger to apply examples
$("#show_example").click(function () {
    example = getSelectedExample()

    if(example != undefined) {
        exampleFactory(example)
        toastr.success("Successfully loaded your example", "Success")
        jumpTo("input_extra_attributes")
    } else {
        toastr.error("Failed to load your example", "Error")
    }
});