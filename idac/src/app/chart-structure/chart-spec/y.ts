import { SpecTag } from './spec-tag';
import { ChartSpec } from './chart-spec';
import { AttrInput } from './attributes';
import { ChartAccent } from '../chart-accent/chart-accent';

export class Y extends SpecTag {
  constructor(public _root: ChartSpec) {
    super('Y Axis');
    this._parent = _root;
    this.attributes = {
      label: new AttrInput(),
      unit: new AttrInput(),
      rangeFrom: new AttrInput(),
      rangeTo: new AttrInput(),
    };
    this.descriptionRule = [
      'Y axis with label name $(label).',
      'The unit of measurement is $(unit).',
      'The range is from $(rangeMin) to $(rangeMax).',
      ].join(' ');
  }
  fromChartAccent(ca: ChartAccent) {
    this.attributes = {
      label: new AttrInput(ca.chart.yLabel.text.split('(')[0].trim()),
      unit: new AttrInput(ca.chart.yLabel.text.split('(')
        .slice(1).join('(').slice(0, -1).trim()),
      rangeTo: new AttrInput(ca.chart.yScale.max),
      rangeFrom: new AttrInput(ca.chart.yScale.min)
    };
  }

  afterFromChartAccent() {
    const allValues = this._root.marks.children.map(bargroup => bargroup.children.map(bar => bar.properties.value() as number))
    .reduce((a, b) => [...a, ...b]);
    if (!this.attributes.rangeMax || !this.attributes.rangeMin) {
    this.properties.rangeTo = () => Math.ceil(Math.max(...allValues));
    this.attributes.rangeFrom = () => Math.floor(Math.min(...allValues));
    }

  }
  _foreignRepr() {
    return this._tagname;
  }
}
