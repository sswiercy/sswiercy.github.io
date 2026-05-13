const TYPES = {
    GRASS: {
        char: "G",
        className: "grass"
    },
    TREE: {
        char: "T",
        className: "tree"
    },
    WATER: {
        char: "W",
        className: "water"
    },
    HOUSE: {
        char: "H",
        className: "house"
    },
    PATH: {
        char: "P",
        className: "path"
    },
    BRIDGE: {
        char: "B",
        className: "bridge"
    }
};

const TYPES_BY_CHAR = new Map(
    Object.keys(TYPES).map(
        function (key) {
            return [TYPES[key].char, TYPES[key]];
        }
    )
);

const TYPES_BY_CLASS_NAME = new Map(
    Object.keys(TYPES).map(
        function (key) {
            return [TYPES[key].className, TYPES[key]];
        }
    )
);

const PATH_AND_BRIDGE = [TYPES.PATH, TYPES.BRIDGE];

const PATH_AND_BRIDGE_SET = new Set(PATH_AND_BRIDGE);

const GRASS_COMPATIBLE = new Set(PATH_AND_BRIDGE.concat(TYPES.HOUSE));

TYPES.GRASS.flat = TYPES.GRASS;
TYPES.TREE.flat = TYPES.TREE;
TYPES.WATER.flat = TYPES.WATER;
TYPES.HOUSE.flat = TYPES.GRASS;
TYPES.PATH.flat = TYPES.GRASS;
TYPES.BRIDGE.flat = TYPES.WATER;

TYPES.GRASS.press = {
    short: TYPES.PATH,
    long: TYPES.HOUSE
};

TYPES.WATER.press = {
    short: TYPES.BRIDGE
};

TYPES.HOUSE.press = {
    short: TYPES.GRASS,
    long: TYPES.PATH
};

TYPES.PATH.press = {
    short: TYPES.GRASS,
    long: TYPES.HOUSE
};

TYPES.BRIDGE.press = {
    short: TYPES.WATER
};

TYPES.GRASS.validationByType = new Map(
    [
        [
            TYPES.PATH,
            validateAll(
                [
                    withMessage(counterLimitReached(TYPES.PATH), ["no-more-paths"]),
                    withMessage(
                        validateAny(
                            [
                                countersAllZero(PATH_AND_BRIDGE),
                                neighborIs(PATH_AND_BRIDGE_SET)
                            ]
                        ),
                        ["path-isolated"]
                    )
                ]
            )
        ],
        [
            TYPES.HOUSE,
            validateAll(
                [
                    withMessage(counterLimitReached(TYPES.HOUSE), ["no-more-houses"]),
                    withMessage(neighborIs(PATH_AND_BRIDGE_SET), ["house-isolated"]),
                ]
            )
        ]
    ]
);

TYPES.WATER.validationByType = new Map(
    [
        [
            TYPES.BRIDGE,
            validateAll(
                [
                    withMessage(counterLimitReached(TYPES.BRIDGE), ["no-more-bridges"]),
                    withMessage(noNeighborIsBridge, ["adjacent-bridges"]),
                    withMessage(
                        validateAny(
                            [
                                countersAllZero(PATH_AND_BRIDGE),
                                neighborIs(new Set([TYPES.PATH]))
                            ]
                        ),
                        ["bridge-isolated"]
                    )
                ]
            )
        ]
    ]
);

TYPES.HOUSE.validationByType = new Map(
    [
        [
            TYPES.GRASS,
            validateNone
        ],
        [
            TYPES.PATH,
            withMessage(counterLimitReached(TYPES.PATH), ["no-more-house-to-path"])
        ]
    ]
);

TYPES.PATH.validationByType = new Map(
    [
        [
            TYPES.GRASS,
            validateAll(
                [
                    withMessage(neighboringHousesAreNextToOtherPathOrBridge, ["house-isolated-by-path"]),
                    withMessage(pathsBridgesStillConnected, ["disconnected-by-path"])
                ]
            )
        ],
        [
            TYPES.HOUSE,
            validateAll(
                [
                    withMessage(counterLimitReached(TYPES.HOUSE), ["no-more-path-to-house"]),
                    withMessage(neighboringHousesAreNextToOtherPathOrBridge, ["house-isolated-by-house"]),
                    withMessage(pathsBridgesStillConnected, ["disconnected-by-house"]),
                    withMessage(neighborIs(PATH_AND_BRIDGE_SET), ["path-to-house-isolated"])
                ]
            )
        ]
    ]
);

TYPES.BRIDGE.validationByType = new Map(
    [
        [
            TYPES.WATER,
            validateAll(
                [
                    withMessage(neighboringHousesAreNextToOtherPathOrBridge, ["house-isolated-by-bridge"]),
                    withMessage(pathsBridgesStillConnected, ["disconnected-by-bridge"])
                ]
            )
        ]
    ]
);

const SCREENS = {
    MAIN_MENU: {
        element: null,
        in: {
            start: null,
            end: function () {
                disableButtons("div.main-menu button", false);
            }
        },
        out: {
            start: function () {
                disableButtons("div.main-menu button", true);
            },
            end: null
        }
    },
    HOW_TO_PLAY: {
        element: null,
        in: {
            start: function () {},
            end: function () {
                disableButtons("div.how-to-play button", false);
            }
        },
        out: {
            start: function () {
                disableButtons("div.how-to-play button", true);
            },
            end: function () {}
        }
    },
    LEVEL_SELECT: {
        element: null,
        in: {
            start: null,
            end: function () {
                disableButtons("div.level-select button", false);
            }
        },
        out: {
            start: function () {
                disableButtons("div.level-select button", true);
            },
            end: function () {}
        }
    },
    GAME: {
        element: null,
        in: {
            start: null,
            end: function () {
                disableDialogButtons(true);
            }
        },
        out: {
            start: function () {
                disableButtons("div.game button", true);
            },
            end: null
        }
    }
};

const LOCAL_STORAGE_COMPLETED_KEY = "settlement-completed";

const LOCAL_STORAGE_LEVEL_KEY = "settlement-level";

const LOCAL_STORAGE_GRID_KEY = "settlement-grid";

const LOCAL_STORAGE_LANG_KEY = "settlement-lang";

const LOCAL_STORAGE_THEME_KEY = "settlement-theme";

var COMPLETED_LEVELS;

var LEVEL_DATA;

var langApplyOne;

function stringSetChar(string, index, char) {
    return string.substring(0, index) + char + string.substring(index + 1);
}

function setLevelCompleted(levelIndex) {
    if (!getLevelCompleted(levelIndex)) {
        const byteIndex = Math.floor(levelIndex / 8);
        const bitIndex = levelIndex % 8;
        COMPLETED_LEVELS = stringSetChar(
            COMPLETED_LEVELS,
            byteIndex,
            String.fromCharCode(COMPLETED_LEVELS[byteIndex].charCodeAt() | (1 << bitIndex))
        );
        saveLevelCompleted();
    }
}

function getLevelCompleted(levelIndex) {
    const byteIndex = Math.floor(levelIndex / 8);
    const bitIndex = levelIndex % 8;
    return (COMPLETED_LEVELS[byteIndex].charCodeAt() >> bitIndex) & 1;
}

function loadLevelCompleted() {
    const numberOfBytes = Math.ceil(LEVELS.length / 8);
    const defaultDataString = String.fromCharCode(0).repeat(numberOfBytes);
    const value = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY);
    if (value == null) {
        return defaultDataString;
    }
    try {
        const dataString = atob(value);
        if (dataString.length != numberOfBytes) {
            return defaultDataString;
        }
        return dataString;
    } catch (e) {
        return defaultDataString;
    }
}

function saveLevelCompleted() {
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, btoa(COMPLETED_LEVELS));
}

function countLevelCompleted() {
    var count = 0;
    for (var i = 0; i < LEVELS.length; i++) {
        if (getLevelCompleted(i)) {
            count++;
        }
    }
    return count;
}

function loadLevelIndex() {
    const value = localStorage.getItem(LOCAL_STORAGE_LEVEL_KEY);
    if (value == null) {
        return 0;
    }
    const levelIndex = parseInt(value);
    if (isNaN(levelIndex) ||
        levelIndex < 0 ||
        levelIndex >= LEVELS.length ||
        levelIndex.toString() !== value) {
        return 0;
    }
    return levelIndex;
}

function saveLevelIndex(levelIndex) {
    localStorage.setItem(LOCAL_STORAGE_LEVEL_KEY, levelIndex);
}

function countType(grid, type) {
    return grid
        .map(function (row) { return row.filter(function (t) { return t == type; }).length; })
        .reduce(function (a, b) { return a + b; }, 0);
}

function loadLevel(level) {
    return {
        hints: level,
        grid: level.map(
            function (row) {
                return row.map(
                    function (type) {
                        return type.flat;
                    }
                );
            }
        ),
        houses: countType(level, TYPES.HOUSE),
        pathsBridges: countType(level, TYPES.PATH) + countType(level, TYPES.BRIDGE)
    };
}

function loadGrid() {

    function parse() {
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                const c = value[i * columns + j];
                const uc = c.toUpperCase();
                const h = c != uc;
                const t1 = TYPES_BY_CHAR.get(uc);
                if (!t1) {
                    return false;
                }
                const position = {x: j, y: i};
                const td = cellAt(table, position);
                const t0 = typeOf(td);
                const t2 = levelData.hints[i][j];
                if ((t0 == t1 && !h) ||
                    (t0 == TYPES.GRASS && GRASS_COMPATIBLE.has(t1)) ||
                    (t0 == TYPES.WATER && t1 == TYPES.BRIDGE)) {
                    if (!td.classList.contains("inactive")) {
                        td.className = t1.className;
                        reverters.push(
                            function () {
                                td.className = t0.className;
                            }
                        );
                        if (h) {
                            td.classList.add("hint", t1 == t2 ? "match" : "mismatch");
                        }
                    }
                } else {
                    return false;
                }
            }
        }
        return true;
    }

    function findTypes(set) {
        const positions = [];
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                const position = {x: j, y: i};
                if (set.has(typeOf(cellAt(table, position)))) {
                    positions.push(position);
                }
            }
        }
        return positions;
    }

    function validatePathsBridgesConnected(pathsBridges) {
        return pathsBridges.length <= 1 || floodFill(
            table,
            pathsBridges[0],
            {x: -1, y: -1},
            function (className) {
                return pathsBridges.every(
                    function (position) {
                        return cellAt(table, position).classList.contains(className);
                    }
                );
            }
        );
    }

    function validateHousesNextToPathOrBridge() {
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                const position = {x: j, y: i};
                if (typeOf(cellAt(table, position)) == TYPES.HOUSE) {
                    const hasPathOrBridge = neighbors(table, position).some(
                        function (neighbor) {
                            return PATH_AND_BRIDGE_SET.has(typeOf(cellAt(table, neighbor)));
                        }
                    );
                    if (!hasPathOrBridge) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function validateBridgesIsolated() {
        for (var i = 1; i < rows; i++) {
            for (var j = 1; j < columns; j++) {
                if (typeOf(cellAt(table, {x: j, y: i})) == TYPES.BRIDGE &&
                    (typeOf(cellAt(table, {x: j - 1, y: i})) == TYPES.BRIDGE ||
                        typeOf(cellAt(table, {x: j, y: i - 1})) == TYPES.BRIDGE)) {
                    return false;
                }
            }
        }
        return true;
    }

    function revert() {
        reverters.forEach(
            function (reverter) {
                reverter();
            }
        );
    }

    const table = SCREENS.GAME.context.table;
    const levelData = LEVEL_DATA[SCREENS.GAME.levelIndex];
    const reverters = [];
    const value = localStorage.getItem(LOCAL_STORAGE_GRID_KEY);
    const rows = numberOfRows(table);
    const columns = numberOfColumns(table);

    if (value == null || value.length != rows * columns) {
        return;
    }

    if (!parse()) {
        revert();
        return;
    }

    const houses = findTypes(new Set([TYPES.HOUSE]));
    const pathsBridges = findTypes(PATH_AND_BRIDGE_SET);

    if (!validatePathsBridgesConnected(pathsBridges) ||
        !validateHousesNextToPathOrBridge() ||
        !validateBridgesIsolated() ||
        houses.length > levelData.houses ||
        pathsBridges.length > levelData.pathsBridges) {
        revert();
        return;
    }

    counterInit([TYPES.HOUSE], houses.length, levelData.houses);
    counterInit(PATH_AND_BRIDGE, pathsBridges.length, levelData.pathsBridges);
}

function saveGrid() {
    const table = SCREENS.GAME.context.table;
    const rows = numberOfRows(table);
    const columns = numberOfColumns(table);
    const chars = [];

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            const cell = cellAt(table, {x: j, y: i});
            var char = typeOf(cell).char;
            if (cell.classList.contains("hint")) {
                char = char.toLowerCase();
            }
            chars.push(char);
        }
    }

    localStorage.setItem(LOCAL_STORAGE_GRID_KEY, chars.join(""));
}

function disableButtons(selector, disabled) {
    document.querySelectorAll(selector).forEach(
        function (button) {
            button.disabled = disabled;
        }
    );
}

function disableDialogButtons(disabled) {
    disableButtons("div.game button", !disabled);
    disableButtons("div.dialog button", disabled);
}

function refreshClass(element, className) {
    element.classList.remove(className);
    element.offsetHeight;
    element.classList.add(className);
}

function randomInt(n) {
    return Math.floor(n * Math.random());
}

function randomElement(list) {
    return list[randomInt(list.length)];
}

function randomPop(list) {
    const index = randomInt(list.length);
    return list.splice(index, 1)[0];
}

function numberOfRows(table) {
    return table.classList.contains("mirrored")
        ? table.firstChild.childElementCount
        : table.childElementCount;
}

function numberOfColumns(table) {
    return table.classList.contains("mirrored")
        ? table.childElementCount
        : table.firstChild.childElementCount;
}

function cellAt(table, position) {
    return table.classList.contains("mirrored")
        ? cellAtUnmirrored(table, positionSwap(position))
        : cellAtUnmirrored(table, position);
}

function cellAtUnmirrored(table, position) {
    return table.childNodes[position.y].childNodes[position.x];
}

function typeOf(td) {
    return TYPES_BY_CLASS_NAME.get(td.classList[0]);
}

function positionSwap(p) {
    return {x: p.y, y: p.x};
}

function positionsEqual(a, b) {
    return a.x == b.x && a.y == b.y;
}

function positionsAdd(a, b) {
    return {x: a.x + b.x, y: a.y + b.y};
}

function positionsSubtract(a, b) {
    return {x: a.x - b.x, y: a.y - b.y};
}

function positionGreaterOrEqual(a, b) {
    return a.x >= b.x && a.y >= b.y;
}

function positionLess(a, b) {
    return a.x < b.x && a.y < b.y;
}

function neighbors(table, position) {
    const positions = [];
    if (position.x > 0) {
        positions.push({x: position.x - 1, y: position.y});
    }
    if (position.y > 0) {
        positions.push({x: position.x, y: position.y - 1});
    }
    if (position.x < numberOfColumns(table) - 1) {
        positions.push({x: position.x + 1, y: position.y});
    }
    if (position.y < numberOfRows(table) - 1) {
        positions.push({x: position.x, y: position.y + 1});
    }
    return positions;
}

function validateNone() {
}

function withMessage(validation, messages) {
    return function (context) {
        const conflicts = validation(context);
        if (conflicts) {
            return {conflicts, messages};
        }
    };
}

function validateAll(validations) {
    return function (context) {
        return validations
            .map(
                function (validation) {
                    return validation(context);
                }
            )
            .reduce(
                function (a, b) {
                    if (a && b) {
                        return {
                            conflicts: a.conflicts.concat(b.conflicts),
                            messages: a.messages.concat(b.messages)
                        };
                    }
                    return a || b;
                },
                null
            );
    };
}

function validateAny(validations) {
    return function (context) {
        var conflicts = [];
        for (var i = 0; i < validations.length; i++) {
            const c = validations[i](context);
            if (!c) {
                return;
            }
            conflicts = conflicts.concat(c);
        }
        return conflicts;
    };
}

function neighborIs(set) {
    return function (context) {
        const pressableNeighbors = neighbors(context.parent.table, context.position).filter(
            function (neighbor) {
                return typeOf(cellAt(context.parent.table, neighbor)).press;
            }
        );
        const hasTypeFromSet = pressableNeighbors.some(
            function (neighbor) {
                return set.has(typeOf(cellAt(context.parent.table, neighbor)));
            }
        );
        if (!hasTypeFromSet) {
            return pressableNeighbors;
        }
    };
}

function neighboringHousesAreNextToOtherPathOrBridge(context) {
    const neighboringHouses = neighbors(context.parent.table, context.position).filter(
        function (neighbor) {
            return typeOf(cellAt(context.parent.table, neighbor)) == TYPES.HOUSE;
        }
    );
    const withoutPathOrBridge = neighboringHouses.filter(
        function (neighbor1) {
            return !neighbors(context.parent.table, neighbor1).some(
                function (neighbor2) {
                    return !positionsEqual(neighbor2, context.position)
                        && PATH_AND_BRIDGE_SET.has(typeOf(cellAt(context.parent.table, neighbor2)));
                }
            );
        }
    );
    if (withoutPathOrBridge.length > 0) {
        return withoutPathOrBridge;
    }
}

function noNeighborIsBridge(context) {
    const neighboringBridges = neighbors(context.parent.table, context.position).filter(
        function (neighbor) {
            return typeOf(cellAt(context.parent.table, neighbor)) == TYPES.BRIDGE;
        }
    );
    if (neighboringBridges.length > 0) {
        return neighboringBridges;
    }
}

function floodFill(table, start, exclude, watcher) {
    const visitedClassName = "visited";
    const queue = [start];
    const visited = [];

    while (queue.length > 0) {
        const next = queue.pop();
        const cell = cellAt(table, next);
        if (!positionsEqual(next, exclude) && !cell.classList.contains(visitedClassName)) {
            cell.classList.add(visitedClassName);
            visited.push(cell);
            neighbors(table, next).forEach(
                function (neighbor) {
                    if (PATH_AND_BRIDGE_SET.has(typeOf(cellAt(table, neighbor)))) {
                        queue.push(neighbor);
                    }
                }
            );
        }
    }

    try {
        return watcher(visitedClassName);
    } finally {
        visited.forEach(
            function (cell) {
                cell.classList.remove(visitedClassName);
            }
        );
    }
}

function pathsBridgesStillConnected(context) {
    const neighborPositions = neighbors(context.parent.table, context.position).filter(
        function (neighbor) {
            return PATH_AND_BRIDGE_SET.has(typeOf(cellAt(context.parent.table, neighbor)));
        }
    );

    if (neighborPositions.length <= 1) {
        return;
    }

    const connected = floodFill(
        context.parent.table,
        neighborPositions[0],
        context.position,
        function (className) {
            return neighborPositions.every(
                function (neighbor) {
                    return cellAt(context.parent.table, neighbor).classList.contains(className);
                }
            );
        }
    );

    if (!connected) {
        return neighborPositions;
    }
}

function countersAllZero(types) {
    return function (context) {
        const allZero = types.every(
            function (type) {
                return context.parent.counterByType.get(type).actual.get() == 0;
            }
        );
        if (!allZero) {
            return [];
        }
    };
}

function counterLimitReached(type) {
    return function (context) {
        const counter = context.parent.counterByType.get(type);
        if (counter.actual.get() == counter.total.get()) {
            return [type];
        }
    };
}

function showMessageCompleted() {
    SCREENS.GAME.context.messages.info.classList.add("invisible");
    SCREENS.GAME.context.messages.completed.classList.remove("invisible");
    SCREENS.GAME.context.messages.button.disabled = false;
}

function hideMessageCompleted() {
    SCREENS.GAME.context.messages.completed.classList.add("invisible");
    SCREENS.GAME.context.messages.info.classList.remove("invisible");
    SCREENS.GAME.context.messages.button.disabled = true;
}

function showConflicts(conflicts) {
    conflicts.forEach(
        function (conflict) {
            const counter = SCREENS.GAME.context.counterByType.get(conflict);
            if (counter) {
                counter.conflict();
            } else {
                refreshClass(cellAt(SCREENS.GAME.context.table, conflict), "conflict");
            }
        }
    );
}

function clearConflicts() {
    SCREENS.GAME.context.counterByType.forEach(
        function (counter) {
            counter.clear();
        }
    );
}

function clearMessages() {
    if (SCREENS.GAME.context.messages.timeoutId != null) {
        clearTimeout(SCREENS.GAME.context.messages.timeoutId);
        SCREENS.GAME.context.messages.error.element.classList.add("invisible");
    }
}

function timeoutMessages() {
    SCREENS.GAME.context.messages.timeoutId = setTimeout(
        function () {
            SCREENS.GAME.context.messages.error.element.classList.add("invisible");
            SCREENS.GAME.context.messages.error.timeoutId = null;
        },
        5000
    );
}

function showMessages(messages) {
    SCREENS.GAME.context.messages.error.element.classList.remove("invisible");
    SCREENS.GAME.context.messages.error.element.textContent = "";
    messages.forEach(
        function (message) {
            const p = document.createElement("p");
            p.classList.add("lang", message);
            langApplyOne(p);
            SCREENS.GAME.context.messages.error.element.appendChild(p);
        }
    );
}

function alertMessages(messages) {
    clearMessages();
    showMessages(messages);
    timeoutMessages();
}

function addCleanup(newCleanup) {
    const oldCleanup = SCREENS.GAME.context.cleanup;
    SCREENS.GAME.context.cleanup = function () {
        oldCleanup();
        newCleanup();
    };
}

function clearCellAnimations() {
    SCREENS.GAME.context.table.querySelectorAll("td").forEach(
        function (td) {
            td.classList.remove("spawn", "changed", "denied", "conflict", "completed");
        }
    );
}

function isCompleted() {
    return Array.from(SCREENS.GAME.context.counterByType.values()).every(
        function (counter) {
            return counter.actual.get() == counter.total.get();
        }
    );
}

function checkCompleted() {

    function animateCompleted() {
        const table = SCREENS.GAME.context.table;
        const rows = numberOfRows(table);
        const columns = numberOfColumns(table);
        const timeoutIds = [];

        function completeDiagonal(d) {
            const timeoutIdIndex = timeoutIds.length;
            timeoutIds.push(
                setTimeout(
                    function () {
                        timeoutIds[timeoutIdIndex] = null;
                        const min = Math.max(d - rows + 1, 0);
                        const max = Math.min(d, columns - 1);
                        for (var i = min; i <= max; i++) {
                            cellAt(table, {x: i, y: d - i}).classList.add("completed");
                        }
                    },
                    125 * d
                )
            );
        }

        for (var d = 0; d < rows + columns - 1; d++) {
            completeDiagonal(d, rows, columns);
        }

        addCleanup(
            function () {
                timeoutIds.forEach(
                    function (timeoutId) {
                        if (timeoutId != null) {
                            clearTimeout(timeoutId);
                        }
                    }
                );
            }
        );
    }

    if (isCompleted()) {
        setLevelCompleted(SCREENS.GAME.levelIndex);
        animateCompleted();
        showLevelCompleted();
        showMessageCompleted();
        deactivateGrid();
    }
}

function press(context, mode) {
    const from = typeOf(context.td);
    const to = from.press[mode];
    if (to) {
        clearMessages();
        const result = from.validationByType.get(to)(context);
        if (result) {
            refreshClass(context.td, "denied");
            showConflicts(result.conflicts);
            showMessages(result.messages);
            timeoutMessages();
        } else {
            context.td.className = to.className;
            refreshClass(context.td, "changed");
            counterAddIfExisting(from, -1);
            counterAddIfExisting(to, 1);
            saveGrid();
            checkCompleted();
        }
    }
}

function deactivateGrid() {
    document.querySelectorAll("div.game td").forEach(
        function (td) {
            td.classList.add("inactive");
        }
    );
}

function addPressListeners(context) {

    function down(event) {
        if (!event.target.classList.contains("inactive")) {
            timeoutId = setTimeout(
                function () {
                    press(context, "long");
                    timeoutId = null;
                },
                250
            );
        }
    }

    function up(event) {
        if (!event.target.classList.contains("inactive")) {
            if (timeoutId != null) {
                press(context, "short");
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        }
    }

    function downTouch(event) {
        if (event.cancelable) {
            event.preventDefault();
        }
        down(event);
    }

    function upTouch(event) {
        if (event.cancelable) {
            event.preventDefault();
        }
        up(event);
    }

    var timeoutId = null;
    context.td.addEventListener("mousedown", down);
    context.td.addEventListener("mouseup", up);
    context.td.addEventListener("touchstart", downTouch);
    context.td.addEventListener("touchend", upTouch);
}

function transitionScreen(from, to) {

    function handleEnd(event) {
        if (event.currentTarget === event.target) {
            to.element.classList.remove("fade-in");
            to.in.end();

            from.element.classList.remove("fade-out");
            from.element.classList.add("hidden");
            from.element.removeEventListener("animationend", handleEnd);
            from.out.end();
        }
    }
    
    to.element.classList.remove("hidden");
    to.element.classList.add("fade-in");
    to.in.start();

    from.element.classList.add("fade-out");
    from.element.addEventListener("animationend", handleEnd);
    from.out.start();
}

function showHints() {
    if (allCountersZero()) {
        alertMessages(["hint-no-tiles", "hint-action"]);
        return false;
    }

    const table = SCREENS.GAME.context.table;
    const rows = numberOfRows(table);
    const columns = numberOfColumns(table);
    const levelData = LEVEL_DATA[SCREENS.GAME.levelIndex];
    var changed = false;

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            const cell = cellAt(table, {x: j, y: i});
            const type = typeOf(cell);
            const flat = levelData.grid[i][j];
            const hint = levelData.hints[i][j];

            if (type != flat) {
                changed ||= !cell.classList.contains("hint");
                cell.classList.add("hint", type == hint ? "match" : "mismatch");
            }
        }
    }

    if (!changed) {
        alertMessages(["hint-no-new-tiles", "hint-place-new-tiles"]);
    }

    return changed;
}

function counterAddIfExisting(type, value) {
    const counter = SCREENS.GAME.context.counterByType.get(type);
    if (counter) {
        counter.actual.set(counter.actual.get() + value);
    }
}

function counterInit(types, actual, total) {
    types.forEach(
        function (type) {
            const counter = SCREENS.GAME.context.counterByType.get(type);
            counter.actual.set(actual);
            counter.total.set(total);
        }
    );
}

function allCountersZero() {
    return Array.from(SCREENS.GAME.context.counterByType.values()).every(
        function (counter) {
            return counter.actual.get() == 0;
        }
    );
}

function buildCounter(types) {

    function accessor(element) {
        return {
            get: function () {
                return parseInt(element.textContent);
            },
            set: function (value) {
                element.textContent = value;
            }
        };
    }

    function conflict() {
        refreshClass(box, "conflict");
    }

    function clear() {
        box.classList.remove("conflict");
    }

    const bar = document.querySelector("div.game div.bar");
    const box = types
        .map(function (type) { return bar.querySelector("span.icon." + type.className); })
        .map(function (element) { return element.parentElement.parentElement; })
        .reduce(
            function (a, b) {
                if (a !== b) {
                    throw new Error("Types do not belong to same counter");
                }
                return a;
            }
        );
    const counts = box.querySelector("span.count");

    return {
        actual: accessor(counts.querySelector("span.actual")),
        total: accessor(counts.querySelector("span.total")),
        conflict,
        clear
    };
}

function buildCounters() {
    const counterByType = new Map();
    document.querySelectorAll("div.game span.count").forEach(
        function (count) {
            const types = Array.from(TYPES_BY_CLASS_NAME.values()).filter(
                function (type) {
                    return count.parentElement.querySelector("span.icon." + type.className);
                }
            );
            const counter = buildCounter(types);
            types.forEach(
                function (type) {
                    counterByType.set(type, counter);
                }
            );
        }
    );
    return counterByType;
}

function buildContext() {
    return {
        table: document.querySelector("table.grid"),
        levelNumber: document.querySelector("div.game span.number"),
        counterByType: buildCounters(),
        messages: {
            info: document.querySelector("div.messages div.info"),
            completed: document.querySelector("div.messages div.completed"),
            button: document.querySelector("div.messages div.completed button"),
            error: {
                element: document.querySelector("div.messages div.error"),
                timeoutId: null
            }
        },
        cleanup: function () {}
    };
}

function showStart() {
    SCREENS.MAIN_MENU.buttons.start.classList.remove("hidden");
    SCREENS.MAIN_MENU.buttons.continue.classList.add("hidden");
}

function showContinue() {
    SCREENS.MAIN_MENU.buttons.continue.classList.remove("hidden");
    SCREENS.MAIN_MENU.buttons.start.classList.add("hidden");
}

function showLevelCompleted() {
    SCREENS.GAME.context.levelNumber.parentElement.classList.add("check");
}

function hideLevelCompleted() {
    SCREENS.GAME.context.levelNumber.parentElement.classList.remove("check");
}

function mirrorLevel() {
    const table = SCREENS.GAME.context.table;

    const tdGrid = Array.from(table.childNodes).map(
        function (tr) {
            return Array.from(tr.childNodes).map(
                function (td) {
                    return td;
                }
            );
        }
    );

    table.textContent = "";

    tdGrid[0].forEach(
        function (column, i) {
            const tr = document.createElement("tr");
            tdGrid.forEach(
                function (row) {
                    tr.appendChild(row[i]);
                }
            );
            table.appendChild(tr);
        }
    );
}

function buildLevel() {

    function buildGrid() {
        levelData.grid.forEach(
            function (row, i) {
                const tr = document.createElement("tr");
                row.forEach(
                    function (type, j) {
                        const td = document.createElement("td");
                        td.classList.add(type.className, "spawn");
                        if (type.press) {
                            addPressListeners(
                                {
                                    parent: context,
                                    position: {x: j, y: i},
                                    td
                                }
                            );
                        } else {
                            td.classList.add("inactive");
                        }
                        tr.appendChild(td);
                    }
                );
                context.table.appendChild(tr);
            }
        );
    }

    const context = SCREENS.GAME.context;
    const levelData = LEVEL_DATA[SCREENS.GAME.levelIndex];

    SCREENS.GAME.context.cleanup();
    SCREENS.GAME.context.cleanup = function () {};

    context.table.textContent = "";
    context.table.style.setProperty("--number-of-rows", levelData.grid.length);
    context.table.style.setProperty("--number-of-columns", levelData.grid[0].length);
    
    context.levelNumber.textContent = SCREENS.GAME.levelIndex + 1;

    buildGrid();

    counterInit([TYPES.HOUSE], 0, levelData.houses);
    counterInit(PATH_AND_BRIDGE, 0, levelData.pathsBridges);
    
    clearMessages();
    hideLevelCompleted();
    hideMessageCompleted();

    if (getLevelCompleted(SCREENS.GAME.levelIndex)) {
        showLevelCompleted();
    }

    if (context.table.classList.contains("mirrored")) {
        mirrorLevel();
    }
}

function buildGame() {

    function updateResize() {
        const table = SCREENS.GAME.context.table;
        const levelData = LEVEL_DATA[SCREENS.GAME.levelIndex];
        const isGridSquare = levelData.grid.length == levelData.grid[0].length;

        if (!isGridSquare) {
            const isContentPortrait = content.offsetHeight > content.offsetWidth;
            const isGridPortrait = levelData.grid.length > levelData.grid[0].length;
            const doOrientationsMatch = isContentPortrait == isGridPortrait;
            const isMirrored = table.classList.contains("mirrored");

            if (doOrientationsMatch == isMirrored) {
                table.classList.toggle("mirrored");
                clearCellAnimations();
                mirrorLevel();
            }
        } else if (table.classList.contains("mirrored")) {
            table.classList.remove("mirrored");
            mirrorLevel();
        }
    }

    SCREENS.GAME.element = document.querySelector("div.game");
    SCREENS.GAME.context = buildContext();
    SCREENS.GAME.levelIndex = loadLevelIndex();

    buildLevel();
    loadGrid();
    
    if (isCompleted()) {
        showMessageCompleted();
        deactivateGrid();
    }

    const content = SCREENS.GAME.element.querySelector("div.content");
    const dialog = document.querySelector("div.dialog");
    const no = dialog.querySelector("button.no");
    const yes = dialog.querySelector("button.yes");

    document.querySelector("button.restart").addEventListener(
        "click",
        function () {

            function openDialog() {
                addListeners();
                disableDialogButtons(false);
                dialog.classList.remove("invisible");
            }

            function closeDialog() {
                removeListeners();
                disableDialogButtons(true);
                dialog.classList.add("invisible");
            }

            function confirm() {
                closeDialog();
                buildLevel();
                saveGrid();
            }

            function addListeners() {
                no.addEventListener("click", closeDialog);
                yes.addEventListener("click", confirm);
            }

            function removeListeners() {
                no.removeEventListener("click", closeDialog);
                yes.removeEventListener("click", confirm);
            }

            openDialog();
        }
    );

    document.querySelector("button.menu").addEventListener(
        "click",
        function () {
            transitionScreen(SCREENS.GAME, SCREENS.MAIN_MENU);
        }
    );

    document.querySelector("button.hint").addEventListener(
        "click",
        function () {
            if (showHints()) {
                saveGrid();
            }
        }
    );

    document.querySelector("button.next-level").addEventListener(
        "click",
        function () {
            SCREENS.GAME.levelIndex = (SCREENS.GAME.levelIndex + 1) % LEVELS.length;
            saveLevelIndex(SCREENS.GAME.levelIndex);
            buildLevel();
            saveGrid();
        }
    );

    SCREENS.GAME.in.start = function () {
        clearConflicts();
        clearCellAnimations();
        updateResize();
        addEventListener("resize", updateResize);
    };

    SCREENS.GAME.out.end = function () {
        removeEventListener("resize", updateResize);
    };
}

function buildLevelSelect() {

    function buildButton(levelIndex) {
        const levelData = LEVEL_DATA[levelIndex];
        const button = document.createElement("button");

        button.addEventListener(
            "click",
            function () {
                SCREENS.GAME.levelIndex = levelIndex;
                saveLevelIndex(SCREENS.GAME.levelIndex);
                buildLevel();
                saveGrid();
                transitionScreen(SCREENS.LEVEL_SELECT, SCREENS.GAME);
            }
        );

        if (getLevelCompleted(levelIndex)) {
            button.classList.add("check");
        }

        if (levelIndex == SCREENS.GAME.levelIndex) {
            button.classList.add("active");
        }
        
        const spanNumber = document.createElement("span");
        spanNumber.classList.add("number");
        spanNumber.textContent = levelIndex + 1;
        button.appendChild(spanNumber);

        button.appendChild(document.createTextNode(" "));

        const spanSize = document.createElement("span");
        spanSize.classList.add("size");
        spanSize.innerHTML = levelData.grid[0].length + " &times; " + levelData.grid.length;
        button.appendChild(spanSize);

        const divCounts = document.createElement("div");

        const spanHouseIcon = document.createElement("span");
        spanHouseIcon.classList.add("icon", "house");
        divCounts.appendChild(spanHouseIcon);

        const spanHouses = document.createElement("span");
        spanHouses.classList.add("count");
        spanHouses.textContent = levelData.houses;
        divCounts.appendChild(spanHouses);

        const spanPathsBridgesIcon = document.createElement("span");
        spanPathsBridgesIcon.classList.add("icon", "path-bridge");
        divCounts.appendChild(spanPathsBridgesIcon);

        const spanPathsBridges = document.createElement("span");
        spanPathsBridges.classList.add("count");
        spanPathsBridges.textContent = levelData.pathsBridges;
        divCounts.appendChild(spanPathsBridges);

        button.appendChild(divCounts);

        return button;
    }

    function update() {
        actual.textContent = page + 1;
        table.textContent = "";
        for (var i = 0; i < NUMBER_OF_ROWS; i++) {
            const tr = document.createElement("tr");
            for (var j = 0; j < NUMBER_OF_COLUMNS; j++) {
                const levelIndex = page * NUMBER_OF_LEVELS_PER_PAGE + NUMBER_OF_COLUMNS * i + j;
                const td = document.createElement("td");
                if (levelIndex < LEVELS.length) {
                    td.appendChild(buildButton(levelIndex));
                }
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
    }

    SCREENS.LEVEL_SELECT.element = document.querySelector("div.level-select");

    const NUMBER_OF_COLUMNS = 5;
    const NUMBER_OF_ROWS = 5;
    const NUMBER_OF_LEVELS_PER_PAGE = NUMBER_OF_COLUMNS * NUMBER_OF_ROWS;
    const NUMBER_OF_PAGES = Math.ceil(LEVELS.length / NUMBER_OF_LEVELS_PER_PAGE);

    const previous = SCREENS.LEVEL_SELECT.element.querySelector("button.previous");
    const next = SCREENS.LEVEL_SELECT.element.querySelector("button.next");
    const close = SCREENS.LEVEL_SELECT.element.querySelector("button.close");

    const actual = SCREENS.LEVEL_SELECT.element.querySelector("span.actual");
    const total = SCREENS.LEVEL_SELECT.element.querySelector("span.total");
    
    const table = SCREENS.LEVEL_SELECT.element.querySelector("table");
    table.style.setProperty("--number-of-rows", NUMBER_OF_ROWS);
    
    var page = Math.floor(SCREENS.GAME.levelIndex / NUMBER_OF_LEVELS_PER_PAGE);
    total.textContent = NUMBER_OF_PAGES;

    previous.addEventListener(
        "click",
        function () {
            page = (page + NUMBER_OF_PAGES - 1) % NUMBER_OF_PAGES;
            update();
        }
    );

    next.addEventListener(
        "click",
        function () {
            page = (page + 1) % NUMBER_OF_PAGES;
            update();
        }
    );

    close.addEventListener(
        "click",
        function () {
            transitionScreen(SCREENS.LEVEL_SELECT, SCREENS.MAIN_MENU);
        }
    );

    SCREENS.LEVEL_SELECT.in.start = update;
}

function buildHowToPlay() {
    SCREENS.HOW_TO_PLAY.element = document.querySelector("div.how-to-play");
    const close = SCREENS.HOW_TO_PLAY.element.querySelector("button.close");

    close.addEventListener(
        "click",
        function () {
            transitionScreen(SCREENS.HOW_TO_PLAY, SCREENS.MAIN_MENU);
        }
    );
}

function buildMainMenuBackground() {

    function inFrom(position) {
        return positionGreaterOrEqual(position, FROM) && positionLess(position, FROM_MAX);
    }

    function inTo(position) {
        return positionGreaterOrEqual(position, TO) && positionLess(position, TO_MAX);
    }

    function spawn(delay) {

        function addIcon(position0) {
            const span = document.createElement("span");
            cellAt(table, position0).appendChild(span);
            span.classList.add(className);
            if (delay != null) {
                span.style.setProperty("animation-delay", delay + "ms");
            }
            refreshClass(span, "animate");
            span.addEventListener(
                "animationend",
                function () {
                    span.remove();
                    if (positionsEqual(position, position0)) {
                        freePositions.push(position);
                    }
                }
            );
        }

        const className = TYPES[randomElement(Object.keys(TYPES))].className;
        const position = randomPop(freePositions);

        addIcon(position);
        if (inFrom(position)) {
            addIcon(positionsAdd(position, TRANSLATION));
        }
    }

    function resetFreePositions() {
        freePositions = [];
        for (var i = 0; i < TOTAL.y; i++) {
            for (var j = 0; j < TOTAL.x; j++) {
                const position = {x: j, y: i};
                if (!inTo(position)) {
                    freePositions.push(position);
                }
            }
        }
    }

    function clearTable() {
        table.querySelectorAll("div.main-menu table span").forEach(
            function (span) {
                span.remove();
            }
        );
    }

    function warmStart() {
        for (var start = 0; start < 2 * ANIMATION_DURATION; start += INTERVAL) {
            spawn(-start);
        }
    }

    function start() {
        if (!document.hidden && SCREENS.MAIN_MENU.intervalId == null) {
            SCREENS.MAIN_MENU.intervalId = setInterval(spawn, INTERVAL);
            warmStart();
        }
    }

    function stop() {
        if (SCREENS.MAIN_MENU.intervalId != null) {
            clearInterval(SCREENS.MAIN_MENU.intervalId);
            SCREENS.MAIN_MENU.intervalId = null;
            clearTable();
            resetFreePositions();
        }
    }

    function visibility() {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    }

    const TRANSLATION = {x: 12, y: -4};
    const WINDOW = {x: 12, y: 12};
    const FROM = {x: -Math.min(TRANSLATION.x, 0), y: -Math.min(TRANSLATION.y, 0)};
    const FROM_MAX = positionsAdd(FROM, WINDOW);
    const TO = {x: Math.max(TRANSLATION.x, 0), y: Math.max(TRANSLATION.y, 0)};
    const TO_MAX = positionsAdd(TO, WINDOW);
    const TOTAL = positionsAdd(WINDOW, {x: Math.abs(TRANSLATION.x), y: Math.abs(TRANSLATION.y)});
    const ANIMATION_DURATION = 4000;
    const INTERVAL = 125;

    var freePositions;
    resetFreePositions();

    const table = document.querySelector("div.main-menu table");

    table.style.setProperty("--total-columns", TOTAL.x);
    table.style.setProperty("--total-rows", TOTAL.y);
    table.style.setProperty("--window-columns", WINDOW.x);
    table.style.setProperty("--window-rows", WINDOW.y);
    table.style.setProperty("--from-column", FROM.x);
    table.style.setProperty("--from-row", FROM.y);
    table.style.setProperty("--to-column", TO.x);
    table.style.setProperty("--to-row", TO.y);
    table.style.setProperty("--animation-duration", ANIMATION_DURATION + "ms");

    for (var i = 0; i < TOTAL.y; i++) {
        const tr = document.createElement("tr");
        for (var j = 0; j < TOTAL.x; j++) {
            const td = document.createElement("td");
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    SCREENS.MAIN_MENU.intervalId = null;

    SCREENS.MAIN_MENU.in.start = function () {
        start();
        addEventListener("visibilitychange", visibility);
    };

    SCREENS.MAIN_MENU.out.end = function () {
        stop();
        removeEventListener("visibilitychange", visibility);
    };
}

function buildMainMenu() {

    function update() {
        if (allCountersZero()) {
            showStart();
        } else {
            showContinue();
        }

        const completedCount = countLevelCompleted();
        box.style.setProperty("--progress", (100 * completedCount / LEVELS.length) + "%");
        actual.textContent = completedCount;
        total.textContent = LEVELS.length;
    }

    SCREENS.MAIN_MENU.element = document.querySelector("div.main-menu");
    SCREENS.MAIN_MENU.buttons = {
        start: document.querySelector("button.start"),
        continue: document.querySelector("button.continue"),
        levelSelect: document.querySelector("button.level-select"),
        howToPlay: document.querySelector("button.how-to-play")
    };

    buildMainMenuBackground();

    SCREENS.MAIN_MENU.buttons.start.addEventListener(
        "click",
        function () {
            transitionScreen(SCREENS.MAIN_MENU, SCREENS.GAME);
        }
    );

    SCREENS.MAIN_MENU.buttons.continue.addEventListener(
        "click",
        function () {
            transitionScreen(SCREENS.MAIN_MENU, SCREENS.GAME);
        }
    );

    SCREENS.MAIN_MENU.buttons.levelSelect.addEventListener(
        "click",
        function () {
            transitionScreen(SCREENS.MAIN_MENU, SCREENS.LEVEL_SELECT);
        }
    );

    SCREENS.MAIN_MENU.buttons.howToPlay.addEventListener(
        "click",
        function () {
            transitionScreen(SCREENS.MAIN_MENU, SCREENS.HOW_TO_PLAY);
        }
    );

    const box = document.querySelector("div.main-menu div.box.check");
    const actual = box.querySelector("span.actual");
    const total = box.querySelector("span.total");

    const backgroundStart = SCREENS.MAIN_MENU.in.start;

    SCREENS.MAIN_MENU.in.start = function () {
        backgroundStart();
        update();
    };

    SCREENS.MAIN_MENU.in.start();
}

function buildLang() {

    function matches(key, tag) {
        return tag.startsWith(key) && (key.length == tag.length || tag[key.length] == '-');
    }

    function update() {
        button.style.setProperty("background-image", "url('images/lang/" + keys[index] + ".png')");
    }

    function store() {
        localStorage.setItem(LOCAL_STORAGE_LANG_KEY, keys[index]);
    }

    function restore() {
        var index = keys.indexOf(localStorage.getItem(LOCAL_STORAGE_LANG_KEY));

        if (index < 0) {
            index = keys.findIndex(
                function (key) {
                    return matches(key, navigator.language);
                }
            );

            if (index < 0) {
                index = keys.indexOf("en");
            }
        }

        return index;
    }

    function appendParse(element, text) {
        const parts = text.split("*");
        if (parts.length % 2 != 1) {
            throw new Error("Odd number of formatting characters");
        }
        parts.forEach(
            function (part, i) {
                var node = document.createTextNode(part);
                if (i % 2 == 1) {
                    const em = document.createElement("em");
                    em.appendChild(node);
                    node = em;
                }
                element.appendChild(node);
            }
        );
    }

    function setParse(element, text) {
        element.textContent = "";
        appendParse(element, text);
    }

    function apply() {
        const lang = LANG[keys[index]];
        Object.keys(lang).forEach(
            function (key) {
                document.querySelectorAll(".lang." + key).forEach(
                    function (element) {
                        setParse(element, lang[key]);
                    }
                );
            }
        );
    }

    function applyOne(element) {
        if (!element.classList.contains("lang")) {
            throw new Error("Can only be invoked on language specific elements");
        }
        const lang = LANG[keys[index]];
        const key = Array.from(element.classList).find(
            function (className) {
                return className != "lang" && lang.hasOwnProperty(className);
            }
        );
        if (!key) {
            throw new Error("Could not find key in language object");
        }
        setParse(element, lang[key]);
    }

    const keys = Object.keys(LANG).sort();
    const button = document.querySelector("button.language");
    var index = restore();

    button.addEventListener(
        "click",
        function () {
            index = (index + 1) % keys.length;
            update();
            apply();
            store();
        }
    );

    update();
    apply();

    return applyOne;
}

function buildTheme() {

    function theme() {
        return isDark ? "dark" : "light";
    }

    function update() {
        body.className = theme();
    }

    function store() {
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme());
    }

    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    var isDark = storedTheme === "dark" ||
        (storedTheme == null && matchMedia('(prefers-color-scheme: dark)').matches);

    const body = document.querySelector("body");
    update();

    document.querySelector("button.theme").addEventListener(
        "click",
        function () {
            isDark = !isDark;
            update();
            store();
        }
    );
}

function load() {
    const body = document.querySelector("body");
    const font = getComputedStyle(body).getPropertyValue("font");
    document.fonts.load(font).then(
        function () {
            COMPLETED_LEVELS = loadLevelCompleted();
            LEVEL_DATA = LEVELS.map(loadLevel);

            buildGame();
            buildLevelSelect();
            buildHowToPlay();
            buildMainMenu();
            langApplyOne = buildLang();
            buildTheme();

            disableButtons("div.hidden button", true);
            body.style.removeProperty("display");
        }
    );
}

addEventListener("load", load);