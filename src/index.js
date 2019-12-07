import { debounce } from 'min-dash';

import moment from 'moment';

import {
  append,
  attr,
  clear,
  create,
  remove
} from 'tiny-svg';

import {
  getDuration,
  getYears
} from './date';

import runs from './runs.json';

import { map } from './math';

import './styles.css';

function getBounds(element) {
  return element.getBoundingClientRect();
}

function updateCountdown() {
  if (countdownDate) {
    overlay.innerHTML = `<span>${ moment(countdownDate).format("dddd, MMMM Do YYYY") }</span><br><span>(${ getDuration(countdownDate) })</span>`;
  }
}

function drawTimeline(options) {
  const {
    data,
    end,
    start,
    today
  } = options;

  let line = create('line');

  append(svg, line);

  const { width, height } = bounds;

  attr(line, {
    stroke: 'white',
    strokeWidth: 2,
    x1: PADDING,
    x2: width - PADDING - MARKER_SIZE,
    y1: height - PADDING_BOTTOM,
    y2: height - PADDING_BOTTOM
  });

  // drawLabel('Today', getX(todayDate, start, end), 90, height - PADDING);

  const circle = create('circle');

  attr(circle, {
    cx: PADDING,
    cy: height - PADDING_BOTTOM,
    r: MARKER_SIZE,
    fill: 'white'
  });

  append(svg, circle);

  const polygon = create('polygon');

  attr(polygon, {
    points: `${ width - PADDING },${ height - PADDING_BOTTOM } ${ width - PADDING - MARKER_SIZE * 2 },${ height - PADDING_BOTTOM - MARKER_SIZE } ${ width - PADDING - MARKER_SIZE * 2 },${ height - PADDING_BOTTOM + MARKER_SIZE }`,
    fill: 'white'
  });

  append(svg, polygon);

  drawYearLabels(start, end, svg, bounds);

  data.forEach(({ date, link, title }) => {
    const x = getX(date, start, end, bounds);

    line = create('line');

    append(svg, line);

    attr(line, {
      stroke: 'white',
      strokeWidth: 2,
      x1: x,
      x2: x,
      y1: height - PADDING_BOTTOM,
      y2: height - PADDING_BOTTOM - PADDING
    });

    const rect = drawLabel(title, x, 60, null, 'run');

    if (link) {
      rect.addEventListener('click', () => {
        var win = window.open(link, '_blank');
        win.focus();
      });
    }
  });
}

function drawLabel(title, pixels, angle = 60, y = null, className) {
  const { height } = bounds;

  const group = create('g');

  append(svg, group);

  attr(group, {
    transform: `translate(${ pixels + FONT_SIZE / 3.5 } ${ y === null ? height - PADDING_BOTTOM - PADDING : y })`
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
    fill: 'none',
    height: FONT_SIZE + FONT_SIZE / 1.25,
    transform: `rotate(-${ angle })`,
    width: textBounds.width + PADDING / 2,
    x: 0,
    y: -FONT_SIZE - FONT_SIZE / 4
  });

  append(group, rect);

  if (className) {
    group.classList.add(className);
  }

  return rect;
}

function drawYearLabels(start, end) {
  const years = getYears(start, end);

  const { height } = bounds;

  years.forEach(year => {
    const date = `${year}-01-01`;

    const x = getX(date, start, end);

    drawLabel(year, x, 90, height - PADDING);
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
  Array.from(svg.childNodes).forEach(childNode => {
    if (childNode.tagName !== 'defs') {
      remove(childNode);
    }
  });

  drawTimeline({
    data: runs,
    start: startDate,
    today: todayDate,
    end: endDate
  });
}

const redrawDebounced = debounce(draw, 100);

const todayDate = moment(),
      startDate = moment.min(todayDate, moment('2020-01-01')),
      endDate = moment('2021-01-01');

let countdownDate = null;

const FONT_SIZE = 20,
      MARKER_SIZE = 5,
      PADDING = 40,
      PADDING_BOTTOM = 120;

// query selector instead of ID due to
// https://github.com/parcel-bundler/parcel/issues/2474
const svg = document.querySelector('svg');

let bounds = getBounds(svg);

setInterval(updateCountdown, 1000);

window.addEventListener('resize', () => {
  bounds = svg.getBoundingClientRect();

  redrawDebounced();
});

draw();

let scrollDirection = null;

window.addEventListener('mousemove', ({ pageX }) => {
  if (pageX < window.innerWidth / 10) {
    scrollDirection = 'left';
  } else if (pageX > window.innerWidth - window.innerWidth / 10) {
    scrollDirection = 'right';
  } else {
    scrollDirection = null;
  }
});

window.addEventListener('touchstart', (event) => {
  event.preventDefault();

  const { changedTouches } = event;

  const touch = changedTouches[ 0 ];

  const { pageX } = touch;

  if (pageX < window.innerWidth / 10) {
    scrollDirection = 'left';
  } else if (pageX > window.innerWidth - window.innerWidth / 10) {
    scrollDirection = 'right';
  } else {
    scrollDirection = null;
  }
}, { passive: false });

window.addEventListener('touchend', () => {
  scrollDirection = null;
});

const scrollSpeed = 10;

const scroll = () => {
  if (scrollDirection === 'left') {
    document.body.scrollLeft = document.body.scrollLeft - scrollSpeed;
  } else if (scrollDirection === 'right') {
    document.body.scrollLeft = document.body.scrollLeft + scrollSpeed;
  }

  requestAnimationFrame(scroll);
};

scroll();
