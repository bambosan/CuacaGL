

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
        //grass : https://www.shadertoy.com/view/lslGR8
		uniform float time;
        uniform float ws;
		uniform vec2 res;
	
        #define BLADES 30

        vec3 rotateY(float a, vec3 v){
	        return vec3(cos(a) * v.x + sin(a) * v.z, v.y, cos(a) * v.z - sin(a) * v.x);
        }

        vec4 grass(vec2 p, float x){
            float s = mix(0.7, 2.0, 0.5 + sin(x * 12.0) * 0.5);
            p.x += pow(1.0 + p.y, 2.0) * 0.1 * cos(x * 0.5 + time * floor(ws));
            p.x *= s;
            p.y = (1.0 + p.y) * s - 1.0;
            float m = 1.0 - smoothstep(0.0, clamp(1.0 - p.y * 1.5, 0.01, 0.6) * 0.2 * s, pow(abs(p.x) * 19.0, 1.5) + p.y - 0.6);
            return vec4(mix(vec3(0.05, 0.1, 0.0) * 0.8, vec3(0.0, 0.3, 0.0), (p.y + 1.0) * 0.5 + abs(p.x)), m * smoothstep(-1.0, -0.9, p.y));
        }

        float rand(vec2 p){
            return fract(sin(dot(p.xy ,vec2(54.90898,18.233))) * 4337.5453);
        }
        vec3 backg(vec2 uv){
            float cost = clamp(dot(vec3(0.0, 0.1, 0.0), normalize(vec3(uv, -1.0))), 0.0, 1.0);
            float sun = 1.0 - distance(uv, vec2(0.5, 0.5));
                sun = clamp(sun,0.0,1.0);
    
            float glow = sun;
            glow = clamp(glow,0.0,1.0);
    
            sun = pow(sun,100.0);
            sun *= 100.0;
            sun = clamp(sun,0.0,1.0);
            glow = pow(glow,6.0) * 1.0;
            glow = clamp(glow,0.0,1.0);
            sun += glow * 0.5;

            float sstars = step(rand(floor((uv * 100.0) * mat2(cos(time*0.01), -sin(time*0.01), sin(time*0.01), cos(time*0.01)))), 0.01) * 0.3;
            return mix(vec3(0.2, 0.3, 0.4)* 0.7, vec3(0.0, 0.0, 0.3),max(0.0, uv.y + 1.)) + sstars + sun;
        }

		void main(){
	        vec3 cw = normalize(vec3(0, 0, -1));
	        vec3 cu = normalize(cross(cw, vec3(0, 1, 0)));
	        vec3 cv = normalize(cross(cu, cw));

	        vec2 uv = (gl_FragCoord.xy / res.xy) * 2.0 - 1.0;
	        uv.x *= res.x / res.y;
	        vec3 ro = vec3(0, 2, 0), rd = mat3(cu, cv, cw) * vec3(uv, -1.);
	
	        vec3 fcol = backg(uv);
	
	        for(int i = 0; i < BLADES; i += 1){
		        float z = -(float(BLADES) * 0.05 + 1.0);
		        float t = (z - dot(vec3(0,0,-1), ro)) / dot(vec3(0,0,-1), rd);
		        vec2 tc = ro.xy + rd.xy * t;
		        tc.x += cos(float(i) * 3.0) * 5.0;
		
		        float cell = floor(tc.x);
		        tc.x = (tc.x - cell) - 0.5;
		
		        vec4 c = grass(tc, float(i) + cell * 10.0);
		        fcol = mix(fcol, c.rgb, step(0.0, t) * c.w);
	        }
	
	        fcol = mix(vec3(length(fcol)), fcol, 0.5) * 0.4;

	        gl_FragColor = vec4(fcol * 1.8, 1.0);
		}`//fsh
	)
	.defAtt('weatherdisp', ['UV'])
	.defUni('weatherdisp', ['time', 'ws', 'res']);

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

            let dval = { val: [], desc: [] };
            obj.data.areas[locp].params.forEach((d, i) => {
                let ho = new Date().getHours();
                switch(i){
                    case 1: dval.val.push(d.times[0].value); break;
                    case 2: dval.val.push(d.times[0].celcius); break;
                    case 3: dval.val.push(d.times[0].value); break;
                    case 4: dval.val.push(d.times[0].celcius); break;
                    case 5: dval.val.push(d.times[ho%4].celcius); break;
                    case 6: dval.val.push(d.times[ho%4].name); break;
                    case 7: dval.val.push(d.times[ho%4].card); break;
                    case 8: dval.val.push(d.times[ho%4].kph); break;
                    default: dval.val.push(d.times[ho%4].value);
                }
                dval.desc.push(d.description);
            });
            console.log(Math.floor(dval.val[8]));
            const loop = () => {
                requestAnimationFrame(loop);
                shader.uni('weatherdisp',
                    [
                        {loc:'time', data:[(Date.now()*.001)%86400-43200], type:'f'},
                        {loc:'ws', data:[dval.val[8]], type: 'f'},
                        {loc:'res', data:[shader.c.width, shader.c.height], type:'f'},
                    ]
                ).draw('weatherdisp',[{loc:'UV',att:'_uv'}],'ibo').flush()
            };
            loop();
            
            document.body.insertAdjacentHTML("beforeend", `
<div style="position: fixed; width: 100vw;">
<pre style="padding: 10px; font-size: 1.2em; color: white">
Lokasi : ${obj.data.areas[locp].domain}
${dval.desc[6]} : ${dval.val[6]}

${dval.desc[0]} : ${dval.val[0]}
${dval.desc[3]} : ${dval.val[3]}
${dval.desc[1]} : ${dval.val[1]}

${dval.desc[5]} : ${dval.val[5]}
${dval.desc[4]} : ${dval.val[4]}
${dval.desc[2]} : ${dval.val[2]}

${dval.desc[7]} : ${dval.val[7]}
${dval.desc[8]} : ${dval.val[8]} km/h

this project still wip..
PetitGL library by <a href="https://mcbeeringi.github.io/petitgl/">McbeEringi</a>
</pre> </div>`)
            document.body.appendChild(shader.c);
            //console.log(dval);
        });
    } else console.log("geoloaction not supported by browser");
});

