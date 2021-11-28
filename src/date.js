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

  let year = startYear;

  while (year <= endYear) {
    years.push(year);

    year++;
  }

  return years;
}

export function getMonths(start, end) {
  const startYear = moment(start).year(),
        startMonth = moment(start).month(),
        endYear = moment(end).year(),
        endMonth = moment(end).month();

  const months = [];

  for (let year = startYear; year < endYear; year++) {
    for (let month = 2; month <= 12; month++) {
      const newMonth = {
        label: month,
        month,
        year
      }

      if (year === startYear) {
        if (month >= startMonth) {
          months.push(newMonth);
        }
      } else if (year === endYear) {
        if (month <= endMonth) {
          months.push(newMonth);
        }
      } else {
        months.push(newMonth);
      }
    }
  }

  return months;
}