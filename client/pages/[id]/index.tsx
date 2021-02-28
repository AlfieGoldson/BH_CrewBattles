import { useEffect, useState } from 'react';
import { Match } from '../../components/Match';
import styles from '../../styles/CB.module.scss';
import Head from 'next/head';
import { io } from 'socket.io-client';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

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
	};
}

export default function CBPage() {
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
		const socket = io(process.env.NEXT_PUBLIC_SERVER_ENDPOINT);

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

				console.log('????');
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
	}, [id]);

	return (
		CB && (
			<>
				<Head>
					<title>
						{CB.clan1.name} vs. {CB.clan2.name}
					</title>
				</Head>
				<div className={styles.container}>
					<div className={styles.main}>
						<motion.div
							className={styles.logo}
							initial={{ opacity: 0, y: -200 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<img src='/Logo.png' />
						</motion.div>
						<motion.div
							className={styles.currentScore}
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
						>
							<motion.p
								className={styles.clan1}
								initial={{ x: -320 }}
								animate={{ x: 0 }}
							>
								{CB.clan1.name}
							</motion.p>
							<p className={styles.score}>
								{CB.currentScore[0]} - {CB.currentScore[1]}
							</p>
							<motion.p
								className={styles.clan2}
								initial={{ x: 320 }}
								animate={{ x: 0 }}
							>
								{CB.clan2.name}
							</motion.p>
						</motion.div>
						<div className={styles.players}>
							{[CB.clan1, CB.clan2].map((clan, clanId) => (
								<div>
									{clan.players.map((p) => {
										const totalStocks = CB.matches
											.filter(
												(m) =>
													(clanId === 0
														? m.player1.name
														: m.player2.name) ===
													p[0]
											)
											.reduce(
												(acc, m) =>
													acc +
													(clanId === 0
														? m.player1.score
														: m.player2.score),
												0
											);

										return (
											<div className={styles.playerName}>
												<img
													width='32px'
													height='32px'
													src={`/legends/${p[1]}.png`}
												/>
												<p>
													{p[0]} - {totalStocks} Stock
													{totalStocks <= 1
														? ''
														: 's'}{' '}
													Taken
												</p>
											</div>
										);
									})}
								</div>
							))}
						</div>
					</div>
					<div className={styles.sets}>
						<div className={styles.setsHeader}>
							<p>{CB.clan1.name}</p>
							<div className={styles.separator}></div>
							<p>{CB.clan2.name}</p>
						</div>
						{CB.matches.map((m, i) => (
							<Match
								maxStocks={CB.stocksPerPlayer}
								player1={m.player1}
								player2={m.player2}
								matchId={i}
							/>
						))}
					</div>
				</div>
			</>
		)
	);
}
