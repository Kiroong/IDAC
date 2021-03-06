import { SpecTag } from 'src/app/chart-structure/chart-spec/spec-tag';
import * as d3 from 'd3';
import { d3AsSelectionArray, makeAbsoluteContext, mergeBoundingBoxes, d3ImmediateChildren } from 'src/app/utils';
import { translate } from 'src/app/chartutils';

function createSVGElement(tagname: string) {
  const namespace = d3.namespace('svg') as d3.NamespaceLocalObject;
  return document.createElementNS(namespace.space, tagname);
}

export interface IBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class HighlightShape {
  boundingBox: IBox;
  constructor(
      public tag: SpecTag,
      public associatedElements: d3.Selection<any, any, any, any>,
      public svg: d3.Selection<SVGSVGElement, any, any, any>,
      public elementLink: any
  ) {
    this.boundingBox = this.getMergedBoundingBox(this.associatedElements);
    this.onInit();
  }

  static getShape (
      tag: SpecTag,
      associatedElements: d3.Selection<any, any, any, any>,
      svg: d3.Selection<SVGSVGElement, any, any, any>,
      elementLink: any
    ) {
      const _class = getHighlightShapeClass(tag);
      return new _class(tag, associatedElements, svg, elementLink);
  }

  onInit() { }

  afterAllRendered() { }

  getMergedBoundingBox(selection: d3.Selection<any, any, any, any>): IBox {
    const boundingBoxes: IBox[] = [
      ...selection.nodes().map(d => d3.select(d)),
      ...d3AsSelectionArray(selection.selectAll('*'))
    ].map(d => {
      const elem = d.node();
      const bbox = elem.getBBox();
      const convert = makeAbsoluteContext(elem, this.svg.node());
      const fourPoints = [
        { ...convert(bbox.x, bbox.y) },
        { ...convert(bbox.x + bbox.width, bbox.y) },
        { ...convert(bbox.x, bbox.y + bbox.height) },
        { ...convert(bbox.x + bbox.width, bbox.y + bbox.height) },
      ];
      const bounds = {
        minX: Math.min(...fourPoints.map(p => p.x)),
        minY: Math.min(...fourPoints.map(p => p.y)),
        maxX: Math.max(...fourPoints.map(p => p.x)),
        maxY: Math.max(...fourPoints.map(p => p.y)),
      };
      return {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
      };
    });
    const mergedBox = mergeBoundingBoxes(boundingBoxes);
    mergedBox.width = Math.max(mergedBox.width, 5);
    mergedBox.height = Math.max(mergedBox.height, 5);
    return mergedBox;
  }

  makeCircle(x: number, y: number, r: number) {
    return d3.select(createSVGElement('circle'))
      .attr('cx', x).attr('cy', y).attr('r', r).node() as SVGCircleElement;
  }

  makeShell({ x, y, width, height }: IBox, dl: number = 5, dt: number = dl, dr: number = dl, db: number = dt) {
    const w = width, h = height;
    const path = `M0 0 h${w} v${h} h${-w}z`
      + `M${-dl} ${-dt} v${h + dt + db} h${w + dl + dr} v${-h - dt - db}z`;
    return d3.select(createSVGElement('path'))
      .attr('d', path)
      .attr('fill-rule', 'evenodd')
      .attr('transform', translate(x, y))
      .node();
  }

  makeLine(line: d3.Selection<any, any, any, any>, strokeWidth: number) {
    return d3.select(createSVGElement('line'))
      .attr('x1', line.attr('x1'))
      .attr('x2', line.attr('x2'))
      .attr('y1', line.attr('y1'))
      .attr('y2', line.attr('y2'))
      .attr('stroke-linecap', 'round')
      .style('stroke-width', strokeWidth)
      .node();
  }

  makePath(path: d3.Selection<any, any, any, any>, strokeWidth: number, fill = true) {
    const pathSel = d3.select(createSVGElement('path'))
      .attr('d', path.attr('d'))
      .style('stroke-width', strokeWidth);
    if (!fill) {
      pathSel.style('fill', 'none');
    }
    return pathSel.node();
  }


  makeRectFromBoundingBox(box: IBox) {
    return d3.select(createSVGElement('rect'))
      .attr('transform', translate(box.x, box.y))
      .attr('width', box.width).attr('height', box.height).node() as SVGRectElement;
  }

  enlargeBoxBy(box: IBox, dl: number, dt: number = dl, dr: number = dl, db: number = dt) {
    box.width += dl + dr;
    box.height += dt + db;
    box.x -= dl;
    box.y -= dt;
  }

  enlargeBoxByMult(box: IBox, mx: number, my: number = mx) {
    const dx = box.width * (mx - 1), dy = box.height * (my - 1);
    this.enlargeBoxBy(box, dx, dy);
  }


  elemMarks(): Element[] {
    return [this.makeRectFromBoundingBox(this.boundingBox)];
  }

  bookmarks(): Element[] {
    return [this.makeShell(this.boundingBox, 5)];
  }

}

class Title extends HighlightShape {
  onInit() {
    this.enlargeBoxByMult(this.boundingBox, 1.05);
  }
}

class Y extends HighlightShape {
  onInit() {
    const d = this.boundingBox.width * 0.2;
    this.enlargeBoxBy(this.boundingBox, d, d, 0, 0);
  }
}
class X extends HighlightShape {
  onInit() {
    const d = this.boundingBox.height * 0.2;
    this.enlargeBoxBy(this.boundingBox, 0, 0, 0, d);
  }
}
class Tick extends HighlightShape {
  textBoundingBox: IBox;
  onInit() {
    this.textBoundingBox = this.getMergedBoundingBox(this.associatedElements.selectAll('text'));
  }
  elemMarks() {
    return [this.makeRectFromBoundingBox(this.textBoundingBox)];
  }
  bookmarks() {
    return [this.makeShell(this.textBoundingBox, this.textBoundingBox.y - this.boundingBox.y)];
  }
}
class Legend extends HighlightShape {
  onInit() {
    this.enlargeBoxBy(this.boundingBox, 10, 0, 10, 0);
  }
  elemMarks() {
    return [this.makeShell(this.boundingBox, 15)];
  }
  bookmarks() {
    const outerBox = { ...this.boundingBox };
    this.enlargeBoxBy(outerBox, 15);
    return [this.makeShell(outerBox, 5)];
  }

}
class Item extends HighlightShape {
  onInit() {
    this.enlargeBoxBy(this.boundingBox, 10, 1, 10, 1);
  }
}
class Marks extends HighlightShape {
  onInit() {
  }
  elemMarks() {
    const yBBox = this.elementLink[this.tag._root.y._id].highlightShape.boundingBox;
    const dx = this.boundingBox.x - (yBBox.x + yBBox.width);
    const dy = this.boundingBox.y - yBBox.y;
    return [this.makeShell(this.boundingBox, dx, dy, dx, 0)];
  }
}
class BarGroup extends HighlightShape {
  onInit() {
    this.enlargeBoxBy(this.boundingBox, 10, 10, 10, 0);
  }
}
class Bar extends HighlightShape {
  onInit() {
    const d = this.boundingBox.width * 0.2;
    this.enlargeBoxBy(this.boundingBox, d, d, d, 0);
  }
}
class SeriesLine extends HighlightShape {
  path;
  onInit() {
    this.path = d3.select(this.associatedElements.nodes().find(d => d.tagName === 'path'));
  }
  elemMarks() {
    return [this.makePath(this.path, 20, false)];
  }
  bookmarks() {
    return [this.makePath(this.path, 7, false)];
  }
}
class SeriesScatter extends HighlightShape {
  circles;
  onInit() {
    this.circles = this.associatedElements.nodes().filter(d => d.tagName === 'circle');
  }
  elemMarks() {
    return this.circles.map(circle => {
      return this.makeCircle(+circle.attributes.cx.value,
        +circle.attributes.cy.value, +circle.attributes.r.value + 15);
    });
  }
  bookmarks() {
    return this.elemMarks();
  }
}
class Point extends HighlightShape {
  circle;
  onInit() {
    const d = 7; // this.boundingBox.width * 0.4;
    this.circle = this.associatedElements.nodes().find(d => d.tagName === 'circle');
  }
  elemMarks() {
    return [this.makeCircle(+this.circle.attributes.cx.value,
      +this.circle.attributes.cy.value, +this.circle.attributes.r.value + 7)];
  }
  bookmarks() {
    return this.elemMarks();
  }
}
class Annotations extends HighlightShape { }
class Highlight extends HighlightShape {
  paths: d3.Selection<any, any, any, any>;
  onInit() {
    this.paths = this.associatedElements.selectAll('path');
  }
  elemMarks() {
    const rects = this.paths.nodes().map(path =>
      this.makeRectFromBoundingBox(
        this.getMergedBoundingBox(d3.select(path))
      )
    );
    return rects;
  }
  bookmarks() {
    return this.elemMarks();
  }
}
class TrendLine extends HighlightShape {
  trendLine: d3.Selection<any, any, any, any>;
  onInit() {
    this.trendLine = this.associatedElements.filter('.trendline');
  }
  elemMarks() {
    return [this.makeLine(this.trendLine, 15)];
  }
  bookmarks() {
    return [this.makeLine(this.trendLine, 7)];
  }
}
class Line extends HighlightShape { }
class Range extends HighlightShape { }
class RelationalHighlightLine extends HighlightShape {
  path: d3.Selection<any, any, any, any>;
  afterAllRendered() {
    this.path = this.elementLink[this.tag._parent._id].associatedElements.filter('path');
  }
  elemMarks() {
    const box = this.getMergedBoundingBox(this.path);
    const arrowWidth = 15;
    const marksBBox = this.elementLink[this.tag._root.marks._id].highlightShape.boundingBox;
    const yBBox = this.elementLink[this.tag._root.y._id].highlightShape.boundingBox;
    let rect: SVGRectElement;
    if (this.tag.properties.relation() === 'above') {
      rect = this.makeRectFromBoundingBox({
        x: box.x + box.width - arrowWidth,
        y: yBBox.y,
        width: arrowWidth,
        height: box.y - yBBox.y
      });
    } else {
      rect = this.makeRectFromBoundingBox({
        x: box.x + box.width - arrowWidth,
        y: box.y + box.height,
        width: arrowWidth,
        height: marksBBox.y + marksBBox.height - box.y - box.height
      });
    }
    return [this.makePath(this.path, 15), rect];
  }
}
class RelationalHighlightRange extends HighlightShape { }

function getHighlightShapeClass(tag: SpecTag) {
  switch (tag._tagname) {
    case 'Title':
      return Title;
    case 'Y Axis':
      return Y;
    case 'X Axis':
      return X;
    case 'Tick':
      return Tick;
    case 'Legend':
      return Legend;
    case 'Item':
      return Item;
    case 'Marks':
      return Marks;
    case 'Bar Group':
      return BarGroup;
    case 'Bar':
      return Bar;
    case 'Series':
      if (tag._root.chartType === 'line-chart') {
        return SeriesLine;
      } else {
        return SeriesScatter;
      }
    case 'Point':
      return Point;
    case 'Annotations':
      return Annotations;
    case 'Highlight':
      return Highlight;
    case 'Trend Line':
      return TrendLine;
    case 'Line':
      return Line;
    case 'Range':
      return Range;
    case 'Below or Above':
      return Highlight; // RelationalHighlightLine;
    case 'Within or Outside':
      return Highlight; // RelationalHighlightRange;
    default:
      return HighlightShape;
  }
}
