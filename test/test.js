const bpmnCli = require('../index');
const fs = require('fs');
const assert = require('assert');




describe('BPMN-js.cli', function () {
    this.timeout(5000);

    it('should render a svg', async function() {
        const bpmnXML = fs.readFileSync('diagram.bpmn', {encoding: 'utf-8'});
        await bpmnCli(bpmnXML);

        assert(fs.existsSync('diagram.svg'))
    });
});
