function getClass(obj) {
  if (typeof obj === "undefined")
    return "undefined";
  if (obj === null)
    return "null";
  return Object.prototype.toString.call(obj)
    .match(/^\[object\s(.*)\]$/)[1];
}

function convert_integer_status_to_string(status) {
  switch(status) { 
    case '0': 
      return "ok";
    case '1': 
      return "warning";
    case '2': 
      return "critical";
    default: 
      return "na";
  }
}

function getBody(content)
{
    var test = content.toLowerCase();    // to eliminate case sensitivity
    var x = test.indexOf("<body");
    if(x == -1) return "";

    x = test.indexOf(">", x);
    if(x == -1) return "";

    var y = test.lastIndexOf("</body>");
    if(y == -1) y = test.lastIndexOf("</html>");
    if(y == -1) y = content.length;    // If no HTML then just grab everything till end

    return content.slice(x + 1, y);
}

function convert_service_entry_to_tr(host, service, data, left_or_right) {
  if (data.notifications_enabled == "0") {
    return ""
  } 
  
  var host_and_status = data.plugin_output.split(' - ')[0]
  var status          = "status-" + convert_integer_status_to_string(data.current_state)
  return "<div class='host-entry " + status + " " + left_or_right + "'>" +
    host + ' ' + host_and_status + 
  "</div>"
}

function toggle_left_right(left_or_right) {
  return left_or_right == "left" ? "right" : "left";
}

function display_nagios_status(data, t, j) {
  if (!data.success) return;
  
  var generated_html = "";
  var left_or_right = "left";
  var service_entries = [];
  for (var host in data.content) {
      // console.log(host + ' ' + data.content[host].plugin_output);
      // generated_html += convert_service_entry_to_tr(host, 'root', data.content[host])

      for (var service in data.content[host].services) {
        var service_status = data.content[host].services[service].current_state
        generated_html += convert_service_entry_to_tr(host, service, data.content[host].services[service], left_or_right)
        left_or_right = toggle_left_right(left_or_right);
        // console.log("service: " + service + " on " + host + " has state: " + service_status)
        service_entries.push(data.content[host].services[service])
      }
  }
  
  var services_by_state = _.groupBy(service_entries, function (e) { return parseInt(e['current_state'], 10); })
  console.log(JSON.stringify(services_by_state))
  console.log(JSON.stringify(Object.keys(services_by_state)))
  
  $('#nagios-api').html(generated_html);
}

function createSearchBox(url) { console.log("doing nothing with url: " + url); }
function refreshPart(a,b)     { console.log("doing nothing with : " + a + " or b: " + b); }