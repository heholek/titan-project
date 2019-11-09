var expect = require("chai").expect;
var request = require("request");

const MAX_TIMEOUT = 30000;

describe("API Testing", function () {

  describe("/", function () {

    var url = "http://localhost:8081/";

    it("returns status 200", function (done) {
      request(url, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

  });


  describe("/start_process", function () {
    this.timeout(MAX_TIMEOUT);

    var url = "http://localhost:8081/start_process";


    it("with bad logstash filter", function (done) {
      formData = {
        input_data: "hi\nho\nha\nhou\nlol",
        logstash_filter: "filter mutate{add_field=>{'test'=> 'test2'}}}",
        input_extra_fields: [{attribute: "type", value: "superTest"}],
        logstash_version: "6.8.3"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(body.config_ok).to.equal(true);
        expect(response.statusCode).to.equal(200);
        expect(body.job_result.status).not.to.equal(0);
        expect(body.job_result.stdout).not.to.match(/hou/);
        expect(body.job_result.stdout).not.to.match(/test2/);
        done();
      });
    });

    it("should work with custom pattern", function (done) {
      formData = {
        input_data: "HAHA\nHOHO\nHUHU",
        custom_logstash_patterns: "STR_UPPER [A-Z]*\n",
        logstash_filter: 'filter{ grok { match => { "message" => "%{STR_UPPER:test}" } }}',
        input_extra_fields: [],
        logstash_version: "6.8.3"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(body.job_result.status).to.equal(0);
        expect(body.job_result.stdout).to.match(/HAHA/);
        expect(body.job_result.stdout).to.match(/HOHO/);
        expect(body.job_result.stdout).to.match(/test/);

        expect(body.job_result.stdout).not.to.match(/HUHU/);

        done();
      });
    });

    it("should work", function (done) {
      formData = {
        input_data: "hi\nho\nha\nhou\nlol",
        logstash_filter: "filter{mutate{add_field=>{'test'=> 'test2'}}}",
        input_extra_fields: [{attribute: "type", value: "superTest"}],
        logstash_version: "6.8.3"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body.config_ok).to.equal(true);
        done();
      });
    });

    it("should work with multiline codec", function (done) {
      formData = {
        input_data: "hi\n ho\n ha\nhou\ lol",
        logstash_filter: "filter{mutate{add_field=>{'test'=> 'test2'}}}",
        custom_codec: 'multiline { pattern => "^\\s" what => "previous" }',
        input_extra_fields: [{attribute: "type", value: "superTest"}],
        logstash_version: "6.8.3"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(body.job_result.status).to.equal(0);
        var accolade_left_number = (body.job_result.stdout.match(/{/g) || []).length
        var accolade_right_number = (body.job_result.stdout.match(/{/g) || []).length
        expect(accolade_left_number).to.equal(1);
        expect(accolade_right_number).to.equal(1);
        expect(body.job_result.stdout).to.match(/hi/);
        expect(body.job_result.stdout).to.match(/ho/);
        expect(body.job_result.stdout).to.match(/superTest/);
        expect(body.job_result.stdout).not.to.match(/hou/);
        expect(body.job_result.stdout).not.to.match(/lol/);

        done();
      });
    });

    it("without parameters", function (done) {
      formData = {
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
        expect(response.statusCode).to.equal(400);
        expect(body.config_ok).to.equal(false);
        expect(body.missing_fields.length).to.equal(4);
        expect(body.missing_fields).to.contain("logstash_filter");
        expect(body.missing_fields).to.contain("input_data");
        expect(body.missing_fields).to.contain("filehash");
        expect(body.missing_fields).to.contain("logstash_version");
        done();
      });
    });

    it("with missing parameters", function (done) {
      formData = {
        input_data: "hi\nho\nha\nhou\nlol"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.config_ok).to.equal(false);
          expect(response.statusCode).to.equal(400);
          expect(body.missing_fields.length).to.equal(2);
          expect(body.missing_fields).to.contain("logstash_filter");
          expect(body.missing_fields).to.contain("logstash_version");
          done();
      });
    });

    it("with incompatible parameters", function (done) {
      formData = {
        input_data: "hi\nho\nha\nhou\nlol",
        logstash_filter: "filter{mutate{add_field=>{'test'=> 'test2'}}}",
        filehash: "1F9720F871674C18E5FECFF61D92C1355CD4BFAC25699FB7DDFE7717C9669B4D085193982402156122DFAA706885FD64741704649795C65B2A5BDEC40347E28A",
        logstash_version: "1.2.3"
      }
      request.post({ url: url, body: formData, json: true }, function (error, response, body) {
          expect(body.config_ok).to.equal(false);
          expect(response.statusCode).to.equal(400);
          expect(body.missing_fields.length).to.equal(2);
          expect(body.missing_fields).to.contain("input_data");
          expect(body.missing_fields).to.contain("filehash");
          done();
      });
    });

  });

});
