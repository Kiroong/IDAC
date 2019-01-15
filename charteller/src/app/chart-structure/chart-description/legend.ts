import { ChartAccent, ItemsTarget } from '../chart-accent/chart-accent';
import { Tag } from './tag';

export class Legend extends Tag {
  constructor(ca: ChartAccent) {
    super('legend');
    this.children = ca.chart.yColumns.map((item, index) => new Item(item, index));

    this.attributes = {
      numItems: this.children.length,
      listOfItems: this.children.map(d => d.attributes.item).join(', '),
    };

    this.setDescriptionRule([
      '$(numItems) legend items: $(listOfItems)',
    ].join(' '));
  }
}

export class Item extends Tag {

  constructor(item: string, index: number) {
    super('item');

    this.attributes = {
      item: item,
      index: index,
    };

    this.setDescriptionRule('$(item).');
  }
}
