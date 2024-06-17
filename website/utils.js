
function loadImages(filenames, callback)
{
    function loadImage(filenames, images, callback)
    {
        if (filenames.length == 0) callback(images);
        else
        {
            const filename = filenames.pop();
            const img = new Image();
            images.push(img);
            img.onload = function() {
                loadImage(filenames, images, callback)
            };
            img.src = filename;
        }
    }

    filenames.reverse();
    loadImage(filenames, [], callback);
}

function interpolate_cosine(p)
{
    const p2 = (1 - Math.cos(p*Math.PI))/2;
    return p2;
}

function interpolate_cosine2(p)
{
    const p2 = (Math.cos(p*Math.PI) - 1)/2;
    return -p2;
}

function interpolate_square(p)
{
    const p2 = 1-Math.pow(1-p, 2);
    return p2;
}

function drawline_helper(x1, y1, x2, y2, ctx)
{
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2)
    ctx.stroke();
}

function drawline(x1, y1, x2, y2, n, interpolate, ctx)
{
    const xs = [];
    const ys = [];
    for (let i = 0; i <= n; i++)
    {
        const p = i/n;
        const q = 1-p;
        const p2 = interpolate(p, 2);
        const q2 = 1 - p2;
        xs.push(x1*p + x2*q);
        ys.push(y1*p2 + y2*q2);
    }
    for (let i = 0; i < n; i++)
    {
        drawline_helper(xs[i], ys[i], xs[i+1], ys[i+1], ctx);
    }
}

function distance_sq(xy1, xy2){
    dx = Math.pow(xy1[0] - xy2[0], 2);
    dy = Math.pow(xy1[1] - xy2[1], 2);
    return dx + dy
}

function makeNoiseObj(width, height, sigma){
    const noiseObj = {};
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const idata = ctx.createImageData(width, height);
    const buffer = new Uint32Array(idata.data.buffer);
    const floatbuffer = [];
    for (let i = 0; i < buffer.length; i++){
        floatbuffer.push(0);
    }

    noiseObj.img = canvas;
    noiseObj.step = () => {
        let len = buffer.length - 1;
        while(len--){
            //draw normal rv
            const u = 1 - Math.random();
            const v = Math.random();
            const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
            //brownian motion
            floatbuffer[len] = Math.max(Math.min( ((floatbuffer[len] + (z*sigma) - 0.5)*0.95) + 0.5, 0.8 ), 0.2);
            const intBuffer = ( (Math.floor(floatbuffer[len] * 256)) % 256 ) >>> 0;
            buffer[len] = (intBuffer<<0) | (intBuffer<<16) | (intBuffer<<8) | ((255>>>0)<<24);
        }
        ctx.putImageData(idata, 0, 0);
    }
    noiseObj.init = () => {
        for (let i = 0; i < buffer.length; i++){
            floatbuffer[i] = (Math.random()*0.1) + 0.45;
        }
        noiseObj.step();
    }
    noiseObj.init();
    return noiseObj;
}

function calcMean(x){
    let total = 0;
    for (let i = 0; i < x.length; i++){
        total += x[i];
    }
    return total/x.length;
}

function makeNoiseObj2(width, height, sigma){
    const noiseObj = {};
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const idata = ctx.createImageData(width, height);
    const buffer = new Uint32Array(idata.data.buffer);
    const floatbuffer1 = [];
    const floatbuffer2 = [];
    const floatbuffer3 = [];
    for (let i = 0; i < buffer.length; i++){
        floatbuffer1.push(0);
        floatbuffer2.push(0);
        floatbuffer3.push(0);
    }

    noiseObj.img = canvas;
    noiseObj.step = () => {
        let len = buffer.length - 1;
        while(len--){
            for (let i = 0; i < 3; i++){
                //draw normal rv
                const u = 1 - Math.random();
                const v = Math.random();
                const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
                const floatbuffer = [floatbuffer1, floatbuffer2, floatbuffer3][i];
                //brownian motion
                floatbuffer[len] = Math.max(Math.min( ((floatbuffer[len] + (z*sigma) - 0.5)*0.95) + 0.5, 0.8 ), 0.2);
            }
            const intBuffer1 = ( (Math.floor(floatbuffer1[len] * 256)) % 256 ) >>> 0;
            const intBuffer2 = ( (Math.floor(floatbuffer2[len] * 256)) % 256 ) >>> 0;
            const intBuffer3 = ( (Math.floor(floatbuffer3[len] * 256)) % 256 ) >>> 0;
            buffer[len] = (intBuffer1<<0) | (intBuffer2<<16) | (intBuffer3<<8) | ((255>>>0)<<24);
        }
        ctx.putImageData(idata, 0, 0);
    }
    noiseObj.init = () => {
        for (let i = 0; i < buffer.length; i++){
            floatbuffer1[i] = (Math.random()*0.1) + 0.45;
            floatbuffer2[i] = (Math.random()*0.1) + 0.45;
            floatbuffer3[i] = (Math.random()*0.1) + 0.45;
        }
        noiseObj.step();
    }
    noiseObj.init();
    return noiseObj;
}
