const bpmnCli = require('../index');
const fs = require('fs');
const path = require('path');

const assert = require('assert');

describe('BPMN-js.cli', function () {
    this.timeout(30000);

    let tmpPath = fs.mkdtempSync('tmp-bpmnjs');
    let bpmnXML;
    const defaultOptions = {height: 1024, width: 786};

    before(function () {
        bpmnXML = fs.readFileSync('diagram.bpmn', {encoding: 'utf-8'});
    });

    after(function() {
        const files = fs.readdirSync(tmpPath);
        files.forEach(element => {
            fs.unlinkSync(path.resolve(tmpPath, element));
        });
       fs.rmdirSync(tmpPath)
    });

    it('should render a svg', async function () {
        const outputPath = path.resolve(tmpPath, 'diagram.jpg');

        await bpmnCli(bpmnXML, {...defaultOptions, ...{type: 'svg'}, output:outputPath});

        assert(fs.existsSync(outputPath))
    });

    it('should render a png', async function () {
        const outputPath = path.resolve(tmpPath, 'diagram.png');
        await bpmnCli(bpmnXML, {...defaultOptions, ...{type: 'png', output:outputPath}});

        assert(fs.existsSync(outputPath))
    });

    it('should render a jpeg', async function () {
        const outputPath = path.resolve(tmpPath, 'diagram.jpg');
        await bpmnCli(bpmnXML, {...defaultOptions, ...{type: 'jpeg', output:outputPath}});

        assert(fs.existsSync(outputPath))
    });

    it('should render a pdf', async function () {
        const outputPath = path.resolve(tmpPath, 'diagram.jpg');

        await bpmnCli(bpmnXML, {...defaultOptions, ...{type: 'pdf', output:outputPath}});

        assert(fs.existsSync(outputPath))
    });
});
