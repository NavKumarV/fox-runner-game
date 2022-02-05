window.addEventListener('load', () => {
    const canvas = document.getElementById('runnerCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    let enemies = [];
    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 2000;
    let randomEnemyInterval = Math.random() * 1000 + 500;
    let score = 0;
    let gameOver = false;

    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', (e) => {
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
                    e.key === 'ArrowRight' || e.key === 'ArrowLeft') &&
                    this.keys.indexOf(e.key) == -1) {
                    this.keys.push(e.key);
                }
            })

            window.addEventListener('keyup', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
                    e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            })
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.height = 200;
            this.width = 200;
            this.x = 0
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.frameXMax = 8;
            this.frameY = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.weight = 1;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
        }
        draw(context) {
            // context.strokeStyle = 'white';
            // context.strokeRect(this.x, this.y, this.width, this.height);

            // context.beginPath();
            // context.arc(this.x+this.width/2, this.y+this.height/2, this.width / 2, 0, Math.PI * 2);
            // context.stroke();

            // context.strokeStyle = 'blue';
            // context.beginPath();
            // context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            // context.stroke();

            context.drawImage(this.image,
                this.frameX * this.width, this.frameY * this.height, // position of the stretched image
                this.width, this.height, //height and width of stretched image
                this.x, this.y, // Position of complete image
                this.width, this.height // Decides the complete height and width of img
            );
        }
        update(input, deltaTime, enemies) {

            enemies.forEach(enemy=>{
                const dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);
                const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx + dy*dy);
                if(distance < enemy.width/2+this.width/2){
                    gameOver = true;
                }
            })

            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.frameXMax) {
                    this.frameX = 0;
                } else {
                    this.frameX++;
                }
                this.frameTimer = 0
            } else {
                this.frameTimer += deltaTime;
            }

            if (input.keys.indexOf('ArrowRight') !== -1) {
                this.speedX = 5;
            } else if (input.keys.indexOf('ArrowLeft') !== -1) {
                this.speedX = -5;
            } else {
                this.speedX = 0;
            }

            if (input.keys.indexOf('ArrowUp') !== -1 && this.onGround()) {
                this.speedY = -30;
            }

            // horizontal moments
            this.x += this.speedX;
            if (this.x < 0) {
                this.x = 0;
            } else if (this.x > this.gameWidth - this.width) {
                this.x = this.gameWidth - this.width;
            }

            // vertical moment
            this.y += this.speedY;
            if (!this.onGround()) {
                this.frameY = 1;
                this.speedY += this.weight;
                this.frameXMax = 5;
            } else {
                this.frameY = 0;
                this.speedY = 0;
                this.frameXMax = 8;
            }

            if (this.y >= this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height;
            }
        }

        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speedX = 5;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speedX, this.y, this.width, this.height);
        }

        update() {
            this.x -= this.speedX;
            if (this.x < 0 - this.width) {
                this.x = 0;
            }
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('enemyImage');
            this.width = 160;
            this.height = 119;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.speedX = 8;
            this.frameX = 0;
            this.frameXMax = 5;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.markForDeletion = false;
        }

        draw(context) {
            // context.strokeStyle = 'white';
            // context.strokeRect(this.x, this.y, this.width, this.height);

            // context.beginPath();
            // context.arc(this.x+this.width/2, this.y+this.height/2, this.width / 2, 0, Math.PI * 2);
            // context.stroke();

            // context.strokeStyle = 'blue';
            // context.beginPath();
            // context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            // context.stroke();

            context.drawImage(this.image,
                this.frameX * this.width, this.frameY * this.height,
                this.width, this.height,
                this.x, this.y,
                this.width, this.height
            )
        }

        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.frameXMax) {
                    this.frameX = 0;
                } else {
                    this.frameX++;
                }
                this.frameTimer = 0
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speedX;

            if (this.x < 0 - this.width) {
                this.markForDeletion = true;
                score++;
            }
        }
    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }

        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        })
        console.log(enemies);
        enemies = enemies.filter(enemy => enemy.markForDeletion === false)
    }

    function displayStatusText(context) {
        context.font = '40px Helvetica';

        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 20, 50);

        context.fillStyle = 'white';
        context.fillText('Score: ' + score, 22, 52);

        if(gameOver){
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('Game Over, try again!', canvas.width/2, 200);

            context.fillStyle = 'white';
            context.fillText('Game Over, try again!', canvas.width/2+2, 200);
        }
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    enemies.push(new Enemy(canvas.width, canvas.height));

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        if(!gameOver){
            requestAnimationFrame(animate); // animate automatically generates timeStamp and passes as argument
        }
    }

    animate(0);


});

