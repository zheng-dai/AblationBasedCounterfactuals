var figure2 = {}
figure2.canvas = document.getElementById("figure2")
figure2.ctx = figure2.canvas.getContext("2d");
figure2.ctx.imageSmoothingEnabled = false;
figure2.mousein = false;
figure2.mousexy = [0, 0];
figure2.selected = -1;
figure2.erased = -1;
figure2.generateindex = 0;
figure2.forcerender = true;
figure2.noise = makeNoiseObj(32, 32, 0.1);
figure2.noisealpha = 0;
figure2.noisealphamax = 16;
figure2.highlightcolor = "red";
figure2.simplify = true;
figure2.simplanim = 0;

document.getElementById("figure2_button").addEventListener("click", ()=>{
    figure2.generateindex = (figure2.generateindex + 1)%3;
    figure2.noisealpha = figure2.noisealphamax;
    figure2.forcerender = true;
    figure2.noise.init();
});

figure2.button2 = document.getElementById("figure2_button2");
figure2.textspan = document.getElementById("figure2_info");
figure2.button2.addEventListener("click", ()=>{
    figure2.simplify = !figure2.simplify;
    if (figure2.simplify) {
        figure2.textspan.innerText = "only 10 training digits";
        figure2.button2.innerText = "click here to show all 384";
    }
    else {
        figure2.textspan.innerText = "all 384 training digits";
        figure2.button2.innerText = "click here to show less";
    }
});

figure2.canvas.addEventListener("mouseenter", (e)=>{
    figure2.mousein = true;
    figure2.setcoord(e);
});

figure2.canvas.addEventListener("mousemove", (e)=>{
    figure2.setcoord(e);
});

figure2.canvas.addEventListener("mouseout", ()=>{
    figure2.selected = -1;
    figure2.mousein = false;
});

figure2.canvas.addEventListener("click", ()=>{
    if (figure2.mousein && figure2.selected != -1){
        const target = figure2_edges[figure2.selected];
        let chosen = true;
        for (let i = 0; i < target.length; i++){
            const j = target[i];
            if (!figure2.ablated[j]) {
                chosen = false;
                break;
            }
        }
        for (let i = 0; i < figure2.ablated.length; i++){
            figure2.ablated[i] = false;
            figure2.abltarget[i] = figure2.ablated_maxsize;
            figure2.abltarget[16] = 32;
            figure2.erased = -1;
        }
        if (!chosen){
            figure2.erased = figure2.selected;
            for (let i = 0; i < target.length; i++){
                const j = target[i];
                figure2.ablated[j] = true;
                figure2.abltarget[j] = 0;
                figure2.abltarget[16] = 22.6;
            }
        }
    }
});

figure2.setcoord = (e) => {
    const rect = figure2.canvas.getBoundingClientRect();
    const offsetX = e.offsetX/rect.width;
    const offsetY = e.offsetY/rect.height;
    figure2.mousexy = [offsetX*figure2.canvas.width, offsetY*figure2.canvas.height];
}

figure2.drawTraining = (i, xy, s, light) => {
    const x = xy[0];
    const y = xy[1];

    const xidx = i%24;
    const yidx = Math.floor(i/24);
    figure2.ctx.drawImage(figure2.training, xidx*32, yidx*32, 32, 32, x-s/2, y-s/2, s, s);

    figure2.ctx.globalAlpha = 1-light;
    figure2.ctx.fillStyle = "black";
    figure2.ctx.fillRect(x-s/2, y-s/2, s, s);
    figure2.ctx.globalAlpha = 1;
}

figure2.drawCounterfactual = (i, j, xy, s) => {
    const x = xy[0];
    const y = xy[1];
    figure2.ctx.drawImage(figure2.generate, i*32, j*32, 32, 32, x-s/2, y-s/2, s, s);
}

figure2.drawCounterfactual2 = (i, j, xy, s) => {
    figure2.drawCounterfactual(i, j, xy, s)
    if (figure2.noisealpha > 0){
        const a = (1-Math.cos(Math.PI*figure2.noisealpha/figure2.noisealphamax))/2;
        const x = xy[0];
        const y = xy[1];
        figure2.ctx.globalAlpha = a;
        figure2.ctx.fillStyle = "black";
        figure2.ctx.fillRect(x-s/2, y-s/2, s, s);
        figure2.ctx.globalAlpha = a;
        figure2.ctx.drawImage(figure2.noise.img, 0, 0, 32, 32, x-s/2, y-s/2, s, s);
        figure2.ctx.globalAlpha = 1;
    }
}

figure2.drawFrame = (xy, s) => {
    const x = xy[0];
    const y = xy[1];
    figure2.ctx.strokeStyle = figure2.highlightcolor;
    figure2.ctx.strokeRect(x-s/2, y-s/2, s, s);
}

figure2.isSimple = (i) => {
    const arr = [0, 35, 73, 107, 138, 181, 221, 264, 312, 350];
    for (let j = 0; j < 10; j++){
        if (i == arr[j]) return true
    }
    return false;
}

figure2.simpleloc = (i) => {
    const arr = [0, 35, 73, 107, 138, 181, 221, 264, 312, 350];
    for (let j = 0; j < 10; j++){
        if (i == arr[j]){
            const yloc = (j - 4.5);
            return [140, yloc * 64 + 500];
        }
    }
    return [140, 500];
    //const y = (figure2.training_xyloc_org[i][1] - 500)*0.8 + 500 + (((i*37)%59)/58 - 0.5) * 80;
    //const x = 140 + ((( (i+1) *19)%59)/58 - 0.5) * 80
    //const y = (figure2.training_xyloc_org[i][1] - 500)*((16 + (i%16))/40) + 500;
    //const x = (figure2.training_xyloc_org[i][0] - 70)*0.3 + 70;
    //const x = figure2.training_xyloc_org[i][0]/10 + 100;
    //const x = (figure2.training_xyloc_org[i][0] - 140)*0.5 + 140;
    //const y = (figure2.training_xyloc_org[i][1] - 500)*0.5 + 500;
    //return [x, y]; //[340, 500];//figure2.training_xyloc_org[ (i+1) % 384];
}

figure2.check = () => {
    figure2.selected = -1;
    if (figure2.mousein){
        for (let i = 0; i < 384; i++){
            if (!figure2.isSimple(i) && figure2.simplify) continue;
            const radius = (figure2.isSimple(i) && figure2.simplify) ? 32 : 20;
            const x = figure2.training_xyloc[i][0];
            const y = figure2.training_xyloc[i][1];
            if (Math.abs(x - figure2.mousexy[0]) <= radius && Math.abs(y - figure2.mousexy[1]) <= radius){
                figure2.selected = i;
            }
        }
    }

    let update = figure2.forcerender;
    figure2.forcerender = false;
    
    if (figure2.simplify && figure2.simplanim > 0){
        figure2.simplanim = Math.max(figure2.simplanim-0.15, 0);
        update = true;
    }
    if (!figure2.simplify && figure2.simplanim < 1){
        figure2.simplanim = Math.min(figure2.simplanim+0.15, 1);
        update = true;
    }

    if (figure2.noisealpha > 0){
        figure2.noisealpha = figure2.noisealpha-1;
        figure2.noise.step();
        update = true;
    }

    for (let i = 0; i < 384; i++){
        const z = figure2.renderorder[i][0];
        const j = figure2.renderorder[i][1];

        if (figure2.simplify) {
            const simplxy = figure2.simpleloc(j);
            figure2.training_xyloc_true[j][0] = simplxy[0];
            figure2.training_xyloc_true[j][1] = simplxy[1];
        } else {
            figure2.training_xyloc_true[j][0] = figure2.training_xyloc_org[j][0];
            figure2.training_xyloc_true[j][1] = figure2.training_xyloc_org[j][1];
        }
        for (let ii = 0; ii < 2; ii++){
            if (figure2.training_xyloc[j][ii] != figure2.training_xyloc_true[j][ii]){
                update = true;
                figure2.training_xyloc[j][ii] = (figure2.training_xyloc[j][ii] + figure2.training_xyloc_true[j][ii])/2;
                if (Math.abs(figure2.training_xyloc[j][ii] - figure2.training_xyloc_true[j][ii]) < 1)
                    figure2.training_xyloc[j][ii] = figure2.training_xyloc_true[j][ii];
            }
        }

        const simpl = (!figure2.isSimple(j) && figure2.simplify) ? 0 : 1;
        if (!figure2.mousein || figure2.selected < 0){
            const tgtsize = ( (figure2.simplify && figure2.simpleloc(i)) ? 0.8 : figure2.natural_z[j] ) * simpl;
            if (tgtsize != z){
                update = true;
                if (Math.abs(tgtsize - z) < 0.05){
                    figure2.renderorder[i][0] = tgtsize;
                }
                else {
                    figure2.renderorder[i][0] = (tgtsize + z)/2;
                }
            }
        }
        else {
            const xy = figure2.training_xyloc[j];
            const dist = distance_sq(xy, figure2.mousexy);
            const z_target = Math.exp(-dist/50000) * simpl;
            
            if (figure2.selected == j && z != 1){
                figure2.renderorder[i][0] = 1;
                update = true;
            }
            else if (figure2.selected != j){
                if (z_target != z){
                    update = true;
                    if (Math.abs(z_target - z) < 0.05){
                        figure2.renderorder[i][0] = z_target;
                    }
                    else {
                        figure2.renderorder[i][0] = (z_target + z)/2;
                    }
                }
            }
        }
    }
    for (let i = 0; i < figure2.abltrue.length; i++){
        if (figure2.abltrue[i] != figure2.abltarget[i]){
            if (Math.abs(figure2.abltrue[i] - figure2.abltarget[i]) < 0.5){
                figure2.abltrue[i] = figure2.abltarget[i];
            } else {
                figure2.abltrue[i] = (figure2.abltrue[i] + figure2.abltarget[i])/2;
            }
            update = true;
        }
    }
    return update;
}

figure2.drawCircle = (xy, r) => {
    figure2.ctx.beginPath();
    figure2.ctx.arc(xy[0], xy[1], r, 0, 2 * Math.PI);
    figure2.ctx.fill();
}

figure2.loop = () => {
    if (!figure2.check()){
        setTimeout(() => requestAnimationFrame(figure2.loop), 200);
        return;
    }
    figure2.renderorder.sort(function(a, b) { return a[0] - b[0]; });
    figure2.ctx.clearRect(0, 0, figure2.canvas.width, figure2.canvas.height);

    figure2.ctx.lineWidth = 1;
    for (let pre_i = 0; pre_i < 384; pre_i++){
        const i = figure2.renderorder[pre_i][1];
        const z = figure2.selected == i ? 1 : figure2.renderorder[pre_i][0];

        const size = (z*16 + 24) * (figure2.isSimple(i) ? 1.6-(figure2.simplanim*0.6) : figure2.simplanim);
        const brightness = (i == figure2.erased) ? 0 : z/2 + 0.5;

        let segments = 20;
        let skipsegments = false;
        if (figure2.selected != i){
            figure2.ctx.lineWidth =  1;
            figure2.ctx.strokeStyle = "black";
            figure2.ctx.globalAlpha = z*0.2 + ((figure2.isSimple(i)) ? (1-figure2.simplanim)*0.2 + 0.1 : figure2.simplanim * figure2.simplanim * 0.1);
            if (figure2.simplanim == 0) {
                if (figure2.isSimple(i)) figure2.ctx.globalAlpha = 0.5;
                else skipsegments = true;
            }
        }
        else {
            figure2.ctx.strokeStyle = figure2.highlightcolor;
            figure2.ctx.globalAlpha = 1;
            figure2.ctx.lineWidth =  8;
            figure2.drawFrame(figure2.training_xyloc[i], size);
            figure2.ctx.lineWidth =  5;
            segments = 100;
        }

        if (!skipsegments){
            const targets = figure2_edges[i];
            for (let j = 0; j < targets.length; j++){
                const k = targets[j];
                if (!figure2.ablated[k]) figure2.lineto(figure2.training_xyloc[i], figure2.param_xyloc[k], segments);
            }
        }
        figure2.ctx.globalAlpha = 1;
        figure2.drawTraining(i, figure2.training_xyloc[i], size, brightness);
    }
    let flow = false;
    for (let i = 0; i < 16; i++){
        figure2.ctx.lineWidth = 2;
        figure2.ctx.strokeStyle = "black";
        figure2.ctx.fillStyle = "black";
        if (figure2.selected != -1){
            for (let j = 0; j < figure2_edges[figure2.selected].length; j++){
                if (i == figure2_edges[figure2.selected][j]){
                    figure2.ctx.lineWidth = 5;  
                    figure2.ctx.strokeStyle = figure2.highlightcolor;
                    figure2.ctx.fillStyle = figure2.highlightcolor;
                    if (!figure2.ablated[i]) flow = true;
                    break;
                }
            }
        }
        if (!figure2.ablated[i]) figure2.lineto2(figure2.param_xyloc[i], figure2.combined_xy);
        figure2.drawCircle(figure2.param_xyloc[i], figure2.abltrue[i])
    }
    if (!flow){
        figure2.ctx.strokeStyle = "black";
        figure2.ctx.fillStyle = "black";
        figure2.ctx.lineWidth = 5;
    } else {
        figure2.ctx.strokeStyle = figure2.highlightcolor;
        figure2.ctx.fillStyle = figure2.highlightcolor;
        figure2.ctx.lineWidth = 9;
        figure2.drawFrame(figure2.generate_xy, 64);
    }

    figure2.lineto2(figure2.combined_xy, figure2.generate_xy);
    figure2.drawCircle(figure2.combined_xy, figure2.abltrue[16]);
    figure2.drawCounterfactual2(figure2.erased + 1, figure2.generateindex, figure2.generate_xy, 64);

    setTimeout(() => requestAnimationFrame(figure2.loop, false), 50);
}

figure2.lineto = (xy1, xy2, segments) => {
    drawline(xy1[0], xy1[1], xy2[0], xy2[1], segments, interpolate_cosine, figure2.ctx);
}

figure2.lineto2 = (xy1, xy2) => {
    drawline(xy1[0], xy1[1], xy2[0], xy2[1], 100, interpolate_square, figure2.ctx);
}

figure2.lineto3 = (xy1, xy2) => {
    drawline(xy1[0], xy1[1], xy2[0], xy2[1], 1, (x) => x, figure2.ctx);
}

figure2.init = () => {
    loadImages(["website/web1.png", "website/web2.png"], (images) => {
        figure2.training = images[0];
        figure2.generate = images[1];

        const xcenter = 340;
        const ycenter = 500;
        figure2.training_xyloc = [];
        figure2.training_xyloc_true = [];
        figure2.training_xyloc_org = [];
        figure2.sizes = [];
        figure2.natural_z = [];
        figure2.renderorder = [];
        for (let i = 0; i < 384; i++){
            const x_raw = i%16;
            const y_raw = Math.floor(i/16);
            const x = xcenter + (x_raw-7.5)*40;
            const y = ycenter + (y_raw-11.5)*40;
            figure2.training_xyloc.push([x, y]);
            figure2.training_xyloc_true.push([x, y]);
            figure2.training_xyloc_org.push([x, y]);
            figure2.sizes.push(32);

            const ydelta = (1-Math.pow((y_raw-11.5)/11.5, 2))*0.2;
            const xdelta = (x_raw/15)*0.8;
            const z = ydelta + xdelta;
            figure2.natural_z.push(z);
            figure2.renderorder.push([z, i]);
        }

        const xcenter2 = 1000;
        const ycenter2 = ycenter;
        figure2.param_xyloc = [];
        figure2.ablated = [];
        figure2.abltarget = [];
        figure2.abltrue = [];
        figure2.ablated_maxsize = 8;
        for (let i = 0; i < 16; i++){
            const x = xcenter2;
            const y = ycenter2 + (i-7.5)*50;
            figure2.param_xyloc.push([x, y]);
            figure2.ablated.push(false);
            figure2.abltarget.push(figure2.ablated_maxsize);
            figure2.abltrue.push(figure2.ablated_maxsize);
        }
        figure2.abltarget.push(32);
        figure2.abltrue.push(32);

        figure2.combined_xy = [1240, ycenter];
        figure2.generate_xy = [1340, ycenter];

        figure2.forcerender = true;
        figure2.loop();
    })
}

figure2.init();