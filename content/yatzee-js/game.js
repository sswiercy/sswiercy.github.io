const DICE_SIZE = "4em";
const DICE_DOTS = [
    [
        {x: 0.5, y: 0.5}
    ],
    [
        {x: 0.3, y: 0.3},
        {x: 0.7, y: 0.7}
    ],
    [
        {x: 0.25, y: 0.25},
        {x: 0.5, y: 0.5},
        {x: 0.75, y: 0.75}
    ],
    [
        {x: 0.3, y: 0.3},
        {x: 0.7, y: 0.3},
        {x: 0.3, y: 0.7},
        {x: 0.7, y: 0.7}
    ],
    [
        {x: 0.25, y: 0.25},
        {x: 0.75, y: 0.25},
        {x: 0.25, y: 0.75},
        {x: 0.75, y: 0.75},
        {x: 0.5, y: 0.5}
    ],
    [
        {x: 0.25, y: 0.3},
        {x: 0.5, y: 0.3},
        {x: 0.75, y: 0.3},
        {x: 0.25, y: 0.7},
        {x: 0.5, y: 0.7},
        {x: 0.75, y: 0.7}
    ]
];

function newDiceSvg(dots) {
    const lines = [];
    lines.push('<svg width="' + DICE_SIZE + '" height="' + DICE_SIZE + '" viewBox="-0.05 -0.05 1.1 1.1">');
    lines.push('<rect x="0" y="0" width="1" height="1" rx="0.2" />');
    dots.forEach(
        function (dot) {
            lines.push('<circle cx="' + dot.x + '" cy="' + dot.y + '" r="0.1" />');
        }
    );
    lines.push('</svg>');
    return lines.join("");
}

function topCalculator(value) {
    return function (values) {
        return values
            .filter(function (n) { return n == value; })
            .reduce(function (a, b) { return a + b; }, 0);
    };
}

function ofAKindCalculator(count) {
    return function (values) {
        var j = 1; 
        for (var i = 1; i < values.length; i++) {
            if (values[i - 1] != values[i]) {
                j = 1;
            } else {
                j++;
                if (j == count) {
                    return values.reduce(function (a, b) { return a + b; }, 0);
                }
            }
        }
        return 0;
    };
}

function fullHouseCalculator() {
    return function (values) {
        const counts = [0, 0, 0, 0, 0, 0];
        values.forEach(
            function (value) {
                counts[value - 1]++;
            }
        );
        counts.sort();
        return (counts[4] == 2 && counts[5] == 3) || counts[5] == 5 ? 25 : 0;
    };
}

function straightCalculator(count, score) {
    return function (values) {
        var j = 1;
        for (var i = 1; i < values.length; i++) {
            if (values[i - 1] != values[i]) {
                if (values[i - 1] + 1 != values[i]) {
                    j = 1;
                } else {
                    j++;
                    if (j == count) {
                        return score;
                    }
                }
            }
        }
        return 0;
    };
}

function yatzeeCalculator() {
    return function (values) {
        for (var i = 1; i < values.length; i++) {
            if (values[i - 1] != values[i]) {
                return 0;
            }
        }
        return 50;
    };
}

function chanceCalculator() {
    return function (values) {
        return values.reduce(function (a, b) { return a + b; }, 0);
    };
}

const CALCULATORS = [
    topCalculator(1),
    topCalculator(2),
    topCalculator(3),
    topCalculator(4),
    topCalculator(5),
    topCalculator(6),
    ofAKindCalculator(3),
    ofAKindCalculator(4),
    fullHouseCalculator(),
    straightCalculator(4, 30),
    straightCalculator(5, 40),
    yatzeeCalculator(),
    chanceCalculator()
];

var PAD_COLS = 1;
var PAD_CONTENT = {};

var COL_SCORES = {};
var TOTAL_SCORE = 0;

var ROLL_COUNT = 0;
const ROLL_COUNT_MAX = 3;
var DICE_STATE = {};

function queryDice() {
    return document.querySelectorAll("table.dice tr.dice");
}

function queryDiceCells() {
    const cells = [];
    queryDice().forEach(
        function (element, index) {
            if (DICE_STATE.hasOwnProperty(index)) {
                cells.push(element.getElementsByClassName(DICE_STATE[index].keep ? "keep" : "roll")[0]);
            }
        }
    );
    return cells;
}

function updateRoll() {
    const btn = document.getElementById("btn-roll");
    btn.innerText = "würfeln (" + ROLL_COUNT + "/" + ROLL_COUNT_MAX + ")";
    if (ROLL_COUNT == ROLL_COUNT_MAX) {
        btn.disabled = true;
        queryDiceCells().forEach(
            function (element) {
                element.children[0].onclick = null;
            }
        );
    } else {
        btn.disabled = false;
    }
}

function allDiceKept() {
    return Object.keys(DICE_STATE).every(
        function (key) {
            return DICE_STATE[key].keep;
        }
    );
}

function roll() {
    const btn = document.getElementById("btn-roll");

    queryDice().forEach(
        function (element, index) {
            if (!DICE_STATE.hasOwnProperty(index)) {
                DICE_STATE[index] = {
                    keep: false
                };
            }
            const state = DICE_STATE[index];
            if (!state.keep) {
                state.value = Math.floor(Math.random() * 6) + 1;

                const roll = element.getElementsByClassName("roll")[0];
                const keep = element.getElementsByClassName("keep")[0];

                roll.innerHTML = newDiceSvg(DICE_DOTS[state.value - 1]);
                roll.children[0].onclick = function () {
                    if (state.keep) {
                        state.keep = false;
                        this.remove();
                        roll.appendChild(this);
                        btn.disabled = false;
                    } else {
                        state.keep = true;
                        this.remove();
                        keep.appendChild(this);
                        if (allDiceKept()) {
                            btn.disabled = true;
                        }
                    }
                };
            }
        }
    );
}

function clearDice() {
    queryDiceCells().forEach(
        function (element) {
            element.innerHTML = "";
        }
    );
    DICE_STATE = {};
    updateRoll();
}

function iteratePad(callback) {
    const rows = document.getElementsByClassName("fill");
    for (var i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        for (var j = 0; j < PAD_COLS; j++) {
            const key = i + "," + j;
            if (!PAD_CONTENT.hasOwnProperty(key)) {
                const cell = cells[j];
                callback(
                    cell,
                    function (value) {
                        PAD_CONTENT[key] = value;
                        cell.innerText = value;
                    },
                    i,
                    j
                );
            }
        }
    }
};

function updatePadCols() {
    document.querySelectorAll("tr.top, tr.bot").forEach(
        function (row) {
            const cells = row.getElementsByTagName("td");
            for (var j = 0; j < PAD_COLS; j++) {
                cells[j].classList.remove("inactive");
                cells[j].innerText = "";
            }
            for (var j = PAD_COLS; j < cells.length; j++) {
                cells[j].classList.add("inactive");
                cells[j].innerText = "";
            }
        }
    );
}

function countActive() {
    var count = 0;
    iteratePad(function () { count++; });
    return count;
}

function activatePad() {
    iteratePad(
        function (cell, setter, i, j) {
            const calculator = CALCULATORS[i];
            cell.onclick = function () {
                deactivatePad();
                setter(
                    calculator(
                        Object.keys(DICE_STATE)
                            .map(function (key) { return DICE_STATE[key].value; })
                            .sort()
                    )
                );

                accumulatePadCol(j);
                accumulateScore();

                if (countActive() == 0) {
                    ROLL_COUNT = ROLL_COUNT_MAX;
                    saveScore();
                    setTimeout(
                        function () {
                            alert("Spiel mit " + TOTAL_SCORE + " Punkten abgeschlossen!");
                        },
                        100
                    );
                } else {
                    ROLL_COUNT = 0;
                }

                clearDice();
            };
            cell.classList.add("empty");
        }
    );
}

function deactivatePad() {
    iteratePad(
        function (cell) {
            cell.onclick = null;
            cell.classList.remove("empty");
        }
    );
}

function accumulatePadCell(classNames, colIndex, value) {
    const rows = document.getElementsByClassName(classNames);
    for (var i = 0; i < rows.length; i++) {
        rows[i].getElementsByTagName("td")[colIndex].innerText = value;
    }
}

function accumulatePadCol(colIndex) {
    var topSum = 0;
    var botTotal = 0;

    const rows = document.getElementsByClassName("fill");
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].classList.contains("top")) {
            topSum += PAD_CONTENT[i + "," + colIndex] || 0;
        }
        if (rows[i].classList.contains("bot")) {
            botTotal += PAD_CONTENT[i + "," + colIndex] || 0;
        }
    }

    const topBonus = topSum >= 63 ? 35 : 0;
    const topTotal = topSum + topBonus;
    const topBotTotal = botTotal + topTotal;

    accumulatePadCell("top sum", colIndex, topSum);
    accumulatePadCell("top bonus", colIndex, topBonus);
    accumulatePadCell("top total", colIndex, topTotal);
    accumulatePadCell("bot total", colIndex, botTotal);
    accumulatePadCell("top bot total", colIndex, topBotTotal);

    COL_SCORES[colIndex] = topBotTotal;
}

function accumulateScore() {
    TOTAL_SCORE = Object.keys(COL_SCORES)
        .map(function (key) { return COL_SCORES[key]; })
        .reduce(function (a, b) { return a + b; }, 0);

    document.querySelectorAll("tr.top.bot.total th.cat").forEach(
        function (element) {
            element.innerText = "gesamt = " + TOTAL_SCORE;
        }
    );
}

function accumulatePad() {
    for (var i = 0; i < PAD_COLS; i++) {
        accumulatePadCol(i);
    }
    accumulateScore();
}

window.onload = function () {
    updatePadCols();
    accumulatePad();
    updateRoll();

    document.getElementById("btn-roll").onclick = function () {
        if (ROLL_COUNT++ == 0) {
            activatePad();
        }
        roll();
        updateRoll();
    };

    document.getElementById("btn-restart").onclick = function () {
        if (confirm("Ein neues Spiel mit der ausgewählten Anzahl an Spalten starten?")) {
            deactivatePad();
            
            PAD_COLS = document.getElementById("col-count").selectedIndex + 1;
            PAD_CONTENT = {};
            COL_SCORES = {};
            ROLL_COUNT = 0;

            updatePadCols();
            accumulatePad();
            clearDice();
        }
    };

    document.getElementById("btn-highscore").onclick = function () {
        window.open("highscore", "_blank");
    };
};