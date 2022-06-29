
const vshader = `attribute vec2 UV;
void main(){
    gl_Position=vec4(UV,0,1);
}`;

const fshader = `precision highp float;
uniform float time;
uniform float ws; // wind speed
uniform vec2 res;
void main(){
	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

const dom = ['Aceh', 'Bali', 'Banten', 'Bengkulu', 'DI Yogyakarta', 'DKI Jakarta', 'Gorontalo', 'Jambi', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur', 'Kalimantan Utara', 'Kep. Bangka Belitung', 'Kep. Riau', 'Lampung', 'Maluku', 'Maluku Utara', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Papua', 'Papua Barat', 'Riau', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Sulawesi Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara'];

const desc = ['Banda Aceh', 'Denpasar', 'Serang', 'Bengkulu', 'Yogyakarta', 'Jakarta Pusat', 'Gorontalo', 'Jambi', 'Bandung', 'Semarang', 'Surabaya', 'Pontianak', 'Banjarmasin', 'Palangkaraya', 'Samarinda', 'Tarakan', 'Pangkal Pinang', 'Tanjung Pinang', 'Bandar Lampung', 'Ambon', 'Ternate', 'Mataram', 'Kupang', 'Kota Jayapura', 'Manokwari', 'Pekanbaru', 'Mamuju', 'Makassar', 'Kendari', 'Manado', 'Padang', 'Palembang', 'Medan'];

const shaderprog = new PetitGL(undefined, [0,0,0,1]).resize(innerWidth, innerHeight).att([ {name:'_uv',data:[-1,-1, 1,-1, -1,1, 1,1], slice:2} ]).ibo([ {name:'ibo',data:[0,1,2, 3,2,1]} ]).compile('weatherdisp',vshader,fshader).defAtt('weatherdisp', ['UV']).defUni('weatherdisp', ['time', 'ws', 'res']);

fnear = (arr, val) => { return arr.reduce((total, num) => Math.abs(total) > Math.abs(num - val) ? num - val : total) + val; }

var urlapi = ''
genurl = () => {

}
genurl();

main = async() => {
    let obj = await (await fetch('https://cuaca-gempa-rest-api.vercel.app/weather/jawa-barat')).json();
    console.log(obj);
    let lat = [], lon = [], cn = [];
    obj.data.areas.forEach(e => {
        lat.push(e.latitude), lon.push(e.longitude), cn.push(e.description);
    });

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((pos) => {
            let nla = fnear(lat, pos.coords.latitude);
            let nlo = fnear(lon, pos.coords.longitude), locp = 0;
            obj.data.areas.forEach((e, i) => { if(lat[i] == nla || lon[i] == nlo) locp = i; });

            let dval = [], ddesc = [];
            obj.data.areas[locp].params.forEach((d, i) => {
                let ho = new Date().getHours();
                switch(i){
                    case 1: dval.push(d.times[0].value); break;
                    case 2: dval.push(d.times[0].celcius); break;
                    case 3: dval.push(d.times[0].value); break;
                    case 4: dval.push(d.times[0].celcius); break;
                    case 5: dval.push(d.times[ho%4].celcius); break;
                    case 6: dval.push(d.times[ho%4].name); break;
                    case 7: dval.push(d.times[ho%4].card); break;
                    case 8: dval.push(d.times[ho%4].kph); break;
                    default: dval.push(d.times[ho%4].value);
                }
                ddesc.push(d.description);
            });

            console.log(obj.data.areas[locp]);
            const loop = () => {
                requestAnimationFrame(loop);
                shaderprog.uni('weatherdisp',
                    [
                        {loc:'time', data:[(Date.now()*.001)%86400-43200], type:'f'},
                        {loc:'ws', data:[dval[8]], type: 'f'},
                        {loc:'res', data:[shaderprog.c.width, shaderprog.c.height], type:'f'},
                    ]
                ).draw('weatherdisp',[{loc:'UV',att:'_uv'}],'ibo').flush()
            };
            loop();

            document.body.insertAdjacentHTML("beforeend", `
<div id="con">
    <p>${obj.data.areas[locp].description}</p>
</div>`)
            document.body.appendChild(shaderprog.c);
        });
    } else console.log("geoloaction not supported by browser");
}
main();