var expect = require("chai").expect;
var request = require("request");

const config = require("./config")

describe("Logstash testing", function () {

  this.slow(100)
  this.timeout(config.MAX_TIMEOUT);
  var url = "http://localhost:8081/logstash/start";

  it("should work with basic parameters on uploaded file", function (done) {
    if (!config.enable_slow_tests) this.skip()

    var filehash = "CCC720F871674C18E5FECFF61D92C1355CD4BFAC25699FB7DDFE7717C9669B4D085193982402156122DFAA706885FD64741704649795C65B2A5BDEC40347E28A";

    formDataInitial = {
      hash: filehash,
      file_content: "hi\nho\nha\nhou\nlol"
    }
    request.post({ url: "http://localhost:8081/file/upload", body: formDataInitial, json: true }, function (error, response, body) {
      expect(error).to.equal(null)

      formData = {
        filehash: filehash,
        logstash_filter: "filter{mutate{add_field=>{'test'=> 'test2'}}}",
        input_extra_fields: [{attribute: "type", value: "superTest"}],
        logstash_version: config.logstashVersion
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(body.config_ok).to.equal(true);
        expect(body.succeed).to.equal(true);
        expect(response.statusCode).to.equal(200);
        expect(body.job_result.stdout).to.match(/hou/);
        expect(body.job_result.stdout).to.match(/ha/);
        done();
      });
    });
    
  });
  
});
