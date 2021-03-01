import styles from '../styles/HomePage.module.scss';
import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
	const [CBName, setCBName] = useState('');

	console.log(process.env.NEXT_PUBLIC_SERVER_ENDPOINT);

	return (
		<div className={styles.container}>
			<p>
				Crew Battle Name:
				<input
					className={styles.cbNameInput}
					type='text'
					value={CBName}
					onChange={(e) =>
						setCBName(e.target.value.replace(/\s/g, '_'))
					}
				/>
			</p>
			{CBName && (
				<Link href={`/${CBName}`}>
					<a className={styles.cbLink}>
						Config <span className={styles.cbName}>{CBName}</span>{' '}
						Crew Battle
					</a>
				</Link>
			)}
		</div>
	);
}
