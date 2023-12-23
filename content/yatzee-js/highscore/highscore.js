const LOCALE = "de-DE";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat(
    LOCALE,
    {
        "year": "numeric",
        "month": "2-digit",
        "day": "2-digit",
        "hour": "2-digit",
        "minute": "2-digit",
        "second": "2-digit"
    }
);

const DATE_FORMAT = new Intl.DateTimeFormat(
    LOCALE,
    {
        "year": "numeric",
        "month": "2-digit",
        "day": "2-digit"
    }
);

const DATE_MONTH_FORMAT = new Intl.DateTimeFormat(
    LOCALE,
    {
        "year": "numeric",
        "month": "long"
    }
);

const DATE_YEAR_FORMAT = new Intl.DateTimeFormat(
    LOCALE,
    {
        "year": "numeric"
    }
);

const DATE_CALCULATOR = [
    function (now) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return {
            date: date,
            text: DATE_FORMAT.format(date)
        };
    },
    function (now) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()) % 7);
        return {
            date: date,
            text: DATE_FORMAT.format(date) + " - " + DATE_FORMAT.format(end)
        };
    },
    function (now) {
        return {
            date: new Date(now.getFullYear(), now.getMonth()),
            text: DATE_MONTH_FORMAT.format(now)
        };
    },
    function (now) {
        return {
            date: new Date(now.getFullYear(), 0),
            text: DATE_YEAR_FORMAT.format(now)
        };
    },
    function (now) {
        return {};
    }
];

function newTableBody(entries) {
    const lines = [];
    if (entries.length) {
        entries.forEach(
            function (entry, index) {
                lines.push('<tr>');
                lines.push('<td>' + (index + 1) + '</td>');
                lines.push('<td>' + DATE_TIME_FORMAT.format(new Date(entry.timestamp)) + '</td>');
                lines.push('<td>' + entry.score + '</td>');
                lines.push('</tr>');
            }
        );
    } else {
        lines.push('<tr>');
        lines.push('<td class="empty" colspan="3">keine Spiele</td>');
        lines.push('</tr>');
    }
    return lines.join("");
}

function update(filter, entries) {
    const bodies = document.getElementsByTagName("tbody");
    for (var i = 0; i < bodies.length; i++) {
        var filtered = [];
        if (entries.hasOwnProperty(i + 1)) {
            filtered = filter == null
                ? entries[i + 1].slice()
                : entries[i + 1].filter(
                    function (entry) {
                        return entry.timestamp >= filter.getTime();
                    }
                );
            filtered.sort(comparingScore);
            filtered.splice(SCORE_LAST_MAX);
        }
        bodies[i].innerHTML = newTableBody(filtered);
    }
}

window.onload = function () {
    const element = document.getElementById("filter");

    const now = Date.now();
    const filters = DATE_CALCULATOR.map(
        function (calculator, index) {
            const filter = calculator(new Date(now));
            if (filter.text) {
                element.children[index].innerText += " (" + filter.text + ")";
            }
            return filter.date;
        }
    );

    const entries = loadScores();
    update(filters[0], entries);

    element.onchange = function () {
        update(filters[this.selectedIndex], entries);
    };
};