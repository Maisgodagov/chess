//ФИГУРЫ
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

const checkAdvantage = () => {
    if (whiteScore > blackScore) {
        whiteAdvantage = whiteScore - blackScore;
        whiteAdvantageSpan.innerHTML = '+' +whiteAdvantage;
        blackAdvantageSpan.innerHTML = null;
    } else if (whiteScore < blackScore) {
        blackAdvantage = blackScore - whiteScore;
        blackAdvantageSpan.innerHTML = '+' +blackAdvantage;
        whiteAdvantageSpan.innerHTML = null;
    } else {
        whiteAdvantageSpan.innerHTML = null;
        blackAdvantageSpan.innerHTML = null;
    }
}
const turnWhiteIndicator = document.getElementById('white-move-indicator');
const turnBlackIndicator = document.getElementById('black-move-indicator');
const turnIndicator = () => {
    if (turn === 'black') {
        turnWhiteIndicator.style.display = "none";
        turnBlackIndicator.style.display = "block";
    } else {
        turnWhiteIndicator.style.display = "block";
        turnBlackIndicator.style.display = "none";
    }
}
turnIndicator();
const createPiece = (type, color) => {
    const piece = document.createElement('div');
    piece.classList.add('piece', `${color}-${type}`);
    piece.setAttribute('type', type);
    piece.setAttribute('color', color);
    return piece;     
}
//НАЧАЛЬНАЯ РАССТАНОВКА
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

//ДОСКА
const board = document.getElementById("board");
const boardSize = 64;
const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
let checkPiece;

for (i = 0; i< boardSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');    
    if (startingPosition[i]) {
        const [type, color] = startingPosition[i].split('-');
        const piece = createPiece(type, color);
        cell.append(piece)
    }
    cell.setAttribute('cell-row', Math.ceil((boardSize - i) / 8));
    cell.setAttribute('cell-col-id', (i % 8) + 1);
    cell.setAttribute('cell-col', cols[i%8]);
    
    const colLet = cell.getAttribute('cell-col')
    const row = parseInt(cell.getAttribute('cell-row'));
    const col = parseInt(cell.getAttribute('cell-col-id'));
    cell.setAttribute('id', `${colLet}${row}`)
    if ((row + col) % 2) {
        cell.classList.add('white');
    } else {
        cell.classList.add('black');
    }
    board.append(cell);
}

// МЕСТО ДЛЯ ВЗЯТЫХ ФИГУР 


// ВОЗМОЖНЫЕ ХОДЫ
// ВОЗМОЖНЫЕ ХОДЫ И ВЗЯТИЯ ПЕШКИ 
const dropPickedPiece = () => {
    document.querySelectorAll('.picked-piece').forEach((piece) => {
        piece.classList.remove('picked-piece');
    });
}
const clearLegalMoves = () => {
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

const clearLegalAttacks = () => {
    document.querySelectorAll('.under-attack').forEach((cell) => {
        cell.classList.remove('under-attack');
    });
}

const getPawnMoves = (id) => {
    const cell = document.getElementById(id);
    const piece = cell.firstChild;
    if (!piece) return;

    const row = parseInt(cell.getAttribute('cell-row'));
    const col = cell.getAttribute('cell-col');
    const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let legalMoves = [];
    let possibleAttack = [];
    const color = piece.getAttribute('color');

    if (piece && piece.getAttribute('type') === 'pawn' && turn === color) {
        const direction = color ==='white' ? 1 : -1;
        const startRow = color === 'white' ? 2 : 7;
        const firstStep = `${col}${row + direction}`;
        const secondStep = `${col}${row + 2 * direction}`;
        const firstCell = document.getElementById(firstStep);
        if (firstCell && !firstCell.firstChild) {
            legalMoves.push(firstStep);
            if (row === startRow) {
                const secondCell = document.getElementById(secondStep);
                if (secondCell && !secondCell.firstChild) {
                    legalMoves.push(secondStep)
                }
            }
        }
        const colIndex = colLetters.indexOf(col);
        const attackLeft = colIndex > 0 ? `${cols[colIndex - 1]}${row + direction}` : null;
        const attackRight = colIndex < 7 ? `${cols[colIndex + 1]}${row + direction}` : null;
    
        if (attackLeft) {
            const targetCell = document.getElementById(attackLeft);
            if (targetCell && targetCell.firstChild) {
                const targetPiece = targetCell.firstChild;
                if (targetPiece.getAttribute('color') !== color) {
                    possibleAttack.push(attackLeft);
                }
            }
        }

        if (attackRight) {
            const targetCell = document.getElementById(attackRight);
            if (targetCell && targetCell.firstChild) {
                const targetPiece = targetCell.firstChild;
                if (targetPiece.getAttribute('color') !== color) {
                    possibleAttack.push(attackRight);
                }
            }
        }
        const allMoves = [...legalMoves, ...possibleAttack];
        const filteredMoves = filterMoveByCheck(id, allMoves, color);
        // Подсвечиваем возможные ходы 
        filteredMoves.forEach((moveId) => {
            const targetCell = document.getElementById(moveId);
            // если там вражеская фигура -> 'under-attack'
            if (targetCell.firstChild && targetCell.firstChild.getAttribute('color') !== color) {
                targetCell.classList.add('under-attack');
            } else {
                targetCell.classList.add('legal-move');
            }
        });
    
    }
}

//ХОДЫ КОНЕЙ
const getKnightMoves = (id) => {
    const cell = document.getElementById(id);
    const piece = cell.firstChild;
    const row = parseInt(cell.getAttribute('cell-row'));
    const col = parseInt(cell.getAttribute('cell-col-id'));
    const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    let legalMoves = [];
    let possibleAttack = [];
    const color = piece.getAttribute('color');
    
    if (cell && piece && piece.getAttribute('type') === 'knight' && color === turn) {
        legalMoves.push(`${colLetters[col-2]}${row+2}`);
        legalMoves.push(`${colLetters[col]}${row+2}`);
        legalMoves.push(`${colLetters[col-3]}${row+1}`);
        legalMoves.push(`${colLetters[col+1]}${row+1}`);
        legalMoves.push(`${colLetters[col-3]}${row-1}`);
        legalMoves.push(`${colLetters[col+1]}${row-1}`);
        legalMoves.push(`${colLetters[col-2]}${row-2}`);
        legalMoves.push(`${colLetters[col]}${row-2}`);

        const onTheWay = (cell) => {
            const targetCell = document.getElementById(cell);
            return targetCell && !targetCell.firstChild;
        }

        legalMoves.forEach((move)=> {
            const targetCell = document.getElementById(move);
            if (targetCell) {
                const targetRow = targetCell.getAttribute('cell-row');
                const targetCol = targetCell.getAttribute('cell-col');
                const targetPiece = targetCell.firstChild;
                if (targetPiece) {
                    const targetColor = targetPiece.getAttribute('color');
                    if (targetColor !== color) {
                        possibleAttack.push(`${targetCol}${targetRow}`)
                    }
                } 
            }
        })

        legalMoves = legalMoves.filter(onTheWay);

        legalMoves.forEach((move) => {
            const targetCell = document.getElementById(move);
            if (targetCell) {
                targetCell.classList.add('legal-move')
            }
        })    
        possibleAttack.forEach((attack) => {
            const targetCell = document.getElementById(attack);
            if (targetCell) {
                targetCell.classList.add('under-attack');
            }
        });
    } 
}

// ХОДЫ СЛОНА 
const getBishopMoves = (id) => {
    const cell = document.getElementById(id);
    const piece = cell.firstChild;
    const row = parseInt(cell.getAttribute('cell-row'));
    const col = parseInt(cell.getAttribute('cell-col-id'));
    const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    let legalMoves = [];
    let possibleAttack = [];
    const color = piece.getAttribute('color');
    
    if (piece && piece.getAttribute('type') === 'bishop' && color === turn) {
            const directions = [
                { row: 1, col: 1}, 
                { row: 1, col: -1},
                { row: -1, col: 1},
                { row: -1, col: -1}
            ];
            directions.forEach((dir) => {
                let currentRow = row;
                let currentCol = col;

                while (true) {
                    currentRow += dir.row;
                    currentCol += dir.col;
                    if (currentRow < 1 || currentRow > 8 || currentCol < 1 || currentCol > 8) {
                        break;
                    }
                    const targetCellId = `${colLetters[currentCol - 1]}${currentRow}`;
                    const targetCell = document.getElementById(targetCellId);

                    if (!targetCell) break;

                    if (targetCell.firstChild) {
                        const targetPiece = targetCell.firstChild;
                        const targetColor = targetPiece.getAttribute('color');

                        if (targetColor !== color) {
                            possibleAttack.push(targetCellId);
                        }
                        break; 
                    } else {
                        legalMoves.push(targetCellId);
                    }
                }
            })   

        legalMoves.forEach((move) => {
            const targetCell = document.getElementById(move);
            if (targetCell) {
                targetCell.classList.add('legal-move')
            }
        })    
    }
    legalMoves.forEach((move) => {
        const targetCell = document.getElementById(move);
        if (targetCell) {
            targetCell.classList.add('legal-move')
        }
    })    
    possibleAttack.forEach((attack) => {
        const targetCell = document.getElementById(attack);
        if (targetCell) {
            targetCell.classList.add('under-attack');
        }
    });
}

// ХОДЫ ЛАДЬИ 
const getRookMoves = (id) => {
    const cell = document.getElementById(id);
    const piece = cell.firstChild;
    const row = parseInt(cell.getAttribute('cell-row'));
    const col = parseInt(cell.getAttribute('cell-col-id'));
    const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    let legalMoves = [];
    let possibleAttack = [];
    const color = piece.getAttribute('color');

    if (piece && piece.getAttribute('type') === 'rook' && turn === color) {
        const directions = [
            { row: 1, col: 0 },  // Вверх
            { row: -1, col: 0 }, // Вниз
            { row: 0, col: 1 },  // Вправо
            { row: 0, col: -1 }  // Влево
        ];

        directions.forEach((dir) => {
            let currentRow = row;
            let currentCol = col;

            while (true) {
                currentRow += dir.row;
                currentCol += dir.col;

                // Проверяем границы доски
                if (currentRow < 1 || currentRow > 8 || currentCol < 1 || currentCol > 8) {
                    break;
                }

                const targetCellId = `${colLetters[currentCol - 1]}${currentRow}`;
                const targetCell = document.getElementById(targetCellId);

                if (!targetCell) break;

                if (targetCell.firstChild) {
                    // Если в клетке есть фигура
                    const targetPiece = targetCell.firstChild;
                    const targetColor = targetPiece.getAttribute('color');

                    if (targetColor !== color) {
                        // Если фигура противника, добавить клетку и завершить проверку
                        possibleAttack.push(targetCellId);
                    }
                    break; // Остановить проверку дальше по направлению
                } else {
                    // Клетка свободна
                    legalMoves.push(targetCellId);
                }
            }
        });

        // Подсвечиваем доступные клетки
        legalMoves.forEach((move) => {
            const targetCell = document.getElementById(move);
            if (targetCell) {
                targetCell.classList.add('legal-move');
            }
        });
        possibleAttack.forEach((attack) => {
            const targetCell = document.getElementById(attack);
            if (targetCell) {
                targetCell.classList.add('under-attack');
            }
        });
    }
};
// ХОДЫ КОРОЛЕВЫ
const getQueenMoves = (id) => {
    const cell = document.getElementById(id);
    const piece = cell.firstChild;
    const row = parseInt(cell.getAttribute('cell-row'));
    const col = parseInt(cell.getAttribute('cell-col-id'));
    const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    let legalMoves = [];
    let possibleAttack = [];
    const color = piece.getAttribute('color');

    if (piece && piece.getAttribute('type') === 'queen' && turn === color) {
        const directions = [
            { row: 1, col: 0 },  // Вверх
            { row: -1, col: 0 }, // Вниз
            { row: 0, col: 1 },  // Вправо
            { row: 0, col: -1 }, // Влево
            { row: 1, col: 1}, 
            { row: 1, col: -1},
            { row: -1, col: 1},
            { row: -1, col: -1}
        ];

        directions.forEach((dir) => {
            let currentRow = row;
            let currentCol = col;

            while (true) {
                currentRow += dir.row;
                currentCol += dir.col;
                // Проверяем границы доски
                if (currentRow < 1 || currentRow > 8 || currentCol < 1 || currentCol > 8) {
                    break;
                }
                const targetCellId = `${colLetters[currentCol - 1]}${currentRow}`;
                const targetCell = document.getElementById(targetCellId);

                if (!targetCell) break;

                if (targetCell.firstChild) {
                    // Если в клетке есть фигура
                    const targetPiece = targetCell.firstChild;
                    const targetColor = targetPiece.getAttribute('color');

                    if (targetColor !== color) {
                        // Если фигура противника, добавить клетку и завершить проверку
                        possibleAttack.push(targetCellId);
                    }
                    break; // Остановить проверку дальше по направлению
                } else {
                    // Клетка свободна
                    legalMoves.push(targetCellId);
                }
            }
        });
        legalMoves.forEach((move) => {
            const targetCell = document.getElementById(move);
            if (targetCell) {
                targetCell.classList.add('legal-move');
            }
        });
        possibleAttack.forEach((attack) => {
            const targetCell = document.getElementById(attack);
            if (targetCell) {
                targetCell.classList.add('under-attack');
            }
        });
    }
}
//ХОДЫ КОРОЛЯ
const getKingMoves = (id) => {
    const cell = document.getElementById(id);
    const piece = cell.firstChild;
    const row = parseInt(cell.getAttribute('cell-row'));
    const col = parseInt(cell.getAttribute('cell-col-id'));
    const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    let legalMoves = [];
    let possibleAttack = [];
    const color = piece.getAttribute('color');

    if (piece && piece.getAttribute('type') === 'king' && turn === color) {
        legalMoves.push(`${colLetters[col-1]}${row+1}`);
        legalMoves.push(`${colLetters[col]}${row+1}`);
        legalMoves.push(`${colLetters[col-2]}${row+1}`);
        legalMoves.push(`${colLetters[col-2]}${row}`);
        legalMoves.push(`${colLetters[col]}${row}`);
        legalMoves.push(`${colLetters[col-1]}${row-1}`);
        legalMoves.push(`${colLetters[col]}${row-1}`);
        legalMoves.push(`${colLetters[col-2]}${row-1}`);
    }
    const onTheWay = (cell) => {
        const targetCell = document.getElementById(cell);
        return targetCell && !targetCell.firstChild;
    }

    legalMoves.forEach((move)=> {
        const targetCell = document.getElementById(move);
        if (targetCell) {
            const targetRow = targetCell.getAttribute('cell-row');
            const targetCol = targetCell.getAttribute('cell-col');
            const targetPiece = targetCell.firstChild;
            if (targetPiece) {
                const targetColor = targetPiece.getAttribute('color');
                if (targetColor !== color) {
                    possibleAttack.push(`${targetCol}${targetRow}`)
                }
            } 
        }
    })

    legalMoves = legalMoves.filter(onTheWay);
    legalMoves.forEach((move) => {
        const targetCell = document.getElementById(move);
        if (targetCell) {
            targetCell.classList.add('legal-move');
        }
    });
    possibleAttack.forEach((attack) => {
        const targetCell = document.getElementById(attack);
        if (targetCell) {
            targetCell.classList.add('under-attack');
        }
    });
}

//ПОКАЗАТЬ ВОЗМОЖНЫЕ ХОДЫ
const showLegalMoves = (id) => {
    clearLegalMoves();
    clearLegalAttacks();
    const cell = document.getElementById(id);
    const piece = cell.firstChild;
    const color = piece.getAttribute('color');
    if (piece) {
        const type = piece.getAttribute('type');
        if(type==='pawn') {
            getPawnMoves(id);
        } else if (type === 'knight') {
            getKnightMoves(id);
        } else if (type === 'bishop') {
            getBishopMoves(id);
        } else if (type === 'rook') {
            getRookMoves(id);
        } else if (type === 'queen') {
            getQueenMoves(id);
        }
        else if (type === 'king') {
            getKingMoves(id);
            legalCastleShort(color);
            legalCastleLong(color);
        }
    } else {
    }
}

// ФИГУРА ВЫБРАНА
const piecePick = (e) => {
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

        piece.classList.add('picked-piece')
        const cell = piece.parentNode;
        const cellId = cell.getAttribute('id');
        showLegalMoves(cellId);
    }  
}

//ИСТОРИЯ ХОДОВ
const movesHistory = [];

//ХОД
const changeTurn = () => {
    if (turn === 'white') {
        turn = 'black'
    } else if (turn === 'black') {
        turn = 'white'
    }
}
const move = (e) => {
    const targetCell = e.target.closest('.cell');
    const pickedPiece = document.querySelector('.picked-piece');
    const color = pickedPiece.getAttribute('color');
    const type = pickedPiece.getAttribute('type');
    const oppColor = color === 'white' ? 'black' : 'white'
    if (targetCell && pickedPiece) {
        movesHistory.push(`${color} ${type} moves from ${pickedPiece.parentNode.id} to ${targetCell.id}`)
        targetCell.appendChild(pickedPiece);
        clearLegalMoves();
        clearLegalAttacks();
        dropPickedPiece();
        ifChecked(oppColor);
        
        turnIndicator();
        updateHistoryList();
    }
   
}

// ЗАХВАТ ФИГУРЫ 
const capturedPieces = [];
const capture = (e) => {
    const targetCell = e.target.closest('.cell');
    const pickedPiece = document.querySelector('.picked-piece');
    const pickedCell = pickedPiece.parentNode;
    const targetPiece = targetCell.firstChild;
    const targetType = targetPiece.getAttribute('type');
    const color = pickedPiece.getAttribute('color');
    const oppColor = color === 'white' ? 'black' : 'white'
    const targetColor = targetPiece.getAttribute('color');
    const type = pickedPiece.getAttribute('type');

    if (targetCell && pickedPiece) {
        movesHistory.push(`${color} ${type} takes ${targetColor} ${targetType} ${pickedCell.id} to ${targetCell.id}`);
        targetCell.appendChild(pickedPiece);
        targetPiece.remove();
        clearLegalMoves();
        clearLegalAttacks();
        dropPickedPiece();

        if (targetColor === 'white') {
            blackStock.appendChild(targetPiece);
            if (targetType === 'pawn') {
                blackScore += 1;
                blackScoreSpan.innerHTML = blackScore;
                checkAdvantage();
            } else if (targetType === 'knight' || targetType === 'bishop') {
                blackScore += 3;
                blackScoreSpan.innerHTML = blackScore;
                checkAdvantage();
            } else if (targetType === 'rook') {
                blackScore += 5;
                blackScoreSpan.innerHTML = blackScore;
                checkAdvantage();
            } else if (targetType === 'queen') {
                blackScore += 9;
                blackScoreSpan.innerHTML = blackScore;
                checkAdvantage();
            }
        } else if (targetColor === 'black') {
            whiteStock.appendChild(targetPiece);
            if (targetType === 'pawn') {
                whiteScore += 1;
                whiteScoreSpan.innerHTML = whiteScore;
                checkAdvantage();
            } else if (targetType === 'knight' || targetType === 'bishop') {
                whiteScore += 3;
                whiteScoreSpan.innerHTML = whiteScore;
                checkAdvantage();
            } else if (targetType === 'rook') {
                whiteScore += 5;
                whiteScoreSpan.innerHTML = whiteScore;
                checkAdvantage();
            } else if (targetType === 'queen') {
                whiteScore += 9;
                whiteScoreSpan.innerHTML = whiteScore;
                checkAdvantage();
            }
        }
        ifChecked(oppColor);
        turnIndicator();
        updateHistoryList();
    }
}

board.addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('piece')) {
        piecePick(e);
    } else if (target.classList.contains('legal-move')) {
        move(e);
    } else if (target.classList.contains('under-attack')) {
        capture(e);
    }else if (target.classList.contains('short-castle')) {
        shortCastle(e);
        longCastle(e);
    } else if (target.classList.contains('long-castle')) {
        longCastle(e);
    } else {
        clearLegalMoves()
        clearLegalAttacks()
    }
})

// ИСТОРИЯ ХОДОВ 
const movesHistoryList = document.getElementById('moves-history-list');

const updateHistoryList = () => {
    const latestMove = movesHistory.slice(-1)[0];
    if (movesHistory.length > 0 && latestMove) {
        const moveArr = latestMove.split(' ');
        const pieceColor = moveArr[0];
        const pieceType = moveArr[1];
        const moveType = moveArr[2];
        if (moveType === 'moves') {
            const pieceCell = moveArr[4];
            const targetCell = moveArr[6];
            const movesHistoryItem = document.createElement('li');
            movesHistoryItem.classList.add('moves-history-item', 'font')
            movesHistoryItem.innerHTML = `${pieceColor} ${pieceType} ${moveType} from ${pieceCell} to ${targetCell}`;
            movesHistoryList.appendChild(movesHistoryItem);
        } else if (moveType === 'takes') {
            const pieceCell = moveArr[5];
            const targetCell = moveArr[7];
            const targetType = moveArr[4];
            const targetColor = moveArr[3];
            const movesHistoryItem = document.createElement('li');
            movesHistoryItem.classList.add('moves-history-item', 'font')
            movesHistoryItem.innerHTML = `${pieceColor} ${pieceType} ${moveType} ${targetColor} ${targetType} from ${pieceCell} to ${targetCell}`;
            movesHistoryList.appendChild(movesHistoryItem);
        }
    }
}

// РОКИРОВКА
//проверка ходил ли король, возвращает булевое значение
const ifKingMoved = (color) => {
    if (color === 'white') {
        let result;
        movesHistory.forEach((move) =>{
            const moveArr = move.split(' ');
            if (moveArr && moveArr.includes(color) && moveArr.includes('king')) {
                result = true;
            } else {
                result = false  
            }
        })  
        return result
    } else if (color === 'black') {
        let result;
        movesHistory.forEach((move) =>{
            const moveArr = move.split(' ');
            if (moveArr && moveArr.includes(color) && moveArr.includes('king')) {
                result = true;
            } else {
                result = false
            }
        })  
        return result;
    }
    
}
//проверка пустые ли клетки между королем и ладьей для короткой рокировки, возвращает булевое значение
const ifShortCastleEmpty = (color) => {
    if (color === 'white') {
        let result;
        const f1 = document.getElementById('f1');
        const g1 = document.getElementById('g1');
        if (!f1.firstChild && !g1.firstChild) {
            result = true; 
        } else {
            result = false; 
        }
        return result;
    } else if (color === 'black') {
        let result;
        const f8 = document.getElementById('f8');
        const g8 = document.getElementById('g8');
        if (!f8.firstChild && !g8.firstChild) {
            result = true;  
        } else {
            result = false;
        }
        return result;
    }
}

//проверка пустые ли клетки между королем и ладьей для длинной рокировки, возвращает булевое значение
const ifLongCastleEmpty = (color) => {
    if (color === 'white') {
        let result;
        const b1 = document.getElementById('b1');
        const c1 = document.getElementById('c1');
        const d1 = document.getElementById('d1');
        if (!b1.firstChild && !c1.firstChild && !d1.firstChild) {
            result = true;
        } else {
            result = false;
        }
        return result;
    } else if (color === 'black') {
        let result;
        const b8 = document.getElementById('b8');
        const c8 = document.getElementById('c8');
        const d8 = document.getElementById('d8');
        if (!b8.firstChild && !c8.firstChild && !d8.firstChild) {
            result = true;
        } else {
            result = false;
        }
        return result;
    }
}
//проверка ходила ли ладья для короткой рокировки 
const ifShortRookMoved = (color) => {
    if (color === 'white') {
        let result;
        movesHistory.forEach((move) =>{
            const moveArr = move.split(' ');
            if (moveArr && moveArr.includes(color) && moveArr.includes('h1')) {
                result = true;
            } else {
                result = false
            }
        })  
        return result
    } else if (color === 'black') {
        let result;
        movesHistory.forEach((move) =>{
            const moveArr = move.split(' ');
            if (moveArr && moveArr.includes(color) && moveArr.includes('h8')) {
                result = true;
            } else {
                result = false
            }
        })  
        return result;
    }
}

//проверка ходила ли ладья для длинной рокировки 
const ifLongRookMoved = (color) => {
    if (color === 'white') {
        let result;
        movesHistory.forEach((move) =>{
            const moveArr = move.split(' ');
            if (moveArr && moveArr.includes(color) && moveArr.includes('a1')) {
                result = true;
            } else {
                result = false
            }
        })  
        return result
    } else if (color === 'black') {
        let result;
        movesHistory.forEach((move) =>{
            const moveArr = move.split(' ');
            if (moveArr && moveArr.includes(color) && moveArr.includes('a8')) {
                result = true;
            } else {
                result = false
            }
        })  
        return result;
    }
}

// Итоговая проверка короткой рокировки
const canCastleShort = (color) => {
    if (!ifKingMoved(color) && ifShortCastleEmpty(color) && !ifShortRookMoved(color)){
        return true
    } else {
        return false
    }      
}

// Итоговая проверка длинной рокировки
const canCastleLong = (color) => {
    if (!ifKingMoved(color) && ifLongCastleEmpty(color) && !ifLongRookMoved(color)){
        return true
    } else {
        return false
    }      
}

// добавляем стиль для короткой рокировки
const legalCastleShort = (color) => {
    if (color === 'white') {
        const g1 = document.getElementById('g1');
        if (canCastleShort(color)) {
            g1.classList.add('short-castle') 
        }
    } else if (color === 'black') {
        const g8 = document.getElementById('g8');
        if (canCastleShort(color)) {
            g8.classList.add('short-castle')
        }
    }
}

// добавляем стиль для короткой рокировки
const legalCastleLong = (color) => {
    if (color === 'white') {
        const c1 = document.getElementById('c1');
        if (canCastleLong(color)) {
            c1.classList.add('long-castle') 
        }
    } else if (color === 'black') {
        const c8 = document.getElementById('c8');
        if (canCastleShort(color)) {
            c8.classList.add('long-castle')
        }
    }
}
// Сама рокировка, короткая
const shortCastle = (e) => {
    const targetCell = e.target.closest('.cell');
    const pickedPiece = document.querySelector('.picked-piece');
    const color = pickedPiece.getAttribute('color');
    const type = pickedPiece.getAttribute('type');
    if (color === 'white') {
        const rook = document.getElementById('h1').firstChild;
        const rookCell = document.getElementById('f1');
        if (targetCell && pickedPiece) {
            movesHistory.push(`${color} ${type} castled short`)
            targetCell.appendChild(pickedPiece);
            rookCell.appendChild(rook)
            clearLegalMoves();
            clearLegalAttacks();
            dropPickedPiece();
            turnIndicator();
            updateHistoryList();
            console.log(movesHistory)
        }
    } else if (color === 'black') {
        const rook = document.getElementById('h8').firstChild;
        const rookCell = document.getElementById('f8');
        if (targetCell && pickedPiece) {
            movesHistory.push(`${color} ${type} castled short`)
            targetCell.appendChild(pickedPiece);
            rookCell.appendChild(rook)
            clearLegalMoves();
            clearLegalAttacks();
            dropPickedPiece();
            turnIndicator();
            updateHistoryList();
            console.log(movesHistory)
        }
    }
    if (turn === 'white') {
        turn = 'black'
    } else if (turn === 'black') {
        turn = 'white'
    }
}

// Сама рокировка, длинная
const longCastle = (e) => {
    const targetCell = e.target.closest('.cell');
    const pickedPiece = document.querySelector('.picked-piece');
    const color = pickedPiece.getAttribute('color');
    const type = pickedPiece.getAttribute('type');
    if (color === 'white') {
        const rook = document.getElementById('a1').firstChild;
        const rookCell = document.getElementById('d1');
        if (targetCell && pickedPiece) {
            movesHistory.push(`${color} ${type} castled long`)
            targetCell.appendChild(pickedPiece);
            rookCell.appendChild(rook)
            clearLegalMoves();
            clearLegalAttacks();
            dropPickedPiece();
            turnIndicator();
            updateHistoryList();
            console.log(movesHistory)
        }
    } else if (color === 'black') {
        const rook = document.getElementById('a8').firstChild;
        const rookCell = document.getElementById('d8');
        if (targetCell && pickedPiece) {
            movesHistory.push(`${color} ${type} castled short`)
            targetCell.appendChild(pickedPiece);
            rookCell.appendChild(rook)
            clearLegalMoves();
            clearLegalAttacks();
            dropPickedPiece();
            turnIndicator();
            updateHistoryList();
            console.log(movesHistory)
        }
    }
    if (turn === 'white') {
        turn = 'black'
    } else if (turn === 'black') {
        turn = 'white'
    }
}

//ШАХ 
//Проверка на шах
const getOppsLegalMoves = (color) => {
    const oppColor = color === 'white' ? 'black' : 'white';
    const oponents = document.querySelectorAll(`.piece[color="${oppColor}"]`);
    const opponentsArr = Array.from(oponents);

    const savedTurn = turn;
    turn = oppColor;
    let oponentsLegalMoves = [];
        opponentsArr.forEach((piece)=> {
            const cell = piece.parentNode;
            const cellId = cell.id;
            showLegalMoves(cellId);
            const singleMoves = document.querySelectorAll('.legal-move, .under-attack');
            const singleMovesArr = Array.from(singleMoves);
            singleMovesArr.forEach((move)=> {
                oponentsLegalMoves.push(move.id)
            })
        }) 
        
    clearLegalAttacks();
    clearLegalMoves(); 
    turn = savedTurn
    return oponentsLegalMoves; 
}


const ifChecked = (color) => {
    const king = document.querySelector(`.${color}-king`);
    const kingId = king.parentElement.id;
        let oponentsLegalMoves = getOppsLegalMoves(color);
        if (oponentsLegalMoves.includes(kingId)) {
            console.log(`Шах ${color} королю`)
            checkPiece = getCheckPiece(color);
            return true
        } else {
            return false
        }
}

const getCheckPiece = (color) => {
    const king = document.querySelector(`.${color}-king`);
    const kingId = king.parentElement.id;
    const oppColor = color === 'white' ? 'black' : 'white';
    const oponents = document.querySelectorAll(`.piece[color="${oppColor}"]`);
    const opponentsArr = Array.from(oponents);
    
    for (let piece of opponentsArr) {
        const cell = piece.parentNode;
        const cellId = cell.id;
        showLegalMoves(cellId);

        const singleMoves = document.querySelectorAll('.legal-move, .under-attack');
        const singleMovesArr = Array.from(singleMoves);

        if (singleMovesArr.some((move) => move.id === kingId)) {
            clearLegalAttacks();
            clearLegalMoves();
            
            return {
                piece: piece,
                position: cellId 
            };
            
        }

        clearLegalAttacks();
        clearLegalMoves();
        
    }

    return null;
};
//симуляция хода и проверка на шах
const simulateMove = (fromCell, toCell, color) => {
    const piece = fromCell.firstChild;
    if (!piece) return false;

    const captured = toCell.firstChild;
    toCell.appendChild(piece);
    const stillInCheck = ifChecked(color);
    fromCell.appendChild(piece);
    if (captured) {
        toCell.appendChild(captured);
    }
    return stillInCheck;
}
//фильтруем ходы, оставляем только те, которые устраняют/не генерируют шах
const filterMoveByCheck = (cellId, moveIds, color) => {
    const fromCell = document.getElementById(cellId);
    const result = [];

    moveIds.forEach((moveId)=> {
        const toCell = document.getElementById(moveId);
        if (!simulateMove(fromCell, toCell, color)) {
            result.push(moveId);
        }
    })
    return result;
}