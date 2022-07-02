
"use strict"
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

const dlat = ['5.54491', '-8.643480', '-6.133333334', '-3.794373', '-7.80279', '-6.176396', '0.53175', '-1.61', '-6.90992', '-6.959144', '-7.27981', '-0.08902', '-3.32828', '-2.21', '-0.43018', '3.329128', '-2.19216', '0.906334', '-5.42396', '-3.67265', '0.833215', '-8.58142', '-10.22498', '-2.556219', '-0.900000002', '0.55742', '-2.683333335', '-5.121379', '-3.966', '1.50213', '-0.88', '-2.978699', '3.66681'];

const dlon = ['95.34312', '115.224609', '106.1667', '102.304688', '110.37625', '106.826591', '123.08807', '103.59', '107.64691', '110.438690', '112.71109', '109.35144', '114.57315', '113.92', '117.17432', '117.571049', '106.12806', '104.562378', '105.25113', '128.23381', '127.365532', '116.11737', '123.60374', '140.703278', '134.00001', '101.46218', '118.8333', '119.418983', '122.6', '124.85236', '100.4', '104.751892', '98.67123'];

const dom = ['Aceh', 'Bali', 'Banten', 'Bengkulu', 'DI Yogyakarta', 'DKI Jakarta', 'Gorontalo', 'Jambi', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur', 'Kalimantan Utara', 'Kep. Bangka Belitung', 'Kep. Riau', 'Lampung', 'Maluku', 'Maluku Utara', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Papua', 'Papua Barat', 'Riau', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Sulawesi Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara'];

const desc = ['Banda Aceh', 'Denpasar', 'Serang', 'Bengkulu', 'Yogyakarta', 'Jakarta Pusat', 'Gorontalo', 'Jambi', 'Bandung', 'Semarang', 'Surabaya', 'Pontianak', 'Banjarmasin', 'Palangkaraya', 'Samarinda', 'Tarakan', 'Pangkal Pinang', 'Tanjung Pinang', 'Bandar Lampung', 'Ambon', 'Ternate', 'Mataram', 'Kupang', 'Kota Jayapura', 'Manokwari', 'Pekanbaru', 'Mamuju', 'Makassar', 'Kendari', 'Manado', 'Padang', 'Palembang', 'Medan'];

const shaderprog = new PetitGL(undefined, [0,0,0,1]).resize(innerWidth, innerHeight).att([ {name:'_uv',data:[-1,-1, 1,-1, -1,1, 1,1], slice:2} ]).ibo([ {name:'ibo',data:[0,1,2, 3,2,1]} ]).compile('weatherdisp',vshader,fshader).defAtt('weatherdisp', ['UV']).defUni('weatherdisp', ['time', 'ws', 'res']);

function fnear(arr, val){
    return arr.reduce((e, i) => (Math.abs(e) > Math.abs(i - val) ? i - val : e), Infinity) + val;
}

async function main(pos){
    let url = 'https://cuaca-gempa-rest-api.vercel.app/weather/';
    const dnla = fnear(dlat, pos.coords.latitude);
    const dnlo = fnear(dlon, pos.coords.longitude);
    dom.forEach((e, i) => {
        if(dlat[i] == dnla || dlon[i] == dnlo) url += e.replaceAll(' ','-').toLowerCase();
    });

    const obj = await (await fetch(url)).json();
    let lat = []; let lon = []; let cn = [];
    obj.data.areas.forEach(e => {
        lat.push(e.latitude);
        lon.push(e.longitude);
        cn.push(e.description);
    });

    const nla = fnear(lat, pos.coords.latitude);
    const nlo = fnear(lon, pos.coords.longitude);
    let locp = 0;
    for(let i = 0; i < obj.data.areas.length; i++) if(lat[i] == nla || lon[i] == nlo) locp++;

    let dval = [];
    let ddesc = [];
    obj.data.areas[locp].params.forEach((e, i) => {
        let ho = new Date().getHours();
        switch(i){
            case 1: dval.push(e.times[0].value); break;
            case 2: dval.push(e.times[0].celcius); break;
            case 3: dval.push(e.times[0].value); break;
            case 4: dval.push(e.times[0].celcius); break;
            case 5: dval.push(e.times[ho%4].celcius); break;
            case 6: dval.push(e.times[ho%4].name); break;
            case 7: dval.push(e.times[ho%4].card); break;
            case 8: dval.push(e.times[ho%4].kph); break;
            default: dval.push(e.times[ho%4].value);
        }
        ddesc.push(e.description);
    });
    
    function renderloop(){
        requestAnimationFrame(renderloop);
        shaderprog.uni('weatherdisp',[
            {loc:'time', data:[(Date.now()*.001)%86400-43200], type:'f'},
            {loc:'ws', data:[dval[8]], type: 'f'},
            {loc:'res', data:[shaderprog.c.width, shaderprog.c.height], type:'f'},
        ]).draw('weatherdisp',[{loc:'UV',att:'_uv'}],'ibo').flush()
    }
    renderloop();
    
    document.body.insertAdjacentHTML('beforeend', `
<div id="con">
<p id="txt">${pos.coords.latitude}, ${pos.coords.longitude}</p>
</div>`)
    document.body.appendChild(shaderprog.c);
}

function error(err){
    console.warn(`ERROR(${err.code}): ${err.message}`);
}
navigator.geolocation.getCurrentPosition(main, error);