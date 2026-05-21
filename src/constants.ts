import { PuzzleImport } from './App';

// The puzzles I created (without anything in the 'author' field) are under Creative Commons CC-BY-NC licence (https://creativecommons.org/share-your-work/cclicenses/)
// Puzzle with an author field allow me to post their puzzle on the website.

export const all_puzzles: PuzzleImport[] = [
        {
        puzzle_name: 'Custom 4',
        puzzle_difficulty: 4,
        puzzle_date: new Date('2026-05-22'),
        author: '',
        additional_text: '',
        groups: [
            {
                
                category: 'Latitudes remarquables',
                items: ['équateur', 'capricorne', 'cancer', 'arctique'],
                difficulty: 1,
            },
            {
                category: 'Villes gagnées par LFI en 2026',
                items: ['creil', 'la courneuve', 'roubaix', 'saint-denis'],
                difficulty: 2,
            },
            {
                category: 'Candidats historiques au méridien 0',
                items: ['paris', 'greenwitch', 'toldède', 'uppsala'],
                difficulty: 3,
            },

            {
                category: 'Stations du métro parisien',
                items: ['anvers', 'liège', 'pyrénnées', 'rennes'],
                difficulty: 4,
            }
        ]
    },
    {
        puzzle_name: 'Custom 3',
        puzzle_difficulty: 4,
        puzzle_date: new Date('2026-05-21'),
        author: '',
        additional_text: '',
        groups: [
            {
                
                category: 'Taxes',
                items: ['zucman', 'foncière', 'séjour', 'carbone'],
                difficulty: 1,
            },
            {
                category: 'Doré',
                items: ['or', 'pyrite', 'julien', 'staphylocoque'],
                difficulty: 2,
            },
            {
                category: 'Symbolisé par un lion',
                items: ['peugeot', 'gryffondor', 'MGM', 'flandres'],
                difficulty: 3,
            },
            {
                category: '_ + Gate(s)',
                items: ['bill', 'benjamin', 'golden', 'water'],
                difficulty: 4,
            }
        ]
    },
    {
        puzzle_name: 'Custom 2',
        puzzle_difficulty: 3,
        puzzle_date: new Date('2026-05-20'),
        author: '',
        additional_text: '',
        groups: [
            {
                
                category: 'Caractéristiques de la lumière',
                items: ['polarisation', 'intensité', 'fréquence', 'longueur d\'onde'],
                difficulty: 1,
            },
            {
                category: 'Lentilles',
                items: ['coco', 'fresnel', 'convergente', 'verte'],
                difficulty: 2,
            },
            {
                category: 'Caps nautiques',
                items: ['Leeuwin', 'Horn', 'Gris-Nez', 'Corse'],
                difficulty: 3,
            },
            {
                category: 'Caractéristiques de marée',
                items: ['haute', 'force', 'estran', 'coefficient'],
                difficulty: 4,
            }
        ]
    },
    {
        puzzle_name: 'Custom 1',
        puzzle_difficulty: 3,
        puzzle_date: new Date('2026-05-19'),
        author: '',
        additional_text: '',
        groups: [
            {
                category: 'Préparations fromagères',
                items: ['soufflé', 'gougère', 'croquette', 'aligot'],
                difficulty: 1,
            },
            {
                
                category: 'Personne qui a une haute opinion de soi',
                items: ['m\'as-tu-vu', 'cacou', 'cake', 'kéké'],
                difficulty: 2,
            },
            {
                category: 'Objectifs photographiques',
                items: ['macro', 'zoom', 'fish-eye', 'soufflet'],
                difficulty: 3,
            },
            {
                category: 'Psychotropes',
                items: ['tabac', 'maté', 'cacao', 'kola'],
                difficulty: 4,
            }
        ]
    }
];
