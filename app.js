import puppeteer from "puppeteer";
import colors from "colors";
import {dates} from "./flights-data.js"

const options = ["--url", "--invalid", "--object"];

const show = (x, Function=null) => {console.log(
    Function ?  Function(x) : x
)}

const pickColorFunction = (isValid) => isValid ? colors.green : colors.red;

const config = (argv) => options.map(x => argv.includes(x)); 

const makeUrl = (date) => {
    const {date_there, date_back} = date;

    const urlFirstPart = "https://www.ryanair.com/pl/pl/trip/flights/select?adults=1&teens=0&children=0&infants=0";
    const urlMidPart =  "&isConnectedFlight=false&isReturn=true&discount=0&promoCode=&originIata=KTW&destinationIata=VCE&tpAdults=1&tpTeens=0&tpChildren=0&tpInfants=0";
    const urlLastPart = "&tpDiscount=0&tpPromoCode=&tpOriginIata=KTW&tpDestinationIata=VCE";

    return `${urlFirstPart}&dateOut=${date_there}&dateIn=${date_back}${urlMidPart}&tpStartDate=${date_there}&tpEndDate=${date_back}${urlLastPart}`;
}

const flightInfo = (date) => {
    const {date_there, date_back, price_back, price_there} = date;
    return `\n\tWylot: ${date_there}\n\tPrzylot: ${date_back}\n\tSuma: ${price_there + price_back} [${price_there}, ${price_back}]`
}

const [showUrl, showInValid, OnlyDateObject] = config(process.argv);


const start = async () => {
    const browser = await puppeteer.launch();
        //>Debug
        // const browser = await puppeteer.launch({slowMo: 500});
        // const browser = await puppeteer.launch({headless: false,slowMo: 500});
    const page = await browser.newPage();

    for(let date of dates) {

        const url = makeUrl(date);

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
            show(`\n--Invalid result [ ${date.date_there} - ${date.date_back}]`, pickColorFunction(isDateValid));
        }
        else if(OnlyDateObject) {
            if(showUrl)
                show("\n" + url);
            show(date, pickColorFunction(isDateValid));
        }
        else {
            if(showUrl)
                show("\n" + url);
            show(flightInfo(date), pickColorFunction(isDateValid))
        }
    }
    
    await browser.close();
}

await start();