const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const player = {
    x: 20,
    y: HEIGHT / 2-50,
    width: 12,
    height: 100,
    speed: 6
};

const computer = {
    x: WIDTH -32,
    y: HEIGHT / 2-50,
    width: 12,
    height: 100,
    speed: 5
};

const ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    size: 12,
    speedX: 5,
    speedY: 3
};

const keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false
};

document.addEventListener("keydown", function(event){
    if (event.key in keys) {
        keys[event.key] = true;
        event.preventDefault();

    }
});



function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;


    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();

    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "white";
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height

    );

    ctx.fillRect(
        computer.x,
        computer.y,
        computer.width,
        computer.height
    );

    ctx.beginPath();
    ctx.arc(
        ball.x,
        ball.y,
        ball.size / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function update() {

    if (keys.w || keys.ArrowUp) {
        player.y -= player.speed;
    }
    if (keys.s || keys.ArrowDown) {
        player.y += player.speed;
    }
    

    if (player.y < 0) {
        player.y = 0;

    }
    if (player.y + player.height > HEIGHT ) {
        player.y = HEIGHT - player.height;

    }

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (
        ball.y - ball.size / 2 <= 0 ||
        ball.y + ball.size / 2 >= HEIGHT
    ) {
        ball.speedY *= -1;

    }

    // Collision with player paddle
    if (
        ball.x - ball.size / 2 <= player.x + player.width &&
        ball.x + ball.size / 2 >= player.x &&
        ball.y + ball.size / 2 >= player.y &&
        ball.y - ball.size / 2 <= player.y + player.height &&
        ball.speedX < 0
    ) {
        ball.speedX *= -1;
    }

    // Collision with computer paddle
    if (
        ball.x + ball.size / 2 >= computer.x &&
        ball.x - ball.size / 2 <= computer.x + computer.width &&
        ball.y + ball.size / 2 >= computer.y &&
        ball.y - ball.size / 2 <= computer.y + computer.height &&
        ball.speedX > 0
    ) {
        ball.speedX *= -1;
    }

}

function gameLoop() {
    update();
    draw();


    requestAnimationFrame(gameLoop);

}

gameLoop();