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
    speed: 3
};

const ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    size: 12,
    speedX: 5,
    speedY: 3
};

const ballImage = new Image();
ballImage.src = "ball.jpg";

let lastSpeedIncreaseTime = performance.now();

const SPEED_INCREASE_INTERVAL = 10000;
const SPEED_MULTIPLAYER = 1.05;
const MAX_BALL_SPEED = 12;
const COMPUTER_SLOW_SPEED = 2;
const COMPUTER_FAST_SPEED = 4;
const COMPUTER_SPEED_CHANGE_INTERVAL = 3000;
let lastComputerSpeedChangeTime = performance.now();
let nextComputerSpeed = COMPUTER_SLOW_SPEED;


const playerScoreDisplay = document.getElementById("playerScore");
const computerScoreDisplay = document.getElementById("computerScore");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const gameOverWinner = document.getElementById("gameOverWinner");
const finalScoreDisplay = document.getElementById("finalScore");
const gameOverMessage = document.getElementById("gameOverMessage");
const playAgainButton = document.getElementById("playAgainButton");
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

    if (ballImage.complete && ballImage.naturalWidth > 0) {
        const imageSize = ball.size * 1.4;

        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
            ballImage,
            ball.x - imageSize / 2,
            ball.y - imageSize / 2,
            imageSize,
            imageSize
        );
        ctx.restore();
    } else {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
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

    const currentTime = performance.now();

    if (currentTime - lastComputerSpeedChangeTime >= COMPUTER_SPEED_CHANGE_INTERVAL) {
        computer.speed = nextComputerSpeed;
        nextComputerSpeed = nextComputerSpeed === COMPUTER_SLOW_SPEED
            ? COMPUTER_FAST_SPEED
            : COMPUTER_SLOW_SPEED;
        lastComputerSpeedChangeTime = currentTime;
    }

    if (ball.x > WIDTH / 2) {
        const computerCenter = computer.y + computer.height / 2;
        const distanceToBall = ball.y - computerCenter;

        if (Math.abs(distanceToBall) > 10) {
            computer.y += Math.sign(distanceToBall) * computer.speed;
        }
    }

    if (computer.y < 0) {
        computer.y = 0;

    }
    if ( computer.y + computer.height > HEIGHT ) {
        computer.y = HEIGHT - computer.height;

    }

    

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
        ball.x = player.x + player.width + ball.size / 2;
        hitPaddle(player, 1);

    }


    if (
        ball.x + ball.size / 2 >= computer.x &&
        ball.x - ball.size / 2 <= computer.x + computer.width &&
        ball.y + ball.size / 2 >= computer.y &&
        ball.y - ball.size / 2 <= computer.y + computer.height &&
        ball.speedX > 0
    ) {
        ball.x = computer.x - ball.size / 2;
        hitPaddle(computer, -1);
    }

    if (ball.x + ball.size / 2 < 0) {
        computerScore += 1;
        computerScoreDisplay.textContent = computerScore;
        if (computerScore >= 11) {
            endMatch("COMPUTER WINS!", "Better luck next time!");
        } else {
            resetBall(1);
        }
    } else if (ball.x - ball.size / 2 > WIDTH) {
        playerScore += 1;
        playerScoreDisplay.textContent = playerScore;
        if (playerScore >= 11) {
            endMatch("YOU WIN!", "Great match!");
        } else {
            resetBall(-1);
        }
    }

}

function endMatch(winner, message) {
    gameOver = true;
    gameOverWinner.textContent = winner;
    finalScoreDisplay.textContent = `${playerScore} - ${computerScore}`;
    gameOverMessage.textContent = message;
    gameOverOverlay.hidden = false;
    playAgainButton.focus();
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

    lastSpeedIncreaseTime = performance.now();
}

function startNewMatch() {
    if (!gameOver) {
        return;
    }

    playerScore = 0;
    computerScore = 0;
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
    player.y = HEIGHT / 2 - player.height / 2;
    computer.y = HEIGHT / 2 - computer.height / 2;
    computer.speed = 3;
    nextComputerSpeed = COMPUTER_SLOW_SPEED;
    lastComputerSpeedChangeTime = performance.now();

    for (const key in keys) {
        keys[key] = false;
    }

    resetBall(1);
    gameOver = false;
    gameOverOverlay.hidden = true;
    draw();
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (gameOver) {
        return;
    }

    update();
    draw();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }

}

playAgainButton.addEventListener("click", startNewMatch);

gameLoop();
