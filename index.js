#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    const bpmnXML = fs.readFileSync('sample.bpmn', 'utf-8');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto(`file://${path.join(__dirname, 'index.html')}`);
    const svg = await page.$eval('#container', (container, bpmnXML) => {
        return new Promise((resolve, reject) => {
            const viewer = new BpmnJS({container: '#container'});
            viewer.importXML(bpmnXML, function (err) {
                if (err) {
                    console.log('error rendering', err);
                    reject();
                } else {
                    console.log('we are good!');
                    viewer.saveSVG((err, svg) => {
                        resolve(svg);
                    })
                }
            });
        });
    }, bpmnXML);

    fs.writeFileSync('diagram.svg', svg)

})();
