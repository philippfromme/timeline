import moment from 'moment';

export function getDuration(date) {
  const diff = moment(date).diff();

  const duration = moment.duration(diff);

  return [
    { count: duration.years(), label: "years" },
    { count: duration.months(), label: "months" },
    { count: duration.days(), label: "days" },
    { count: duration.hours(), label: "hours" },
    { count: duration.seconds(), label: "seconds" }
  ]
    .filter(({ count }) => count > 0)
    .map(({ count, label }) => `${count} ${label}`)
    .join(" ");
}

export function getYears(start, end) {
  const startYear = moment(start).year(),
        endYear = moment(end).year();

  const years = [];

  let year = startYear + 1;

  while (year <= endYear) {
    years.push(year);

    year++;
  }

  return years;
}