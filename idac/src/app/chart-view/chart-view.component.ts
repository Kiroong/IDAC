import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { SpecTag } from '../chart-structure/chart-spec/spec-tag';
import { ChartSpec } from '../chart-structure/chart-spec/chart-spec';
import * as d3 from 'd3';
import { SvgContainerComponent } from '../svg-container/svg-container.component';
import { d3ImmediateChildren, d3AsSelectionArray, makeAbsoluteContext, mergeBoundingBoxes } from '../utils';
import { translate } from '../chartutils';

@Component({
  selector: 'app-chart-view',
  templateUrl: './chart-view.component.html',
  styleUrls: ['./chart-view.component.scss']
})
export class ChartViewComponent implements OnInit, AfterViewChecked {

  @Input() src: string;
  @Input() chartSpec: ChartSpec;
  @Input() currentTag: SpecTag;
  @Output() currentTagChange: EventEmitter<SpecTag> = new EventEmitter();

  @ViewChild(SvgContainerComponent) svgContainer: SvgContainerComponent;

  svg: d3.Selection<SVGGElement, any, HTMLElement, any>;
  elementLink = {};
  ready = false;

  constructor() { }

  ngOnInit() {
  }

  onSVGInit() {
    this.ready = true;
    this.svg = d3.select(this.svgContainer.svgContainerDiv.nativeElement).select('svg');
    const [annotationBackground, g2, annotationForeground] = d3AsSelectionArray(d3ImmediateChildren(this.svg, 'g'));
    const [title, legend, chart] = d3AsSelectionArray(d3ImmediateChildren(g2, 'g'));
    const items = d3AsSelectionArray(legend.selectAll('.legend'));
    const [marks, x, y, yLabel, xLabel] = d3AsSelectionArray(d3ImmediateChildren(chart, 'g'));
    const serieses = d3AsSelectionArray(d3ImmediateChildren(marks, 'g'));
    const xTicks = d3AsSelectionArray(x.selectAll('.tick'));
    const yTicks = d3AsSelectionArray(y.selectAll('.tick'));
    const annotation = annotationBackground.merge(annotationForeground);

    // annotationForeground.selectAll('._uniqueid_930').style('fill', 'green').selectAll('*').style('fill', 'green');
    // annotationForeground.selectAll('._uniqueid_933').style('fill', 'pink').selectAll('*').style('fill', 'pink');

    const cs = this.chartSpec;
    const pairs = [
      [cs.title, title],
      [cs.y, y],
      [cs.x, x],
      [cs.legend, legend],
      [cs.marks, marks],
    ];
    cs.x.children.forEach((tick, i) => {
      pairs.push([tick, xTicks[i]]);
    });
    cs.legend.children.forEach((item, i) => {
      pairs.push([item, items[i]]);
    });
    this.elementLink = pairs.reduce((accum, [k, v]: [SpecTag, any]) => {
      accum[k._id] = v;
      return accum;
    }, {});
    console.log(this.elementLink);
  }

  ngAfterViewChecked() {
    if (this.ready) {
      this.svg.selectAll('.idac-highlight').remove();
      const target = this.elementLink[this.currentTag._id];
      if (target) {
        const boundingBoxes = d3AsSelectionArray(target.selectAll('*')).map(d => {
          const elem = d.node();
          const bbox = elem.getBBox();
          const convert = makeAbsoluteContext(elem, this.svg.node());
          return {
            ...convert(bbox.x, bbox.y),
            width: bbox.width,
            height: bbox.height
          };
        });
        const mergedBox = mergeBoundingBoxes(boundingBoxes);
        console.log(mergedBox);
        this.svg.append('rect').attr('transform', translate(mergedBox.x, mergedBox.y))
          .attr('width', mergedBox.width).attr('height', mergedBox.height)
          .style('fill', 'rgba(255, 255, 0, 0.5)')
          .classed('idac-highlight', true);
      }
    }
  }

  _currentTagChange(tag: SpecTag) {
    this.currentTag = tag;
    this.currentTagChange.emit(this.currentTag);
  }

}
