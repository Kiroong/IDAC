export const keyBindings = {
    moveToNextElement: new Set(['tab']),
    moveToPreviousElement: new Set(['shift', 'tab']),
    moveToNextAnnotation: new Set(['d']),
    moveToPreviousAnnotation: new Set(['shift', 'd']),
    moveToNextSibling: new Set(['arrowright']),
    moveToPreviousSibling: new Set(['arrowleft']),
    moveToParent: new Set(['arrowup']),
    moveToChild: new Set(['arrowdown']),
    moveToPreviouslyVisitedElement: new Set(['u']),
    moveToNextFrame: new Set(['f']),
    moveToPreviousFrame: new Set(['shift', 'f']),
    moveToTitle: new Set(['t']),
    moveToXAxis: new Set(['x']),
    moveToYAxis: new Set(['y']),
    moveToLegend: new Set(['l']),
    moveToMarks: new Set(['m']),
    moveToNextDataPoint: new Set(['p']),
    moveToPreviousDataPoint: new Set(['shift', 'p']),
    checkCurrentElement: new Set(['enter']),
    queryMaximum: new Set(['q', 'h']),
    queryMinimum: new Set(['q', 'j']),
    queryAverage: new Set(['q', 'k']),
    queryTendency: new Set(['q', 'l']),
}
