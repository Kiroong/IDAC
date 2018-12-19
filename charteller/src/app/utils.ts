export function eqArray(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

export function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    let eq = [];
    as.forEach(a => eq.push(bs.has(a)));
    return eq.reduce((a,b) => a&&b);
}