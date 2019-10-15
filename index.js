#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    const bpmnXML = fs.readFileSync('diagram.bpmn', 'utf-8');

    const browser = await puppeteer.launch({defaultViewport: {width: 1440, height: 900, landscape: true, deviceScaleFactor: 2}});
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
                    canvas.zoom('fit-viewport');
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

    const screenshot = await page.screenshot({omitBackground: true, type: 'png'});

    browser.close();

    fs.writeFileSync('diagram.png', screenshot);
    fs.writeFileSync('diagram.svg', svg);
    console.log("Export complete");
})();
