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

function convert_service_entry_to_div(data, height) {
  // console.log(JSON.stringify(data));
  if (data.notifications_enabled == "0") {
    return ""
  } 
  
  var host_and_status = data.plugin_output.split(' - ')[0].substring(0,50)
  var status          = "status-" + convert_integer_status_to_string(data.current_state)
  var class_str       = "class='host-entry " + status + "' "
  return "<div " + class_str + height + ">" +
    data['host'] + ' ' + host_and_status + 
  "</div>"
}

function generate_html_from_services(services_lookup, good_bad, div_height) {
  // console.log(JSON.stringify(services));
  var services = services_lookup[good_bad];
  var generated_html = "<div class='state-"+good_bad+"' style='height: " + div_height + "'>";
  var width          = good_bad == "good" ? "46%" : "98%"
  var element_height = div_height / services.length;
  console.log("element_height = " + element_height)
  if (good_bad == "good") {
    element_height *= 2;
  }
  console.log("element_height = " + element_height)
  var style = "style='height: " + element_height + "px; width: " + width + "' "
  for (var i=0; i<services.length; ++i) {
    generated_html += convert_service_entry_to_div(services[i], style)
  }
  return generated_html + "</div>";
}

function display_nagios_status(data, t, j) {
  if (!data.success) return;
  
  var service_entries = [];
  for (var host in data.content) {
      for (var service_name in data.content[host].services) {
        var service = data.content[host].services[service_name]
        service['host'] = host;
        service['service'] = service_name;
        service_entries.push(service);
      }
  }
  
  $('#nagios-api').html(generate_html_from_services(service_entries));
  
  var html = "";
  var services_by_state = _.groupBy(service_entries, function (e) { return e['current_state'] === "0" ? "good" : "bad" });
  var has_bad_state = (services_by_state["bad"] !== undefined);
  var has_good_state = (services_by_state["bad"] !== undefined);
  
  if (services_by_state["bad"] !== undefined) {
    var div_height = $(window).height() / (has_good_state ? 2.0 : 1.0);
    console.log("div_height = " + div_height)
    html += generate_html_from_services(services_by_state, "bad", div_height);
  }
  
  // Good services
  if (services_by_state["good"] !== undefined) {
    var div_height = $(window).height() / (has_bad_state ? 2.0 : 1.0);
    html += generate_html_from_services(services_by_state, "good", div_height);
  }
  $('#nagios-api').html(html);
  
  // console.log(JSON.stringify(services_by_state));
  console.log(Object.keys(services_by_state));
  
}

function createSearchBox(url) { console.log("doing nothing with url: " + url); }
function refreshPart(a,b)     { console.log("doing nothing with : " + a + " or b: " + b); }