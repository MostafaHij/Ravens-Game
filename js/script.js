
window.addEventListener('load', function () {

    /** @type {HTMLCanvasElement} */

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const collisionCanvas = document.getElementById('collisionCanvas');
    const collisionCTX = collisionCanvas.getContext('2d');
    collisionCanvas.width = window.innerWidth;
    collisionCanvas.height = window.innerHeight;

    let gameOver = false;
    let timeToNextRaven = 0;
    let ravenInterval = 500;
    let lastTime = 0;
    let score = 0;
    ctx.font = '50px Impact';



    let ravens = [];

    function Raven() {
        this.spriteWidth = 1626 / 6;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.3 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markForDeletion = false;
        this.image = new Image();
        this.image.src = 'images/raven.png';
        this.frameX = 0;
        this.maxFramX = 5;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';

        this.update = function (deltaTime) {
            // when raven reach top or bottom of screen it will change direction to positive or nigative
            if (this.y < 0 || this.y > canvas.height - this.height)
                this.directionY *= -1;

            this.x -= this.directionX;
            this.y += this.directionY;

            if (this.x < 0 - this.width) {
                this.markForDeletion = true;
                gameOver = true;
            }

            this.timeSinceFlap += deltaTime;

            if (this.timeSinceFlap > this.flapInterval) {
                if (this.frameX < this.maxFramX) {
                    this.frameX++;
                } else {
                    this.frameX = 0;
                }
                this.timeSinceFlap = 0;
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, this.color))

                }
            }
        }

        this.draw = function () {
            collisionCTX.fillStyle = this.color;
            collisionCTX.fillRect(this.x, this.y, this.width, this.height);
            ctx.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
        }
    }


    let explosions = [];

    function Explosion(x, y, size) {
        this.image = new Image();
        this.image.src = 'images/boom.png';
        this.spriteWidth = 1000 / 5;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frameX = 0;
        this.sound = new Audio();
        this.sound.src = 'sounds/boom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 100;
        this.markForDeletion = false;

        this.update = function (deltaTime) {

            if (this.frameX === 0) this.sound.play();

            this.timeSinceLastFrame += deltaTime;
            if (this.timeSinceLastFrame > this.frameInterval) {
                this.frameX++;
                this.timeSinceLastFrame = 0;
                if (this.frameX > 4) this.markForDeletion = true;
            }
        }

        this.draw = function () {
            ctx.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size)

        }
    }



    let particles = [];
    function Particle(x, y, size, color) {
        this.size = size;
        this.x = x + this.size / 2;
        this.y = y + this.size / 3;
        this.color = color;
        this.radius = Math.random() * this.size / 10;
        this.maxRadius = Math.random() * 20 + 35;
        this.speedX = Math.random() * 1 + 0.5
        this.markForDeletion = false;

        this.update = function () {
            this.x += this.speedX;
            this.radius += 0.3;
            if (this.radius > this.maxRadius - 5) this.markForDeletion = true;
        }

        this.draw = function () {
            ctx.save();
            ctx.globalAlpha = 1 - this.radius / this.maxRadius;
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function setScore() {
        ctx.fillStyle = '#143442';
        ctx.fillText('Score: ' + score, 50, 75);
        ctx.fillStyle = 'white';
        ctx.fillText('Score: ' + score, 53, 78);
    }

    function drawGameOver() {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#143442';
        ctx.fillText('Game Over, Your Score: ' + score, canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = 'white';
        ctx.fillText('Game Over, Your Score: ' + score, (canvas.width / 2) + 2, (canvas.height / 2) + 2);
    }

    window.addEventListener('click', function (e) {
        const detectedPixelColor = collisionCTX.getImageData(e.x, e.y, 1, 1);
        const pixelColor = detectedPixelColor.data;

        // remove only raven that holding same colors in randomColors and image data colors
        ravens.forEach(function (obj) {
            if (obj.randomColors[0] === pixelColor[0] && obj.randomColors[1] === pixelColor[1] && obj.randomColors[2] === pixelColor[2]) {
                // collision detected
                explosions.push(new Explosion(obj.x, obj.y, obj.width))
                obj.markForDeletion = true;
                score++;
            }
        });
    });

    function animate(timesTamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        collisionCTX.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);

        // DeltaTime = calculating differnce between last frame and current fram
        let deltaTime = timesTamp - lastTime;
        lastTime = timesTamp;
        timeToNextRaven += deltaTime;

        // pushing new Object
        if (timeToNextRaven > ravenInterval) {
            ravens.push(new Raven());
            timeToNextRaven = 0;
        }

        ravens.sort(function (a, b) {
            return a.width - b.width;
        });

        setScore();

        particles.forEach(function (object) {
            object.update(deltaTime);
            object.draw();
        });

        ravens.forEach(function (object) {
            object.update(deltaTime);
            object.draw();
        });

        explosions.forEach(function (object) {
            object.update(deltaTime);
            object.draw();
        });

        // update array to hold only objects with markForDeletion as false
        ravens = ravens.filter(function (obj) {
            if (obj.markForDeletion === false)
                return ravens
        })

        explosions = explosions.filter(function (obj) {
            if (obj.markForDeletion === false)
                return explosions
        });

        particles = particles.filter(function (obj) {
            if (obj.markForDeletion === false)
                return particles
        })

        if (!gameOver) requestAnimationFrame(animate);
        else drawGameOver();
    }
    animate(0);
});

