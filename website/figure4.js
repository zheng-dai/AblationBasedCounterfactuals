var figure4 = {};
figure4.bkg = document.getElementById("figure4background");
figure4.bkg2 = document.getElementById("figure4background2");
figure4.canvas = document.getElementById("figure4");
figure4.ctx = figure4.canvas.getContext("2d");
figure4.ctx.imageSmoothingEnabled = false;
figure4.idstate = 0;
figure4.noise1 = makeNoiseObj(32, 32, 0.15);
figure4.noise2 = makeNoiseObj2(256, 256, 0.25);
figure4.image = 0;

figure4.reinit = () => {
    figure4.idstate += 1;
    figure4.loop(figure4.idstate, 1);
}

document.getElementById("figure4_button").addEventListener("click", ()=>{
    figure4.reinit();
});

figure4.loop = (loopid, anim) => {
    if (loopid != figure4.idstate) {
        return;
    }
    if (anim == 1) {
        figure4.noise1.init();
        figure4.noise2.init();
        
        figure4.image = (figure4.image + 1)%5;
        const shift = Math.floor(figure4.image * 100);
        figure4.bkg2.style.setProperty("top", "-" + shift + "%");
    }

    const s = [32, 32, 32, 32, 128, 256, 256, 256, 256];
    figure4.noise1.step();
    figure4.noise2.step();
    for (let i = 0; i < 9; i++) {
        const current_noise = (i < 2) ? figure4.noise1 : figure4.noise2;
        figure4.ctx.drawImage(current_noise.img, 0, 0, s[i], s[i], i*256, 0, 256, 256);
    }

    figure4.canvas.style.setProperty("opacity", 1-Math.pow(1-anim,2));
    figure4.bkg.style.setProperty("opacity", 1-anim*anim);
    figure4.bkg.style.setProperty("filter", "blur(" + Math.floor(Math.max(anim*8,0)) + "px)");
    if (anim > 0) {
        setTimeout(() => requestAnimationFrame(() => figure4.loop(loopid, Math.max(anim-0.1, 0) )), 50);
    }
}
