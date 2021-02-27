import { motion } from 'framer-motion';
import styles from './Match.module.scss';

interface Props<Clan1Name extends string, Clan2Name extends string> {
	player1: ICBPlayer<Clan1Name>;
	player2: ICBPlayer<Clan2Name>;
	maxStocks: number;
	matchId: number;
}

function Stocks({ stocks, maxStocks }: { stocks: number; maxStocks: number }) {
	let stocksNodes: React.ReactNode[] = [];

	for (let i = 0; i < maxStocks; i++) {
		stocksNodes.push(
			i < stocks ? (
				<div className={styles.filled} />
			) : (
				<div className={styles.empty} />
			)
		);
	}

	return <div className={styles.stocks}>{stocksNodes}</div>;
}

export function Match<Clan1Name extends string, Clan2Name extends string>({
	player1,
	player2,
	maxStocks,
	matchId,
}: Props<Clan1Name, Clan2Name>) {
	return (
		<motion.div
			className={styles.container}
			initial={{ opacity: 0, y: -100 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: matchId / 10 }}
		>
			<div className={styles.player}>
				<img src={`/legends/${player1.legend}.png`} />
				{player1.name}
			</div>
			<div className={styles.setScore}>
				{player1.score} - {player2.score}
			</div>
			<div className={styles.player}>
				<img src={`/legends/${player2.legend}.png`} />
				{player2.name}
			</div>

			<Stocks stocks={player1.startingStocks} maxStocks={maxStocks} />
			<div className={styles.teamsScore}>
				{player1.teamScore} - {player2.teamScore}
			</div>
			<Stocks stocks={player2.startingStocks} maxStocks={maxStocks} />
		</motion.div>
	);
}
