let crypto = "eth";
let fiat1 = "usdt";

let fiat2 = "aud";
let breedCurr = crypto;


const currencies = ["slp", "axs"];
const topId = document.getElementById("pricesDiv");
const bottomId = document.getElementById("breedCostsDiv");
const breedSelect = document.getElementById("breedSelect");
const currSelect = document.getElementById("currSelect");


let pricesMap = new Map();
const slpCosts = [600, 900, 1500, 2400, 3900, 6300, 10200];
let individualCosts = [0,0,0,0,0,0,0];
let TotalCosts = [0,0,0,0,0,0,0];

const fetchPrice = (curr1, curr2) => {
    let socket = new WebSocket(`wss://stream.binance.com:9443/ws/${curr1}${curr2}@ticker`);
    socket.onopen = () => {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
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
    select.appendChild(createSelectOption("aud"));
    select.appendChild(createSelectOption("bidr"));
    select.appendChild(createSelectOption("brl"));
    select.appendChild(createSelectOption("eur"));
    select.appendChild(createSelectOption("gbp"));
    select.appendChild(createSelectOption("rub"));
    select.appendChild(createSelectOption("try"));
    select.appendChild(createSelectOption("uah"));
    select.appendChild(createSelectOption("usdt"));



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
    tr2.innerHTML = "Individual";
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
    for (let i = 1; i<=7; ++i) {
        document.getElementById(`indiv${i}`).innerHTML = individualCosts[i-1].toFixed(4);
        document.getElementById(`cumul${i}`).innerHTML = TotalCosts[i-1].toFixed(4);
        document.getElementById(`aver${i}`).innerHTML = (TotalCosts[i-1]/i).toFixed(4);
    }
}

const calculateBreedCosts = () => {
    const flatAXS = pricesMap.get(`axs${breedCurr}`) * 1;
    const slpPrice = pricesMap.get(`slp${breedCurr}`);
    //console.log(flatAXS, slpPrice);
    for (let i = 0; i<7; ++i) {
        individualCosts[i] = (slpCosts[i]*slpPrice + flatAXS);
        if (i == 0) {
            TotalCosts[i] = individualCosts[i];
        } else {
            TotalCosts[i] = individualCosts[i] + TotalCosts[i-1];
        }
    }
}


const showPage  = () => {
    document.getElementById("loader1").style.display = "none";
    document.getElementById("loader2").style.display = "none";
    document.getElementById("topTable").style.display = "block";
    document.getElementById("bottomTable").style.display = "block";
}

const fetchStoredData = () => {
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

window.onload = () => {
    fetchStoredData();
    //console.log(breedCurr, fiat2);
    createTopTable();
    fetchPrices(crypto, fiat1, fiat2);
    createBottomTable();
    setTimeout(showPage, 3300);
}