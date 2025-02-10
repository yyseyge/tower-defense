// Monster.js
import * as Tile from "./tile.js";

let monsterArray = []; // 몬스터 객체 담아놓을 배열

export class Monster {
    constructor(life, posX, posY, speed) {
        this.life = life; //monster의 생명력 
        this.posX = posX; //monster의 x좌표
        this.posY = posY; //monster의 y좌표표
        this.speed = speed;
        this.pathIndex = 0; // 경로 인덱스 추가
        this.img = new Image(); // 이미지 속성
        this.img.src = "https://png.pngtree.com/png-clipart/20190618/original/pngtree-anime-character-campus-game-character-anime-comic-hand-drawn-png-image_3923580.jpg"; // 몬스터 이미지
        this.isImageLoaded = false; // 이미지가 로드되었는지 여부

        // 이미지 로드 완료 후 상태를 업데이트
        this.img.onload = () => {
            this.isImageLoaded = true;
            console.log('Image loaded:', this.isImageLoaded);
        };
    }

    init(life, posX, posY, speed, count) {
        this.createMonster(life, posX, posY, speed, count);
    }

    createMonster(life, posX, posY, count) {
        for (let i = 0; i < count; i++) {
            let monster = new Monster(life, posX, posY, this.speed); // 몬스터 객체 생성
            monsterArray.push(monster);  // 배열에 몬스터 추가
        }
    }

    move() {
        if (this.pathIndex >= Tile.monsterPath.length) return; // 경로 끝에 도달하면 이동 멈춤

        let targetTile = Tile.tiles[Tile.monsterPath[this.pathIndex]]; // 목표 타일

        // 목표 타일에 도달한 경우
        if (Math.abs(this.posX - targetTile.posx) < this.speed && Math.abs(this.posY - targetTile.posy) < this.speed) {
            this.posX = targetTile.posx;
            this.posY = targetTile.posy;
            this.pathIndex++; // path 인덱스 변경하면 두번째 targetTile이 변경됨
        } else {
            // 목표 타일로 이동
            if (this.posX < targetTile.posx) this.posX += this.speed;
            else if (this.posX > targetTile.posx) this.posX -= this.speed;

            if (this.posY < targetTile.posy) this.posY += this.speed;
            else if (this.posY > targetTile.posy) this.posY -= this.speed;
        }
    }

    // 몬스터 그리기
    drawMonsters(ctx) {
        if (this.isImageLoaded) { // 이미지가 로드되었을 때만 그리기
            ctx.drawImage(this.img, this.posX, this.posY, 40, 40); // 이미지를 그리는 코드
        }
    }
}

// 몬스터 이동을 시작하는 함수
export function startMonsterMovement() {
    setInterval(() => {
        // 모든 몬스터가 이동하도록 설정
        monsterArray.forEach((monster) => {
            monster.move();
        });

        // 캔버스와 컨텍스트 설정
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");

        // 몬스터 그리기
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 이전에 그려진 이미지를 지워줍니다.
        monsterArray.forEach((monster) => {
            monster.drawMonsters(ctx);
        });
    }, 100); // 100ms마다 이동
}
