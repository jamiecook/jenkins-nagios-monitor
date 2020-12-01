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
  return $($.parseHTML(content.replace('width: 99vw !important;', ''))).filter('#page-body')[0];
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

function generate_html_from_services(services_lookup, good_bad, div_height_abs, div_height_rel) {
  var services       = services_lookup[good_bad];
  var generated_html = "<div class='state-"+good_bad+"' style='height: " + div_height_rel + "%'>";
  var width          = good_bad == "good" ? "47.5%" : "98%"
  var element_height = div_height_abs / services.length;
  console.log("element_height = " + element_height)
  if (good_bad == "good") {
    element_height *= 2;
  }
  console.log("element_height = " + element_height)
  var style = "style='height: " + element_height + "px; width: " + width + "' "
  console.log("num of elements = " + services.length)
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
        if (service.notifications_enabled == "0") { 
           console.log("skipping " + host + ":" + service_name);
           continue; 
        }
        service['host'] = host;
        service['service'] = service_name;
        service_entries.push(service);
      }
  }
  
  // $('#nagios-api').html(generate_html_from_services(service_entries));
  
  var html = "";
  var services_by_state = _.groupBy(service_entries, function (e) { return e['current_state'] === "0" ? "good" : "bad" });
  var has_bad_state = (services_by_state["bad"] !== undefined);
  var has_good_state = (services_by_state["bad"] !== undefined);
  
  if (services_by_state["bad"] !== undefined) {
    var div_height_abs = $(window).height() / (has_good_state ? 2.0 : 1.0);
    var div_height_rel = 100.0 / (has_good_state ? 2.0 : 1.0);
    console.log("------------------- bad services -------------------")
    console.log(JSON.stringify(services_by_state["bad"]))
    console.log("----------------------------------------------------")
    html += generate_html_from_services(services_by_state, "bad", div_height_abs, div_height_rel);
  }
  
  // Good services
  if (services_by_state["good"] !== undefined) {
    console.log("window height: " + $(window).height())
    console.log("nagios-api div height: " + $('#nagios-api').height())
    var div_height_abs = $(window).height() / (has_bad_state ? 2.0 : 1.0);
    console.log("div_height_absolute: " + div_height_abs)
    var div_height_rel = 100.0 / (has_good_state ? 2.0 : 1.0);
    console.log("div_height_relative: " + div_height_rel)
    html += generate_html_from_services(services_by_state, "good", div_height_abs, div_height_rel);
  }
  $('#nagios-api').html(html);
  
  // console.log(JSON.stringify(services_by_state));
  console.log(Object.keys(services_by_state));
  
}

function createSearchBox(url) { console.log("doing nothing with url: " + url); }
function refreshPart(a,b)     { console.log("doing nothing with : " + a + " or b: " + b); }
