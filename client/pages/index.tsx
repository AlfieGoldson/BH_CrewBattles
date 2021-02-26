import { useEffect, useState } from 'react';
import { Match, ICBPlayer } from '../components/Match';
import styles from '../styles/CB.module.scss';

import { io } from 'socket.io-client';
const ENDPOINT = 'http://localhost:3001';

interface ICBClan<NPlayers extends number, PlayerName extends string> {
	name: string;
	players: Tuple<[name: PlayerName, legend: string], NPlayers>;
}

interface CBMatch<Clan1Name extends string, Clan2Name extends string> {
	player1: ICBPlayer<Clan1Name>;
	player2: ICBPlayer<Clan2Name>;
}

interface ICrewBattle<
	NPlayers extends number,
	Clan1Name extends string,
	Clan1 extends ICBClan<NPlayers, Clan1Name>,
	Clan2Name extends string,
	Clan2 extends ICBClan<NPlayers, Clan2Name>
> {
	clan1: Clan1;
	clan2: Clan2;
	matches: CBMatch<Clan1Name, Clan2Name>[];
	stocksPerPlayer: number;
}

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

	return { clan1, clan2, matches, stocksPerPlayer };
}

export default function CBPage() {
	useEffect(() => {
		const socket = io(ENDPOINT);
		socket.on('CBData', (data) => {
			if (!data) return;
			try {
				const {
					playerCount,
					stocksPerPlayer,
					clan1,
					clan2,
					scores,
				} = JSON.parse(data);
				setCB(
					getCrewBattle(
						playerCount,
						stocksPerPlayer,
						clan1,
						clan2,
						scores
					)
				);
			} catch (e) {}
		});
	}, []);

	const [CB, setCB] = useState<
		ICrewBattle<
			number,
			string,
			ICBClan<number, string>,
			string,
			ICBClan<number, string>
		>
	>(null);

	return (
		CB && (
			<div className={styles.container}>
				<div className={styles.main}>
					<div>LOGO</div>
					<div>SCORE</div>
					<div>TEAMS</div>
				</div>
				<div className={styles.sets}>
					<div className={styles.setsHeader}>
						<p>{CB.clan1.name}</p>
						<div className={styles.separator}></div>
						<p>{CB.clan2.name}</p>
					</div>
					{CB.matches.map((m) => (
						<Match
							maxStocks={CB.stocksPerPlayer}
							player1={m.player1}
							player2={m.player2}
						/>
					))}
				</div>
			</div>
		)
	);
}
