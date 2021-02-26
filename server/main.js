const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

app.get('/', (req, res) => {
	res.status(200).send('hello');
});

const server = http.createServer(app);

const io = socketIo(server, {
	cors: {
		origin: '*',
	},
});

let sockets = [];

io.on('connection', (socket) => {
	console.log('New client connected');
	sockets.push(socket);

	socket.on('disconnect', () => {
		console.log('Client disconnected');
		sockets.pop(socket);
	});

	socket.on('newCBData', (data) => {
		try {
			if (!data) return;

			JSON.parse(data); //TODO: Better test

			sockets.forEach((s) => s.emit('CBData', data));
		} catch (e) {}
	});
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
