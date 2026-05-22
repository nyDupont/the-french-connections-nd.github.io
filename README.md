# The French Connections — Édition Custom

> 🔀 Ceci est un **fork** du projet original [The French Connections](https://github.com/the-french-connections/the-french-connections.github.io) par [the-french-connections](https://github.com/the-french-connections).

Ce fork propose une **version retravaillée** du jeu permettant de créer et publier mes propres puzzles personnalisés, avec quelques modifications d'interface pour transformer le site d'un puzzle quotidien en bibliothèque de puzzles à découvrir librement.

🎮 **[Jouer en ligne](https://nydupont.github.io/the-french-connections-nd.github.io/)**

## À propos du jeu

"The French Connections" est un jeu de mots français basé sur le [jeu Connections du New York Times](https://www.nytimes.com/games/connections), lui-même inspiré du jeu télévisuel anglais [Only Connect](https://kotaku.com/new-york-times-connections-only-connect-puzzle-wordle-1850553072). Le but est de regrouper 16 mots en 4 catégories thématiques de 4 mots chacune.

**Clause de non-responsabilité :** "The French Connections" est un produit indépendant, gratuit et bénévole qui n'est pas affilié au New York Times Company et qui n'a pas été autorisé, parrainé ou approuvé de quelque manière que ce soit par cette dernière. Nous vous encourageons à jouer au jeu quotidien NYT Connections sur le site web du New York Times.

## Différences avec le projet original

Ce fork apporte les modifications suivantes :

- **Bibliothèque de puzzles** : tous les puzzles sont accessibles à tout moment (plus de "puzzle du jour")
- **Sidebar avec tri et filtres** : sélectionne un puzzle par date, titre, difficulté ; filtre par auteurice
- **Compteur d'erreurs** : on peut se tromper autant de fois qu'on veut ; le but est de minimiser les erreurs
- **Structure JSON modulaire** : chaque puzzle est un fichier `.json` dans `src/puzzles/`, ce qui facilite la contribution
- **Interface retravaillée** : récap simplifié, menu de jeux annexes retiré, etc.

## Crédits

Tout le mérite du développement du jeu d'origine revient à l'auteur·rice original·e du projet, qui a créé l'essentiel du code, le design, et la grande majorité des puzzles. Ce fork est non-commercial.

Les puzzles originaux sont sous licence [CC-BY-NC](https://creativecommons.org/share-your-work/cclicenses/) (Creative Commons Attribution - Pas d'Utilisation Commerciale).

## Lancer le projet en local

Prérequis : [Node.js](https://nodejs.org/) version 18 ou supérieure.

```bash
git clone https://github.com/nyDupont/the-french-connections-nd.github.io.git
cd the-french-connections-nd.github.io
npm install --legacy-peer-deps
npm run dev
```

Le jeu sera accessible sur `http://localhost:5173/`.

## Structure des puzzles

Chaque puzzle est un fichier JSON dans `src/puzzles/`, au format :

```json
{
  "puzzle_name": "Nom du puzzle",
  "puzzle_difficulty": 3,
  "puzzle_date": "2026-05-22",
  "author": "Initiales de l'auteurice",
  "additional_text": "",
  "groups": [
    {
      "category": "Catégorie facile",
      "items": ["mot1", "mot2", "mot3", "mot4"],
      "difficulty": 1
    },
    {
      "category": "Catégorie moyenne",
      "items": ["mot5", "mot6", "mot7", "mot8"],
      "difficulty": 2
    },
    {
      "category": "Catégorie difficile",
      "items": ["mot9", "mot10", "mot11", "mot12"],
      "difficulty": 3
    },
    {
      "category": "Catégorie très difficile",
      "items": ["mot13", "mot14", "mot15", "mot16"],
      "difficulty": 4
    }
  ]
}
```

Les difficultés 1 à 4 correspondent aux couleurs jaune, vert, bleu, violet (de la plus facile à la plus difficile).
