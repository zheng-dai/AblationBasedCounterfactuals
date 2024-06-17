var figure4 = {};
figure4.bkg = document.getElementById("figure4background");
figure4.bkg2 = document.getElementById("figure4background2");
figure4.canvas = document.getElementById("figure4");
figure4.ctx = figure4.canvas.getContext("2d");
figure4.ctx.imageSmoothingEnabled = false;
figure4.idstate = 0;
figure4.sigma = 0.1;
figure4.noise = [
    makeNoiseObj(32, 32, figure4.sigma),
    makeNoiseObj(32, 32, figure4.sigma),
    makeNoiseObj2(32, 32, figure4.sigma),
    makeNoiseObj2(32, 32, figure4.sigma),
    makeNoiseObj2(48, 48, figure4.sigma),
    makeNoiseObj2(48, 48, figure4.sigma),
    /*makeNoiseObj2(128, 128, figure4.sigma),
    makeNoiseObj2(256, 256, figure4.sigma),
    makeNoiseObj2(256, 256, figure4.sigma),
    makeNoiseObj2(256, 256, figure4.sigma),
    makeNoiseObj2(256, 256, figure4.sigma)*/
];
figure4.image = -1;

figure4.reinit = () => {
    figure4.idstate += 1;
    figure4.loop(figure4.idstate, 1);
}

document.getElementById("figure4_button").addEventListener("click", ()=>{
    figure4.reinit();
});

figure4.loop = (loopid, anim) => {
    if (loopid != figure4.idstate) return;
    if (anim == 1) {
        for (let i = 0; i < figure4.noise.length; i++) figure4.noise[i].init();
        figure4.image = (figure4.image + 1)%5;
        const shift = Math.floor(figure4.image * 100);
        figure4.bkg2.style.setProperty("top", "-" + shift + "%");
    }

    const s = [32, 32, 32, 32, 48, 48, 128, 256, 256, 256, 256];
    for (let ii = 0; ii < 9; ii++) {
        const i = (ii > 4) ? ii%2 + 4 : ii;
        figure4.noise[i].step();
        figure4.ctx.drawImage(figure4.noise[i].img, 0, 0, s[i], s[i], ii*256, 0, 256, 256);
    }

    figure4.canvas.style.setProperty("opacity", 1-Math.pow(1-anim,2));
    figure4.bkg.style.setProperty("opacity", 1-anim*anim);
    figure4.bkg.style.setProperty("filter", "blur(" + Math.floor(Math.max(anim*5-2,0)) + "px)");
    if (anim > 0) {
        setTimeout(() => requestAnimationFrame(() => figure4.loop(loopid, Math.max(anim-0.1, 0) )), 50);
    }
}

figure4.loop(figure4.idstate, 1);