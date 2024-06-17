var figure1 = {}
figure1.canvas = document.getElementById("figure1")
figure1.ctx = figure1.canvas.getContext("2d");

figure1.lineto = (xy1, xy2, segments) => {
    drawline(xy1[0], xy1[1], xy2[0], xy2[1], segments, interpolate_cosine, figure1.ctx);
}

figure1.drawCircle = (xy, r) => {
    figure1.ctx.beginPath();
    figure1.ctx.arc(xy[0], xy[1], r, 0, 2 * Math.PI);
    figure1.ctx.fill();
}

figure1.getscatter = (n, sc) => {
    const arr = [];
    for (let i = 0; i < n; i++){
        const frac = (n==1) ? 0 : i/(n-1);
        const y = (frac-0.5) * sc + 256;
        arr.push(y);
    }
    return arr;
}

figure1.draw = () => {
    figure1.ctx.fillStyle = "black";
    figure1.ctx.strokeStyle = "black";
    figure1.ctx.lineWidth = 3;

    const ys = [
        figure1.getscatter(3, 112),
        figure1.getscatter(3, 128),
        figure1.getscatter(7, 224),
        figure1.getscatter(5, 192),
        figure1.getscatter(3, 128),
        figure1.getscatter(1, 0),
        figure1.getscatter(1, 0),
    ]
    const xs = figure1.getscatter(7, 480);
    xs[0] += 40;
    xs[2] -= 12;
    xs[3] += 24;
    xs[5] -= 40;

    for (let i = 1; i < xs.length-1; i++){
        const x = xs[i];
        const y = ys[i];
        for (j = 0; j < y.length; j++){
            figure1.drawCircle([x, y[j]], 10);
        }
    }

    for (let i = 1; i < xs.length-1; i++){
        if (i == xs.length-2) figure1.ctx.lineWidth = 7;
        const x1 = xs[i];
        const x2 = xs[i+1];
        const y1 = ys[i];
        const y2 = ys[i+1];
        for (j = 0; j < y1.length; j++){
            for (k = 0; k < y2.length; k++){
                figure1.lineto([x1, y1[j]], [x2, y2[k]], 20);
            }
        }
    }
    for (let i = 0; i < ys[0].length; i++){
        figure1.lineto([xs[0], ys[0][i]], [xs[1], ys[1][i]], 20);
    }
}

figure1.draw();