import styles from '../../styles/ConfigPage.module.scss';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Head from 'next/head';
import Link from 'next/link';
const ENDPOINT = 'http://localhost:3001';
import Select from 'react-select';
import { legends } from '../../util/legends';
import { useRouter } from 'next/router';

export default function ConfigPage() {
	const [socket, setSocket] = useState<Socket>(null);
	const [playerCount, setPlayerCount] = useState(1);
	const [stocksPerPlayer, setStocksPerPlayer] = useState(3);
	const [clans, setClans] = useState<
		[ICBClan<number, string>, ICBClan<number, string>]
	>([
		{ name: 'Clan1', players: Array.from({ length: 10 }, () => ['', '']) },
		{ name: 'Clan2', players: Array.from({ length: 10 }, () => ['', '']) },
	]);
	const [scoresCount, setScoresCount] = useState(0);
	const [scores, setScores] = useState<[number, number][]>(
		Array.from({ length: 100 }, () => [0, 0])
	);

	const {
		query: { id },
	} = useRouter();

	function handleSubmit() {
		if (!socket || !id) return;
		const jsonCB: IJSONCrewBattle<number> = {
			clan1: {
				...clans[0],
				players: clans[0].players.filter((_, i) => i < playerCount),
			},
			clan2: {
				...clans[1],
				players: clans[1].players.filter((_, i) => i < playerCount),
			},
			playerCount,
			scores: scores.filter((_, i) => i < scoresCount),
			stocksPerPlayer,
		};

		socket.emit('newCBData', { channelId: id, ...jsonCB });
	}

	useEffect(() => {
		setSocket(io(ENDPOINT));
	}, [id]);

	useEffect(() => {
		console.log('socket', socket);
		if (!socket) return;

		socket.on('CBData', (data) => {
			if (!data) return;
			try {
				const {
					playerCount,
					stocksPerPlayer,
					clan1,
					clan2,
					scores,
				} = data as IJSONCrewBattle<number>;

				setPlayerCount(playerCount);
				setStocksPerPlayer(stocksPerPlayer);
				setClans([
					{
						...clan1,
						players: [
							...clan1.players,
							...Array.from({ length: 10 - playerCount }, (): [
								string,
								string
							] => ['', '']),
						],
					},
					{
						...clan2,
						players: [
							...clan2.players,
							...Array.from({ length: 10 - playerCount }, (): [
								string,
								string
							] => ['', '']),
						],
					},
				]);
				setScoresCount(scores.length);
				setScores([
					...scores,
					...Array.from({ length: 100 - scoresCount }, (): [
						number,
						number
					] => [0, 0]),
				]);
			} catch (e) {
				console.log(e);
			}
		});

		socket.emit('requestData', { channelId: id });
		console.log('request');
	}, [socket]);

	function updatePlayerValue(
		teamId: number,
		playerIndex: number,
		valueIndex: 0 | 1,
		value: string
	) {
		let newClans: [ICBClan<number, string>, ICBClan<number, string>] = [
			...clans,
		];

		newClans[teamId].players[playerIndex][valueIndex] = value;
		setClans(newClans);
	}

	function updateScores(scoreIndex: number, clanId: 0 | 1, score: number) {
		let newScores: [number, number][] = [...scores];
		newScores[scoreIndex][clanId] = score;
		setScores(newScores);
	}

	return (
		<div className={styles.container}>
			<Head>
				<title>
					{clans[0].name} vs. {clans[1].name} • Config
				</title>
			</Head>
			<h1>Crew Battle Config</h1>
			<div>
				<label>
					<h3>Players In Teams</h3>
					<input
						type='number'
						value={playerCount}
						onChange={(e) => {
							const val = e.target.valueAsNumber;
							setPlayerCount(Math.max(1, Math.min(val, 10)));
						}}
					/>
				</label>
			</div>
			<div>
				<label>
					<h3>Stocks per Player</h3>
					<input
						type='number'
						value={stocksPerPlayer}
						onChange={(e) => {
							const val = e.target.valueAsNumber;
							setStocksPerPlayer(Math.max(1, Math.min(val, 10)));
						}}
					/>
				</label>
			</div>
			<div className={styles.clans}>
				{clans.map((_, clanId) => (
					<div className={styles.clan}>
						<h2>Clan {clanId + 1}</h2>
						<label>
							<h3>Clan Name</h3>
							<input
								className={styles.clanName}
								type='text'
								value={clans[clanId].name}
								onChange={(e) => {
									let newClans: [
										ICBClan<number, string>,
										ICBClan<number, string>
									] = [...clans];
									newClans[clanId].name = e.target.value;
									setClans(newClans);
								}}
							/>
						</label>
						{Array.from({ length: playerCount }, (_, i) => (
							<div className={styles.player}>
								<h3>Player {i + 1}</h3>
								<div>
									<input
										type='text'
										value={clans[clanId].players[i][0]}
										onChange={(e) =>
											updatePlayerValue(
												clanId,
												i,
												0,
												e.target.value
											)
										}
									/>
									<div className={styles.legendsSelect}>
										{clans[clanId].players[i][1] && (
											<img
												width='32px'
												height='32px'
												src={`/legends/${clans[clanId].players[i][1]}.png`}
											/>
										)}
										<Select
											className={styles.select}
											value={{
												value:
													clans[clanId].players[i][1],
												label:
													clans[clanId].players[i][1],
											}}
											options={legends.map((l) => ({
												value: l.bio_name,
												label: l.bio_name,
											}))}
											onChange={(e) =>
												updatePlayerValue(
													clanId,
													i,
													1,
													e.value
												)
											}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				))}
			</div>
			<div className={styles.scores}>
				<h2>Scores</h2>
				<label>
					Scores Count
					<input
						type='number'
						value={scoresCount}
						onChange={(e) => {
							const val = e.target.valueAsNumber;
							setScoresCount(Math.max(0, Math.min(val, 100)));
						}}
					/>
				</label>
				{Array.from({ length: scoresCount }, (_, i) => (
					<div>
						<h3>Match {i + 1}</h3>
						<label>
							<input
								type='number'
								value={scores[i][0]}
								onChange={(e) =>
									updateScores(i, 0, e.target.valueAsNumber)
								}
							/>
						</label>
						<label>
							<input
								type='number'
								value={scores[i][1]}
								onChange={(e) =>
									updateScores(i, 1, e.target.valueAsNumber)
								}
							/>
						</label>
					</div>
				))}
			</div>
			<div className={styles.buttons}>
				<a onClick={handleSubmit} className={styles.submitBtn}>
					Submit
				</a>
				<Link href={`/${id}`}>
					<a target='_blank' className={styles.submitBtn}>
						Open Display Page
					</a>
				</Link>
			</div>
		</div>
	);
}
