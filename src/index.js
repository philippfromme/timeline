
import { debounce } from 'min-dash';

import moment from 'moment';

import {
  append,
  attr,
  clear,
  create
} from 'tiny-svg';

import {
  getDuration,
  getYears
} from './date';

import marathons from './marathons.json';

import { map } from './math';

import './styles.css';

function getBounds(element) {
  return element.getBoundingClientRect();
}

function updateCountdown() {
  if (countdownDate) {
    overlay.textContent = getDuration(countdownDate);
  }
}

function drawTimeline(options) {
  const { data, start, end } = options;

  let line = create('line');

  append(svg, line);

  const { width, height } = bounds;

  attr(line, {
    stroke: 'white',
    strokeWidth: 2,
    x1: PADDING,
    x2: width - PADDING,
    y1: height - PADDING,
    y2: height - PADDING
  });

  drawLabel('Today', PADDING, 90);

  drawYearLabels(start, end, svg, bounds);

  data.forEach(({ date, title }) => {
    const x = getX(date, start, end, bounds);

    line = create('line');

    append(svg, line);

    attr(line, {
      stroke: 'white',
      strokeWidth: 2,
      x1: x,
      x2: x,
      y1: height - PADDING,
      y2: height - 2 * PADDING
    });

    const [ rect, text ] = drawLabel(title, x);

    rect.addEventListener('mouseenter', () => {
      text.classList.add('hover');

      overlay.classList.remove('hidden');

      countdownDate = date;

      updateCountdown();
    });

    rect.addEventListener('mouseleave', () => {
      text.classList.remove('hover');

      overlay.classList.add('hidden');
    });
  });

  window.addEventListener('mousemove', event => {
    const overlayBounds = overlay.getBoundingClientRect();

    const align = event.pageX < bounds.width / 2 ? 'left' : 'right';

    if (align === 'left' || overlay.classList.contains('hidden')) {
      overlay.style.left = event.pageX + 'px';

      overlay.classList.add('left');
      overlay.classList.remove('right');
    } else {
      overlay.style.left = event.pageX - overlayBounds.width + 'px';

      overlay.classList.add('right');
      overlay.classList.remove('left');
    }

    overlay.style.top = event.pageY + 'px';
  });
}

function drawLabel(title, pixels, angle = 60) {
  const { height } = bounds;

  const group = create('g');

  append(svg, group);

  attr(group, {
    transform: `translate(${pixels + FONT_SIZE / 3.5} ${height - 2 * PADDING})`
  });

  const text = create('text');

  append(group, text);

  text.textContent = title;

  attr(text, {
    fill: 'white',
    fontFamily: 'Roboto Mono',
    fontSize: FONT_SIZE,
    x: PADDING / 4
  });

  const textBounds = text.getBoundingClientRect();

  attr(text, {
    transform: `rotate(-${angle})`
  });

  const rect = create('rect');

  attr(rect, {
    fill: 'transparent',
    height: FONT_SIZE + FONT_SIZE / 1.5,
    transform: `rotate(-${ angle })`,
    width: textBounds.width + PADDING / 2,
    x: 0,
    y: -FONT_SIZE - FONT_SIZE / 4
  });

  append(group, rect);

  return [ rect, text ];
}

function drawYearLabels(start, end) {
  const years = getYears(start, end);

  years.forEach(year => {
    const date = `${year}-01-01`;

    const x = getX(date, start, end);

    drawLabel(year, x, 90);
  });
}

function getX(date, start, end) {
  const dateUnix = moment(date).unix(),
        startUnix = moment(start).unix(),
        endUnix = moment(end).unix();

  const { width } = bounds;

  const percent = map(dateUnix, startUnix, endUnix, 0, 100);

  return map(percent, 0, 100, 0 + PADDING, width - PADDING);
}

function draw() {
  drawTimeline({
    data: marathons,
    start: startDate,
    end: endDate
  });
}

const redrawDebounced = debounce(draw, 100);

const startDate = moment(),
      endDate = '2021-01-01';

let countdownDate = null;

const FONT_SIZE = 20,
      PADDING = 40;

const svg = document.getElementById('svg'),
      overlay = document.getElementById('overlay');

let bounds = getBounds(svg);

setInterval(updateCountdown, 1000);

window.addEventListener('resize', () => {
  clear(svg);

  bounds = svg.getBoundingClientRect();

  redrawDebounced();
});

draw();
