import { PuzzleImport } from './App';

// All puzzles live as JSON files in ./puzzles/
// Vite's import.meta.glob discovers them at build time.
// Each JSON file's puzzle_date is an ISO string ("YYYY-MM-DD"),
// which we convert to a real Date object here.

type PuzzleJson = Omit<PuzzleImport, 'puzzle_date'> & { puzzle_date: string };

const puzzleModules = import.meta.glob<{ default: PuzzleJson }>(
    './puzzles/*.json',
    { eager: true }
);

export const all_puzzles: PuzzleImport[] = Object.values(puzzleModules)
    .map((mod) => ({
        ...mod.default,
        puzzle_date: new Date(mod.default.puzzle_date),
    }))
    .sort((a, b) => b.puzzle_date.getTime() - a.puzzle_date.getTime());
