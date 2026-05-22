/**
 * This code is partially based on dbousamra's Connections clone: https://github.com/dbousamra/connections.
 */
import * as React from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    ChakraProvider,
    Divider,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    HStack,
    Heading,
    IconButton,
    ListItem,
    Modal,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    ModalHeader,
    ModalOverlay,
    Select,
    Stack,
    Text,
    UnorderedList,
    VStack,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import {
    HamburgerIcon,
    StarIcon,
    TriangleDownIcon,
    TriangleUpIcon,
} from '@chakra-ui/icons';
// import { useState, useRef, useEffect } from 'react';
import { useState } from 'react';
import useMethods from 'use-methods';
import { all_puzzles } from './constants.ts';

export type Group = {
    category: string;
    items: string[];
    difficulty: 1 | 2 | 3 | 4;
};

export type PuzzleImport = {
    puzzle_name: string;
    puzzle_difficulty: number;
    puzzle_date: Date;
    author: string;
    additional_text: string;
    groups: Group[];
};


type Options = {
    groups: Group[];
};

type State = {
    difficulty: number,//Current puzzle's difficulty
    date: Date,//Date of availability
    author: string,//Puzzle's author
    additional_text: string,//Additional text/note
    groups: Group[],//List of current puzzle groups
    complete: Group[],//All completed groups
    incomplete: Group[],//All non-completed groups
    items: string[],
    activeItems: string[],//Items currently selected
    mistakesRemaining: number,//Number of mistakes remaining
    oneAway: boolean,//Whether current guess is "One away" (3 out of 4 words in a category)
    guesses: string[][],//History of all guesses
    discoveredCategories: number[],//Store the order of discovered categories (only used to check if the guess is "perfect" (yellow -> purple), "reverse perfect" (purple -> yellow)...)
    alreadyGuessed: boolean,//Whether current guess was already guessed
    guessWasWrong: boolean,//Whether current guess was wrong
    isFinished: boolean,//Whether the game ended
    emojiFromGuesses: string[],//Store the value of guesses as emojis (colored circles)
    current_name: string,//Current puzzle's name
};

// Assign a color for each level of difficulty
const difficultyColor = (difficulty: 1 | 2 | 3 | 4): string => {
    return {
        1: '#fbd400',
        2: '#b5e352',
        3: '#729eeb',
        4: '#bc70c4',
    }[difficulty];
};

const chunk = <T,>(list: T[], size: number): T[][] => {
    const chunkCount = Math.ceil(list.length / size);
    return new Array(chunkCount).fill(null).map((_c: null, i: number) => {
        return list.slice(i * size, i * size + size);
    });
};

const shuffle = <T,>(list: T[]): T[] => {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
};

const methods = (state: State) => {
    return {
        update(newPuzzle: PuzzleImport) {
            state.difficulty = newPuzzle.puzzle_difficulty;
            state.date = newPuzzle.puzzle_date;
            state.author = newPuzzle.author;
            state.additional_text = newPuzzle.additional_text;
            state.groups = newPuzzle.groups;
            state.incomplete = newPuzzle.groups;
            state.complete = [];
            state.items = shuffle(newPuzzle.groups.flatMap((g) => g.items));
            state.activeItems = [];
            state.mistakesRemaining = 4;
            state.oneAway = false;
            state.guesses = [];
            state.discoveredCategories = [];
            state.alreadyGuessed = false;
            state.guessWasWrong = false;
            state.isFinished = false;
            state.emojiFromGuesses = [];
            state.current_name = newPuzzle.puzzle_name;
        },

        toggleActive(item: string) {
            state.guessWasWrong = false;
            state.oneAway = false;
            state.alreadyGuessed = false;
            if (state.activeItems.includes(item)) {
                state.activeItems = state.activeItems.filter((i) => i !== item);
            } else if (state.activeItems.length < 4) {
                state.activeItems.push(item);
            }
        },

        shuffle() {
            shuffle(state.items);
        },

        deselectAll() {
            state.activeItems = [];
        },

        submit() {
            const foundGroup = state.incomplete.map((group) => ({
                group,
                matchingItems: group.items.filter((item) => state.activeItems.includes(item))
            }));

            const currentGuesses: string[] = [];
            for (let next_group of foundGroup) {
                if (next_group.matchingItems.length > 0) {
                    for (let next_item of next_group.matchingItems) {
                        currentGuesses.push(next_item);
                    }
                }
            }

            // If it was already guessed, push the alarm, if not store the guess
            for (let guess of state.guesses) {
                const sortedArr1 = guess.slice().sort();
                const sortedArr2 = currentGuesses.slice().sort();
                if (JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2)) {
                    state.alreadyGuessed = true;
                    break;
                }
            }
            if (!state.alreadyGuessed) {
                state.guesses.push(currentGuesses);

                for (let next_group of foundGroup) {
                    if (next_group.matchingItems.length === 4) {
                        state.complete.push(next_group.group);
                        const incomplete = state.incomplete.filter((group) => group !== next_group.group);
                        state.incomplete = incomplete;
                        state.items = state.items.filter(item => !next_group.matchingItems.includes(item));//incomplete.flatMap((group) => group.items);
                        state.activeItems = [];
                        state.discoveredCategories.push(next_group.group.difficulty);

                        // Check if all categories were discovered. If yes, this is the end!
                        if (state.incomplete.length === 0) {
                            state.isFinished = true;
                            this.getEmojiFromGuesses();
                        }
                        return;
                    } else {
                        if (next_group.matchingItems.length === 3) {
                            state.oneAway = true;
                        }
                    }
                }

                state.guessWasWrong = true;
                state.mistakesRemaining -= 1;
            }

            state.activeItems = [];

            // terminait le jeu après 4 erreurs
            // if (state.mistakesRemaining === 0) { 
            //     state.complete = state.complete.concat(state.incomplete);
            //     state.incomplete = [];
            //     state.items = [];
            //     state.isFinished = true;
            //     this.getEmojiFromGuesses();
            // }
        },

        getEmojiFromGuesses() {
            for (const guessList of state.guesses) {
                for (const guess of guessList) {
                    for (const grp of state.groups) {
                        if (grp.items.includes(guess)) {
                            switch (grp.difficulty) {
                                case 1:
                                    state.emojiFromGuesses.push('&#128993;');
                                    break;
                                case 2:
                                    state.emojiFromGuesses.push('&#128994;');
                                    break;
                                case 3:
                                    state.emojiFromGuesses.push('&#128309;');
                                    break;
                                case 4:
                                    state.emojiFromGuesses.push('&#128995;');
                                    break;
                                default:
                                    state.emojiFromGuesses.push('&#9633;');
                                    break;
                            }
                        }
                    }
                }
            }
        },
    };
};

const useGame = (options: Options, difficulty: number, date: Date, author: string, additional_text: string, current_name: string) => {
    const initialState: State = {
        difficulty: difficulty,
        date: date,
        author: author,
        additional_text: additional_text,
        groups: options.groups,
        incomplete: options.groups,
        complete: [],
        items: shuffle(options.groups.flatMap((g) => g.items)),
        activeItems: [],
        mistakesRemaining: 4,
        oneAway: false,
        guesses: [],
        discoveredCategories: [],
        alreadyGuessed: false,
        guessWasWrong: false,
        isFinished: false,
        emojiFromGuesses: [],
        current_name: current_name,
    };

    const [state, fns] = useMethods(methods, initialState);

    return {
        ...state,
        ...fns,
    };
};

export const App = () => {
    // const currentDate = new Date();
    // const all_groups_name = all_puzzles.filter((puzzle) => puzzle.puzzle_date <= currentDate);
    const all_groups_name = all_puzzles; // even future puzzle are available
    const current_puzzle = all_groups_name[0];
    // const ending_text = `The French Connections #${all_groups_name.length}. Prochains puzzles quand j'aurai du temps.`;

    const game = useGame({
        groups: current_puzzle.groups,
    },
        current_puzzle.puzzle_difficulty,
        current_puzzle.puzzle_date,
        current_puzzle.author,
        current_puzzle.additional_text,
        current_puzzle.puzzle_name
    );

const handleMenuItemClick = (puzzleImport: PuzzleImport) => {
        game.update(puzzleImport);
        setIsOpenResults(false);
    };

    // const [showBanner, setShowBanner] = useState(true);

    // const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    // const selectedItemRef = useRef(null);
    // const menuListRef = useRef(null);

    // // Find currently selected puzzle's index
    // const currentIndex = all_groups_name.findIndex(
    //     (item) => item.puzzle_name === game.current_name
    // );

    const toast = useToast();

    const [isOpenRules, setIsOpenRules] = useState(false);
    const [isOpenResults, setIsOpenResults] = useState(false);

    const [showBanner, setShowBanner] = useState(true);

    // Drawer (panneau coulissant) pour mobile
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
    // Sur desktop large, on affiche un sidebar permanent ; sur mobile, un drawer
    // const isDesktop = useBreakpointValue({ base: false, lg: true });

    // États pour le tri et les filtres du sidebar
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'difficulty'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    // Sens par défaut pour chaque critère de tri
    const defaultSortDir: Record<'date' | 'name' | 'difficulty', 'asc' | 'desc'> = {
        date: 'desc',
        name: 'asc',
        difficulty: 'asc',
    };

    // Quand on clique sur un critère : si c'est déjà le critère actif, on inverse le sens ;
    // sinon on change de critère et on remet le sens par défaut.
    const handleSortClick = (criterion: 'date' | 'name' | 'difficulty') => {
        if (sortBy === criterion) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(criterion);
            setSortDir(defaultSortDir[criterion]);
        }
    };

    const [filterAuthor, setFilterAuthor] = useState<string>('');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('');

    // Liste unique des auteurs (pour le filtre)
    const uniqueAuthors = Array.from(
        new Set(all_groups_name.map((p) => p.author).filter((a) => a !== ''))
    ).sort();

    // Applique filtres puis tri
    const displayedPuzzles = all_groups_name
        .filter((p) => {
            if (filterAuthor && p.author !== filterAuthor) return false;
            if (filterDifficulty && String(p.puzzle_difficulty) !== filterDifficulty) return false;
            return true;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'date') cmp = a.puzzle_date.getTime() - b.puzzle_date.getTime();
            else if (sortBy === 'name') cmp = a.puzzle_name.localeCompare(b.puzzle_name, 'fr');
            else if (sortBy === 'difficulty') cmp = a.puzzle_difficulty - b.puzzle_difficulty;
            return sortDir === 'asc' ? cmp : -cmp;
        });

    const handleCloseRules = () => setIsOpenRules(false);
    const handleCloseResults = () => setIsOpenResults(false);

    const containsHtmlTags = (str: string) => /<[^>]*>/g.test(str);

    const PuzzleControls = () => (
        <VStack align="stretch" spacing={3} mb={3}>
            <Box>
                <Text fontSize="xs" fontWeight="semibold" mb={1}>Trier par</Text>
                <HStack spacing={1}>
                    {(['date', 'name', 'difficulty'] as const).map((criterion) => {
                        const labels = { date: 'Date', name: 'Titre', difficulty: 'Difficulté' };
                        const isActive = sortBy === criterion;
                        return (
                            <Button
                                key={criterion}
                                size="xs"
                                variant={isActive ? 'solid' : 'outline'}
                                bg={isActive ? '#729eeb' : 'transparent'}
                                color={isActive ? 'white' : 'gray.700'}
                                borderColor={isActive ? '#729eeb' : 'gray.300'}
                                _hover={{
                                    bg: isActive ? '#5a87d4' : 'gray.100'
                                }}
                                onClick={() => handleSortClick(criterion)}
                                iconSpacing="0.2rem"
                                rightIcon={
                                    isActive ? (
                                        sortDir === 'asc'
                                            ? <TriangleUpIcon boxSize="0.8em" mt="-4px" />
                                            : <TriangleDownIcon boxSize="0.8em" mt="-3px" />
                                    ) : undefined
                                }
                            >
                                {labels[criterion]}
                            </Button>
                        );
                    })}
                </HStack>
            </Box>
            <Box>
                <Text fontSize="xs" fontWeight="semibold" mb={1}>Filtrer par difficulté</Text>
                <Select
                    size="sm"
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                    <option value="">Toutes</option>
                    <option value="1">1 étoile</option>
                    <option value="2">2 étoiles</option>
                    <option value="3">3 étoiles</option>
                    <option value="4">4 étoiles</option>
                    <option value="5">5 étoiles</option>
                </Select>
            </Box>
            {uniqueAuthors.length > 1 && (
                <Box>
                    <Text fontSize="xs" fontWeight="semibold" mb={1}>Filtrer par auteur</Text>
                    <Select
                        size="sm"
                        value={filterAuthor}
                        onChange={(e) => setFilterAuthor(e.target.value)}
                    >
                        <option value="">Tous</option>
                        {uniqueAuthors.map((author) => (
                            <option key={author} value={author}>{author}</option>
                        ))}
                    </Select>
                </Box>
            )}
            <Divider />
        </VStack>
    );

    const PuzzleList = () => (
        <VStack align="stretch" spacing={1} w="100%">
            {displayedPuzzles.map((puzzle: PuzzleImport) => {
                const isCurrent = puzzle.puzzle_name === game.current_name;
                return (
                    <Box
                        key={puzzle.puzzle_name}
                        as="button"
                        onClick={() => {
                            handleMenuItemClick(puzzle);
                            onDrawerClose();
                        }}
                        textAlign="left"
                        px={3}
                        py={2}
                        borderRadius="md"
                        bg={isCurrent ? "#efefe6" : "transparent"}
                        // color={isCurrent ? "white" : "inherit"}
                        fontWeight={isCurrent ? "bold" : "normal"}
                        _hover={{ bg: isCurrent ? "#efefe6" : "gray.100" }}
                        title={
                            (puzzle.author ? `Auteur : ${puzzle.author}\n` : '') +
                            `Date : ${puzzle.puzzle_date.toISOString().slice(0, 10)}`
                        }
                    >
                        <Text fontSize="sm" noOfLines={2}>{puzzle.puzzle_name}</Text>
                        <HStack spacing={0} mt={1}>
                            {[...Array(5).keys()].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    boxSize="0.6em"
                                    color={i < puzzle.puzzle_difficulty ? "#fbd400" : "gray.300"}
                                />
                            ))}
                        </HStack>
                    </Box>
                );
            })}
        </VStack>
    );

    return (
        <ChakraProvider>
            <>
                {showBanner && (
                    <Flex
                        w="100%"
                        bg="#729eeb"
                        color="white"
                        px={4}
                        py={2}
                        align="center"
                        justify="center"
                        gap={2}
                        position="sticky"
                        top={0}
                        zIndex={10}
                    >
                        <Text fontSize={["xs", "sm"]} textAlign="center">
                            Ceci est une copie de {" "}
                            <a
                                href="https://the-french-connections.github.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "underline", fontWeight: "bold" }}
                            >
                                The French Connections
                            </a>
                            .
                        </Text>
                        <Button
                            size="xs"
                            variant="ghost"
                            color="white"
                            _hover={{ bg: "#5a87d4" }}
                            onClick={() => setShowBanner(false)}
                            ml={2}
                        >
                            ✕
                        </Button>
                    </Flex>
                )}

                <IconButton
                    aria-label="Ouvrir la liste des puzzles"
                    icon={<HamburgerIcon />}
                    onClick={onDrawerOpen}
                    position="fixed"
                    top={showBanner ? "60px" : "8px"}
                    left={2}
                    zIndex={20}
                    size="md"
                    display={{ base: 'flex', lg: 'none' }}
                />

                <Drawer isOpen={isDrawerOpen} onClose={onDrawerClose} placement="left" size="full">
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Puzzles</DrawerHeader>
                        <DrawerBody>
                            <PuzzleControls />
                            <PuzzleList />
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
                <Flex>
                
                <Box
                    as="aside"
                    w="280px"
                    minH="100vh"
                    borderRight="1px solid"
                    borderColor="gray.200"
                    p={4}
                    overflowY="auto"
                    position="sticky"
                    top={0}
                    maxH="100vh"
                    display={{ base: 'none', lg: 'block' }}
                >
                    <Heading size="md" mb={4}>Puzzles</Heading>
                    <PuzzleControls />
                    <PuzzleList />
                </Box>

                    <Flex direction="column" align="center" justify="center" minHeight="100vh" flex={1}>
                    <Stack spacing={4} align="center">
                        <Heading size={["xl", "2xl", "3xl"]} fontFamily="Georgia" fontWeight="light" align='center'>
                            The French Connect<Text as="span" color="#fbd400">i</Text><Text as="span" color="#b5e352">o</Text><Text as="span" color="#729eeb">n</Text><Text as="span" color="#bc70c4">s</Text>
                        </Heading>
                        <Text fontWeight="semibold">Cr&eacute;e 4 groupes de 4 mots !</Text>
                        <VStack spacing={.5} align="center">
                            <Heading size={['md', 'lg']} fontWeight="semibold" textAlign="center">
                                {game.current_name}
                            </Heading>
                            <HStack>
                                {[...Array(5).keys()].map((_, index) => (
                                    index < game.difficulty ? (
                                        <StarIcon key={index} boxSize={['0.6em', '0.75em', '1em', '1.25em']} color="#fbd400" />
                                    ) : (
                                        <StarIcon key={index} boxSize={['0.6em', '0.75em', '1em', '1.25em']} color="gray.300" />
                                    )
                                ))}
                            </HStack>
                        </VStack>
                        {game.oneAway && <Alert status='info' variant='left-accent' w={['344px', '438px', '528px', '624px']} animation={game.oneAway ? "fadeIn 0.5s ease" : "fadeOut 0.5s ease"}>
                            <AlertTitle align='center' fontSize={["xs", "s", "md"]}>Presque...</AlertTitle>
                        </Alert>}
                        {game.alreadyGuessed && <Alert status='info' variant='left-accent' w={['344px', '438px', '528px', '624px']} animation={game.alreadyGuessed ? "fadeIn 0.5s ease" : "fadeOut 0.5s ease"}>
                            <AlertTitle align='center' fontSize={["xs", "s", "md"]}>D&eacute;j&agrave; devin&eacute;...</AlertTitle>
                        </Alert>}
                        <Modal isOpen={isOpenRules} onClose={handleCloseRules}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader fontWeight='bold' fontSize="2xl">R&egrave;gles du jeu</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                    <Text fontWeight='bold'>Trouve des groupes de 4 mots qui partagent quelque chose en commun !</Text>
                                    <UnorderedList>
                                        <ListItem>S&eacute;lectionne 4 mots puis appuie sur le bouton "Valider" pour v&eacute;rifier si tu as raison.</ListItem>
                                        <ListItem>Trouve les groupes en faisant moins de 4 erreurs.</ListItem>
                                    </UnorderedList>
                                    <Text fontWeight='bold' mt='1rem'>Exemples de cat&eacute;gories :</Text>
                                    <UnorderedList>
                                        <ListItem>SERPENTS : Boa, Vip&egrave;re, Crotale, Python </ListItem>
                                        <ListItem>FEU + _ : Rouge, Follet, Gr&eacute;geois, Sacr&eacute; </ListItem>
                                    </UnorderedList>
                                    <Text mt='1rem' mb='1rem'>Les cat&eacute;gories sont toujours plus sp&eacute;cifiques que "MOTS DE 4 LETTRES" ou "ADJECTIFS". Pour les trouver, tu peux t'aider d'Internet, d'un dictionnaire ou le faire &agrave; plusieurs, le principal &eacute;tant que tu t'amuses.</Text>
                                    <Text mb='1rem'>Chaque puzzle a une unique solution. Attention aux pi&egrave;ges... Chaque groupe correspond &agrave; une couleur : </Text>
                                    <UnorderedList mb='1rem'>
                                        <ListItem>&#128993; : Facile</ListItem>
                                        <ListItem>&#128994; : Moyen</ListItem>
                                        <ListItem>&#128309; : Difficile</ListItem>
                                        <ListItem>&#128995; : Tr&egrave;s difficile</ListItem>
                                    </UnorderedList>
                                    <Text mb='1rem'>Les autres grilles sont not&eacute;es par leur auteurice en difficult&eacute; de 1 &agrave; 5 &eacute;toiles.</Text>
                                    <Text mb='1rem'>Le dictionnaire de r&eacute;f&eacute;rence est le Wiktionnaire. Utiliser Internet n'est pas interdit, &agrave; vous de voir si vous pr&eacute;f&eacute;rez chercher les solutions avec ou sans.</Text>
                                </ModalBody>
                            </ModalContent>
                        </Modal>
                        {game.author != '' && (
                            <Text mt='-0.5rem' mb='0.25rem' fontSize={['2xs', 'xs', 'sm', 'md']} px={[2, 3, 4]} textAlign="center" wordBreak="break-word" fontStyle={'italic'}>Auteurice : {game.author}</Text>
                        )}
                        {game.additional_text != '' && (
                            <Text mb='0.5rem' fontSize={['2xs', 'xs', 'sm', 'md']} px={[2, 3, 4]} textAlign="center" wordBreak="break-word" fontStyle={'italic'}>{game.additional_text}</Text>
                        )}
                        <Stack maxWidth="624px">
                            {game.complete.map((group: Group) => (
                                <Stack key={group.category} w={['344px', '438px', '528px', '624px']} h={["56px", "64px", "72px", "80px"]} spacing={1} lineHeight={1} rounded="lg" align="center" justify="center" bg={difficultyColor(group.difficulty)} animation="appearFromCenter 0.75s ease forwards">
                                    <Text fontSize={group.category.length > 45 ? ["xs", "xs", "sm", "md"] : group.category.length > 35 ? ["xs", "sm", "lg", "xl"] : ["sm", "md", "lg", "xl"]} fontWeight="extrabold" textTransform="uppercase">{group.category}</Text>
                                    <Text fontSize={["sm", "md", "l", "xl"]} textTransform="uppercase">
                                        {containsHtmlTags(group.items[0]) ? (
                                            group.items.map((item) => (
                                                <span style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: item }} />
                                            ))
                                        ) : (
                                            group.items.join(', ')
                                        )}
                                    </Text>
                                </Stack>
                            ))}
                            {chunk(game.items, 4).map((row, index) => (
                                <HStack key={index} justify="center" spacing={[2, 3, 4]}>
                                    {row.map((item) => (
                                        <Button key={item} className={game.guessWasWrong ? 'shake-animation' : ''} style={{ whiteSpace: "pre-line" }} w={['80px', '100px', '120px', '150px']} h={["56px", "64px", "72px", "80px"]} bg="#efefe6" fontSize={
                                            !item.includes('\n') && !item.includes('<a') && item.length > 17
                                                ? ["5.75px", "7px", "9px", "10px"]
                                                : item.includes('\n') || item.length > 12
                                                    ? ["7.75px", "10.25px", "12.5px", "14px"]
                                                    : ["9.5px", "12px", "14px", "16px"]
                                        } fontWeight="extrabold" textTransform="uppercase" onClick={() => game.toggleActive(item)} isActive={game.activeItems.includes(item)} _active={{ bg: '#5a594e', color: 'white' }} animation={game.guessWasWrong ? "shake 0.5s ease" : ""}>
                                            {containsHtmlTags(item) ? (
                                                <span dangerouslySetInnerHTML={{ __html: item }} />
                                            ) : (
                                                item
                                            )}
                                        </Button>
                                    ))}
                                </HStack>
                            ))}
                        </Stack>
                        <HStack align="baseline">
                            <Text fontSize={["14px", "16px"]}>Erreurs : {4 - game.mistakesRemaining}</Text>
                        </HStack>
                        <VStack padding="1em" spacing={2}>
                            <HStack spacing={2}>
                                <Button
                                    colorScheme="black"
                                    variant="outline"
                                    rounded="full"
                                    borderWidth="2px"
                                    isDisabled={game.isFinished}
                                    onClick={game.shuffle}
                                    fontSize={["13px", "14px", "16px"]}
                                    whiteSpace="normal"
                                    textAlign="center"
                                    px={[2, 3, 4]}
                                    py={[0.5, 1, 2]}
                                >
                                    M&eacute;langer
                                </Button>
                                <Button
                                    colorScheme="black"
                                    variant="outline"
                                    rounded="full"
                                    borderWidth="2px"
                                    isDisabled={game.activeItems.length <= 0}
                                    onClick={game.deselectAll}
                                    fontSize={["13px", "14px", "16px"]}
                                    whiteSpace="normal"
                                    textAlign="center"
                                    px={[2, 3, 4]}
                                    py={[0.5, 1, 2]}
                                >
                                    D&eacute;s&eacute;lectionner
                                </Button>
                                <Button
                                    colorScheme="black"
                                    variant="outline"
                                    rounded="full"
                                    borderWidth="2px"
                                    isDisabled={game.activeItems.length !== 4}
                                    onClick={game.submit}
                                    fontSize={["13px", "14px", "16px"]}
                                    whiteSpace="normal"
                                    textAlign="center"
                                    px={[2, 3, 4]}
                                    py={[0.5, 1, 2]}
                                >
                                    Valider
                                </Button>
                            </HStack>
                            <HStack spacing={2}>
                                <Button
                                    colorScheme="black"
                                    variant="outline"
                                    rounded="full"
                                    borderWidth="2px"
                                    onClick={() => setIsOpenRules(true)}
                                    fontSize={["13px", "14px", "16px"]}
                                    whiteSpace="normal"
                                    textAlign="center"
                                    px={[2, 3, 4]}
                                    py={[0.5, 1, 2]}
                                >
                                    R&egrave;gles
                                </Button>
                                <Button
                                    colorScheme="black"
                                    variant="outline"
                                    rounded="full"
                                    borderWidth="2px"
                                    isDisabled={!game.isFinished}
                                    onClick={() => setIsOpenResults(true)}
                                    fontSize={["13px", "14px", "16px"]}
                                    whiteSpace="normal"
                                    textAlign="center"
                                    px={[2, 3, 4]}
                                    py={[0.5, 1, 2]}
                                >
                                    R&eacute;sultats
                                </Button>
                            </HStack>
                        </VStack>
                        {game.isFinished && <Modal isOpen={isOpenResults} onClose={handleCloseResults}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader textAlign="center" pb={2}>
                                    <Text fontWeight='bold' fontSize="xl">-- Récapitulatif --</Text>
                                    <Text fontSize="md" mt={1}>{game.current_name}</Text>
                                    <HStack justify="center" mt={1}>
                                        {[...Array(5).keys()].map((_, index) => (
                                            <StarIcon
                                                key={index}
                                                boxSize="0.9em"
                                                color={index < game.difficulty ? "#fbd400" : "gray.300"}
                                            />
                                        ))}
                                    </HStack>
                                </ModalHeader>
                                <ModalCloseButton />
                                <ModalBody pb={6}>
                                    <Text mb={2}>
                                        <b>Nombre d'erreurs :</b> {4 - game.mistakesRemaining}
                                    </Text>
                                    <Text mb={1}>
                                        <b>Historique des essais :</b>
                                    </Text>
                                    <Text fontSize='2xl' lineHeight='1.2' mb={4}>
                                        {game.emojiFromGuesses.map((emoji: string, index: number) => (
                                            <React.Fragment key={index}>
                                                {String.fromCodePoint(parseInt(emoji.substring(2)))}
                                                {(index + 1) % 4 === 0 && index + 1 < game.emojiFromGuesses.length && <br />}
                                            </React.Fragment>
                                        ))}
                                    </Text>
                                    <Flex justify="center">
                                        <Button
                                            colorScheme="black"
                                            variant="outline"
                                            rounded="full"
                                            borderWidth="2px"
                                            onClick={() => {
                                                const stars = '★'.repeat(game.difficulty) + '☆'.repeat(5 - game.difficulty);
                                                const emojis = game.emojiFromGuesses
                                                    .map((e: string, i: number) => {
                                                        const c = String.fromCodePoint(parseInt(e.substring(2)));
                                                        return (i + 1) % 4 === 0 ? c + '\n' : c;
                                                    })
                                                    .join('');
                                                const text = `-- Récapitulatif --\n${game.current_name}\n${stars}\n\nNombre d'erreurs : ${4 - game.mistakesRemaining}\nHistorique des essais :\n${emojis}`;
                                                navigator.clipboard.writeText(text);
                                                toast({
                                                    title: "Copié !",
                                                    status: "success",
                                                    duration: 2000,
                                                    isClosable: true,
                                                    position: "top"
                                                });
                                            }}
                                            fontSize={["14px", "16px"]}
                                            h={["30px", "40px"]}
                                        >
                                            Copier
                                        </Button>
                                    </Flex>
                                </ModalBody>
                            </ModalContent>
                        </Modal>}
                    </Stack>
                </Flex>
                </Flex>
            </>
        </ChakraProvider>
    );
};