import { moveLineX, addElement, formatDate, getDayOfWeek } from "./functions";

export class Popup {
    constructor(chart, y, height) {
        this.chart = chart;
        this.x = -1;
        this.y = y;
        this.height = height;
        this.hidden = false;
        this.line = this.chart.addElement('line', { x1: this.x, x2: this.x, y1: this.y, y2: this.y + this.height, stroke: '#c0c', 'stroke-width': 1 });
        this.box = this.chart.addElement('g');
        this.border = addElement(this.box, 'path', {
            d: this.makeBoxD(150, 50),
            fill: 'none', stroke: '#0c0'
        });
        this.label = addElement(this.box, 'text', {x: 10, y: 10});
        this.detailTexts = [];
    }

    move(points) {
        if (!points[0] || !points[0][1]) return;
        let [threshold, x, i, v] = points[0][1];
        this.show();
        if (x !== this.x) {
            this.x = x;
            let date = new Date(this.chart.data.columns[0][i]);
            let labelText = getDayOfWeek(date) + ', ' + formatDate(date);
            this.label.textContent = labelText;
            this.setDetailTexts(points, i);
            moveLineX(this.line, x, x);
            this.box.setAttribute('transform', `translate(${x}, 100)`);
        }
    }

    setDetailTexts(lines, n) {
        let offsetX = 10;
        lines.forEach(([line, [threshold, x, _, v]], i) => {
            let texts = this.detailTexts[i];
            if (!texts) {
                let lineLabel = addElement(this.box, 'text', {x: offsetX, y: 30, stroke: line.color, fill: line.color});
                let lineValue = addElement(this.box, 'text', {x: offsetX, y: 50, fill: line.color});
                texts = [lineLabel, lineValue];
                this.detailTexts.push(texts);
            }
            let [lineLabel, lineValue] = texts;
            lineLabel.textContent = line.name;
            lineValue.textContent = v;
            let box = lineValue.getBBox();
            offsetX += Math.max(box.width, 20);
        });
    }

    show() {
        if (!this.hidden) return;
        this.line.setAttribute('visibility', 'visible');
        this.box.setAttribute('visibility', 'visible');
        this.hidden = false;
    }

    hide() {
        if (this.hidden || 1) return;
        this.line.setAttribute('visibility', 'hidden');
        this.box.setAttribute('visibility', 'hidden');
        this.hidden = true;
    }

    makeBoxD(width, height) {
        let s = `M 0 0 H ${width} V ${height} H 0 V 0`;
        return s;
    }
}