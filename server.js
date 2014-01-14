var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var socketIO = require('socket.io');


var nodeStatic = require('node-static');

var staticServer = new nodeStatic.Server("./public/");

var server = http.createServer(function (request, response) {
	staticServer.serve(request, response);
}).listen(8080);


//socket server
var socketServer = socketIO.listen(server);

var sockets = [];
var guestNum = 1;
var nicknames = {};

var rooms = { Room1: [] }; // { room1: [socket.ids], etc }

socketServer.on("connection", function(socket){
	// console.log("connection from ", socket.id);
	sockets.push(socket)

	nicknames[socket.id] = "guest" + guestNum;
	guestNum++;
	rooms.Room1.push(socket.id);

	//client just sends text or change name
	socket.on("click_submit", function(options){

		if (!change_nick(options.form, socket.id)) {

			sockets.forEach(function(s){

				//emit to client
				s.emit("chat_data", {
					room: options.room,
					nickname: nicknames[socket.id],
					chatData: options.form,
				})
			})
		}
	});

	//client wants to change room
	socket.on("join_room", function(options) {
		for (var key in rooms) {
			if (key == options.new_room) {
				rooms[options.new_room].push(socket.id);
			} else {
				rooms[options.new_room] = [socket.id];
			}
		}

		//remove room
		console.log(rooms, options.old_room)
		var room_index = rooms[options.old_room].indexOf(socket.id)
		delete rooms[options.old_room][room_index]

		socket.emit("joined_room", options.new_room);
	});

});

change_nick = function(data, id){
	var new_name = data.slice(6);

	//new name already exists
	for (var key in nicknames) {
		console.log(key, new_name);
		if (nicknames[key] == new_name) return true;
	}

	if (data.slice(0,6) == "/nick "){
		nicknames[id] = new_name;
		return true
	}

	return;
}







console.log('Server running at http://127.0.0.1:8080/');