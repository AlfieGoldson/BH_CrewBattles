import { Match } from '../../components/Match';
import styles from '../../styles/CB.module.scss';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useCB } from '../../hooks/useCB';

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
