#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const proc = require('process');

function parseArgs() {
    return require('yargs')
        .command('$0 <file>', 'render a bpmn diagram', (yargs) => {
            yargs.positional('file', {describe: 'a BPMN-XML process definition file '})
                .usage('Usage: $0 [options] <file>')
        })
        .option('t', {
            describe: 'file type of the new diagram',
            choices: ['svg', 'png', 'jpeg', 'pdf'],
            alias: 'type',
            default: 'svg'
        })
        .option('o', {
            describe: 'output path for the rendered diagram.',
            alias: 'output',
            defaultDescription: '<input>.<type>'
        })
        .option('w', {
            describe: 'width of the diagram (does not apply to svg)',
            alias: 'width',
            default: 1024,
            type: 'number'
        })
        .option('h', {
            describe: 'height of the diagram (does not apply to svg)',
            alias: 'height',
            default: 768,
            type: 'number'
        })
        .wrap(120)
        .version()
        .help()
        .argv;
}

async function renderDiagram(bpmnXML, options) {
    let browser;
    try {
        browser = await puppeteer.launch({
            defaultViewport: {
                width: options.width,
                height: options.height,
                landscape: true,
                deviceScaleFactor: 2
            },
            args: ['--no-sandbox'],
            executablePath: process.env.CHROMIUM_PATH
        });

        const page = await browser.newPage();
        page.on('console', msg => console.log("BPMN-js: " + msg.text()));
        await page.goto(`file://${path.join(__dirname, 'index.html')}`);

        const bpmnJsDist = path.resolve(require.resolve('bpmn-js'), '../dist');
        await page.addScriptTag({path: path.resolve(bpmnJsDist, 'bpmn-viewer.production.min.js')});

        const svg = await page.$eval('#container', (container, bpmnXML, options) => {
            const viewer = new BpmnJS({container: '#container'});

            function loadDiagram() {
                return new Promise((resolve, reject) => {
                    viewer.importXML(bpmnXML, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('Diagram looks valid');
                            resolve();
                        }
                    });
                });
            }

            function exportSVG() {
                return new Promise((resolve, reject) => {
                    viewer.saveSVG((err, svg) => {
                        if (err) {
                            console.log('Failed to export', err);
                            reject(err);
                        } else {
                            resolve(svg);
                        }
                    });
                });
            }

            return loadDiagram().then(() => {
                if (options.type === 'svg') {
                    return exportSVG();
                } else {
                    const canvas = viewer.get('canvas');
                    canvas.zoom('fit-viewport', 'auto');
                }
            }).catch((err) => {
                throw err;
            });

        }, bpmnXML, options);

        switch (options.type) {
            case 'svg':
                fs.writeFileSync(options.output, svg);
                break;
            case 'png':
            case 'jpeg':
                await page.screenshot({omitBackground: true, type: options.type})
                    .then(image => fs.writeFileSync(options.output, image));
                break;
            case 'pdf':
                await page.pdf({landscape: true, format: 'a4', pageRange: 1, preferCSSPageSize: true})
                    .then(pdf => fs.writeFileSync(options.output, pdf));
                break;
        }

    } catch (e) {
        error( e);
    } finally {
        browser.close();
    }
}

function error(e) {
    console.error('Failed to render diagram\n', e);
    process.exit(1);
}

if (require.main === module) {
    const options = parseArgs();

    if (!fs.existsSync(options.file)) {
        error(`File ${options.file} does not exist.`);
    }

    if (!options.output) {
        let baseName = path.parse(options.file).name;
        let directoryName = path.parse(options.file).dir;
        options.output = `${directoryName}/${baseName}.${options.type}`;
    }

    const bpmnXML = fs.readFileSync(options.file, {encoding: 'utf-8'});
    renderDiagram(bpmnXML, options)
        .then(() => console.log("Export complete"))
        .catch(error);
}


module.exports = renderDiagram;
