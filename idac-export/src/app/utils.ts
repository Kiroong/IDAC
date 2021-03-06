import * as d3 from 'd3';

export function eqArray(a: any[], b: any[]) {
    if (a === b) {
      return true;
    } else if (a === null || b === null) {
      return false;
    } else if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
}

export function eqSet(as: Set<any>, bs: Set<any>) {
    if (as.size !== bs.size) {
      return false;
    }
    const eq = [];
    as.forEach(a => eq.push(bs.has(a)));
    return eq.reduce((a, b) => a && b);
}

export function isAscendingArray(arr: any[]) {
  for (let i = 1; i < arr.length ; i++) {
    if (arr[i - 1] > arr[i]) {
      return false;
    }
  }
  return true;
}

export function isDescendingArray(arr: any[]) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] < arr[i]) {
      return false;
    }
  }
  return true;
}

export function d3ImmediateChildren(selection: d3.Selection<any, any, any, any>, selector: string) {
  return selection.selectAll(selector).filter(function() {
    return (this as any).parentNode === selection.node();
  });
}

export function d3AsSelectionArray(selection: d3.Selection<any, any, any, any>) {
  return Array.from(selection.nodes()).map(d => d3.select(d));
}

export function makeAbsoluteContext(element: SVGGraphicsElement, svgDocument: SVGSVGElement) {
  return function(x: number, y: number) {
    const point = svgDocument.createSVGPoint();
    point.x = x; point.y = y;
    const transformedPoint = point.matrixTransform(element.getCTM());
    return {
      x: transformedPoint.x,
      y: transformedPoint.y
    };
  };
}

export function mergeBoundingBoxes(boundingBoxes: {x: number, y: number, width: number, height: number}[]) {
  const left = [];
  const right = [];
  const top = [];
  const bottom = [];
  boundingBoxes.forEach(box => {
    left.push(box.x);
    right.push(box.x + box.width);
    top.push(box.y);
    bottom.push(box.y + box.height);
  });
  return {
    x: d3.min(left),
    y: d3.min(top),
    width: d3.max(right) - d3.min(left),
    height: d3.max(bottom) - d3.min(top),
  };
}

export function zip(rows: any[][]) {
  return rows[0].map((_, c) => rows.map(row => row[c]));
}

export function firstLetterUpperCase(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : '';
}

export function OnClickOutside(element, callback) {
  const outsideClickListener = event => {
      if (!element.contains(event.target) && isVisible(element)) { // or use: event.target.closest(selector) === null
        callback();
        removeClickListener();
      }
  };

  const removeClickListener = () => {
      document.removeEventListener('click', outsideClickListener);
  };

  document.addEventListener('click', outsideClickListener);
}

// source (2018-03-11): https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js
const isVisible = elem => !!elem && !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );

export class Counter {
  count = {};
  constructor() {
  }
  addCount(name) {
    this.count[name] ? this.count[name] += 1 : this.count[name] = 1;
  }
  getCount(name) {
    return this.count[name] ? this.count[name] : 0;
  }
}

export function pearsonCorrelation(independent, dependent)
{
    // covariance
    let independent_mean = arithmeticMean(independent);
    let dependent_mean = arithmeticMean(dependent);
    let products_mean = meanOfProducts(independent, dependent);
    let covariance = products_mean - (independent_mean * dependent_mean);

    // standard deviations of independent values
    let independent_standard_deviation = standardDeviation(independent);

    // standard deviations of dependent values
    let dependent_standard_deviation = standardDeviation(dependent);

    // Pearson Correlation Coefficient
    let rho = covariance / (independent_standard_deviation * dependent_standard_deviation);

    return rho;
}


function arithmeticMean(data)
{
    let total = 0;

    // note that incrementing total is done within the for loop
    for(let i = 0, l = data.length; i < l; total += data[i], i++);

    return total / data.length;
}


function meanOfProducts(data1, data2)
{
    let total = 0;

    // note that incrementing total is done within the for loop
    for(let i = 0, l = data1.length; i < l; total += (data1[i] * data2[i]), i++);

    return total / data1.length;
}


function standardDeviation(data)
{
    let squares = [];

    for(let i = 0, l = data.length; i < l; i++)
    {
        squares[i] = Math.pow(data[i], 2);
    }

    let mean_of_squares = arithmeticMean(squares);
    let mean = arithmeticMean(data);
    let square_of_mean = Math.pow(mean, 2);
    let variance = mean_of_squares - square_of_mean;
    let std_dev = Math.sqrt(variance);

    return std_dev;
}
