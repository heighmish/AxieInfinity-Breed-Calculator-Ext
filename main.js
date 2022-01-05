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
const selectedCostsDiv = document.getElementById("selectedCostsDiv");

// Values determined by Sky Mavis
const slpCosts = [1800, 2700, 4500, 7200, 11700, 18900, 30600]; 
const axsBreedCost = 0.5

let pricesMap = new Map(); // stores all the currency information
const supportedCurrencies = ["aud", "bidr", "brl", 'eur',"gbp","rub","try", "uah","usdt"] // currencies supporting eth, slp and axs conversions
let individualCosts = [0,0,0,0,0,0,0]; // store the individual index+1 breed cost
let totalCosts = [0,0,0,0,0,0,0]; // store total/cumulative breed costs
let selectedElements = new Set(); // set of table cells that have been selected by the user
let totalSelected = false; // boolean stores if a total column cell has been selected

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
    // Function creates the cypto prices table by building up rows and cells
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
        // On change of select, re-render the new chosen value then save the users choice to chrome storage then open new websocket to the new currency
        fiat2 = document.getElementById("topSelect").value;
        chrome.storage.sync.set({"fiat2":fiat2});
        chrome.storage.sync.set({"topSelect":select.selectedIndex});
        fetchPrice(crypto, fiat2);
    }
    select.className = "selectClass";
    return select;
}

const updateTopTable = (pricesMap) => {
    // render the price information to screen from the priceMap
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
    tr2.innerHTML = "Individ";
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
    createClickListener();
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
    individual.className = "interactiveCell";
    tr.appendChild(individual);
    let Total = document.createElement("td");
    Total.id = `cumul${number}`;
    Total.className = "interactiveCell";
    tr.appendChild(Total);
    let average = document.createElement("td");
    average.id = `aver${number}`;
    tr.appendChild(average);
    return tr;
}
const createClickListener = () => {
    // add event listener to the relevant td elements in the bottom breed costs table, cells under indiv and total
    const tdElements = document.getElementsByClassName("interactiveCell");
    for (i = 0; i < tdElements.length; i++) {
        tdElements[i].addEventListener("click", tableHandler)
    }
}


const updateBottomTable = () => {
    // Renders new information in the bottom breed costs table
    let decimalPlaces;
    individualCosts[0] > 1 ? decimalPlaces = 1: decimalPlaces = 4;
    for (let i = 1; i<=7; ++i) {
        document.getElementById(`indiv${i}`).innerHTML = individualCosts[i-1].toFixed(decimalPlaces);
        document.getElementById(`cumul${i}`).innerHTML = totalCosts[i-1].toFixed(decimalPlaces);
        document.getElementById(`aver${i}`).innerHTML = (totalCosts[i-1]/i).toFixed(decimalPlaces); // 
    }
}

const calculateBreedCosts = () => {
    // calculate the individual and total breed costs in the currently selected currency, either eth or usdt currently
    // average costs are calculated when rendering the new information by dividing total cost by the current breed count
    const flatAXS = pricesMap.get(`axs${breedCurr}`) * axsBreedCost;
    const slpPrice = pricesMap.get(`slp${breedCurr}`);
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
    // function called before extension fully loads, fetches all data saved in chrome storage and updates the default variable values to stored ones
    chrome.storage.sync.get(['lastUsed'], (result) => {
        // Fetch timestamp of when data was last saved, if less than half an hour since last used fetch the price information and update values
        const oldTime = result.lastUsed;
        if (Date.now() - oldTime < 1800000) { //less than half an hour since last used data likely still valid if not, live data is updated within approximately 3 seconds
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
    document.getElementById("selectedCostsDiv").style.display = "flex";
    setInterval(saveData, 5000); // save data every 5 seconds
}

const saveData = () => {
    // save priceMap, individual and totalCosts arrays to chrome storage. 
    // each array stores 7 doubles and map stores 6 or more (string, double) pairs
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
    // function waits until all the websockets are online and have messaged at least once before removing the loading spinner
    // checks every 100 milliseconds
    let interval = setInterval(function() {
        // while the prices havent loaded yet maintain the load screens
        if (pricesMap.size >= 6) {
            clearInterval(interval);
            showPage();
        }
    }, 100);
}


const tableHandler = (event) => {
    // handle the onlick events of the clickable td elements in the breed cost table
    // there are three main states for clickable table elements, no cells active, multiple individual cells active or only one total cell can be active at any time
    const clearSet = () => {
        // deactivate all elements
        selectedElements.forEach(element => {
            deselectElement(element);
        })
    }
    const selectElement = (id) => {
        if (id.includes("cumul")) { // check current element is a total/cumulative 
            totalSelected = true; 
            clearSet(); // regardless of the state of currently active elements, decactivate all elements
        } else { // current element is individual
            if (totalSelected) { // if a total/cumulative was already selected need to deactivate it
                clearSet();
                totalSelected = false;
            }
        }
        selectedElements.add(id); // add newly pressed cell to set
        document.getElementById(id).className = "interactiveCellPressed"; // change css class to better visualisation of active cell
    }
    const deselectElement = (id) => {
        // delect cell from tracked list and change css class
        selectedElements.delete(id);
        document.getElementById(id).className = "interactiveCell";
    }

    selectedElements.has(event.target.id) ? deselectElement(event.target.id) : selectElement(event.target.id); //check whether cell is already active, if it is deactivate else activate
    displayCosts();
}

const displayCosts = () => {
    const leftCol = document.getElementById("leftColumn");
    const rightCol = document.getElementById("rightColumn");
    const costsText= document.getElementById("costsText");

    const Default = () => {
        // default display when no cells are selected
        costsText.style.display = "flex";
        leftCol.style.display = "None";
        rightCol.style.display = "None";
    }

    const Costs = () => {
        // display costs when cells are selected
        costsText.style.display = "none";
        leftCol.style.display = "flex";
        leftCol.innerText = `${axsDisplay} Axs`;
        rightCol.style.display = "flex";
        rightCol.innerText = `${slpDisplay} Slp`;
    }
    let axsDisplay = 0, slpDisplay = 0;
    if (totalSelected && selectedElements.size) { // if true calculate total/cumulative costs
        let [val] = selectedElements; // only one element in the set, destructure to get the element
        val = parseInt(val.substr(-1,1)); // last character corresponds to the integer breed count
        axsDisplay = val * axsBreedCost;
        for (i = 0; i < val; i++) {
            slpDisplay += slpCosts[i];
        }
    }
    else {
        selectedElements.forEach(element => {
            const val = parseInt(element.substr(-1,1));
            axsDisplay += axsBreedCost;
            slpDisplay += slpCosts[val-1];
        })
    }
    axsDisplay && slpDisplay ? Costs() : Default();
}
   

window.onload = () => {
    fetchStoredData();
    createTopTable();
    fetchPrices(crypto, fiat1, fiat2);
    createBottomTable();
    waitForData()
}