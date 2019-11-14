var expect = require("chai").expect;
var request = require("request");

const config = require("./config")

describe("Logstash testing", function () {

  this.slow(100)
  this.timeout(config.MAX_TIMEOUT);
  var url = "http://localhost:8081/logstash/start";

  it("with bad logstash filter", function (done) {
    if (!config.enable_slow_tests) this.skip()

    formData = {
      input_data: "hi\nho\nha\nhou\nlol",
      logstash_filter: "filter mutate{add_field=>{'test'=> 'test2'}}}",
      input_extra_fields: [{attribute: "type", value: "superTest"}],
      logstash_version: config.logstashVersion
    }
    request.post({ url: url, body: formData, json: true }, function (error, response, body) {
      expect(body.config_ok).to.equal(true);
      expect(body.succeed).to.equal(true);
      expect(response.statusCode).to.equal(200);
      expect(body.job_result.status).not.to.equal(0);
      expect(body.job_result.stdout).not.to.match(/hou/);
      expect(body.job_result.stdout).not.to.match(/test2/);
      done();
    });
  });
  
});
