

loadjson = async(url) => {
    return (await (await fetch(url)).json());
}

fnearest = (arr, val) => {
    return arr.reduce((total, num)=> Math.abs(total) > Math.abs(num - val) ? num - val : total) + val;
}

loadjson('https://cuaca-gempa-rest-api.vercel.app/weather/indonesia').then((obj) => {
    let la = [];
    let lo = [];
    let numloc = obj.data.areas.length;
    for(let i = 0; i < numloc; i++){
        la.push(obj.data.areas[i].latitude);
        lo.push(obj.data.areas[i].longitude);
    }

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((pos) => {
            let nla = fnearest(la, pos.coords.latitude);
            let nlo = fnearest(lo, pos.coords.longitude);
            let locnum = 0;
            for(let i = 0; i < numloc; i++){
                if(la[i] == nla || lo[i] == nlo) break;
                locnum++;
            }

        });
    } else console.log("geoloaction not supported by browser");
});

