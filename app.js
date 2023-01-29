import puppeteer from "puppeteer";
import {dates} from "./flights-data.js";
import * as f from "./functions.js";

const [showUrl, showInValid, onlyDateObject] = f.config(process.argv);

const start = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for(let date of dates) {

        const url = f.makeUrl(date);

        await page.goto(url);
        await page.waitForSelector('flights-summary-container');

        [date.price_there, date.price_back] = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".date-item--selected")).map(el => {
                el = el.querySelector("flights-price");

                if(el)
                    return parseFloat(el.textContent.replace("zł ", '').replace(/ /g, "").replace(",", "."));
                else
                    return null;
            });
        });

        f.print(showUrl, showInValid, onlyDateObject, date, url);
    }

    await browser.close();
}

await start();