
window.onload =()=> {
    const xhttp = new XMLHttpRequest();
    xhttp.onload =()=> getxmldat(xhttp);
    xhttp.open("GET", "https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Indonesia.xml");
    xhttp.send();
}

getxmldat =(xml)=> {
    let xmldat = xml.responseXML.getElementsByTagName("forecast")[0];
    let ladata = []
    let lodata = []

    for(let i = 3; i < xmldat.childNodes.length - 1; i++){
        let la = xmldat.childNodes[i].getAttribute("latitude")
        let lo = xmldat.childNodes[i].getAttribute("longitude")

        ladata.push(la)
        lodata.push(lo)
    }
}

fnearest =(arr, val)=> {
    return arr.reduce((total, num)=> Math.abs(total) > Math.abs(num - val) ? num - val : total) + val;
}

