require 'webrick'

root = File.expand_path 'C:\Users\jamie.cook\Documents\CI'
server = WEBrick::HTTPServer.new :Port => 8000, :DocumentRoot => root

trap 'INT' do server.shutdown end

server.start