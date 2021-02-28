const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_URL);

redisClient.on('error', function (error) {
	console.error(error);
});

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

			redisClient.del(channelId);
			redisClient.set(channelId, JSON.stringify(newData), () => {
				console.log(newData);
				sockets
					.filter((s) => s.channelId === channelId)
					.forEach((s) => s.socket.emit('CBData', newData));
			});

			redisClient.get(channelId, redis.print);
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

		redisClient.get(channelId, (e, cbData) => {
			if (e) return;
			if (!cbData) return;
			try {
				socket.emit('CBData', JSON.parse(cbData));
			} catch (e) {}
		});
	});
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
