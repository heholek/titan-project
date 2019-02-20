<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div class="form-group">
      <label for="input_data">Input data</label>
      <textarea class="form-control" id="input_data" rows="5" v-model="input_data"></textarea>
    </div>
    <div class="form-group">
      <label for="logstash_filter">Logstash filter</label>
      <textarea class="form-control" id="logstash_filter" rows="5" v-model="logstash_filter"></textarea>
    </div>
    <div class="form-group">
      <label for="output">Output</label>
      <textarea class="form-control" id="output" rows="5" v-model="output"></textarea>
    </div>
    <button v-on:click="send" type="button">Process</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data(){
			return {
        input_data: "",
        logstash_filter: "",
        output: ""
			}
    },
    methods: {
      send: function (event) {
        var res = {
          "logstash_filter": this.$data.logstash_filter,
          "input_data": this.$data.input_data
        }
        console.log(res);

        let self = this

        this.axios
        .post('http://192.168.1.88:3000/start_job', {
          input_data: self.$data.input_data,
          logstash_filter: self.$data.logstash_filter
        })
        .then(function (response) {
          self.$data.output = response.data.job_result.stdout
        })
        
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
