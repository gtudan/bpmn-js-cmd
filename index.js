#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');


(async () => {
    const bpmnXML = fs.readFileSync('diagram.bpmn', 'utf-8');

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

        const png = await page.screenshot({omitBackground: true, type: 'png'});
        const jpeg = await page.screenshot({type: 'jpeg'});
        const pdf = await page.pdf({landscape: true, format: 'a4', pageRange: 1, preferCSSPageSize: true});

        fs.writeFileSync('diagram.png', png);
        fs.writeFileSync('diagram.jpeg', jpeg);
        fs.writeFileSync('diagram.svg', svg);
        fs.writeFileSync('diagram.pdf', pdf);
    } catch (e) {
        console.error('Failed to generate diagram', e);
    } finally {
        browser.close();
    }
})();


console.log("Export complete");
