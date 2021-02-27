type Tuple<T, N extends number> = N extends N
	? number extends N
		? T[]
		: _TupleOf<T, N, []>
	: never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
	? R
	: _TupleOf<T, N, [T, ...R]>;

interface ICBPlayer<PlayerName extends string> {
	name: PlayerName;
	startingStocks: number;
	score: number;
	teamScore: number;
	legend: string;
}

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

interface IJSONCrewBattle<NPlayers extends number> {
	playerCount: number;
	stocksPerPlayer: number;
	clan1: ICBClan<NPlayers, string>;
	clan2: ICBClan<NPlayers, string>;
	scores: [number, number][];
}
