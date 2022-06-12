

fetch('https://cuaca-gempa-rest-api.vercel.app/weather/jawa-barat').then((r)=> { return r.json() }).then((obj)=> { 
    
    console.log(obj.data) 


});

console.log(json);

fnearest =(arr, val)=> {
    return arr.reduce((total, num)=> Math.abs(total) > Math.abs(num - val) ? num - val : total) + val;
}

