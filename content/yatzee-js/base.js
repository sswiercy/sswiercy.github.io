const SCORE_KEY_TEXT = ["yatzee-score-", "-"];
const SCORE_KEY_REGEXP = new RegExp("^" + SCORE_KEY_TEXT[0] + "([1-9]\\d*)" + SCORE_KEY_TEXT[1] + "(\\d+)$");
const SCORE_LAST_MAX = 100;

function binarySearch(data, greater) {
    var i = 0;
    var j = data.length;
    while (i < j) {
        const k = Math.floor((i + j) / 2);
        if (greater(data[k])) {
            i = k + 1;
        } else {
            j = k;
        }
    }
    return i;
}

function insertSorted(data, value, greater) {
    data.splice(binarySearch(data, function (x) { return greater(value, x); }), 0, value);
}

function loadScores() {
    const entries = {};
    const count = window.localStorage.length;

    for (var i = 0; i < count; i++) {
        const key = window.localStorage.key(i);
        const result = key.match(SCORE_KEY_REGEXP);
        if (result) {
            const score = parseInt(window.localStorage.getItem(key));
            if (!isNaN(score) && score >= 0) {
                const columns = parseInt(result[1]);
                if (!entries.hasOwnProperty(columns)) {
                    entries[columns] = [];
                }
                entries[columns].push(
                    {
                        key: key,
                        timestamp: parseInt(result[2]),
                        score: score
                    }
                );
            }
        }
    }

    return entries;
}

function comparingTimestamp(a, b) {
    return b.timestamp - a.timestamp;
}

function comparingScore(a, b) {
    var cmp = b.score - a.score;
    if (cmp == 0) {
        cmp = a.timestamp - b.timestamp;
    }
    return cmp;
}

function pruneScores(entries) {
    Object.keys(entries).forEach(
        function (key) {
            const queue = [];
            entries[key].sort(comparingTimestamp).forEach(
                function (entry) {
                    insertSorted(
                        queue,
                        entry,
                        function (a, b) {
                            return comparingScore(a, b) > 0;
                        }
                    );
                    if (queue.length > SCORE_LAST_MAX && queue.pop() == entry) {
                        window.localStorage.removeItem(entry.key);
                    }
                }
            );
        }
    );
}

function saveScore() {
    window.localStorage.setItem(
        SCORE_KEY_TEXT[0] + PAD_COLS + SCORE_KEY_TEXT[1] + Date.now(), TOTAL_SCORE
    );
    pruneScores(loadScores());
}