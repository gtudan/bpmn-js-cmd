#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

async function renderDiagram(bpmnXML, options) {
    let browser;
    try {
        browser = await puppeteer.launch({
            defaultViewport: {
                width: 1024,
                height: 768,
                landscape: true,
                deviceScaleFactor: 2
            }
        });

        const page = await browser.newPage();
        page.on('console', msg => console.log("BPMN-js: " + msg.text()));

        await page.goto(`file://${path.join(__dirname, 'index.html')}`);
        const svg = await page.$eval('#container', (container, bpmnXML) => {
            const viewer = new BpmnJS({container: '#container'});
            return new Promise((resolve, reject) => {
                viewer.importXML(bpmnXML, function (err) {
                    if (err) {
                        console.log('error rendering', err);
                        reject(err);
                    } else {
                        console.log('Diagram looks valid');
                        const canvas = viewer.get('canvas');
                        canvas.zoom('fit-viewport', 'auto');
                        viewer.saveSVG((err, svg) => {
                            if (err) {
                                console.log('Failed to export', err);
                                reject(err);
                            } else {
                                resolve(svg);
                            }
                        });
                    }
                });
            });
        }, bpmnXML);

        await Promise.all([
            fs.promises.writeFile('diagram.svg', svg),
            page.screenshot({omitBackground: true, type: 'png'})
                .then(png => fs.promises.writeFile('diagram.png', png)),
            page.screenshot({type: 'jpeg'})
                .then(jpeg => fs.promises.writeFile('diagram.jpeg', jpeg)),
            page.pdf({landscape: true, format: 'a4', pageRange: 1, preferCSSPageSize: true})
                .then(pdf => fs.promises.writeFile('diagram.pdf', pdf))
        ]);

    } catch (e) {
        console.error('Failed to generate diagram', e);
    } finally {
        browser.close();
    }
}

if (require.main === module) {
    const bpmnXML = fs.readFileSync('diagram.bpmn', {encoding: 'utf-8'});
    renderDiagram(bpmnXML)
        .then(() => console.log("Export complete"))
        .catch(console.error);
}


module.exports = renderDiagram;
