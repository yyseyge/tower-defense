import * as Tile from "./tile.js";

class Monster {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 5;
  }
}

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let life = 10;

const monsterImg = new Image();
monsterImg.src =
  "data:image/jpeg;base64,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";
const monsterImgSize = 80;
let monsterLoopTF = true;

let monsters = []; //monster객체를 담아놓을 배열
for (let i = 0; i < 3; i++) { 
  let monster = new Monster(-50, 150);
  monsters.push(monster);
}

let startTime = Date.now(); //startTime이라는 변수에 현재 시작 시간 담아놓음
let monsterSpawnInterval = 500; //몬스터 사이의 간격 초
monsters = monsters.map((monster, index) => ({ 
  ...monster, //...은 스프레드연산자 의미: 현재 객체의 속성을 그래도 유지한채, 새로운 속성추가(spawnTime)
  //만약 ...안쓰면 기존 monster가 가지고 있던 속성 모두 사라지고 spawnTime속성만 생김김
  spawnTime: index * monsterSpawnInterval, // 각 몬스터가 순차적으로 출발
}));

// 맵 그리기
function drawMap() {
  Tile.setTiles();
  Tile.setRoadTiles();
  Tile.tiles.forEach((tile) => tile.draw(ctx));
}

function monsterLoop() {
  drawMap();
  let currentTime = Date.now();
  let activeMonster = 0;
  monsters.forEach((monster) => {
    if (currentTime - startTime < monster.spawnTime) {
      return;
    }

    if (monster.x == Tile.tiles[39].posx + 100) {
      return;
    }

    activeMonster++;

    if (
      monster.x < Tile.tiles[Tile.monsterPath[0]].posx &&
      monster.y == Tile.tiles[Tile.monsterPath[0]].posy
    ) {
      monster.x += monster.speed;
    } else if (
      monster.x == Tile.tiles[Tile.monsterPath[0]].posx &&
      monster.y < Tile.tiles[Tile.monsterPath[1]].posy
    ) {
      monster.y += monster.speed;
    } else if (
      monster.x < Tile.tiles[Tile.monsterPath[2]].posx &&
      monster.y == Tile.tiles[Tile.monsterPath[1]].posy
    ) {
      monster.x += monster.speed;
    } else if (
      monster.x == Tile.tiles[Tile.monsterPath[2]].posx &&
      monster.y > Tile.tiles[Tile.monsterPath[3]].posy
    ) {
      monster.y -= monster.speed;
    } else if (
      monster.x < Tile.tiles[Tile.monsterPath[4]].posx &&
      monster.y == Tile.tiles[Tile.monsterPath[3]].posy
    ) {
      monster.x += monster.speed;
    } else if (
      monster.x == Tile.tiles[Tile.monsterPath[4]].posx &&
      monster.y < Tile.tiles[Tile.monsterPath[5]].posy
    ) {
      monster.y += monster.speed;
    } else if (
      monster.x < Tile.tiles[39].posx &&
      monster.y == Tile.tiles[39].posy
    ) {
      monster.x += monster.speed;
    } else {
      monster.x = Tile.tiles[39].posx + 100;
      monster.y = Tile.tiles[39].posy;
      life -= 1;
      console.log("end", life);
    }
    ctx.drawImage(
      monsterImg,
      monster.x - monsterImgSize / 2,
      monster.y - monsterImgSize / 2,
      monsterImgSize,
      monsterImgSize
    );
    // console.log(monster.x,monster.y)
  });

  if (activeMonster === 0) {
    console.log("end");
    monsterLoopTF = false;
  }
}

function gameLoop() {
  if (monsterLoopTF) {
    monsterLoop();
  }
  requestAnimationFrame(gameLoop);
}

gameLoop();
