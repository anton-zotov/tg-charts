Object.values = Object.values || (x => Object.keys(x).map(k => x[k]));
Object.entries = Object.entries || (x => Object.keys(x).map(k => [k, x[k]]));