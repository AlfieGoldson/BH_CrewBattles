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

let interval;

io.on('connection', (socket) => {
	console.log('New client connected');
	if (interval) {
		clearInterval(interval);
	}
	interval = setInterval(() => getApiAndEmit(socket), 1000);
	socket.on('disconnect', () => {
		console.log('Client disconnected');
		clearInterval(interval);
	});
});

const getApiAndEmit = (socket) => {
	try {
		const fileData = fs.readFileSync('./cbtest.json');
		if (!fileData) return;

		JSON.parse(fileData); //TODO: Better test

		socket.emit('CBData', fileData.toString());
	} catch (e) {}
};

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
