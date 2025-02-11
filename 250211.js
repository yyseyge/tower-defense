import * as Tile from "./tile.js";

let monsterArray = []; // 몬스터 객체 담아놓을 배열

export class Monster {
    constructor(life, posX, posY, speed) {
        this.life = life;
        this.posX = posX;
        this.posY = posY;
        this.speed = speed;
        this.pathIndex = 0;
        this.img = new Image();
        this.img.src = "https://png.pngtree.com/png-clipart/20190618/original/pngtree-anime-character-campus-game-character-anime-comic-hand-drawn-png-image_3923580.jpg";
        this.isImageLoaded = false;
        //this.isMoving=false;

        this.img.onload = () => {
            this.isImageLoaded = true;
        };
    }

    move() {
        if (this.pathIndex >= Tile.monsterPath.length) return;

        let targetTile = Tile.tiles[Tile.monsterPath[this.pathIndex]];

        if (Math.abs(this.posX - targetTile.posx) < this.speed && Math.abs(this.posY - targetTile.posy) < this.speed) {
            this.posX = targetTile.posx;
            this.posY = targetTile.posy;
            this.pathIndex++;
        } else {
            if (this.posX < targetTile.posx) this.posX += this.speed;
            else if (this.posX > targetTile.posx) this.posX -= this.speed;

            if (this.posY < targetTile.posy) this.posY += this.speed;
            else if (this.posY > targetTile.posy) this.posY -= this.speed;
        }
    }

    draw(ctx) {
        if (this.isImageLoaded) {
            ctx.drawImage(this.img, this.posX, this.posY, 40, 40);
        }
    }
}

// 몬스터 이동을 시작하는 함수
export function startMonsterMovement() {
    // 몬스터 50마리 생성
    for (let i = 0; i < 50; i++) {
        let monster = new Monster(5, -50, 150, 5);
        monsterArray.push(monster);
    }

    let activeMonsterCount = 0;

    // 1초마다 하나씩 몬스터가 이동을 시작
    const intervalId = setInterval(() => {
        if (activeMonsterCount >= monsterArray.length) {
            clearInterval(intervalId);
            return;
        }

        let currentMonster = monsterArray[activeMonsterCount];
        currentMonster.isMoving = true; // 현재 몬스터의 이동을 허용
        activeMonsterCount++;
    }, 1000);

    // 모든 몬스터의 이동을 처리하고 캔버스를 갱신
    setInterval(() => {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        monsterArray.forEach((monster) => {
            if (monster.isMoving) { // 이동이 허용된 몬스터만 이동
                monster.move();
            }
            monster.draw(ctx);
        });
    }, 10);
}
// 이 코드를 사용하면 캔버스에 몬스터 이미지 50개가 차례대로 잘 나오는데

