
var xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Indonesia.xml", true);

var xmlval;
xhttp.onreadystatechange =()=> {
    if(this.readyState == 4){
        console.log(this.responseXML);
    }
}
xhttp.send(null);


const nearest =(arr, val)=> arr.reduce((p, n) => (Math.abs(p) > Math.abs(n - val) ? n - val : p), Infinity) + val;