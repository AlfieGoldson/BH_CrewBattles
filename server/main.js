const express = require('express');
const http = require('http');
const { parse } = require('path');
const socketIo = require('socket.io');

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
let cbData = {};

io.on('connection', (socket) => {
	console.log('New client connected');

	socket.on('disconnect', () => {
		console.log('Client disconnected');
		sockets = sockets.filter((s) => s.socket !== socket);
	});

	socket.on('newCBData', (data) => {
		try {
			if (!data) return;

			const { channelId, ...newData } = data;

			if (!channelId) return;

			console.log(`Received Data, ID: ${channelId}`);

			cbData = { ...cbData, [channelId]: newData };

			sockets
				.filter((s) => s.channelId === channelId)
				.forEach((s) => s.socket.emit('CBData', newData));
		} catch (e) {
			console.error(e);
		}
	});

	socket.on('requestData', (data) => {
		const { channelId } = data;
		if (!channelId) return;

		console.log('request', channelId);

		sockets = [
			...sockets.filter((s) => s.socket !== socket),
			{ socket, channelId },
		];

		console.log(sockets);

		if (!cbData[channelId]) return;

		console.log(cbData[channelId]);

		socket.emit('CBData', cbData[channelId]);
	});
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
