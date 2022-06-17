

const load = async(url) => {
    return (await (await fetch(url)).json());
}

fnear = (arr, val) => {
    return arr.reduce((total, num) => Math.abs(total) > Math.abs(num - val) ? num - val : total) + val;
}

const shader = new PetitGL(undefined, [0,0,0,1])
	.resize(innerWidth, innerHeight)
	.att([ {name:'_uv',data:[-1,-1, 1,-1, -1,1, 1,1],slice:2} ])
	.ibo([ {name:'ibo',data:[0,1,2, 3,2,1]} ])
	.compile(
		'weatherdisp',//program name
    
		`attribute vec2 UV;
		void main(){
			gl_Position=vec4(UV,0,1);
		}`,//vsh

		`precision highp float;
		uniform float time;
		uniform vec2 res;
	
		void main(){
            vec2 uv = gl_FragCoord.xy / res;
			gl_FragColor = vec4(uv, 0.0, 1.0);
		}`//fsh
	)
	.defAtt('weatherdisp', ['UV'])
	.defUni('weatherdisp', ['time', 'res']);

load('https://cuaca-gempa-rest-api.vercel.app/weather/indonesia').then(obj => {
    let la = [];
    let lo = [];
    for(let i = 0; i < obj.data.areas.length; i++){
        la.push(obj.data.areas[i].latitude);
        lo.push(obj.data.areas[i].longitude);
    }
    
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((pos) => {
            let nla = fnear(la, pos.coords.latitude);
            let nlo = fnear(lo, pos.coords.longitude);
            let locp = 0;
            for(let i = 0; i < obj.data.areas.length; i++){
                if(la[i] == nla || lo[i] == nlo) break;
                locp++;
            }
            let ambdat = []
            obj.data.areas[locp].params.forEach(d => { ambdat.push(d) });

            let dval = { val: [], desc: [] };
            for(let i = 0; i < ambdat.length; i++){
                let ho = new Date().getHours();
                switch(i){
                    case 1: dval.val.push(ambdat[i].times[0].value); break;
                    case 2: dval.val.push(ambdat[i].times[0].celcius); break;
                    case 3: dval.val.push(ambdat[i].times[0].value); break;
                    case 4: dval.val.push(ambdat[i].times[0].celcius); break;
                    case 5: dval.val.push(ambdat[i].times[ho%3].celcius); break;
                    case 6: dval.val.push(ambdat[i].times[ho%3].name); break;
                    case 7: dval.val.push(ambdat[i].times[ho%3].card); break;
                    case 8: dval.val.push(ambdat[i].times[ho%3].kph+"km/h"); break;
                    default: dval.val.push(ambdat[i].times[ho%3].value);
                }
                dval.desc.push(ambdat[i].description);
            }

            const loop = () => {
                requestAnimationFrame(loop);
                shader.uni('weatherdisp',
                    [
                        {loc:'time',data:[(Date.now()*.001)%86400-43200],type:'f'},
                        {loc:'res',data:[shader.c.width, shader.c.height],type:'f'},
                    ]
                ).draw('weatherdisp',[{loc:'UV',att:'_uv'}],'ibo').flush()
            };
        
            loop();
            document.body.insertAdjacentHTML("beforeend", `
<div style="position: fixed; width: 100vw; height: 100vh;"><pre style="padding: 15px; font-size: 2em; color: black">
Lokasi : ${obj.data.areas[locp].domain}
${dval.desc[0]} : ${dval.val[0]}
${dval.desc[1]} : ${dval.val[1]}
${dval.desc[2]} : ${dval.val[2]}
${dval.desc[3]} : ${dval.val[3]}
${dval.desc[4]} : ${dval.val[4]}
${dval.desc[5]} : ${dval.val[5]}
${dval.desc[6]} : ${dval.val[6]}
${dval.desc[7]} : ${dval.val[7]}
${dval.desc[8]} : ${dval.val[8]}
</pre></div>`)
            document.body.appendChild(shader.c);
            
            //console.log(dval);
        });
    } else console.log("geoloaction not supported by browser");
});

