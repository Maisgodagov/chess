const whiteStock = document.getElementById('white-taken-pieces');
const blackStock = document.getElementById('black-taken-pieces');

let whiteScore = 0;
let blackScore = 0;

let isPromotionPending = false;

const getWhiteScore = () => {
    let score = 0;
    const pieces = boardEl.querySelectorAll('[color="white"]');
    pieces.forEach((piece) => {
        const type = piece.getAttribute('type');
        if (type === 'pawn') {
            score += 1;
        } else if (type === 'rook') {
            score += 5;
        } else if (type === 'knight' || type === 'bishop') {
            score += 3;
        } else if (type === 'queen') {
            score += 9;
        }
    });
    return score;
};

const getBlackScore = () => {
    let score = 0;
    const pieces = boardEl.querySelectorAll('[color="black"]');
    pieces.forEach((piece) => {
        const type = piece.getAttribute('type');
        if (type === 'pawn') {
            score += 1;
        } else if (type === 'rook') {
            score += 5;
        } else if (type === 'knight' || type === 'bishop') {
            score += 3;
        } else if (type === 'queen') {
            score += 9;
        }
    });
    return score;
};

const whiteScoreSpan = document.getElementById('white-score');
const blackScoreSpan = document.getElementById('black-score');
whiteScoreSpan.innerHTML = whiteScore;
blackScoreSpan.innerHTML = blackScore;

let whiteAdvantage = null;
let blackAdvantage = null;
const whiteAdvantageSpan = document.getElementById('white-advantage');
const blackAdvantageSpan = document.getElementById('black-advantage');
whiteAdvantageSpan.innerHTML = whiteAdvantage;
blackAdvantageSpan.innerHTML = blackAdvantage;

let turn = 'white';
const opponents = [
    {
        name: 'Камень',
        img: './img/rock.png',
        depth: 1,
        skill: 1
    },
    {
        name: 'Обезьянка Бо',
        img: './img/monkey.png',
        depth: 4,
        skill: 4
    },
    {
        name: 'Кот Стивен',
        img: './img/cat.png',
        depth: 7,
        skill: 7
    },
    {
        name: 'Совенок Филиппо',
        img: './img/owl.png',
        depth: 10,
        skill: 10
    },
    {
        name: 'Магнус Карлсен',
        img: './img/magnus.png',
        depth: 14,
        skill: 15
    },
    {
        name: 'Сверхразум',
        img: './img/genius.png',
        depth: 15,
        skill: 20
    }
];

let selectedOpponent = null;
let playerColor = 'white';

function setupOpponentSelection() {
    const opponentsList = document.querySelectorAll('.opponent');
    opponentsList.forEach((opponentEl) => {
        opponentEl.addEventListener('click', () => {
            opponentsList.forEach(el => el.classList.remove('selected-opponent'));
            opponentEl.classList.add('selected-opponent');
            const opponentName = opponentEl.querySelector('h3').innerText;
            selectedOpponent = opponents.find(op => op.name === opponentName);
        });
    });
}

const turnWhiteIndicator = document.getElementById('white-move-indicator');
const turnBlackIndicator = document.getElementById('black-move-indicator');

function checkAdvantage() {
    whiteScore = getWhiteScore();
    blackScore = getBlackScore();
    if (whiteScore > blackScore) {
        whiteAdvantage = whiteScore - blackScore;
        whiteAdvantageSpan.innerHTML = '+' + whiteAdvantage;
        blackAdvantageSpan.innerHTML = null;
    } else if (whiteScore < blackScore) {
        blackAdvantage = blackScore - whiteScore;
        blackAdvantageSpan.innerHTML = '+' + blackAdvantage;
        whiteAdvantageSpan.innerHTML = null;
    } else {
        whiteAdvantageSpan.innerHTML = null;
        blackAdvantageSpan.innerHTML = null;
    }
}

function turnIndicator() {
    if (turn === 'black') {
        turnWhiteIndicator.style.display = 'none';
        turnBlackIndicator.style.display = 'block';
    } else {
        turnWhiteIndicator.style.display = 'block';
        turnBlackIndicator.style.display = 'none';
    }
}
turnIndicator();

const boardEl = document.getElementById('board');
const boardSize = 64;
const cols = ['a','b','c','d','e','f','g','h'];

const startingPosition = [
    'rook-black', 'knight-black', 'bishop-black', 'queen-black', 'king-black', 'bishop-black', 'knight-black', 'rook-black',
    'pawn-black', 'pawn-black', 'pawn-black', 'pawn-black', 'pawn-black', 'pawn-black', 'pawn-black', 'pawn-black',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    'pawn-white', 'pawn-white', 'pawn-white', 'pawn-white', 'pawn-white', 'pawn-white', 'pawn-white', 'pawn-white',
    'rook-white', 'knight-white', 'bishop-white', 'queen-white', 'king-white', 'bishop-white', 'knight-white', 'rook-white'
];

function createPiece(type, color) {
    const piece = document.createElement('div');
    piece.classList.add('piece', `${color}-${type}`);
    piece.setAttribute('type', type);
    piece.setAttribute('color', color);
    return piece;
}
for (let i = 0; i < boardSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    if (startingPosition[i]) {
        const [type, color] = startingPosition[i].split('-');
        const piece = createPiece(type, color);
        cell.append(piece);
    }
    const row = Math.ceil((boardSize - i) / 8);
    const col = (i % 8) + 1;
    const file = cols[(i % 8)];

    cell.setAttribute('cell-row', row);
    cell.setAttribute('cell-col-id', col);
    cell.setAttribute('cell-col', file);

    const cellId = `${file}${row}`;
    cell.setAttribute('id', cellId);

    if ((row + col) % 2 === 1) {
        cell.classList.add('white');
    } else {
        cell.classList.add('black');
    }

    boardEl.append(cell);
}

let boardArray = new Array(8).fill(null).map(() => new Array(8).fill(null));

const fileToIndex = { 'a':0,'b':1,'c':2,'d':3,'e':4,'f':5,'g':6,'h':7 };

function idToRC(id) {
    const file = id[0];
    const rank = parseInt(id[1], 10);
    const col = fileToIndex[file];
    const row = 8 - rank;
    return [row, col];
}

function rcToId(row, col) {
    const files = ['a','b','c','d','e','f','g','h'];
    let f = files[col];
    let r = 8 - row;
    return f + r;
}

function initBoardArrayFromDOM() {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            boardArray[r][c] = null;
        }
    }
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach((cellEl) => {
        const id = cellEl.id;
        const [rr, cc] = idToRC(id);
        const pieceEl = cellEl.querySelector('.piece');
        if (pieceEl) {
            const type = pieceEl.getAttribute('type');
            const color = pieceEl.getAttribute('color');
            boardArray[rr][cc] = {
                type,
                color,
                hasMoved: false
            };
        }
    });
}
initBoardArrayFromDOM();

function dropPickedPiece() {
    document.querySelectorAll('.picked-piece').forEach((p) => {
        p.classList.remove('picked-piece');
    });
}
function clearLegalMoves() {
    document.querySelectorAll('.legal-move').forEach((cell) => {
        cell.classList.remove('legal-move');
    });
    document.querySelectorAll('.short-castle').forEach((cell) => {
        cell.classList.remove('short-castle');
    });
    document.querySelectorAll('.long-castle').forEach((cell) => {
        cell.classList.remove('long-castle');
    });
}
function clearLegalAttacks() {
    document.querySelectorAll('.under-attack').forEach((cell) => {
        cell.classList.remove('under-attack');
    });
}

let enPassantTarget = null;

function onBoard(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function canMoveOrCapture(board, r, c, color) {
    if (!onBoard(r, c)) return false;
    const target = board[r][c];
    if (!target) return true;
    if (target.color !== color) return true;
    return false;
}

function generatePawnMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = piece.color;
    const dir = (color === 'white') ? -1 : +1;
    let moves = [];

    let f1 = r + dir;
    if (onBoard(f1, c) && !board[f1][c]) {
        if ((color === 'white' && f1 === 0) || (color === 'black' && f1 === 7)) {
            moves.push({ fromR: r, fromC: c, toR: f1, toC: c, enPassant: false, promotion: true });
        } else {
            moves.push({ fromR: r, fromC: c, toR: f1, toC: c, enPassant: false });
        }
    }
    let startRow = (color === 'white') ? 6 : 1;
    if (r === startRow && !board[f1][c]) {
        let f2 = r + 2 * dir;
        if (onBoard(f2, c) && !board[f2][c]) {
            moves.push({ fromR: r, fromC: c, toR: f2, toC: c, enPassant: false, doublePawn: true });
        }
    }
    for (let dc of [-1, +1]) {
        let cc = c + dc;
        if (onBoard(f1, cc)) {
            const targ = board[f1][cc];
            if (targ && targ.color !== color) {
                if ((color === 'white' && f1 === 0) || (color === 'black' && f1 === 7)) {
                    moves.push({
                        fromR: r, fromC: c,
                        toR: f1, toC: cc,
                        enPassant: false,
                        promotion: true
                    });
                } else {
                    moves.push({
                        fromR: r, fromC: c,
                        toR: f1, toC: cc,
                        enPassant: false
                    });
                }
            }
        }
    }

    if (enPassantTarget) {
        const epId = enPassantTarget;
        const [epR, epC] = idToRC(epId);
        for (let dc of [-1, +1]) {
            let rr = r + dir;
            let cc = c + dc;
            if (rr === epR && cc === epC) {
                moves.push({
                    fromR: r, fromC: c,
                    toR: epR, toC: cc,
                    enPassant: true
                });
            }
        }
    }
    return moves;
}

function generateKnightMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = piece.color;
    let moves = [];
    const offsets = [
        [-2, -1], [-2, +1], [-1, -2], [-1, +2],
        [+1, -2], [+1, +2], [+2, -1], [+2, +1]
    ];
    for (let [dr, dc] of offsets) {
        let rr = r + dr, cc = c + dc;
        if (onBoard(rr, cc) && canMoveOrCapture(board, rr, cc, color)) {
            moves.push({ fromR: r, fromC: c, toR: rr, toC: cc });
        }
    }
    return moves;
}

function generateBishopMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    let moves = [];
    const color = piece.color;
    const directions = [[-1, -1], [-1, +1], [+1, -1], [+1, +1]];
    for (let [dr, dc] of directions) {
        let rr = r, cc = c;
        while (true) {
            rr += dr; cc += dc;
            if (!onBoard(rr, cc)) break;
            if (canMoveOrCapture(board, rr, cc, color)) {
                moves.push({ fromR: r, fromC: c, toR: rr, toC: cc });
                if (board[rr][cc]) break;
            } else {
                break;
            }
        }
    }
    return moves;
}

function generateRookMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    let moves = [];
    const color = piece.color;
    const directions = [[-1, 0], [+1, 0], [0, -1], [0, +1]];
    for (let [dr, dc] of directions) {
        let rr = r, cc = c;
        while (true) {
            rr += dr; cc += dc;
            if (!onBoard(rr, cc)) break;
            if (canMoveOrCapture(board, rr, cc, color)) {
                moves.push({ fromR: r, fromC: c, toR: rr, toC: cc });
                if (board[rr][cc]) break;
            } else {
                break;
            }
        }
    }
    return moves;
}

function generateQueenMoves(board, r, c) {
    return generateRookMoves(board, r, c).concat(generateBishopMoves(board, r, c));
}

function generateKingMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = piece.color;
    let moves = [];
    const offsets = [
        [-1, -1], [-1, 0], [-1, +1],
        [0, -1], [0, +1],
        [+1, -1], [+1, 0], [+1, +1]
    ];
    for (let [dr, dc] of offsets) {
        let rr = r + dr, cc = c + dc;
        if (onBoard(rr, cc) && canMoveOrCapture(board, rr, cc, color)) {
            moves.push({ fromR: r, fromC: c, toR: rr, toC: cc });
        }
    }
    return moves;
}

function generatePseudoMoves(board, color) {
    let moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            if (p.color !== color) continue;
            switch (p.type) {
                case 'pawn':
                    moves = moves.concat(generatePawnMoves(board, r, c));
                    break;
                case 'knight':
                    moves = moves.concat(generateKnightMoves(board, r, c));
                    break;
                case 'bishop':
                    moves = moves.concat(generateBishopMoves(board, r, c));
                    break;
                case 'rook':
                    moves = moves.concat(generateRookMoves(board, r, c));
                    break;
                case 'queen':
                    moves = moves.concat(generateQueenMoves(board, r, c));
                    break;
                case 'king':
                    moves = moves.concat(generateKingMoves(board, r, c));
                    break;
            }
        }
    }
    return moves;
}

function isKingInCheck(board, color) {
    let kr = -1, kc = -1;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'king' && p.color === color) {
                kr = r; kc = c; break;
            }
        }
        if (kr !== -1) break;
    }
    if (kr === -1) {
        return true;
    }
    const oppColor = (color === 'white') ? 'black' : 'white';
    const oppMoves = generatePseudoMoves(board, oppColor);
    return oppMoves.some(m => m.toR === kr && m.toC === kc);
}

function generateAllLegalMoves(board, color) {
    const pseudo = generatePseudoMoves(board, color);
    let legal = [];
    pseudo.forEach((move) => {
        const { fromR, fromC, toR, toC, enPassant, promotion } = move;
        const piece = board[fromR][fromC];
        const savedTarget = board[toR][toC];

        let capturedSquare = { r: toR, c: toC };
        if (enPassant) {
            const dir = (piece.color === 'white') ? +1 : -1;
            capturedSquare.r = toR + dir;
            capturedSquare.c = toC;
        }

        const savedCaptured = board[capturedSquare.r][capturedSquare.c];
        board[fromR][fromC] = null;
        board[capturedSquare.r][capturedSquare.c] = null;
        board[toR][toC] = piece;

        const inCheck = isKingInCheck(board, color);

        board[fromR][fromC] = piece;
        board[toR][toC] = savedTarget;
        if (savedCaptured) {
            board[capturedSquare.r][capturedSquare.c] = savedCaptured;
        }

        if (!inCheck) {
            legal.push(move);
        }
    });
    return legal;
}

function showLegalMoves(cellId) {
    clearLegalMoves();
    clearLegalAttacks();
    initBoardArrayFromDOM();
    const [r, c] = idToRC(cellId);
    const piece = boardArray[r][c];
    if (!piece) return;
    if (piece.color !== turn) return;
    const allMoves = generateAllLegalMoves(boardArray, turn);
    const pieceMoves = allMoves.filter(m => (m.fromR === r && m.fromC === c));

    pieceMoves.forEach((move) => {
        const toId = rcToId(move.toR, move.toC);
        const cellEl = document.getElementById(toId);
        if (!cellEl) return;
        if (move.enPassant === true) {
            cellEl.classList.add('under-attack');
            return;
        }
        const targPiece = cellEl.querySelector('.piece');
        if (targPiece) {
            const tgtColor = targPiece.getAttribute('color');
            if (tgtColor !== piece.color) {
                cellEl.classList.add('under-attack');
            }
        } else {
            cellEl.classList.add('legal-move');
        }
    });
    
    // Добавляем проверку, является ли выбранная фигура королем
    if (piece.type === 'king') {
        legalCastleShort(piece.color);
        legalCastleLong(piece.color);
    }
}


function piecePick(e) {
    const piece = e.target;
    if (!piece.classList.contains('piece')) return;

    if (piece.classList.contains('picked-piece')) {
        clearLegalMoves();
        clearLegalAttacks();
        dropPickedPiece();
    } else {
        clearLegalMoves();
        clearLegalAttacks();
        dropPickedPiece();

        piece.classList.add('picked-piece');
        const cell = piece.parentNode;
        const cellId = cell.getAttribute('id');
        showLegalMoves(cellId);
    }
}

const movesHistory = [];
const movesHistoryList = document.getElementById('moves-history-list');

function updateHistoryList() {
    const latestMove = movesHistory.slice(-1)[0];
    if (!latestMove) return;
    const moveArr = latestMove.split(' ');
    const pieceColor = moveArr[0];
    const pieceType = moveArr[1];
    const moveType = moveArr[2];
    let li;
    if (moveType === 'moves') {
        const pieceCell = moveArr[4];
        const targetCell = moveArr[6];
        li = document.createElement('li');
        li.innerHTML = `${capitalize(pieceColor)} ${capitalize(pieceType)} moves from ${pieceCell} to ${targetCell}`;
    } else if (moveType === 'takes') {
        const pieceCell = moveArr[5];
        const targetCell = moveArr[7];
        const targetType = moveArr[4];
        const targetColor = moveArr[3];
        li = document.createElement('li');
        li.innerHTML = `${capitalize(pieceColor)} ${capitalize(pieceType)} takes ${capitalize(targetColor)} ${capitalize(targetType)} from ${pieceCell} to ${targetCell}`;
    } else if (moveType === 'castled') {
        const castleType = moveArr[3]; // short or long
        li = document.createElement('li');
        li.innerHTML = `${capitalize(pieceColor)} ${capitalize(pieceType)} castled ${castleType}`;
    }
    if (li) {
        movesHistoryList.appendChild(li);
    }
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function setEnPassantIfNeeded(fromR, fromC, toR, toC, piece) {
    if (piece.type === 'pawn') {
        const dir = (piece.color === 'white') ? -1 : +1;
        if (Math.abs(toR - fromR) === 2) {
            const midRow = (fromR + toR) / 2;
            const midCol = toC;
            enPassantTarget = rcToId(midRow, midCol);
            return;
        }
    }
    enPassantTarget = null;
}

function checkPromotion(pickedPiece) {
    if (!pickedPiece) return;
    if (pickedPiece.getAttribute('type') !== 'pawn') return;

    const parentCell = pickedPiece.parentNode;
    if (!parentCell) return;

    const cellId = parentCell.id;
    const [row, col] = idToRC(cellId);
    const color = pickedPiece.getAttribute('color');

    if ((color === 'white' && row === 0) || (color === 'black' && row === 7)) {
        parentCell.style.position = 'relative';
        openPromotionDialog(pickedPiece, color);
    }
}

function openPromotionDialog(pawnEl, color) {
    const dialog = document.getElementById('promotion-dialog');
    if (!dialog) {
        promotePiece(pawnEl, 'queen', color);
        return;
    }
    const cell = pawnEl.parentNode;  
    cell.appendChild(dialog);
    dialog.style.display = 'block';
    if (color === 'black') {
        dialog.classList.add('black-modal');
    } else if (color === 'white') {
        dialog.classList.remove('black-modal');
    }
    isPromotionPending = true;
    const buttons = dialog.querySelectorAll('button');
    buttons.forEach((btn) => {
        btn.classList.remove(
            'btn-white-queen', 'btn-white-rook',
            'btn-white-bishop','btn-white-knight',
            'btn-black-queen', 'btn-black-rook',
            'btn-black-bishop','btn-black-knight'
        );
        const figureType = btn.getAttribute('data-type');
        btn.classList.add(`btn-${color}-${figureType}`);
        btn.onclick = null;
    });

    buttons.forEach((btn) => {
        btn.onclick = () => {
            const newType = btn.getAttribute('data-type'); 
            promotePiece(pawnEl, newType, color);
            dialog.style.display = 'none';
            initBoardArrayFromDOM();
            checkAdvantage();
            isPromotionPending = false;
            if (turn === 'black') {
                sendCurrentFENToEngine();
            }
        };
    });
}

function promotePiece(pieceEl, newType, color) {
    pieceEl.classList.remove(`${color}-pawn`, `${color}-knight`, `${color}-bishop`, `${color}-rook`, `${color}-queen`);
    pieceEl.classList.add(`${color}-${newType}`);
    pieceEl.setAttribute('type', newType);
    console.log(`promotePiece: ${color} pawn -> ${newType}`);
}

function changeTurn() {
    turn = (turn === 'white') ? 'black' : 'white';
}

function move(e) {
    const targetCell = e.target.closest('.cell');
    const pickedPiece = document.querySelector('.picked-piece');
    if (!targetCell || !pickedPiece) return;

    const color = pickedPiece.getAttribute('color');
    const type = pickedPiece.getAttribute('type');
    const fromId = pickedPiece.parentNode.id;
    const toId = targetCell.id;
    const oppColor = (color === 'white') ? 'black' : 'white';

    movesHistory.push(`${color} ${type} moves from ${fromId} to ${toId}`);
    targetCell.appendChild(pickedPiece);

    clearLegalMoves();
    clearLegalAttacks();
    dropPickedPiece();
    initBoardArrayFromDOM();
    const [fr, fc] = idToRC(fromId);
    const [tr, tc] = idToRC(toId);
    const movedPiece = boardArray[tr][tc];
    setEnPassantIfNeeded(fr, fc, tr, tc, movedPiece);
    checkPromotion(pickedPiece);
    ifChecked(oppColor);
    checkEndgameState(oppColor);
    changeTurn();
    turnIndicator();
    checkAdvantage();
    updateHistoryList();
    sendCurrentFENToEngine();
}

function capture(e) {
    const targetCell = e.target.closest('.cell');
    const pickedPiece = document.querySelector('.picked-piece');
    if (!targetCell || !pickedPiece) return;

    const pickedCell = pickedPiece.parentNode;
    const fromId = pickedCell.id;
    const toId = targetCell.id;

    const [fromR, fromC] = idToRC(fromId);
    const [toR, toC] = idToRC(toId);

    const color = pickedPiece.getAttribute('color');
    const type = pickedPiece.getAttribute('type');
    const oppColor = (color === 'white') ? 'black' : 'white';

    const targetPiece = targetCell.firstChild;
    let targetType = null;
    let targetColor = null;
    if (targetPiece) {
        targetType = targetPiece.getAttribute('type');
        targetColor = targetPiece.getAttribute('color');
    }
    let isEnPassant = false;
    if (
        type === 'pawn' &&
        Math.abs(fromC - toC) === 1 &&
        Math.abs(fromR - toR) === 1 &&
        !targetPiece
    ) {
        isEnPassant = true;
    }

    if (isEnPassant) {
        const dir = (color === 'white') ? -1 : +1;
        const enemyRow = toR + dir;
        const enemyCol = toC;
        const enemyCellId = rcToId(enemyRow, enemyCol);
        const enemyCellEl = document.getElementById(enemyCellId);

        if (enemyCellEl && enemyCellEl.firstChild) {
            const enemyPawn = enemyCellEl.firstChild;
            targetType = enemyPawn.getAttribute('type');
            targetColor = enemyPawn.getAttribute('color');
            enemyPawn.remove();

            movesHistory.push(`${color} ${type} takes ${targetColor} ${targetType} enPassant ${fromId} to ${toId}`);
        }
        targetCell.appendChild(pickedPiece);

    } else {
        movesHistory.push(`${color} ${type} takes ${targetColor} ${targetType} ${fromId} to ${toId}`);

        targetCell.appendChild(pickedPiece);
        if (targetPiece) {
            targetPiece.remove();
        }
    }

    clearLegalMoves();
    clearLegalAttacks();
    dropPickedPiece();

    if (targetColor === 'white') {
        const dummyPiece = createPiece(targetType, 'white');
        blackStock.appendChild(dummyPiece);

        if (targetType === 'pawn') blackScore += 1;
        else if (targetType === 'knight' || targetType === 'bishop') blackScore += 3;
        else if (targetType === 'rook') blackScore += 5;
        else if (targetType === 'queen') blackScore += 9;
        blackScoreSpan.innerHTML = blackScore;

    } else if (targetColor === 'black') {
        const dummyPiece = createPiece(targetType, 'black');
        whiteStock.appendChild(dummyPiece);

        if (targetType === 'pawn') whiteScore += 1;
        else if (targetType === 'knight' || targetType === 'bishop') whiteScore += 3;
        else if (targetType === 'rook') whiteScore += 5;
        else if (targetType === 'queen') whiteScore += 9;
        whiteScoreSpan.innerHTML = whiteScore;
    }
    checkAdvantage();

    initBoardArrayFromDOM();

    if (type === 'pawn') {
        checkPromotion(pickedPiece);
    }

    enPassantTarget = null;

    ifChecked(oppColor);
    checkEndgameState(oppColor);

    changeTurn();
    turnIndicator();
    updateHistoryList();
    checkAdvantage();
    sendCurrentFENToEngine();
}

function ifKingMoved(color) {
    let result = false;
    movesHistory.forEach((move) => {
        const arr = move.split(' ');
        if (arr.includes(color) && arr.includes('king')) {
            result = true;
        }
    });
    return result;
}
function ifShortCastleEmpty(color) {
    if (color === 'white') {
        const f1 = document.getElementById('f1');
        const g1 = document.getElementById('g1');
        return (!f1.firstChild && !g1.firstChild);
    } else {
        const f8 = document.getElementById('f8');
        const g8 = document.getElementById('g8');
        return (!f8.firstChild && !g8.firstChild);
    }
}
function ifLongCastleEmpty(color) {
    if (color === 'white') {
        const b1 = document.getElementById('b1');
        const c1 = document.getElementById('c1');
        const d1 = document.getElementById('d1');
        return (!b1.firstChild && !c1.firstChild && !d1.firstChild);
    } else {
        const b8 = document.getElementById('b8');
        const c8 = document.getElementById('c8');
        const d8 = document.getElementById('d8');
        return (!b8.firstChild && !c8.firstChild && !d8.firstChild);
    }
}
function ifShortRookMoved(color) {
    let result = false;
    movesHistory.forEach((move) => {
        const arr = move.split(' ');
        if (color === 'white') {
            if (arr.includes('white') && arr.includes('h1')) result = true;
        } else {
            if (arr.includes('black') && arr.includes('h8')) result = true;
        }
    });
    return result;
}
function ifLongRookMoved(color) {
    let result = false;
    movesHistory.forEach((move) => {
        const arr = move.split(' ');
        if (color === 'white') {
            if (arr.includes('white') && arr.includes('a1')) result = true;
        } else {
            if (arr.includes('black') && arr.includes('a8')) result = true;
        }
    });
    return result;
}
function canCastleShort(color) {
    return (!ifKingMoved(color) && ifShortCastleEmpty(color) && !ifShortRookMoved(color));
}
function canCastleLong(color) {
    return (!ifKingMoved(color) && ifLongCastleEmpty(color) && !ifLongRookMoved(color));
}
function legalCastleShort(color) {
    if (!canCastleShort(color)) return;
    if (color === 'white') {
        const g1 = document.getElementById('g1');
        g1.classList.add('short-castle');
    } else {
        const g8 = document.getElementById('g8');
        g8.classList.add('short-castle');
    }
}
function legalCastleLong(color) {
    if (!canCastleLong(color)) return;
    if (color === 'white') {
        const c1 = document.getElementById('c1');
        c1.classList.add('long-castle');
    } else {
        const c8 = document.getElementById('c8');
        c8.classList.add('long-castle');
    }
}
function shortCastle(e) {
    const targetCell = e.target.closest('.cell');
    const pickedPiece = document.querySelector('.picked-piece');
    if (!targetCell || !pickedPiece) return;
    const color = pickedPiece.getAttribute('color');
    const type = pickedPiece.getAttribute('type');

    if (color === 'white') {
        const rookCell = document.getElementById('h1');
        const rook = rookCell.firstChild;
        const f1 = document.getElementById('f1');

        movesHistory.push(`${color} ${type} castled short`);
        targetCell.appendChild(pickedPiece);
        f1.appendChild(rook);
    } else {
        const rookCell = document.getElementById('h8');
        const rook = rookCell.firstChild;
        const f8 = document.getElementById('f8');

        movesHistory.push(`${color} ${type} castled short`);
        targetCell.appendChild(pickedPiece);
        f8.appendChild(rook);
    }
    clearLegalMoves();
    clearLegalAttacks();
    dropPickedPiece();

    initBoardArrayFromDOM();
    castlingRights = updateCastlingRightsAfterMove(color, type, null, null);

    changeTurn();
    turnIndicator();
    updateHistoryList();
    sendCurrentFENToEngine();
}
function longCastle(e) {
    const targetCell = e.target.closest('.cell');
    const pickedPiece = document.querySelector('.picked-piece');
    if (!targetCell || !pickedPiece) return;
    const color = pickedPiece.getAttribute('color');
    const type = pickedPiece.getAttribute('type');

    if (color === 'white') {
        const rookCell = document.getElementById('a1');
        const rook = rookCell.firstChild;
        const d1 = document.getElementById('d1');

        movesHistory.push(`${color} ${type} castled long`);
        targetCell.appendChild(pickedPiece);
        d1.appendChild(rook);
    } else {
        const rookCell = document.getElementById('a8');
        const rook = rookCell.firstChild;
        const d8 = document.getElementById('d8');

        movesHistory.push(`${color} ${type} castled long`);
        targetCell.appendChild(pickedPiece);
        d8.appendChild(rook);
    }
    clearLegalMoves();
    clearLegalAttacks();
    dropPickedPiece();

    initBoardArrayFromDOM();

    castlingRights = updateCastlingRightsAfterMove(color, type, null, null);

    changeTurn();
    turnIndicator();
    updateHistoryList();

    sendCurrentFENToEngine();
}

function ifChecked(color) {
    initBoardArrayFromDOM();
    const inCheck = isKingInCheck(boardArray, color);

    const whiteKingEl = document.querySelector('.white-king');
    const blackKingEl = document.querySelector('.black-king');
    if (whiteKingEl) whiteKingEl.classList.remove('checked');
    if (blackKingEl) blackKingEl.classList.remove('checked');

    if (inCheck) {
        console.log(`Шах ${color} королю`);
        const kingEl = document.querySelector(`.${color}-king`);
        if (kingEl) {
            kingEl.classList.add('checked');
        }
    }
    return inCheck;
}

function checkEndgameState(color) {
    const inCheck = isKingInCheck(boardArray, color);
    const legalMoves = generateAllLegalMoves(boardArray, color);

    if (legalMoves.length === 0) {
        if (inCheck) {
            console.log(`Мат! ${color} проиграл`);
            if (color === 'black') { // Черные в шахе и мате, значит белые победили
                showGameResult('win');
            } else if (color === 'white') { // Белые в шахе и мате, значит черные победили
                showGameResult('lose');
            }
        } else {
            console.log(`Пат! Ничья`);
            showGameResult('draw');
        }
    }
}


function updateCastlingRightsAfterMove(color, type, fromId, toId) {
    let newCastlingRights = castlingRights;

    if (type === 'king') {
        if (color === 'white') {
            newCastlingRights = newCastlingRights.replace('K', '').replace('Q', '');
        } else {
            newCastlingRights = newCastlingRights.replace('k', '').replace('q', '');
        }
    }

    if (type === 'rook') {
        if (color === 'white') {
            if (fromId === 'h1' || toId === 'h1') {
                newCastlingRights = newCastlingRights.replace('K', '');
            }
            if (fromId === 'a1' || toId === 'a1') {
                newCastlingRights = newCastlingRights.replace('Q', '');
            }
        } else {
            if (fromId === 'h8' || toId === 'h8') {
                newCastlingRights = newCastlingRights.replace('k', '');
            }
            if (fromId === 'a8' || toId === 'a8') {
                newCastlingRights = newCastlingRights.replace('q', '');
            }
        }
    }

    if (newCastlingRights === '') {
        newCastlingRights = '-';
    }

    return newCastlingRights;
}


let castlingRights = "KQkq";
let enPassantSquare = null;
let halfmoveClock = 0;
let fullmoveNumber = 1;


function boardToFEN(board, turn, castling, enPassant, halfmove, fullmove) {
    let fenRows = [];
    for (let row = 0; row < 8; row++) {
        let emptyCount = 0;
        let fenRow = "";
        for (let col = 0; col < 8; col++) {
            const p = board[row][col];
            if (!p) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fenRow += emptyCount;
                    emptyCount = 0;
                }
                fenRow += pieceToFenSymbol(p);
            }
        }
        if (emptyCount > 0) {
            fenRow += emptyCount;
        }
        fenRows.push(fenRow);
    }
    const piecePlacement = fenRows.join('/');

    const activeColor = (turn === 'white') ? 'w' : 'b';

    let castlingStr = castling;
    if (!castlingStr || castlingStr.length === 0) {
        castlingStr = "-";
    }

    let enPassantStr = enPassant ? enPassant : "-";

    const halfmoveStr = halfmove.toString();

    const fullmoveStr = fullmove.toString();

    const fen = `${piecePlacement} ${activeColor} ${castlingStr} ${enPassantStr} ${halfmoveStr} ${fullmoveStr}`;
    return fen;
}

function pieceToFenSymbol(piece) {
    let s = '';
    switch(piece.type) {
        case 'pawn':   s='p'; break;
        case 'knight': s='n'; break;
        case 'bishop': s='b'; break;
        case 'rook':   s='r'; break;
        case 'queen':  s='q'; break;
        case 'king':   s='k'; break;
    }
    if (piece.color === 'white') {
        return s.toUpperCase();
    }
    return s;
}

function fenToBoard(fen) {
    const parts = fen.split(' ');
    if (parts.length < 6) {
        console.warn("Invalid FEN:", fen);
        return null;
    }
    const [placement, activeColor, castling, enPassant, halfmoveStr, fullmoveStr] = parts;

    let newBoard = new Array(8).fill(null).map(() => new Array(8).fill(null));
    const ranks = placement.split('/');
    if (ranks.length !== 8) {
        console.warn("Invalid piecePlacement in FEN:", placement);
        return null;
    }
    for (let row = 0; row < 8; row++) {
        const rankStr = ranks[row];
        let col = 0;
        for (let i = 0; i < rankStr.length; i++) {
            const ch = rankStr[i];
            if (/\d/.test(ch)) {
                const emptyCount = parseInt(ch, 10);
                for (let k = 0; k < emptyCount; k++) {
                    newBoard[row][col] = null;
                    col++;
                }
            } else {
                const pieceObj = fenSymbolToPiece(ch);
                newBoard[row][col] = pieceObj;
                col++;
            }
        }
    }
    let turnVal = (activeColor === 'w') ? 'white' : 'black';

    let castlingStr = (castling === '-') ? '' : castling;

    let enPassantVal = (enPassant === '-') ? null : enPassant;

    let halfmoveVal = parseInt(halfmoveStr, 10);

    let fullmoveVal = parseInt(fullmoveStr, 10);

    return {
        board: newBoard,
        turn: turnVal,
        castling: castlingStr,
        enPassant: enPassantVal,
        halfmove: halfmoveVal,
        fullmove: fullmoveVal
    };
}

function fenSymbolToPiece(ch) {
    const isWhite = (ch === ch.toUpperCase());
    const lower = ch.toLowerCase();
    let type = '';
    switch(lower) {
        case 'p': type = 'pawn'; break;
        case 'n': type = 'knight'; break;
        case 'b': type = 'bishop'; break;
        case 'r': type = 'rook'; break;
        case 'q': type = 'queen'; break;
        case 'k': type = 'king'; break;
        default:
            console.warn("Unknown FEN symbol:", ch);
            return null;
    }
    let color = isWhite ? 'white' : 'black';
    return { type, color, hasMoved: false };
}

function applyEngineMove(uciMove) {
    console.log(`Applying engine move: ${uciMove}`);
    // Пример: "e2e4" или "e7e8q"
    const regex = /^([a-h][1-8])([a-h][1-8])(q|r|b|n)?$/;
    const match = uciMove.match(regex);
    if (!match) {
        console.warn("Invalid UCI move from engine:", uciMove);
        return;
    }
    const fromId = match[1];
    const toId = match[2];
    const promo = match[3] ? match[3] : null;

    const fromCell = document.getElementById(fromId);
    const toCell = document.getElementById(toId);
    if (!fromCell || !toCell) {
        console.warn("Invalid cell IDs in engine move:", fromId, toId);
        return;
    }

    const piece = fromCell.querySelector('.piece');
    if (!piece) {
        console.warn("No piece found at fromCell:", fromId);
        return;
    }

    let isEnPassant = false;
    if (piece.getAttribute('type') === 'pawn') {
        const [fromR, fromC] = idToRC(fromId);
        const [toR, toC] = idToRC(toId);
        if (Math.abs(fromC - toC) === 1 && 
            ((piece.getAttribute('color') === 'white' && toR === fromR -1) || 
             (piece.getAttribute('color') === 'black' && toR === fromR +1)) && 
            !toCell.firstChild) {
            isEnPassant = true;
        }
    }

    if (!isEnPassant && toCell.firstChild) {
        const targetPiece = toCell.querySelector('.piece');
        if (targetPiece) {
            const targetType = targetPiece.getAttribute('type');
            const targetColor = targetPiece.getAttribute('color');
            targetPiece.remove();

            if (targetColor === 'white') {
                const dummyPiece = createPiece(targetType, 'white');
                blackStock.appendChild(dummyPiece);

                if (targetType === 'pawn') blackScore += 1;
                else if (targetType === 'knight' || targetType === 'bishop') blackScore += 3;
                else if (targetType === 'rook') blackScore += 5;
                else if (targetType === 'queen') blackScore += 9;
                blackScoreSpan.innerHTML = blackScore;

            } else if (targetColor === 'black') {
                const dummyPiece = createPiece(targetType, 'black');
                whiteStock.appendChild(dummyPiece);

                if (targetType === 'pawn') whiteScore += 1;
                else if (targetType === 'knight' || targetType === 'bishop') whiteScore += 3;
                else if (targetType === 'rook') whiteScore += 5;
                else if (targetType === 'queen') whiteScore += 9;
                whiteScoreSpan.innerHTML = whiteScore;
            }
            checkAdvantage();
        }
    }

    if (isEnPassant) {
        const [toR, toC] = idToRC(toId);
        const dir = (piece.getAttribute('color') === 'white') ? +1 : -1;
        const enemyRow = toR + dir;
        const enemyCol = toC;
        const enemyCellId = rcToId(enemyRow, enemyCol);
        const enemyCellEl = document.getElementById(enemyCellId);

        if (enemyCellEl && enemyCellEl.firstChild) {
            const enemyPawn = enemyCellEl.firstChild;
            const targetType = enemyPawn.getAttribute('type');
            const targetColor = enemyPawn.getAttribute('color');
            enemyPawn.remove();

            if (targetColor === 'white') {
                const dummyPiece = createPiece(targetType, 'white');
                blackStock.appendChild(dummyPiece);

                if (targetType === 'pawn') blackScore += 1;
                else if (targetType === 'knight' || targetType === 'bishop') blackScore += 3;
                else if (targetType === 'rook') blackScore += 5;
                else if (targetType === 'queen') blackScore += 9;
                blackScoreSpan.innerHTML = blackScore;

            } else if (targetColor === 'black') {
                const dummyPiece = createPiece(targetType, 'black');
                whiteStock.appendChild(dummyPiece);

                if (targetType === 'pawn') whiteScore += 1;
                else if (targetType === 'knight' || targetType === 'bishop') whiteScore += 3;
                else if (targetType === 'rook') whiteScore += 5;
                else if (targetType === 'queen') whiteScore += 9;
                whiteScoreSpan.innerHTML = whiteScore;
            }
            checkAdvantage();
        }
    }

    toCell.appendChild(piece);
    fromCell.classList.remove('picked-piece');

    if (promo) {
        const newTypeMap = { 'q': 'queen', 'r': 'rook', 'b': 'bishop', 'n': 'knight' };
        const newType = newTypeMap[promo];
        if (newType) {
            promotePiece(piece, newType, piece.getAttribute('color'));
        } else {
            console.warn(`Unknown promotion type from engine: ${promo}`);
            promotePiece(piece, 'queen', piece.getAttribute('color'));
        }
    }

    movesHistory.push(`Black ${piece.getAttribute('type')} moves from ${fromId} to ${toId}`);
    updateHistoryList();

    clearLegalMoves();
    clearLegalAttacks();
    dropPickedPiece();

    initBoardArrayFromDOM();

    const [fr, fc] = idToRC(fromId);
    const [tr, tc] = idToRC(toId);
    const movedPiece = boardArray[tr][tc];
    setEnPassantIfNeeded(fr, fc, tr, tc, movedPiece);
    castlingRights = updateCastlingRightsAfterMove(movedPiece.color, movedPiece.type, fromId, toId);
    if (movedPiece.type === 'pawn' || isEnPassant) {
        halfmoveClock = 0;
    } else {
        halfmoveClock += 1;
    }

    if (movedPiece.color === 'black') {
        fullmoveNumber += 1;
    }
    updateFENVariables();

    ifChecked((movedPiece.color === 'white') ? 'black' : 'white');
    checkEndgameState((movedPiece.color === 'white') ? 'black' : 'white');

    changeTurn();
    turnIndicator();
    checkAdvantage();
}

let engineWorker = new Worker('engine/engineWorker.js');

engineWorker.onmessage = function(e) {
    const line = e.data;
    console.log("Engine says:", line);

    if (typeof line === 'string' && line.startsWith("bestmove")) {
        const parts = line.split(" ");
        const best = parts[1];
        console.log("Engine bestmove =", best);
        const delay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
        console.log(`Задержка перед ходом бота: ${delay} мс`);
        showEngineThinking();
        setTimeout(() => {
            applyEngineMove(best);
            hideEngineThinking();
        }, delay);
    }
};

function sendCmdToEngine(cmd) {
    console.log("Sending to engine:", cmd);
    engineWorker.postMessage(cmd);
}

sendCmdToEngine("uci");
sendCmdToEngine("isready");
sendCmdToEngine("ucinewgame");

let engineDepth = 12;
setEngineSkillLevel(10);
function startEngineIfNeeded() {
    if (turn === 'black') {
        const fen = boardToFEN(boardArray, turn, castlingRights, enPassantSquare, halfmoveClock, fullmoveNumber);
        console.log("Setting position to FEN:", fen);
        sendCmdToEngine("position fen " + fen);
        sendCmdToEngine("go depth " + engineDepth);
    }
}

startEngineIfNeeded();

function sendCurrentFENToEngine() {
    if (isPromotionPending) {
        return;
    }
    const fen = boardToFEN(
        boardArray,
        turn,
        castlingRights,
        enPassantSquare,
        halfmoveClock,
        fullmoveNumber
    );
    sendCmdToEngine("position fen " + fen);
    sendCmdToEngine("go depth " + engineDepth);
}

function showEngineThinking() {
    const thinkingEl = document.getElementById('engine-thinking');
    const playerDiv = document.getElementById('player-div')
    if (thinkingEl) {
        thinkingEl.style.display = 'block';
        playerDiv.appendChild(thinkingEl);
    }
}

function hideEngineThinking() {
    const thinkingEl = document.getElementById('engine-thinking');
    if (thinkingEl) {
        thinkingEl.style.display = 'none';
    }
}

function setupStartGameButton() {
    const startButton = document.getElementById('start-game-button');
    startButton.addEventListener('click', () => {
        if (!selectedOpponent) {
            alert('Пожалуйста, выберите соперника.');
            return;
        }
        const colorRadios = document.getElementsByName('player-color');
        colorRadios.forEach((radio) => {
            if (radio.checked) {
                playerColor = radio.value;
            }
        });
        engineDepth = selectedOpponent.depth;
        const skillLevel = selectedOpponent.skill;
        setEngineSkillLevel(skillLevel);

        updatePlayerDisplays();

        const selectionOverlay = document.getElementById('selection-overlay');
        selectionOverlay.style.display = 'none';
        turn = (playerColor === 'white') ? 'white' : 'black';
        turnIndicator();

        if (turn === 'black') {
            const fen = boardToFEN(boardArray, turn, castlingRights, enPassantSquare, halfmoveClock, fullmoveNumber);
            sendCmdToEngine("position fen " + fen);
            sendCmdToEngine("go depth " + engineDepth);
        }
    });
}

function updatePlayerDisplays() {
    if (playerColor === 'white') {
        document.querySelector('#player-black .player-name-black').innerText = selectedOpponent.name;
        document.querySelector('#player-black .player-img').src = selectedOpponent.img;
    } else {
        document.querySelector('#player-white .player-name-white').innerText = selectedOpponent.name;
        document.querySelector('#player-white .player-img').src = selectedOpponent.img;
    }
}

boardEl.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('piece')) {
        piecePick(e);
    } else if (target.classList.contains('legal-move')) {
        move(e);
    } else if (target.classList.contains('under-attack')) {
        capture(e);
    } else if (target.classList.contains('short-castle')) {
        shortCastle(e);
    } else if (target.classList.contains('long-castle')) {
        longCastle(e);
    } else {
        clearLegalMoves();
        clearLegalAttacks();
    }
});

function updateFENVariables() {
    if (enPassantTarget) {
        enPassantSquare = enPassantTarget;
    } else {
        enPassantSquare = null;
    }
}
function setEngineSkillLevel(level) {
    level = Math.max(0, Math.min(level, 20));
    sendCmdToEngine(`setoption name Skill Level value ${level}`);
}

function setEngineDepth(level) {
    engineDepth = Math.max(1, Math.min(level, 20));
    console.log(`Engine depth set to ${engineDepth}`);
}
function showGameResult(outcome) {
    const overlay = document.querySelector('.game-result-overlay');
    const resultTitle = overlay.querySelector('.result-title');
    const resultText = overlay.querySelector('.result-text');
    const resultImg = overlay.querySelector('.result-img');

    if (!selectedOpponent) {
        console.warn("No selected opponent found!");
        return;
    }

    if (outcome === 'win') {
        resultTitle.innerText = "Победа!";
        resultText.innerText = `${selectedOpponent.name} повержен. Ты показал отличную игру!`;
    } else if (outcome === 'lose') {
        resultTitle.innerText = "Поражение!";
        resultText.innerText = `${selectedOpponent.name} тебя переиграл. Не расстраивайся, можешь попробовать взять реванш.`;
    } else if (outcome === 'draw') {
        resultTitle.innerText = "Ничья";
        resultText.innerText = "Партия закончилась ничьей.";
    }

    resultImg.src = selectedOpponent.img;
    resultImg.alt = selectedOpponent.name;

    overlay.style.display = 'flex';
}

function resetGame() {
    const overlay = document.querySelector('.game-result-overlay');
    overlay.style.display = 'none';

    boardEl.innerHTML = '';

    for (let i = 0; i < boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        if (startingPosition[i]) {
            const [type, color] = startingPosition[i].split('-');
            const piece = createPiece(type, color);
            cell.append(piece);
        }
        const row = Math.ceil((boardSize - i) / 8);
        const col = (i % 8) + 1;
        const file = cols[(i % 8)];

        cell.setAttribute('cell-row', row);
        cell.setAttribute('cell-col-id', col);
        cell.setAttribute('cell-col', file);

        const cellId = `${file}${row}`;
        cell.setAttribute('id', cellId);

        if ((row + col) % 2 === 1) {
            cell.classList.add('white');
        } else {
            cell.classList.add('black');
        }

        boardEl.append(cell);
    }

    whiteScore = 0;
    blackScore = 0;
    whiteScoreSpan.innerHTML = whiteScore;
    blackScoreSpan.innerHTML = blackScore;

    whiteAdvantageSpan.innerHTML = null;
    blackAdvantageSpan.innerHTML = null;

    turn = 'white';
    turnIndicator();

    enPassantTarget = null;
    castlingRights = "KQkq";
    halfmoveClock = 0;
    fullmoveNumber = 1;

    whiteStock.innerHTML = '';
    blackStock.innerHTML = '';

    movesHistory.length = 0;
    movesHistoryList.innerHTML = '';

    initBoardArrayFromDOM();

    const selectionOverlay = document.getElementById('selection-overlay');
    selectionOverlay.style.display = 'flex';
}

function setupGameResultButton() {
    const restartButton = document.getElementById('restart-game-button');
    if (!restartButton) {
        console.warn("No element with id 'restart-game-button' found!");
        return;
    }
    restartButton.addEventListener('click', () => {
        resetGame();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupOpponentSelection();
    setupStartGameButton();
    setupGameResultButton();
});

