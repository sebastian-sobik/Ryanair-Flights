import puppeteer from "puppeteer";
import {dates} from "./flights-data.js";
import * as f from "./functions.js";

const [showUrl, showInValid, OnlyDateObject] = f.config(process.argv);

const start = async () => {
    // const browser = await puppeteer.launch();
        // >Debug
        // const browser = await puppeteer.launch({slowMo: 500});
        const browser = await puppeteer.launch({headless: false,slowMo: 500});
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

        const isDateValid = date.price_there && date.price_back;

        if(!showInValid && !(isDateValid)){
            f.show(`\n--Invalid result [ ${date.date_there} - ${date.date_back}]`, f.pickColorFunction(isDateValid));
        }
        else if(OnlyDateObject) {
            if(showUrl)
               f.show("\n" + url);
            f.show(date, f.pickColorFunction(isDateValid));
        }
        else {
            if(showUrl)
                f.show("\n" + url);
            f.show(f.flightInfo(date), f.pickColorFunction(isDateValid))
        }
    }
    
    await browser.close();
}

await start();