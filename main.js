const whiteStock = document.getElementById('white-taken-pieces');
const blackStock = document.getElementById('black-taken-pieces');

let whiteScore = 0;
let blackScore = 0;
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

const turnWhiteIndicator = document.getElementById('white-move-indicator');
const turnBlackIndicator = document.getElementById('black-move-indicator');

function checkAdvantage() {
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

/***************************************************
 * 2) СОЗДАНИЕ ДОСКИ (DOM) И НАЧАЛЬНОЙ РАССТАНОВКИ
 ***************************************************/
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

// Генерируем клетки .cell
for (let i = 0; i < boardSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    if (startingPosition[i]) {
        const [type, color] = startingPosition[i].split('-');
        const piece = createPiece(type, color);
        cell.append(piece);
    }

    const row = Math.ceil((boardSize - i) / 8);  // 8..1 (снизу вверх)
    const col = (i % 8) + 1;                    // 1..8
    const file = cols[(i % 8)];                 // 'a'..'h'

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

/***************************************************
 * 3) ПАРАЛЛЕЛЬНАЯ «ЛОГИЧЕСКАЯ» МОДЕЛЬ boardArray[8][8]
 ***************************************************/
let boardArray = new Array(8).fill(null).map(() => new Array(8).fill(null));

// Сопоставление буквы 'a'..'h' => индекс 0..7
const fileToIndex = { 'a':0,'b':1,'c':2,'d':3,'e':4,'f':5,'g':6,'h':7 };

// Преобразование id ("a1") -> (row,col) / (0..7, 0..7).
// При вашем коде: a1 = row=7,col=0, a8 = row=0,col=0 (верх)
function idToRC(id) {
    const file = id[0];        
    const rank = parseInt(id[1], 10);
    const col = fileToIndex[file];     
    const row = 8 - rank;             // a1 => rank=1 => row=7
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
        const [r, c] = idToRC(id);
        const pieceEl = cellEl.querySelector('.piece');
        if (pieceEl) {
            const type = pieceEl.getAttribute('type');
            const color = pieceEl.getAttribute('color');
            boardArray[r][c] = {
                type,
                color,
                hasMoved: false 
            };
        }
    });
}
initBoardArrayFromDOM();

/***************************************************
 * 4) ОЧИСТКА ПОДСВЕТКИ
 ***************************************************/
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

/***************************************************
 * 5) EN PASSANT (глобальная переменная)
 ***************************************************/
let enPassantTarget = null;

/***************************************************
 * 6) ГЕНЕРАТОР ХОДОВ (с учётом en passant)
 ***************************************************/
function onBoard(r, c) {
    return r>=0 && r<8 && c>=0 && c<8;
}
function canMoveOrCapture(board, r, c, color) {
    if (!onBoard(r,c)) return false;
    const target = board[r][c];
    if (!target) return true; 
    if (target.color !== color) return true; 
    return false; 
}

// --- Pawn (с en passant) ---
function generatePawnMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = piece.color;

    // ВАЖНО: у вас белые идут "row--", значит dir=-1 (белым), +1 (чёрным)
    let dir = (color === 'white') ? -1 : +1;
    let moves = [];

    // Ход вперёд на 1
    let f1 = r + dir;
    if (onBoard(f1,c) && !board[f1][c]) {
        moves.push({fromR:r, fromC:c, toR:f1, toC:c, enPassant:false});
    }

    // Двойной ход
    let startRow = (color==='white') ? 6 : 1;
    if (r===startRow && !board[f1][c]) {
        let f2 = r + 2*dir;
        if (onBoard(f2,c) && !board[f2][c]) {
            moves.push({fromR:r, fromC:c, toR:f2, toC:c, enPassant:false, doublePawn:true});
        }
    }

    // Взятия по диагоналям
    for (let dc of [-1,+1]) {
        let cc = c + dc;
        if (onBoard(f1,cc)) {
            const targ = board[f1][cc];
            if (targ && targ.color !== color) {
                moves.push({
                    fromR:r, fromC:c,
                    toR:f1, toC:cc,
                    enPassant:false
                });
            }
        }
    }

    // EN PASSANT (если enPassantTarget) => диагональ на пустую клетку
    if (enPassantTarget) {
        let epR = enPassantTarget.r;
        let epC = enPassantTarget.c;
        for (let dc of [-1,+1]) {
            let rr = r + dir;
            let cc = c + dc;
            if (rr === epR && cc === epC) {
                // Ход
                moves.push({
                    fromR:r, fromC:c,
                    toR:epR, toC:epC,
                    enPassant:true
                });
            }
        }
    }

    return moves;
}

// Остальные фигуры
function generateKnightMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = piece.color;
    let moves = [];
    const offsets = [
        [-2,-1],[-2,+1],[-1,-2],[-1,+2],
        [+1,-2],[+1,+2],[+2,-1],[+2,+1]
    ];
    for (let [dr,dc] of offsets) {
        let rr=r+dr, cc=c+dc;
        if (onBoard(rr,cc) && canMoveOrCapture(board,rr,cc,color)) {
            moves.push({fromR:r,fromC:c,toR:rr,toC:cc});
        }
    }
    return moves;
}

function generateBishopMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    let moves = [];
    const color = piece.color;
    const directions = [[-1,-1],[-1,+1],[+1,-1],[+1,+1]];
    for (let [dr,dc] of directions) {
        let rr=r, cc=c;
        while(true){
            rr+=dr; cc+=dc;
            if (!onBoard(rr,cc)) break;
            if (canMoveOrCapture(board,rr,cc,color)) {
                moves.push({fromR:r,fromC:c,toR:rr,toC:cc});
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
    const directions = [[-1,0],[+1,0],[0,-1],[0,+1]];
    for (let [dr,dc] of directions) {
        let rr=r, cc=c;
        while(true){
            rr+=dr; cc+=dc;
            if (!onBoard(rr,cc)) break;
            if (canMoveOrCapture(board,rr,cc,color)) {
                moves.push({fromR:r, fromC:c, toR:rr, toC:cc});
                if (board[rr][cc]) break;
            } else {
                break;
            }
        }
    }
    return moves;
}

function generateQueenMoves(board, r, c) {
    return generateRookMoves(board,r,c).concat(generateBishopMoves(board,r,c));
}

function generateKingMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const color = piece.color;
    let moves=[];
    const offsets=[
        [-1,-1],[-1,0],[-1,+1],
        [0,-1],[0,+1],
        [+1,-1],[+1,0],[+1,+1]
    ];
    for (let [dr,dc] of offsets) {
        let rr=r+dr, cc=c+dc;
        if (onBoard(rr,cc) && canMoveOrCapture(board, rr, cc, color)) {
            moves.push({fromR:r,fromC:c,toR:rr,toC:cc});
        }
    }
    return moves;
}

// Псевдоходы
function generatePseudoMoves(board, color) {
    let moves=[];
    for (let r=0; r<8; r++){
        for (let c=0; c<8; c++){
            const p=board[r][c];
            if (!p) continue;
            if (p.color!==color) continue;
            switch(p.type){
                case 'pawn':
                    moves=moves.concat(generatePawnMoves(board,r,c));
                    break;
                case 'knight':
                    moves=moves.concat(generateKnightMoves(board,r,c));
                    break;
                case 'bishop':
                    moves=moves.concat(generateBishopMoves(board,r,c));
                    break;
                case 'rook':
                    moves=moves.concat(generateRookMoves(board,r,c));
                    break;
                case 'queen':
                    moves=moves.concat(generateQueenMoves(board,r,c));
                    break;
                case 'king':
                    moves=moves.concat(generateKingMoves(board,r,c));
                    break;
            }
        }
    }
    return moves;
}

// Проверка, под боем ли король
function isKingInCheck(board, color) {
    let kr=-1, kc=-1;
    for (let r=0; r<8; r++){
        for (let c=0; c<8; c++){
            const p=board[r][c];
            if (p && p.type==='king' && p.color===color) {
                kr=r; kc=c; break;
            }
        }
        if (kr!==-1) break;
    }
    if (kr===-1) {
        return true; 
    }
    const oppColor=(color==='white')?'black':'white';
    const oppMoves=generatePseudoMoves(board, oppColor);
    return oppMoves.some(m=>m.toR===kr && m.toC===kc);
}

// Генерация всех легальных ходов
function generateAllLegalMoves(board, color) {
    const pseudo=generatePseudoMoves(board, color);
    let legal=[];
    pseudo.forEach((move)=>{
        const {fromR,fromC,toR,toC,enPassant} = move;
        const piece=board[fromR][fromC];
        const savedTarget=board[toR][toC];

        // EN PASSANT
        let capturedSquare = { r: toR, c: toC };
        if (enPassant) {
            // белые (dir=-1), чёрные (dir=+1)
            const dir = (piece.color==='white') ? -1 : +1;
            capturedSquare.r = toR - dir;
            capturedSquare.c = toC;
        }

        const savedCaptured = board[capturedSquare.r][capturedSquare.c];
        
        // «Виртуальный» ход
        board[fromR][fromC] = null;
        board[capturedSquare.r][capturedSquare.c] = null;  
        board[toR][toC] = piece;

        // Проверяем шах
        const inCheck = isKingInCheck(board, color);

        // Откат
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

/***************************************************
 * 7) ПОКАЗАТЬ ХОДЫ
 ***************************************************/
function showLegalMoves(cellId) {
    clearLegalMoves();
    clearLegalAttacks();

    initBoardArrayFromDOM();

    const [r,c] = idToRC(cellId);
    const piece = boardArray[r][c];
    if (!piece) return;
    if (piece.color !== turn) return; 

    const allMoves=generateAllLegalMoves(boardArray, turn);
    const pieceMoves=allMoves.filter(m=>m.fromR===r && m.fromC===c);

    pieceMoves.forEach((move)=>{
        const toId= rcToId(move.toR, move.toC);
        const cellEl = document.getElementById(toId);
        if (!cellEl) return;
        const targPiece = cellEl.querySelector('.piece');
        if (targPiece) {
            const tgtColor = targPiece.getAttribute('color');
            if (tgtColor!==piece.color) {
                cellEl.classList.add('under-attack');
            }
        } else {
            cellEl.classList.add('legal-move');
        }
    });

    // Рокировка
    legalCastleShort(piece.color);
    legalCastleLong(piece.color);
}

/***************************************************
 * 8) ОБРАБОТКА ВЫБОРА ФИГУРЫ
 ***************************************************/
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

/***************************************************
 * 9) ИСТОРИЯ ХОДОВ
 ***************************************************/
const movesHistory = [];
const movesHistoryList = document.getElementById('moves-history-list');

function updateHistoryList() {
    const latestMove = movesHistory.slice(-1)[0];
    if (!latestMove) return;
    const moveArr = latestMove.split(' ');
    const pieceColor = moveArr[0];
    const pieceType = moveArr[1];
    const moveType = moveArr[2];
    if (moveType === 'moves') {
        const pieceCell = moveArr[4];
        const targetCell = moveArr[6];
        const li = document.createElement('li');
        li.innerHTML = `${pieceColor} ${pieceType} moves from ${pieceCell} to ${targetCell}`;
        movesHistoryList.appendChild(li);
    } else if (moveType === 'takes') {
        const pieceCell = moveArr[5];
        const targetCell = moveArr[7];
        const targetType = moveArr[4];
        const targetColor = moveArr[3];
        const li = document.createElement('li');
        li.innerHTML = `${pieceColor} ${pieceType} takes ${targetColor} ${targetType} from ${pieceCell} to ${targetCell}`;
        movesHistoryList.appendChild(li);
    } else if (moveType === 'castled') {
        // ...
    }
}

/***************************************************
 * 10) EN PASSANT ЛОГИКА: УСТАНОВКА/СБРОС
 ***************************************************/
function setEnPassantIfNeeded(fromR, fromC, toR, toC, piece) {
    if (piece.type==='pawn') {
        // Если белая => dir=-1, если чёрная => dir=+1
        const dir = (piece.color==='white') ? -1 : +1;
        // Если сходили на 2 клетки
        if (Math.abs(toR - fromR)===2) {
            // Промежуточная
            const midRow = (fromR + toR)/2; 
            const midCol = toC;
            enPassantTarget = { r: midRow, c: midCol };
            console.log('setEnPassantTarget =>', enPassantTarget);
            return;
        }
    }
    enPassantTarget = null;
}

/***************************************************
 * 11) СОВЕРШЕНИЕ ХОДА / СЪЕДАНИЯ
 ***************************************************/
function changeTurn() {
    turn = (turn==='white')?'black':'white';
}

function move(e) {
    const targetCell = e.target.closest('.cell');
    const pickedPiece = document.querySelector('.picked-piece');
    if (!targetCell || !pickedPiece) return;

    const color = pickedPiece.getAttribute('color');
    const type = pickedPiece.getAttribute('type');
    const fromId = pickedPiece.parentNode.id;
    const toId = targetCell.id;
    const oppColor = (color==='white'?'black':'white');

    movesHistory.push(`${color} ${type} moves from ${fromId} to ${toId}`);
    targetCell.appendChild(pickedPiece);

    clearLegalMoves();
    clearLegalAttacks();
    dropPickedPiece();

    // Обновить boardArray
    initBoardArrayFromDOM();

    // EN PASSANT: если пешка пошла на 2 клетки
    const [fr, fc] = idToRC(fromId);
    const [tr, tc] = idToRC(toId);
    const movedPiece = boardArray[tr][tc];
    setEnPassantIfNeeded(fr, fc, tr, tc, movedPiece);

    ifChecked(oppColor);
    checkEndgameState(oppColor);
    changeTurn();
    turnIndicator();
    updateHistoryList();
}

// *** EN PASSANT-Ориентированная capture ***
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
    const oppColor = (color==='white') ? 'black' : 'white';

    const targetPiece = targetCell.firstChild;
    let targetType = null;
    let targetColor = null;
    if (targetPiece) {
        targetType = targetPiece.getAttribute('type');
        targetColor = targetPiece.getAttribute('color');
    }

    // Проверяем, enPassant ли
    let isEnPassant = false;
    if (
        type==='pawn' &&
        Math.abs(fromC - toC)===1 &&
        Math.abs(fromR - toR)===1 &&
        !targetPiece
    ) {
        isEnPassant = true;
    }

    if (isEnPassant) {
        // Для белых => dir=-1, для чёрных => dir=+1
        const dir = (color==='white') ? -1 : +1;
        const enemyRow = toR - dir;
        const enemyCol = toC;
        const enemyCellId = rcToId(enemyRow, enemyCol);
        const enemyCellEl = document.getElementById(enemyCellId);

        console.log('EN PASSANT!',
            'color=', color, 'dir=', dir,
            'from=', fromR, fromC, 'to=', toR, toC,
            'enemyRow=', enemyRow, 'enemyCol=', enemyCol,
            'enemyCellId=', enemyCellId
        );

        if (enemyCellEl && enemyCellEl.firstChild) {
            const enemyPawn = enemyCellEl.firstChild;
            targetType = enemyPawn.getAttribute('type');  // 'pawn'
            targetColor = enemyPawn.getAttribute('color');

            // Удаляем вражескую пешку
            enemyPawn.remove();
            console.log('Removed enemy pawn for en passant');

            movesHistory.push(`${color} ${type} takes ${targetColor} ${targetType} enPassant ${fromId} to ${toId}`);
        } else {
            console.warn('enPassant: не нашли пешку соперника!', enemyRow, enemyCol);
        }

        // Ставим пешку на toId
        targetCell.appendChild(pickedPiece);

    } else {
        // Обычное взятие
        movesHistory.push(`${color} ${type} takes ${targetColor} ${targetType} ${fromId} to ${toId}`);

        targetCell.appendChild(pickedPiece);
        if (targetPiece) {
            targetPiece.remove();
        }
    }

    clearLegalMoves();
    clearLegalAttacks();
    dropPickedPiece();

    // Добавляем фигуру соперника в "сток" + очки
    if (targetColor === 'white') {
        const dummyPiece = createPiece(targetType, 'white');
        blackStock.appendChild(dummyPiece);

        if (targetType==='pawn') blackScore+=1;
        else if (targetType==='knight'||targetType==='bishop') blackScore+=3;
        else if (targetType==='rook') blackScore+=5;
        else if (targetType==='queen') blackScore+=9;
        blackScoreSpan.innerHTML=blackScore;

    } else if (targetColor === 'black') {
        const dummyPiece = createPiece(targetType, 'black');
        whiteStock.appendChild(dummyPiece);

        if (targetType==='pawn') whiteScore+=1;
        else if (targetType==='knight'||targetType==='bishop') whiteScore+=3;
        else if (targetType==='rook') whiteScore+=5;
        else if (targetType==='queen') whiteScore+=9;
        whiteScoreSpan.innerHTML=whiteScore;
    }
    checkAdvantage();

    initBoardArrayFromDOM();

    // Сбрасываем enPassantTarget (если не использовано, пропадает)
    enPassantTarget = null;

    ifChecked(oppColor);
    checkEndgameState(oppColor);

    changeTurn();
    turnIndicator();
    updateHistoryList();
}

/***************************************************
 * 12) ОБРАБОТЧИК НАЖАТИЙ НА ДОСКУ
 ***************************************************/
boardEl.addEventListener('click', (e)=>{
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

/***************************************************
 * 13) РОКИРОВКА (ваш код)
 ***************************************************/
function ifKingMoved(color) {
    let result=false;
    movesHistory.forEach((move)=>{
        const arr=move.split(' ');
        if (arr.includes(color) && arr.includes('king')){
            result=true;
        }
    });
    return result;
}
function ifShortCastleEmpty(color) {
    if (color==='white'){
        const f1=document.getElementById('f1');
        const g1=document.getElementById('g1');
        return (!f1.firstChild && !g1.firstChild);
    } else {
        const f8=document.getElementById('f8');
        const g8=document.getElementById('g8');
        return (!f8.firstChild && !g8.firstChild);
    }
}
function ifLongCastleEmpty(color) {
    if (color==='white') {
        const b1=document.getElementById('b1');
        const c1=document.getElementById('c1');
        const d1=document.getElementById('d1');
        return (!b1.firstChild && !c1.firstChild && !d1.firstChild);
    } else {
        const b8=document.getElementById('b8');
        const c8=document.getElementById('c8');
        const d8=document.getElementById('d8');
        return (!b8.firstChild && !c8.firstChild && !d8.firstChild);
    }
}
function ifShortRookMoved(color) {
    let result=false;
    movesHistory.forEach((move)=>{
        const arr=move.split(' ');
        if (color==='white') {
            if (arr.includes('white') && arr.includes('h1')) result=true;
        } else {
            if (arr.includes('black') && arr.includes('h8')) result=true;
        }
    });
    return result;
}
function ifLongRookMoved(color) {
    let result=false;
    movesHistory.forEach((move)=>{
        const arr=move.split(' ');
        if (color==='white') {
            if (arr.includes('white') && arr.includes('a1')) result=true;
        } else {
            if (arr.includes('black') && arr.includes('a8')) result=true;
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
    if (color==='white') {
        const g1=document.getElementById('g1');
        g1.classList.add('short-castle');
    } else {
        const g8=document.getElementById('g8');
        g8.classList.add('short-castle');
    }
}
function legalCastleLong(color) {
    if (!canCastleLong(color)) return;
    if (color==='white'){
        const c1=document.getElementById('c1');
        c1.classList.add('long-castle');
    } else {
        const c8=document.getElementById('c8');
        c8.classList.add('long-castle');
    }
}
function shortCastle(e) {
    const targetCell=e.target.closest('.cell');
    const pickedPiece=document.querySelector('.picked-piece');
    if(!targetCell||!pickedPiece)return;
    const color=pickedPiece.getAttribute('color');
    const type=pickedPiece.getAttribute('type');

    if(color==='white'){
        const rookCell=document.getElementById('h1');
        const rook=rookCell.firstChild;
        const f1=document.getElementById('f1');

        movesHistory.push(`${color} ${type} castled short`);
        targetCell.appendChild(pickedPiece);
        f1.appendChild(rook);
    } else {
        const rookCell=document.getElementById('h8');
        const rook=rookCell.firstChild;
        const f8=document.getElementById('f8');

        movesHistory.push(`${color} ${type} castled short`);
        targetCell.appendChild(pickedPiece);
        f8.appendChild(rook);
    }
    clearLegalMoves();
    clearLegalAttacks();
    dropPickedPiece();

    initBoardArrayFromDOM();

    changeTurn();
    turnIndicator();
    updateHistoryList();
}
function longCastle(e) {
    const targetCell=e.target.closest('.cell');
    const pickedPiece=document.querySelector('.picked-piece');
    if(!targetCell||!pickedPiece)return;
    const color=pickedPiece.getAttribute('color');
    const type=pickedPiece.getAttribute('type');

    if(color==='white'){
        const rookCell=document.getElementById('a1');
        const rook=rookCell.firstChild;
        const d1=document.getElementById('d1');

        movesHistory.push(`${color} ${type} castled long`);
        targetCell.appendChild(pickedPiece);
        d1.appendChild(rook);
    } else {
        const rookCell=document.getElementById('a8');
        const rook=rookCell.firstChild;
        const d8=document.getElementById('d8');

        movesHistory.push(`${color} ${type} castled short`);
        targetCell.appendChild(pickedPiece);
        d8.appendChild(rook);
    }
    clearLegalMoves();
    clearLegalAttacks();
    dropPickedPiece();

    initBoardArrayFromDOM();

    changeTurn();
    turnIndicator();
    updateHistoryList();
}

/***************************************************
 * 14) ПРОВЕРКА ШАХА + МАТ / ПАТ
 ***************************************************/
function ifChecked(color) {
    initBoardArrayFromDOM();
    const inCheck = isKingInCheck(boardArray, color);

    // Удалим .checked, если был
    const whiteKingEl=document.querySelector('.white-king');
    const blackKingEl=document.querySelector('.black-king');
    if (whiteKingEl) whiteKingEl.classList.remove('checked');
    if (blackKingEl) blackKingEl.classList.remove('checked');

    if (inCheck) {
        console.log(`Шах ${color} королю`);
        const kingEl=document.querySelector(`.${color}-king`);
        if (kingEl) {
            // Пример: добавим класс .checked
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
            // alert('Checkmate!');
        } else {
            console.log(`Пат! Ничья`);
            // alert('Stalemate!');
        }
    }
}
