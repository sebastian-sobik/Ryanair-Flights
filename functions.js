import colors from "colors";
const options = ["--url", "--invalid", "--object"];

export const pickColorFunction = (isValid) => isValid ? colors.green : colors.red;

export const config = (argv) => options.map(x => argv.includes(x));

export const makeUrl = (date) => {
    const {date_there, date_back, from, to} = date;

    const urlFirstPart = `https://www.ryanair.com/pl/pl/trip/flights/select?adults=1&teens=0&children=0&infants=0`;
    const urlMidPart =  `&isConnectedFlight=false&isReturn=true&discount=0&promoCode=&originIata=${from}&destinationIata=${to}&tpAdults=1&tpTeens=0&tpChildren=0&tpInfants=0`;
    const urlLastPart = `&tpDiscount=0&tpPromoCode=&tpOriginIata=${from}&tpDestinationIata=${to}`;

    return `${urlFirstPart}&dateOut=${date_there}&dateIn=${date_back}${urlMidPart}&tpStartDate=${date_there}&tpEndDate=${date_back}${urlLastPart}`;
}

export const flightInfo = (date, time_there, time_back) => {
    const {date_there, date_back, price_back, price_there, from, to} = date;
    return `\n\t${from} - ${to}\n\tWylot: ${date_there}, ${time_there}\n\tPrzylot: ${date_back}, ${time_back}\n\tSuma: ${price_there + price_back} [${price_there}, ${price_back}]`
}

export const print = (showUrl, showInValid, OnlyDateObject, date, url, time_there, time_back) => {
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
        show(flightInfo(date, time_there, time_back), pickColorFunction(isDateValid))
    }
}

export const show = (x, Function=null) => console.log(Function ?  Function(x) : x);
