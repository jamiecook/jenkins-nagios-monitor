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

function convert_service_entry_to_tr(data, left_or_right, height) {
  // console.log(JSON.stringify(data));
  if (data.notifications_enabled == "0") {
    return ""
  } 
  
  var host_and_status = data.plugin_output.split(' - ')[0]
  var status          = "status-" + convert_integer_status_to_string(data.current_state)
  var float_str       = height === "" ? left_or_right : ""
  var class_str       = "class='host-entry " + status + " " + float_str + "' "
  return "<div " + class_str + height + ">" +
    data.current_state + " " + data['host'] + ' ' + host_and_status + 
  "</div>"
}

function toggle_left_right(left_or_right) {
  return left_or_right == "left" ? "right" : "left";
}

function generate_html_from_services(services, fill_height) {
  // console.log(JSON.stringify(services));
  var left_or_right = "left";
  var generated_html = "";
  var height = fill_height ? "style='height: " + (100.0 / services.length) + "%; width: 100%' " : ""
  for (var i=0; i<services.length; ++i) {
    // console.log(JSON.stringify(services[i]));
    generated_html += convert_service_entry_to_tr(services[i], left_or_right, height)
    left_or_right = toggle_left_right(left_or_right);
  }
  return generated_html;
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
    html += "<div class='state-bad' style='height: " + (has_good_state ? "50%" : "100%") + "'>";
    html += generate_html_from_services(services_by_state["bad"], true);
    html += "</div>"
  }
  
  // Good services
  if (services_by_state["good"] !== undefined) {
    html += "<div class='state-good' style='height: " + (has_bad_state ? "50%" : "100%") + "'>";
    html += generate_html_from_services(services_by_state["good"]);
    html += "</div>"
  }
  $('#nagios-api').html(html);
  
  // console.log(JSON.stringify(services_by_state));
  console.log(Object.keys(services_by_state));
  
}

function createSearchBox(url) { console.log("doing nothing with url: " + url); }
function refreshPart(a,b)     { console.log("doing nothing with : " + a + " or b: " + b); }