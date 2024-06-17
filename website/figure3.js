var figure3 = {}
figure3.canvas = document.getElementById("figure3")
figure3.ctx = figure3.canvas.getContext("2d");
figure3.mousein = false;
figure3.mousemove = false;
figure3.mousexy = [0, 0];

figure3.canvas.addEventListener("mouseenter", (e)=>{
    figure3.mousein = true;
    figure3.mousemove = true;
    figure3.setcoord(e);
});

figure3.canvas.addEventListener("mousemove", (e)=>{
    figure3.mousemove = true;
    figure3.setcoord(e);
});

figure3.canvas.addEventListener("mouseout", ()=>{
    figure3.mousemove = true;
    figure3.mousein = false;
});

figure3.setcoord = (e) => {
    const rect = figure3.canvas.getBoundingClientRect();
    const offsetX = e.offsetX/rect.width;
    const offsetY = e.offsetY/rect.height;
    figure3.mousexy = [offsetX*figure3.canvas.width, offsetY*figure3.canvas.height];
}

figure3.getrelcoord = (xy) => {
    const x = (xy[0] - 1.75)/4;
    const y = 1 - ((xy[1] - 0.8)/1.5);
    return [x*figure3.canvas.width, y*figure3.canvas.width]
}

figure3.drawCircle = (xy, r) => {
    figure3.ctx.beginPath();
    figure3.ctx.arc(xy[0], xy[1], r, 0, 2 * Math.PI);
    figure3.ctx.fill();
}

figure3.outlineCircle = (xy, r) => {
    figure3.ctx.beginPath();
    figure3.ctx.arc(xy[0], xy[1], r, 0, 2 * Math.PI);
    figure3.ctx.stroke();
}

figure3.drawbox = (xy1, xy2, w) => {
    figure3.ctx.fillRect(xy1[0] - w/2, Math.min(xy1[1], xy2[1]), w, Math.abs(xy1[1] - xy2[1]));
}

figure3.loop = (forceredraw = false) => {
    let otheranim = 0;
    if (figure3.mousemove)
    {
        figure3.mousemove = false;
        let selected = null;
        let radius = 100000;
        for (let i = 0; i < 23; i++){
            const point = figure3.points[i];
            point.animtarget = 0;
            const x = point.x;
            const y = point.y;
            const xy = figure3.getrelcoord([x, y]);
            const d = distance_sq(xy, figure3.mousexy);
            if ( d < radius) {
                selected = point;
                radius = d;
            }
        }
        if (radius < 1600){
            selected.animtarget = 1;
        }
    }

    let redraw = false || forceredraw;
    for (let i = 0; i < 23; i++){
        if (figure3.points[i].step()) redraw = true;
        otheranim = Math.max(otheranim, figure3.points[i].anim);
    }
    if (!redraw){
        setTimeout(() => requestAnimationFrame(() => figure3.loop(false)), 200);
        return;
    }

    figure3.ctx.clearRect(0, 0, figure3.canvas.width, figure3.canvas.height);
    figure3.points.sort(function(a, b) { return a.animtarget - b.animtarget; });

    const xlim = [1.75, 5.75];
    const yof = (x) => 2.46 - (0.2*x);
    const ylim = [yof(xlim[0]), yof(xlim[1])];
    const lims = [figure3.getrelcoord([xlim[0], ylim[0]]), figure3.getrelcoord([xlim[1], ylim[1]])]
    figure3.ctx.globalAlpha = 1-3*otheranim/4;
    figure3.ctx.lineWidth = 2;
    figure3.ctx.setLineDash([10, 5]);
    drawline(lims[0][0], lims[0][1], lims[1][0], lims[1][1], 1, (x) => x, figure3.ctx);
    figure3.ctx.globalAlpha = 1;

    for (let i = 0; i < 23; i++){
        const point = figure3.points[i];
        figure3.ctx.fillStyle = point.colorback;
        const x = point.x;
        const y = point.y;
        const xy = figure3.getrelcoord([x, y]);
        
        if (point.anim > 0){
            const p = interpolate_cosine2(point.anim);
            const p2 = Math.pow(point.anim, 2);
            for (let j = 2; j >= 0; j--){
                const w = [40, 8, 2][j] * p;
                const stats1 = point.bar[j*2 + 1]*p + y*(1-p);
                const stats2 = point.bar[j*2 + 2]*p + y*(1-p);
                const co1 = figure3.getrelcoord([x, stats1]);
                const co2 = figure3.getrelcoord([x, stats2]);
                //figure3.drawbox(xy, co1, w);
                figure3.drawbox(co1, co2, w);
                if (j == 2){
                    figure3.drawbox(co1, [x, co1[1]+2], 40);
                    figure3.drawbox(co2, [x, co2[1]-2], 40);
                }
            }
            //text
            const texty1 = point.bar[5]*p + y*(1-p);
            const texty2 = figure3.getrelcoord([x, texty1])[1];
            const textyy1 = point.bar[6]*p + y*(1-p);
            const textyy2 = figure3.getrelcoord([x, textyy1])[1];
            const textx = (xy[0]-18)*p2 + xy[0]*(1-p2);
            const textxx = (xy[0]+22)*p2 + xy[0]*(1-p2);
            const textxxx = (xy[0]+22+24)*p2 + xy[0]*(1-p2);
            const textloc = [textx, texty2+2];
            const textloc2 = [textxx, textyy2-2];
            figure3.ctx.save();
            figure3.ctx.rotate(3*Math.PI / 2);
            figure3.ctx.font = 'bold '+Math.floor(point.anim * 36)+'px Arial';
            figure3.ctx.textAlign = 'left';
            figure3.ctx.textBaseline = 'bottom';
            figure3.ctx.fillText(point.datasetid, -textloc[1], textloc[0]);
            figure3.ctx.font = 'bold '+Math.floor(point.anim * 24)+'px Arial';
            figure3.ctx.textAlign = 'right';
            figure3.ctx.textBaseline = 'top';
            figure3.ctx.fillText("Landscape", -textloc2[1], textloc2[0]);
            figure3.ctx.fillText(point.cfsize, -textloc2[1], textxxx);
            figure3.ctx.restore();

            //median
            const med = point.bar[0]*p + y*(1-p);
            const med2 = figure3.getrelcoord([x, med])[1];
            figure3.ctx.fillStyle = "white";
            figure3.drawbox([xy[0], med2-1], [xy[0], med2+1], 40);

            figure3.ctx.fillStyle = point.colorfront;
            const scatter = point.ys;
            let xseed = 16
            for (let j = 0; j < scatter.length; j++){
                xseed = (xseed*19) % 59;
                const noise = (xseed/58 - 0.5)/8;
                const yloc = scatter[j]*p + y*(1-p);
                const xloc = (x+noise)*p2 + x*(1-p2);
                const xyloc = figure3.getrelcoord([xloc, yloc]);
                figure3.drawCircle(xyloc, (scatter.length < 30) ? 6 : 3);
            }
        }

        if (point.anim > 0){
            figure3.ctx.fillStyle = "black";
            figure3.drawCircle(xy, (1-point.anim)*10);
        }
        else{
            figure3.ctx.globalAlpha = 1-otheranim;
            figure3.ctx.fillStyle = "black";
            figure3.drawCircle(xy, (1-point.anim)*10);
            figure3.ctx.globalAlpha = otheranim;
            figure3.ctx.fillStyle = "silver";
            figure3.drawCircle(xy, (1-point.anim)*10);
            figure3.ctx.globalAlpha = 1;
        }
        //figure3.ctx.strokeStyle = "black";
        //figure3.ctx.lineWidth = 2;
        //if (point.anim < 1) figure3.outlineCircle(xy, (1-point.anim)*10);
    }

    setTimeout(() => requestAnimationFrame(() => figure3.loop(false)), 20);
    return;
}

figure3.init = () => {
    
const typeinfos = [["MNIST", "rgb(255,127,142)", "rgb(204,0,24)"],
["Fashion-MNIST", "rgb(127,216,255)", "rgb(0,142,204)"],
["CIFAR-10", "rgb(255,204,127)", "rgb(204,122,0)"],
["CIFAR-100", "rgb(255,204,127)", "rgb(204,122,0)"],
["CelebA", "rgb(0,178,49)", "rgb(0,51,14)"],
["MetFaces", "rgb(255,127,242)", "rgb(204,0,183)"],
["ArtBench", "rgb(191,127,255)", "rgb(101,0,204)"]];

    figure3.points = [];
    for (let i = 0; i < 23; i++){
        const point = {}
        point.y = calcMean(figure3_rads[i]);
        point.ys = figure3_rads[i];
        point.x = Math.log(figure3_dss[i])/Math.log(10);
        point.dss = figure3_dss[i];
        point.cfsize = figure3_cfs[i];
        point.bar = figure3_bars[i];
        point.anim = 0;
        point.animtarget = 0;
        point.step = () => {
            if (point.anim < point.animtarget) {
                point.anim = Math.min(point.anim + 0.1, point.animtarget);
                return true;
            } else if (point.anim > point.animtarget) {
                point.anim = Math.max(point.anim - 0.1, point.animtarget);
                return true;
            }
            return false;
        }
        point.id = i;

        let typeinfo = null;
        if (i < 6) typeinfo = typeinfos[0];
        else if (i < 12) typeinfo = typeinfos[1];
        else if (i < 14) typeinfo = typeinfos[2];
        else if (i < 16) typeinfo = typeinfos[3];
        else if (i < 20) typeinfo = typeinfos[4];
        else if (i < 21) typeinfo = typeinfos[5];
        else typeinfo = typeinfos[6];

        point.colorback = typeinfo[1];
        point.colorfront = typeinfo[2];
        point.colorback = "grey";
        point.colorfront = "black";
        point.datasetid = typeinfo[0]
        figure3.points.push(point);
    }
    figure3.loop(true);
}

figure3.init();