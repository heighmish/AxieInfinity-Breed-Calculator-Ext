// Establish default variables
let crypto = "eth";
let fiat1 = "usdt";

let fiat2 = "aud";
let breedCurr = crypto;

// Grab element ids and set more default values
const currencies = ["slp", "axs"];
const topId = document.getElementById("pricesDiv");
const bottomId = document.getElementById("breedCostsDiv");
const breedSelect = document.getElementById("breedSelect");
const currSelect = document.getElementById("currSelect");
const axsBreedCost = 0.5


let pricesMap = new Map(); // stores all the currency information
const slpCosts = [1800, 2700, 4500, 7200, 11700, 18900, 30600];
const supportedCurrencies = ["aud", "bidr", "brl", 'eur',"gbp","rub","try", "uah","usdt"]
let individualCosts = [0,0,0,0,0,0,0];
let totalCosts = [0,0,0,0,0,0,0];

const fetchPrice = (curr1, curr2) => {
    // Opens a new websocket to binance and updates the price map and then rerenders the new information
    let socket = new WebSocket(`wss://stream.binance.com:9443/ws/${curr1}${curr2}@ticker`);
    socket.onopen = () => {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Change how many decimals are displayed based on price
            let price = parseFloat(data.c);
            if (price > 1) {
                price = price.toFixed(2);
            } else if (price * 1000 > 0.1) {
                price = price.toFixed(4);
            } else {
                price = price.toFixed(6);
            }
            pricesMap.set(data.s.toLowerCase(), price);
            calculateBreedCosts();
            updateTopTable(pricesMap);
            updateBottomTable();
        }
    }
}

const fetchPrices = (crypto_, fiat1_, fiat2_) => {
    // Opens multiple websockets for all the currencies the user has selected
    currencies.forEach(currency => {
        fetchPrice(currency, crypto_);
        fetchPrice(currency, fiat1_);
    });
    fetchPrice(crypto_, fiat1_);
    fetchPrice(crypto_, fiat2_);
}

const createTopTable = () => {
    let table = document.createElement("table");
    table.className = "topTableClass";
    table.id = "topTable";
    let tableBody = document.createElement("tbody");
    tableBody.appendChild(createTableRow("slp","slp1", "slp2"));
    tableBody.appendChild(createTableRow("axs","axs1", "axs2"));
    tableBody.appendChild(createTableRow(`${crypto}`, `${crypto}1`, `${crypto}2`));
    table.appendChild(tableBody);
    currSelect.append(createTopSelect());
    topId.append(table);
}

const createTableRow = (header, data1, data2) => {
    let tr = document.createElement('tr');
    let rowHeader = document.createElement("th");
    rowHeader.innerHTML = '<img src="'+`./assets/${header}.png`+'" height=20 width=20></img>';
    rowHeader.id = header;
    let rowData1 = document.createElement("td");
    rowData1.id = data1;
    let rowData2 = document.createElement("td");
    rowData2.id = data2;
    tr.appendChild(rowHeader);
    tr.appendChild(rowData1);
    tr.appendChild(rowData2);
    return tr;
}

const createTopSelect = () => {
    let select = document.createElement("select");
    select.id = "topSelect";
    const createSelectOption = (currency) => {
        let opt = document.createElement("option");
        opt.value = currency;
        opt.innerHTML = currency;
        return opt;
    }
    // Add supported currencies
    supportedCurrencies.forEach(curr => {
        select.appendChild(createSelectOption(curr))
    })



    select.onchange = () => {
        fiat2 = document.getElementById("topSelect").value;
        chrome.storage.sync.set({"fiat2":fiat2});
        chrome.storage.sync.set({"topSelect":select.selectedIndex});
        fetchPrice(crypto, fiat2);
    }
    select.className = "selectClass";
    return select;
}

const updateTopTable = (pricesMap) => {
    // render the price information to screen
    document.getElementById("slp1").innerHTML = `${pricesMap.get(`slp${crypto}`)} (${crypto})`;
    document.getElementById("slp2").innerHTML = `${pricesMap.get(`slp${fiat1}`)} (${fiat1})`;
    pricesMap.set(`axs${crypto}`, (pricesMap.get(`axs${fiat1}`) / pricesMap.get(`${crypto}${fiat1}`)).toFixed(4));
    document.getElementById("axs1").innerHTML = `${pricesMap.get(`axs${crypto}`)} (${crypto})`;
    document.getElementById("axs2").innerHTML = `${pricesMap.get(`axs${fiat1}`)} (${fiat1})`; //`${pricesMap.get(`axs${crypto}`)}(${crypto})`;
    document.getElementById(`${crypto}1`).innerHTML = `${pricesMap.get(`${crypto}${fiat1}`)} (${fiat1})`;
    document.getElementById(`${crypto}2`).innerHTML = `${pricesMap.get(`${crypto}${fiat2}`)} (${fiat2})`;
}


const createBottomTable = () => {
    let table = document.createElement("table");
    table.className = "topTableClass";
    table.id = "bottomTable";
    let thead = document.createElement("thead");
    let tr = document.createElement("tr");
    let tr1 = document.createElement("th")
    tr1.innerHTML = "Count";
    tr.appendChild(tr1);
    let tr2 = document.createElement("th");
    tr2.innerHTML = "Indiv";
    tr.appendChild(tr2);
    let tr3 = document.createElement("th");
    tr3.innerHTML = "Total";
    tr.appendChild(tr3);
    let tr4 = document.createElement("th");
    tr4.innerHTML = "Average";
    tr.appendChild(tr4);
    thead.append(tr);
    table.append(thead);
    let tbody = document.createElement("tbody");
    for (let i = 1; i <= 7; ++i) {
        tbody.appendChild(createBottomTableRow(i));
    }
    table.appendChild(tbody);
    bottomId.append(table);
    breedSelect.appendChild(createBottomSelect());
}

const createBottomSelect = () => {
    let select = document.createElement("select");
    select.id = "bottomSelect";
    let curr0 = document.createElement("option");
    curr0.value = crypto;
    curr0.innerHTML = crypto;
    let curr1 = document.createElement("option");
    curr1.value = fiat1;
    curr1.innerHTML = fiat1;
    select.appendChild(curr0);
    select.appendChild(curr1);
    select.onchange = () => {
        breedCurr = document.getElementById("bottomSelect").value;
        chrome.storage.sync.set({"breedCurr": breedCurr});
        chrome.storage.sync.set({"botSelect": select.selectedIndex});
        console.log(select.selectedIndex);
        
    }
    select.className = "selectClass";
    
    return select;
}

const createBottomTableRow = (number) => {
    let tr = document.createElement('tr');
    let rowHeader = document.createElement("th");
    rowHeader.innerHTML = number;
    tr.appendChild(rowHeader);
    let individual = document.createElement("td");
    individual.id = `indiv${number}`;
    tr.appendChild(individual);
    let Total = document.createElement("td");
    Total.id = `cumul${number}`;
    tr.appendChild(Total);
    let average = document.createElement("td");
    average.id = `aver${number}`;
    tr.appendChild(average);
    return tr;
}

const updateBottomTable = () => {
    let decimalPlaces = 4
    if (individualCosts[0] > 1) { // Larger currencies require less decimals than ethereum
        decimalPlaces = 1
    }
    for (let i = 1; i<=7; ++i) {
        document.getElementById(`indiv${i}`).innerHTML = individualCosts[i-1].toFixed(decimalPlaces);
        document.getElementById(`cumul${i}`).innerHTML = totalCosts[i-1].toFixed(decimalPlaces);
        document.getElementById(`aver${i}`).innerHTML = (totalCosts[i-1]/i).toFixed(decimalPlaces);
    }
}

const calculateBreedCosts = () => {
    const flatAXS = pricesMap.get(`axs${breedCurr}`) * axsBreedCost;
    const slpPrice = pricesMap.get(`slp${breedCurr}`);
    //console.log(flatAXS, slpPrice);
    for (let i = 0; i<7; ++i) {
        individualCosts[i] = (slpCosts[i]*slpPrice + flatAXS);
        if (i == 0) {
            totalCosts[i] = individualCosts[i];
        } else {
            totalCosts[i] = individualCosts[i] + totalCosts[i-1];
        }
    }
}


const fetchStoredData = () => {
    chrome.storage.sync.get(['lastUsed'], (result) => {
        const oldTime = result.lastUsed;
        if (Date.now() - oldTime < 1800000) { //less than hour an hour since last used data likely still valid
            chrome.storage.sync.get(['data'], (storedData) => {
                if (storedData.data.prices_ != undefined) {
                    pricesMap = new Map(Object.entries(storedData.data.prices_));
                    individualCosts = storedData.data.individualCosts_;
                    totalCosts = storedData.data.totalCosts_;
                    calculateBreedCosts();
                    updateTopTable(pricesMap);
                    updateBottomTable();
                }
            })
        }
    })
    chrome.storage.sync.get(['breedCurr'], (result) => {
        breedCurr = result.breedCurr;
        if (breedCurr === undefined) {
            breedCurr = crypto;
        }
    })
    chrome.storage.sync.get(['fiat2'], (result) => {
        fiat2 = result.fiat2;
        if (fiat2 === undefined) {
            fiat2 = "aud";
        }
        fetchPrice(crypto, fiat2);
    })
    
    chrome.storage.sync.get(['botSelect'], (result) => {
        document.getElementById("bottomSelect").selectedIndex = result.botSelect;     
    })
    
    chrome.storage.sync.get(['topSelect'], (result) => {
        document.getElementById("topSelect").selectedIndex = result.topSelect;   
    })
}

const showPage  = () => {
    document.getElementById("loader1").style.display = "none";
    document.getElementById("loader2").style.display = "none";
    document.getElementById("topTable").style.display = "block";
    document.getElementById("bottomTable").style.display = "block";
    setInterval(saveData, 5000); // save data every 5 seconds
}

const saveData = () => {
    let data = {
        prices_: Object.fromEntries(pricesMap),
        individualCosts_: individualCosts,
        totalCosts_: totalCosts,
    };
    let lastUsed = Date.now()
    chrome.storage.sync.set({"data": data})
    chrome.storage.sync.set({"lastUsed" : lastUsed})
}

const waitForData = () => {
    let interval = setInterval(function() {
        // while the prices havent loaded yet maintain the load screens
        if (pricesMap.size >= 6) {
            clearInterval(interval);
            showPage();
        }
    }, 100);
}
   

window.onload = () => {
    fetchStoredData();
    createTopTable();
    fetchPrices(crypto, fiat1, fiat2);
    createBottomTable();
    waitForData()
    
}