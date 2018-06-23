const zz = require('../src/zilez');
const mocha = require('mocha');

describe('Zilez test', () => {
    it('should start watching this path', () => {
        zz.observe(__dirname, p => {
            if (p.operation == 'add') {
                console.log(`File ${p.path} added.`);
            }
        });
    });
})