import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

function getCrewBattle<
	NPlayers extends number,
	Clan1Name extends string,
	Clan1 extends ICBClan<NPlayers, Clan1Name>,
	Clan2Name extends string,
	Clan2 extends ICBClan<NPlayers, Clan2Name>
>(
	playerCount: NPlayers,
	stocksPerPlayer: number,
	clan1: Clan1,
	clan2: Clan2,
	scores: [number, number][]
): ICrewBattle<NPlayers, Clan1Name, Clan1, Clan2Name, Clan2> {
	const matches = scores
		.map(
			([s1, s2], i): CBMatch<Clan1Name, Clan2Name> => {
				if (i === 0) return null;

				const [prevS1, prevS2] = scores[i - 1];

				const p1 =
					clan1.players[
						playerCount - Math.ceil(prevS1 / stocksPerPlayer)
					]; //TODO: undefined if 0 stocks remaining
				const p2 =
					clan2.players[
						playerCount - Math.ceil(prevS2 / stocksPerPlayer)
					];

				return {
					player1: {
						name: p1[0],
						startingStocks:
							prevS1 % stocksPerPlayer || stocksPerPlayer,
						legend: p1[1], // TODO: change legend name
						score: prevS2 - s2,
						teamScore: s1,
					},
					player2: {
						name: p2[0],
						startingStocks:
							prevS2 % stocksPerPlayer || stocksPerPlayer,
						legend: p2[1], // TODO: change legend name
						score: prevS1 - s1,
						teamScore: s2,
					},
				};
			}
		)
		.slice(1);

	return {
		clan1,
		clan2,
		matches,
		stocksPerPlayer,
		currentScore: scores.length > 0 ? scores[scores.length - 1] : [0, 0],
		scores,
	};
}

export function useCB() {
	const [socket, setSocket] = useState<Socket>(null);
	const [CB, setCB] = useState<
		ICrewBattle<
			number,
			string,
			ICBClan<number, string>,
			string,
			ICBClan<number, string>
		>
	>(null);

	const {
		query: { id },
	} = useRouter();

	useEffect(() => {
		setSocket(io(process.env.NEXT_PUBLIC_SERVER_ENDPOINT));
	}, [id]);

	useEffect(() => {
		if (!socket) return;

		socket.on('CBData', (data) => {
			console.log(data);
			if (!data) return;
			try {
				const {
					playerCount,
					stocksPerPlayer,
					clan1,
					clan2,
					scores,
				} = data as IJSONCrewBattle<number>;

				setCB(
					getCrewBattle(
						playerCount,
						stocksPerPlayer,
						clan1,
						clan2,
						scores
					)
				);
			} catch (e) {
				console.log(e);
			}
		});

		socket.emit('requestData', { channelId: id });
	}, [socket]);

	return { CB, socket };
}
