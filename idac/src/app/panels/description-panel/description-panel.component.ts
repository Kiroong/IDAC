import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { SpecTag } from 'src/app/chart-structure/chart-spec/spec-tag';
import * as FuzzySearch from 'fuzzy-search';
import { Textcomplete, Textarea } from 'textcomplete';


@Component({
  selector: 'app-description-panel',
  templateUrl: './description-panel.component.html',
  styleUrls: ['./description-panel.component.scss']
})
export class DescriptionPanelComponent implements OnInit, AfterViewInit {

  @Input() tag: SpecTag;

  @ViewChild('input') textarea: ElementRef<HTMLTextAreaElement>;

  fuzzySearcher: FuzzySearch;

  constructor() { }

  ngOnInit() {
    const keys = Object.keys(this.tag.properties);
    this.fuzzySearcher = new FuzzySearch(keys.map(key => ({ key })), ['key'], { sort: true });
  }

  ngAfterViewInit() {
    const editor = new Textarea(this.textarea.nativeElement);
    const textComplete = new Textcomplete(editor);
    textComplete.register([{
      match: /(^|\s)\$\(([a-zA-Z0-9+\-\_]*)$/,
      search: (term, callback) => callback(this.searchKeyword(term)),
      replace: (name) => `$1$(${name}) `
    }]);
  }

  searchKeyword(keyword: string): string[] {
    return this.fuzzySearcher.search(keyword).map(({key}) => key);
  }

  onDrop(event: DragEvent) {
    const textarea = this.textarea.nativeElement;
    const propName = event.dataTransfer.getData('text');
    const content = textarea.value;
    const pos = textarea.selectionStart;
    const leftContent = content.slice(0, pos),
          rightContent = content.slice(pos);
    // textarea.value = `${leftContent}$(${propName})${rightContent}`;
    textarea.focus();
    textarea.selectionStart += 1;
  }

  onDragOver(event: DragEvent) {
    /*
    const textarea = this.textarea.nativeElement;
    console.log(textarea.);
    */
  }

}
