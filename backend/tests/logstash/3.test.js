var expect = require("chai").expect;
var request = require("request");

const config = require("./config")

describe("Logstash testing", function () {

  this.slow(100)
  this.timeout(config.MAX_TIMEOUT);
  var url = "http://localhost:8081/logstash/start";

  it("should work with custom pattern and disabled grok pattern configuration", function (done) {
    if (!config.enable_slow_tests) this.skip()

    formData = {
      input_data: "HAHA\nHOHO\nHUHU",
      custom_logstash_patterns: "STR_UPPER [A-Z]*\n",
      logstash_filter: "filter {\n  grok {\n    match => {\n      'message' => '%{STR_UPPER:test}'\n    }\n    patterns_dir => '/idontexists'\n    patterns_files_glob => '*.fake_extension'\n  }\n}",
      input_extra_fields: [],
      logstash_version: config.logstashVersion
    }
    request.post({ url: url, body: formData, json: true }, function (error, response, body) {
      expect(body.config_ok).to.equal(true);
      expect(body.succeed).to.equal(true);
      expect(response.statusCode).to.equal(200);
      expect(body.job_result.status).to.equal(0);
      expect(body.job_result.stdout).to.match(/HAHA/);
      expect(body.job_result.stdout).to.match(/HOHO/);
      expect(body.job_result.stdout).to.match(/HUHU/);
      expect(body.job_result.stdout).to.match(/test/);


      done();
    });
  });

  
});
