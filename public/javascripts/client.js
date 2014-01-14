var socket = io.connect();

socket.on("connect", function() {
	console.log("socket connected!");
});

$(function(){
	$('#chat_submit').on("click", function(event){
		event.preventDefault();

		var current_room = $('#room_name').text()

		var form_data = $('#chat_text').val()

		//emit to server room name
		if (form_data.slice(0,6) == "/join ") {
			socket.emit("join_room", {
				new_room: form_data.slice(6),
				old_room: current_room
			})
		}
		//emit to server chat text data
		else {
			socket.emit("click_submit", {
				form: form_data,
				room: current_room
			});
			$('#chat_text').val("");
		}
	})

	//emit from server
	socket.on("chat_data", function(options){
		var room = options.room;
		$('#chatbox.' + room).append("<li>" +
			options.nickname + ": " + options.chatData);
	})

	socket.on("joined_room", function(roomName) {
		$("#chatbox").empty();
		$("#chatbox").addClass(roomName);
		$("#room_name").text(roomName);
	});
})
