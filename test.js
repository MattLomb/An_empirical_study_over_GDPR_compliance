const tcfDecoder = require('tcf-decoder');

const encodedTCString = "COz2pfpOz2pfpABABBENAPCAqAA6A_HAAwAAAAqgBCACAAIAAIAAgACACAAIAA...";

// Decodifica la TCString
const decodedTCString = tcfDecoder.decode(encodedTCString);

console.log(decodedTCString);