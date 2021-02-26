import { ReactNode, useEffect, useState } from 'react';
import { Stage, Layer, Line, Text, Circle, Group, Rect } from 'react-konva';

type CBResult<T extends number> = {
	playerCount: T;
	playerStocks: number;
	teamA: Tuple<string, T>;
	teamB: Tuple<string, T>;
	scores: [teamAScore: number, teamBScore: number][];
};

const testCB: CBResult<3> = {
	playerCount: 3,
	playerStocks: 3,
	teamA: ['teros', 'lucien', 'ada'],
	teamB: ['sentinel', 'fait', 'bodvar'],
	scores: [
		[9, 9],
		[6, 9],
		[3, 9],
		[0, 9],
	],
};

const ySpace = 100;
const col1X = 100;
const col2X = 500;
const stockNodeSize = 25;

function BuildGraph<T extends number>({
	playerCount,
	teamA,
	teamB,
	playerStocks,
	scores,
}: CBResult<T>) {
	let graph: ReactNode[] = [];
	let playerNodes: ReactNode[] = [];

	playerNodes = [teamA, teamB].map((team, teamId) =>
		team.map((p, pId) => (
			<Group>
				<Rect
					x={teamId === 0 ? col1X - 50 : col2X + 50}
					y={playerStocks * (playerCount - pId) * ySpace}
					rotation={teamId === 0 ? -90 : 90}
					width={(playerStocks - 1) * ySpace}
					height={20}
					offsetX={teamId === 0 ? 0 : (playerStocks - 1) * ySpace}
					fill='orange'
				/>
				<Text
					fontSize={16}
					text={p}
					x={teamId === 0 ? col1X - 50 : col2X + 50}
					y={playerStocks * (playerCount - pId) * ySpace}
					rotation={teamId === 0 ? -90 : 90}
					width={(playerStocks - 1) * ySpace}
					height={20}
					align='center'
					verticalAlign='middle'
					offsetX={teamId === 0 ? 0 : (playerStocks - 1) * ySpace}
				/>
				{Array.from({ length: playerStocks }, (_, i) => i + 1).map(
					(n) => (
						<Rect
							fill={
								teamId === 0
									? 'rgb(200, 0, 0)'
									: 'rgb(0, 0, 200)'
							}
							x={teamId === 0 ? col1X : col2X}
							y={(playerStocks * pId + n) * ySpace}
							width={stockNodeSize * 2}
							height={stockNodeSize * 2}
							offsetX={stockNodeSize}
							offsetY={stockNodeSize}
						/>
					)
				)}
			</Group>
		))
	);

	graph = scores.map(([scoreA, scoreB], i) => {
		const iA = playerCount - Math.floor(scoreA / playerStocks);
		const iB = playerCount - Math.floor(scoreB / playerStocks);
		console.log(iA, iB);

		if (i === 0) return null;

		const oldScoreA = scores[i - 1][0];
		const oldScoreB = scores[i - 1][1];
		const sameScoreA = scoreA === oldScoreA;
		const sameScoreB = scoreB === oldScoreB;

		return (
			<Line
				key={i}
				x={0}
				y={0}
				points={[
					col1X - stockNodeSize,
					oldScoreA * ySpace + stockNodeSize,
					col1X + stockNodeSize,
					oldScoreA * ySpace + stockNodeSize,
					col2X - stockNodeSize,
					oldScoreB * ySpace + stockNodeSize,
					col2X + stockNodeSize,
					oldScoreB * ySpace + stockNodeSize,
					...(sameScoreB
						? [
								col2X + stockNodeSize,
								scoreB * ySpace - stockNodeSize,
								col2X - stockNodeSize,
								scoreB * ySpace - stockNodeSize,
						  ]
						: [
								col2X + stockNodeSize,
								(scoreB + 1) * ySpace - stockNodeSize,
								col2X - stockNodeSize,
								(scoreB + 1) * ySpace - stockNodeSize,
						  ]),
					...(sameScoreA
						? [
								col1X + stockNodeSize,
								scoreA * ySpace - stockNodeSize,
								col1X - stockNodeSize,
								scoreA * ySpace - stockNodeSize,
						  ]
						: [
								col1X + stockNodeSize,
								(scoreA + 1) * ySpace - stockNodeSize,
								col1X - stockNodeSize,
								(scoreA + 1) * ySpace - stockNodeSize,
						  ]),
				]}
				closed
				fill='rgba(200, 200, 200, 0.5)'
				// stroke='rgba(40, 40, 40, 0.5)'
				// strokeWidth={1}
			/>
		);
	});

	return (
		<>
			<Layer>{graph}</Layer>
			<Layer>{playerNodes}</Layer>
		</>
	);
}

export default function HomePage() {
	const [cbResult, setCBResult] = useState(testCB);
	// const [isCBValid, setIsCBValid] = useState(false);

	// useEffect(() => {
	// 	let errors: string[] = [];
	// 	console.log(cbResult.teamA.length === cbResult.playerCount);
	// 	if (cbResult.teamA.length !== cbResult.playerCount)
	// 		errors.push(`Team A doesn't havev the right player count`);

	// 	if (cbResult.teamB.length !== cbResult.playerCount)
	// 		errors.push(`Team B doesn't havev the right player count`);

	// 	errors.forEach(console.error);

	// 	setIsCBValid(errors.length > 0);
	// }, [cbResult]);

	return (
		typeof window !== 'undefined' && (
			<>
				{/* <img
					src={`/mapArt/Backgrounds/${mapData.background}`}
					alt='BG'
					className={styles.backgroundImg}
				/> */}
				<Stage
					width={window.innerWidth}
					height={window.innerHeight}
					draggable
				>
					{/* <Layer>
						{[cbResult.teamB, cbResult.teamA].map(
							(team, teamId) => (
								<Group>
									{team.map(([player, stocksTaken], i) => {
										const x = teamId === 0 ? 100 : 500;
										const y = 100 + i * 100;
										return (
											<Group>
												<Circle
													radius={40}
													fill={
														teamId === 0
															? 'rgb(200, 0, 0)'
															: 'rgb(0, 0, 200)'
													}
													x={x}
													y={y}
												/>
												<Text
													text={player}
													x={x}
													y={y}
												/>
											</Group>
										);
									})}
								</Group>
							)
						)}
						<Line
							x={0}
							y={0}
							points={[0, 0, 100, 100]}
							stroke='rgba(40, 40, 40, 0.75)'
							strokeWidth={5}
						/>
					</Layer> */}
					{BuildGraph(cbResult)}
				</Stage>
			</>
		)
	);
}
