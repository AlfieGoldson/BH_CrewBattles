import styles from '../../styles/Overlay.module.scss';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useCB } from '../../hooks/useCB';

function MatchOverlay({
	match,
}: {
	match: CBMatch<string, string>;
	clan1: ICBClan<number, string>;
	clan2: ICBClan<number, string>;
}) {
	return (
		<motion.div
			className={styles.overlay}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
		>
			<div className={styles.legend1}>
				<img src={`/legends/${match.player1.legend}.png`} />
			</div>
			<p className={styles.name1}>{match.player1.name}</p>
			<p className={styles.score1}>{match.player1.score}</p>
			<p className={styles.score2}>{match.player2.score}</p>
			<p className={styles.name2}>{match.player2.name}</p>
			<div className={styles.legend2}>
				<img src={`/legends/${match.player2.legend}.png`} />
			</div>
		</motion.div>
	);
}

export default function CBPage() {
	const { CB } = useCB();

	return (
		CB && (
			<>
				<Head>
					<title>
						{CB.clan1.name} vs. {CB.clan2.name}
					</title>
				</Head>
				<div className={styles.container}>
					{CB.matches.length > 0 && (
						<MatchOverlay
							match={CB.matches[CB.matches.length - 1]}
							clan1={CB.clan1}
							clan2={CB.clan2}
						/>
					)}
				</div>
			</>
		)
	);
}
