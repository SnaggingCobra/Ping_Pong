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

let lastSpeedIncreaseTime = performance.now();

const SPEED_INCREASE_INTERVAL = 10000;
const SPEED_MULTIPLAYER = 1.05;
const MAX_BALL_SPEED = 12;


const playerScoreDisplay = document.getElementById("playerScore");
const computerScoreDisplay = document.getElementById("computerScore");
const gameStatusDisplay = document.getElementById("gameStatus");
let playerScore = 0;
let computerScore = 0;
let gameOver = false;

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

document.addEventListener("keyup", function(event){
    if (event.key in keys) {
        keys[event.key] = false;
        event.preventDefault();
    }
});

window.addEventListener("blur", function(){
    for (const key in keys) {
        keys[key] = false;
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
    if (gameOver) {
        return;
    }

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

    const computerCenter = computer.y + computer.height /2;

    if (computerCenter < ball.y - 10) {
        computer.y += computer.speed;

    }

    if (computerCenter > ball.y + 10) {
        computer.y -= computer.speed;

    }

    if (computer.y < 0) {
        computer.y = 0;

    }
    if ( computer.y + computer.height > HEIGHT ) {
        computer.y = HEIGHT - computer.height;

    }

    

    const currentTime = performance.now();

    if (currentTime - lastSpeedIncreaseTime >= SPEED_INCREASE_INTERVAL) {
        const currentSpeed = Math.hypot(ball.speedX, ball.speedY);

        const newSpeed = Math.min(
            currentSpeed * SPEED_MULTIPLAYER,
            MAX_BALL_SPEED
        );

        const speedRatio = newSpeed / currentSpeed;

        ball.speedX *= speedRatio;
        ball.speedY *= speedRatio;

        lastSpeedIncreaseTime = currentTime;

    }

    ball.x += ball.speedX;
    ball.y += ball.speedY;


    if (
        ball.y - ball.size / 2 <= 0 ||
        ball.y + ball.size / 2 >= HEIGHT
    ) {
        ball.speedY *= -1;

    }



    if (
        ball.x - ball.size / 2 <= player.x + player.width &&
        ball.x + ball.size / 2 >= player.x &&
        ball.y + ball.size / 2 >= player.y &&
        ball.y - ball.size / 2 <= player.y + player.height &&
        ball.speedX < 0
    ) {
        hitPaddle(player, 1);

    }


    if (
        ball.x + ball.size / 2 >= computer.x &&
        ball.x - ball.size / 2 <= computer.x + computer.width &&
        ball.y + ball.size / 2 >= computer.y &&
        ball.y - ball.size / 2 <= computer.y + computer.height &&
        ball.speedX > 0
    ) {
        hitPaddle(computer, -1);
    }

    if (ball.x + ball.size / 2 < 0) {
        computerScore += 1;
        computerScoreDisplay.textContent = computerScore;
        if (computerScore >= 11) {
            gameOver = true;
            gameStatusDisplay.textContent = "Computer wins!";
        } else {
            resetBall(1);
        }
    } else if (ball.x - ball.size / 2 > WIDTH) {
        playerScore += 1;
        playerScoreDisplay.textContent = playerScore;
        if (playerScore >= 11) {
            gameOver = true;
            gameStatusDisplay.textContent = "Player wins!";
        } else {
            resetBall(-1);
        }
    }

}

function hitPaddle(paddle, direction) {
    const paddleCenter = paddle.y + paddle.height / 2;
    const hitPosition = (ball.y - paddleCenter) / (paddle.height / 2);
    const maxAngle = Math.PI / 3;
    const angle = hitPosition * maxAngle;
    const speed = Math.hypot(ball.speedX, ball.speedY);

    ball.speedX = direction * speed * Math.cos(angle);
    ball.speedY = speed * Math.sin(angle);
}


function resetBall(direction) {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.speedX = 5 * direction;
    ball.speedY = 3;
}

function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);

}

gameLoop();