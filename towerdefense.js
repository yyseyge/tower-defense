// html 화면 전환
function startPage() {
  document.getElementById("startPage").style.display = "none"; // 게임 시작 후 첫 페이지 숨기기
  document.getElementById("gameframe").style.display = "block"; // 게임 화면 표시하기
}

function difficultyPage() {
  document.getElementById("startPage").style.display = "none"; // 첫 번째 페이지 숨기기
  document.getElementById("setframe").style.display = "block"; // 난이도 설정 페이지 표시하기
}

function backPage() {
  document.getElementById("startPage").style.display = "block"; // 첫 번째 페이지 다시 표시
  document.getElementById("setframe").style.display = "none"; // 난이도 설정 페이지 숨기기
}

function selectDifficulty(level) {
  console.log("선택한 난이도:", level);
  document.getElementById("setframe").style.display = "none"; // 게임 시작 후 첫 페이지 숨기기
  document.getElementById("gameframe").style.display = "block"; // 게임 화면 표시하기
}

function showImage(imageUrl, name, damage, range, cooldown, cost) {
  const itemInfo = document.getElementById("itemInfo");
  itemInfo.innerHTML = `
      <img src="${imageUrl}" width="140" height="60">
      <p>이름: ${name}</p>
      <p>데미지: ${damage}</p>
      <p>범위: ${cooldown} |공격주기: ${range} </p>
      <p>필요골드: ${cost}</p>
  `;
}

class Tile {
  static rows = 6;
  static cols = 10;
  static tileSize = 100;

  static tileImage = {
    road: "https://opengameart.org/sites/default/files/styles/medium/public/Tiled%20-%20Metal%20or%20Rock_0.png",
    bg: "https://opengameart.org/sites/default/files/styles/medium/public/grass_26.png",
  };

  static tiles = [];

  // 스테이지 별 몬스터 이동하는 길 // 현재는 1 스테이지만
  static stageRoad = {
    1: [10, 11, 21, 31, 41, 42, 43, 44, 45, 35, 25, 15, 16, 17, 18, 28, 38, 39],
  };

  constructor(image, x, y, midX, midY) {
    this.x = x; // 이미지 생성 위치
    this.y = y; // 이미지 생성 위치
    this.midX = midX; // 각 타일의 중간 좌표
    this.midY = midY; // 각 타일의 중간 좌표
    this.image = image;
    this.isInstallable = true;
  }

  static setTiles() {
    for (let row = 0; row < Tile.rows; row++) {
      for (let col = 0; col < Tile.cols; col++) {
        let tile = new Tile(
          Tile.tileImage["bg"],
          col * Tile.tileSize,
          row * Tile.tileSize,
          col * Tile.tileSize + Tile.tileSize / 2,
          row * Tile.tileSize + Tile.tileSize / 2
        );
        Tile.tiles.push(tile);
      }
    }
    // console.log(Tile.tiles); // 정상 세팅 확인용
  }

  static setRoadTiles(stage) {
    let road = Tile.stageRoad[stage];

    for (let i = 0; i < road.length; i++) {
      Tile.tiles[road[i]].image = Tile.tileImage["road"];
      Tile.tiles[road[i]].isInstallable = false;
    }
  }

  drawTile(bctx) {
    let mapTileImage = new Image();
    mapTileImage.src = this.image;
    mapTileImage.addEventListener("load", () => {
      bctx.drawImage(
        mapTileImage,
        this.x,
        this.y,
        Tile.tileSize,
        Tile.tileSize
      );
    });
  }

  static setting() {
    Tile.setTiles(); // 기본 전체 배경 타일 설정
    Tile.setRoadTiles(Status.stage); // 스테이지 별 몬스터 이동 경로 타일 배경 설정
  }

  static drawMap(bctx) {
    Tile.tiles.forEach((tile) => tile.drawTile(bctx)); // 뒷캔버스에 타일 그리기
  }
}

class Tower {
  static towers = [];
  static towerSize = 90;

  constructor(towerImage, x, y, cooldown, damage, range, projImg, gold) {
    this.towerImage = towerImage;
    this.x = x;
    this.y = y;
    this.target = null;
    this.image = towerImage;

    this.gold = gold;

    // 범위 데미지 추가
    this.range = range;
    this.damage = damage;

    // 타워별 투사체 이미지 설정
    this.projImg = projImg;

    // 공격주기
    this.cooldown = cooldown; // 쿨타임 기준 값
    this.coolTime = 0;
  }

  // 몬스터 탐지
  findTarget() {
    let inRangeMonsters = Monster.monsters.filter((monster) => {
      // 캔버스 안에 몬스터가 있어야 함
      if (
        monster.x < 0 ||
        monster.x > bcvsW ||
        monster.y < 0 ||
        monster.y > bcvsH
      ) {
        return false;
      }

      // 사정거리 안에 있는 몬스터만 탐지
      let distance = Math.hypot(this.x - monster.x, this.y - monster.y);
      return distance <= this.range;
    });

    if (inRangeMonsters.length > 0) {
      this.target = inRangeMonsters.reduce((prev, curr) =>
        prev.pathIndex > curr.pathIndex ? prev : curr
      );
    } else {
      this.target = null;
    }
  }

  // 공격
  shoot() {
    if (this.target && this.coolTime <= 0) {
      Projectile.projectiles.push(
        new Projectile(
          this.x,
          this.y,
          this.target,
          40,
          this.damage,
          this.projImg
        )
      );
      this.coolTime = this.cooldown;
      // console.log(this.coolTime, this.cooldown);
    }
  }

  draw(bctx) {
    this.drawRange(bctx);
    bctx.drawImage(
      this.image,
      this.x - Tower.towerSize / 2,
      this.y - Tower.towerSize / 2,
      Tower.towerSize,
      Tower.towerSize
    );
  }

  // 타워 공격 범위 이미지로 보여주기
  drawRange(bctx) {
    bctx.beginPath();
    bctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
    bctx.fillStyle = "rgba(0,0,255,0.1)";
    bctx.fill();
    bctx.closePath();
  }

  // 타워 적 탐지 가동
  static updateTowers() {
    Tower.towers.forEach((tower) => {
      tower.findTarget();

      if (tower.coolTime > 0) {
        tower.coolTime--;
        // console.log(tower.coolTime);
      } else {
        tower.shoot();
      }
    });
  }
}

class Projectile {
  static projectiles = [];
  static size = 150; //ks

  // 투사체 별 이미지
  static projectileImgs = {
    1: "https://blogger.googleusercontent.com/img/a/AVvXsEhu1q2KwCaBLVuYwE6KxDT6YDdYcgLsM00yQDGRWjbk3jn3qo1zCK97oWIJjW8FW5G_LCHIKkQ6Q5lGyAXu-wIBsaf92vC1TcLmCcCdauWCRbJnAqkdLgE6K4N4aJae3-pwa1q_Wz2-qx0eo-UsAwo5QsN0DQvvMfB3gBIUcKVbSMu00q2HMY-QeA3KYYIj",
    2: "https://blogger.googleusercontent.com/img/a/AVvXsEhu1q2KwCaBLVuYwE6KxDT6YDdYcgLsM00yQDGRWjbk3jn3qo1zCK97oWIJjW8FW5G_LCHIKkQ6Q5lGyAXu-wIBsaf92vC1TcLmCcCdauWCRbJnAqkdLgE6K4N4aJae3-pwa1q_Wz2-qx0eo-UsAwo5QsN0DQvvMfB3gBIUcKVbSMu00q2HMY-QeA3KYYIj",
    3: "https://blogger.googleusercontent.com/img/a/AVvXsEgXSOWCbppI2tEhbJk_s25nj32IzKjvL9OQaHeL_oEZmEeiko_eZcOnYGzjD114I6lWs132NrYnEgeiSdMPsEJfzPdcRvyloFuiM8_jbQYHX859mFaHBgeW-3nQlQD4esQIM2pFxNZCGFhN4Z03i-sceB29CigeKOtEkMgyXi5SyCh_Tf0uKREemX1KXqGX",
    4: "https://blogger.googleusercontent.com/img/a/AVvXsEiUACP2g4PZQB6tXy7InbeesVXJ0VE22Z0QCuEjv46J5vInDpS3uCYAuq6gHSEAJDTpi4jn2LD2NLZLh8UmU4fHfADV12ftY33IX_VV7e5VGW_0_-4K3hKYg-5kccIrAw7J659rMYHj4N4_mvx-MnhG9c64fxYof-kiK145Fvaa8VGn6RfaTz74ls-MBtSJ",
  };

  constructor(x, y, target, speed, damage, projImg) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.target = target;
    this.damage = damage;
    this.img = Projectile.projectileImgs[projImg];
  }

  move() {
    // 타겟이 없으면 공격 x
    if (!this.target) return;

    let dx = this.target.x - this.x;
    let dy = this.target.y - this.y;
    let distance = Math.hypot(dx, dy);

    if (distance <= this.speed) {
      this.x = this.target.x;
      this.y = this.target.y;
      this.hitTarget();
      return;
    }

    this.x += (dx / distance) * this.speed;
    this.y += (dy / distance) * this.speed;
  }

  hitTarget() {
    if (this.target) {
      this.target.hp -= this.damage;

      if (this.target.hp <= 0) {
        this.removeMonster(this.target);
      }
    }
    this.removeProjectile(); // 타겟이 없으면 투사체 제거
  }

  // 현재 공격 중인 몬스터 제거
  removeMonster(monster) {
    let index = Monster.monsters.indexOf(monster);
    if (index !== -1) {
      Monster.monsters.splice(index, 1);
      Status.goldUpdate((Status.gold += monster.gold));
    }
  }

  // 현재 투사체 제거
  removeProjectile() {
    let index = Projectile.projectiles.indexOf(this);
    if (index !== -1) {
      Projectile.projectiles.splice(index, 1);
    }
  }

  // 투사체 이미지
  draw(bctx) {
    var img = new Image();
    img.src = this.img;

    bctx.drawImage(
      img,
      this.x - Projectile.size / 2,
      this.y - Projectile.size / 2,
      Projectile.size,
      Projectile.size
    );
  }

  static updateProjectiles(bctx) {
    for (let i = Projectile.projectiles.length - 1; i >= 0; i--) {
      let p = Projectile.projectiles[i];
      p.move();
      p.draw(bctx);
    }
  }
}

class Monster {
  static size = 80; // 이미지 사이즈
  static path = [11, 41, 45, 15, 18, 38, 39]; // 몬스터 이동 경로

  // 몬스터 웨이브 별 소환되는 마리수
  static monstersbywave = {
    1: 5,
    2: 10,
    3: 15,
    4: 20,
    5: 25,
    6: 30,
    7: 35,
    8: 40,
    9: 45,
    10: 50,
  };

  // 웨이브 별 몬스터 이동속도
  static wavebyspeed = {
    1: 3,
    2: Math.round(Math.random() * 3 + 3), //3~6
    3: Math.round(Math.random() * 5 + 3), //3~8
    4: Math.round(Math.random() * 7 + 3), //3~10
    5: Math.round(Math.random() * 9 + 3), //3~12
    6: Math.round(Math.random() * 11 + 5), //5~16
    7: Math.round(Math.random() * 12 + 5), //5~18
    8: Math.round(Math.random() * 13 + 5), //5~15
    9: Math.round(Math.random() * 14 + 5), //5~22
    10: Math.round(Math.random() * 10 + 10), //10~20
  };

  // 웨이브 별 몬스터 체력
  static wavebyhp = {
    1: 30,
    2: 50,
    3: Math.random() * 10 + 50, //50 ~60
    4: Math.random() * 20 + 50, //50~70
    5: Math.random() * 30 + 50, //50~80
    6: Math.random() * 40 + 50, //50~90
    7: Math.random() * 50 + 50, //50~100
    8: Math.random() * 60 + 50, //50~110
    9: Math.random() * 80 + 50, //50~120
    10: Math.random() * 105 + 70, //70~150
  };
  static monsters = []; // 생성된 몬스터

  // 몬스터 이미지
  static imgSrc =
    "https://png.pngtree.com/png-clipart/20220824/ourmid/pngtree-monster-merah-png-image_6121764.png";

  constructor(x, y, hp, speed) {
    this.image = new Image();
    this.image.src = Monster.imgSrc;
    this.isImageLoaded = false;
    this.image.onload = () => {
      this.isImageLoaded = true;
    };

    this.x = x;
    this.y = y;
    this.hp = hp;
    this.speed = speed;
    this.pathIndex = 0;
    this.isMoving = false;

    // 몬스터 별 골드 설정
    if (this.speed <= 5) {
      this.gold = 5;
      if (this.hp > 100) {
        this.gold = 10;
      }
    } else if (5 < this.speed && this.speed <= 15) {
      this.gold = 10;
      if (this.hp > 100) {
        this.gold = 15;
      }
    } else {
      this.gold = 10;
    }
  }

  move() {
    if (this.pathIndex >= Monster.path.length) {
      const monsterIndex = Monster.monsters.indexOf(this);
      if (monsterIndex !== -1) {
        Monster.monsters.splice(monsterIndex, 1);
        Status.lifeUpdate((Status.life -= 1));
      }

      if (Monster.monsters.length === 0) {
        console.log("몬스터 없음.");
        clearInterval(gameFrameInterval);
        gameFrameLoop = false;
        drawBg();
        Status.waveUpdate((Status.wave += 1));
      }
      return;
    }

    let targetTile = Tile.tiles[Monster.path[this.pathIndex]];
    if (
      Math.abs(this.x - targetTile.midX) < this.speed &&
      Math.abs(this.y - targetTile.midY) < this.speed
    ) {
      this.x = targetTile.midX;
      this.y = targetTile.midY;
      this.pathIndex++;
    } else {
      if (this.x < targetTile.midX) this.x += this.speed;
      else if (this.x > targetTile.midX) this.x -= this.speed;

      if (this.y < targetTile.midY) this.y += this.speed;
      else if (this.y > targetTile.midY) this.y -= this.speed;
    }
  }

  draw(bctx) {
    if (this.isImageLoaded) {
      bctx.drawImage(
        this.image,
        this.x - Monster.size / 2,
        this.y - Monster.size / 2,
        Monster.size,
        Monster.size
      );

      // 몬스터 체력바
      bctx.fillStyle = "red";
      bctx.fillRect(
        this.x - Monster.size / 2,
        this.y - 50,
        (Tile.tileSize / 2) * (this.hp / 20),
        5
      );
    }
  }

  // 몬스터 생성
  static setMonsters(amount, x, y, hp, speed) {
    if (!gameFrameLoop) {
      for (let i = 0; i < amount; i++) {
        let monster = new Monster(x, y, hp, speed);
        Monster.monsters.push(monster);
      }
    }
  }

  // 몬스터 순차적 출발
  static monsterFrame(bctx) {
    if (!gameFrameLoop) return;

    let activeMonsterCount = 0;

    let moving = setInterval(() => {
      if (activeMonsterCount < Monster.monsters.length) {
        Monster.monsters[activeMonsterCount].isMoving = true;
        activeMonsterCount++;
      }

      if (
        activeMonsterCount >= Monster.monsters.length ||
        Monster.monsters.length === 0
      ) {
        clearInterval(moving);
      }
    }, 500);

    // 몬스터 이동 및 제거
    for (let i = Monster.monsters.length - 1; i >= 0; i--) {
      let monster = Monster.monsters[i];

      if (monster.isMoving) {
        monster.move();
      }
      monster.draw(bctx);

      if (monster.pathIndex >= Monster.path.length) {
        Monster.monsters.splice(i, 1);
        Status.lifeUpdate((Status.life -= 1));
      }
    }

    if (Monster.monsters.length === 0) {
      // clearInterval(gameFrameInterval);
      // gameFrameLoop = false;
      Status.waveUpdate((Status.wave += 1));
      Status.checkWave();
      console.log("monster 0");
    }
  }
}

class Status {
  static stage = 1; // 현재 스테이지 // 디폴트 1
  static wave = 1; // 현재 웨이브 // 디폴트 1
  static life = 3; // 라이프 // 디폴트 3
  static gold = 0; // 보유 골드 // 디폴트 0

  static statusUpdate(stage, wave, life, gold) {
    Status.stage = stage;
    Status.wave = wave;
    Status.life = life;
    Status.gold = gold;
  }

  static waveUpdate(wave) {
    let waveBar = document.getElementsByClassName("statusbar")[1];
    Status.wave = wave;
    waveBar.innerText = `Wave : ${Status.wave}`;
  }

  static lifeUpdate(life) {
    let lifeBar = document.getElementsByClassName("statusbar")[2];
    Status.life = life;
    lifeBar.innerText = `life : ${Status.life}`;
  }

  static goldUpdate(gold) {
    let goldBar = document.getElementsByClassName("statusbar")[3];
    Status.gold = gold;
    goldBar.innerText = `Gold : ${Status.gold}`;
  }

  static display() {
    let stage = document.getElementsByClassName("statusbar")[0];
    let wave = document.getElementsByClassName("statusbar")[1];
    let life = document.getElementsByClassName("statusbar")[2];
    let gold = document.getElementsByClassName("statusbar")[3];

    stage.innerText = `Stage : ${Status.stage}`;
    wave.innerText = `Wave : ${Status.wave}`;
    life.innerText = `life : ${Status.life}`;
    gold.innerText = `Gold : ${Status.gold}`;
  }

  // 라이프가 0이 되면 게임 종료
  static checkLife() {
    if (Status.life <= 0) {
      clearInterval(drawFrame);
      clearInterval(gameFrameInterval);
      document.getElementsByClassName("container")[0].style.opacity = "0.1";
      let endpage = document.createElement("div");
      endpage.style =
        "position: absolute; top:20%;width:100%;text-align: center; background-color: black; color: white; vertical-align: middle;";
      endpage.innerHTML = "<h1>Game Over</h1>";
      document.body.appendChild(endpage);
    }
  }

  // 웨이브 모두 클리어시 게임 종료
  static checkWave() {
    if (Status.wave > 10) {
      clearInterval(drawFrame);
      clearInterval(gameFrameInterval);
      document.getElementsByClassName("container")[0].style.display = "none";
      let clearpage = document.createElement("div");
      clearpage.style =
        "text-align: center; background-color: black; color: white; vertical-align: middle;";
      clearpage.innerHTML = "<h1>모든 웨이브를 클리어 했습니다 !! </h1>";
      document.body.appendChild(clearpage);
    }
  }
}

// 캔버스
/** @type {HTMLCanvasElement} */
const bcvs = document.getElementById("canvas");
const bctx = bcvs.getContext("2d");
const bcvsW = 1000;
const bcvsH = 600;

// topbar에 수치 표시
function statusDisplay() {
  Status.statusUpdate(1, 1, 3, 30);
  Status.display();
}

// 판매버튼 및 기능 // 타워 이미지가 안사라짐
const sellBtn = document.getElementsByClassName("mainbutton2")[0];
let sellMode = false;

sellBtn.addEventListener("click", () => {
  if (!sellMode) {
    sellMode = true;
    sellBtn.style.border = "1px solid yellow";
  } else {
    sellMode = false;
    sellBtn.style.border = "";
  }
  console.log(sellMode);
});

let interval2;

bcvs.addEventListener("click", function sellTower(e) {
  // 판매가능 상태 확인
  if (!sellMode) return;

  // 타워 인덱스를 찾을 기준 좌표
  let stX;
  let stY;

  for (let i = 0; i < Tile.tiles.length; i++) {
    // 마우스 클릭한 곳의 좌표가 각각 타일의 범위 안에 있다면
    if (
      Tile.tiles[i].midX + Tile.tileSize / 2 > e.offsetX &&
      Tile.tiles[i].midY + Tile.tileSize / 2 > e.offsetY &&
      Tile.tiles[i].midX - Tile.tileSize / 2 < e.offsetX &&
      Tile.tiles[i].midY - Tile.tileSize / 2 < e.offsetY
    ) {
      //해당 타일의 기준 좌표 설정
      Tile.tiles[i].isInstallable = true;
      stX = Tile.tiles[i].midX;
      stY = Tile.tiles[i].midY;

      // 해당 좌표에 있는 타워 찾아내서 제거
      for (let j = 0; j < Tower.towers.length; j++) {
        if (Tower.towers[j].x == stX && Tower.towers[j].y == stY) {
          Status.goldUpdate((Status.gold += Tower.towers[j].gold));
          console.log(Status.gold);

          Tower.towers.splice(j, 1);
          drawState();
          return;
        }
      }
    }
  }
});

// 우측 타워 아이템 클릭 이벤트
const towerClass = document.getElementsByClassName("item");
let hasItem = false;
let selectedImgSrc = ""; // 선택한 타워 이미지 저장

// 우측 타워 아이템 클래스 전체를 돌며 이벤트 설정
for (let i = 0; i < towerClass.length; i++) {
  towerClass[i].addEventListener("click", function (e) {
    if (hasItem) return; // 구입된 상태에서 중복 구매되는거 방지

    // 클릭한 부분이 타워 이미지일 경우에만 진행
    if (Array.from(document.querySelectorAll(".itemimg")).includes(e.target)) {
      if (Status.gold >= e.target.alt.split(";")[0]) {
        selectedImgSrc = e.target.src; // 선택한 이미지 저장
        hasItem = true;
        Status.goldUpdate(
          (Status.gold -= parseInt(e.target.alt.split(";")[0]))
        );
        console.log("구매성공, 남은 골드 :", Status.gold);

        //ks//
        img = new Image();
        img.width = Tower.towerSize;
        img.height = Tower.towerSize;
        img.src = e.target.src;
        img.style.position = "absolute";

        moveImageListener = function (event) {
          document.body.appendChild(img);
          img.style.left = event.clientX + 10 + "px";
          img.style.top = event.clientY - 100 + "px";
        };
        document.addEventListener("mousemove", moveImageListener);
        //ks//

        bcvs.addEventListener(
          "click",
          function placeTower(event) {
            //ks//
            document.removeEventListener("mousemove", moveImageListener);
            document.body.removeChild(img);
            //ks//

            // 아이템을 구매한 상태인 경우
            if (hasItem) {
              for (let i = 0; i < Tile.tiles.length; i++) {
                // 마우스 클릭한 곳의 좌표가 각각 타일의 범위 안에 있다면
                if (
                  Tile.tiles[i].midX + Tile.tileSize / 2 > event.offsetX &&
                  Tile.tiles[i].midY + Tile.tileSize / 2 > event.offsetY &&
                  Tile.tiles[i].midX - Tile.tileSize / 2 < event.offsetX &&
                  Tile.tiles[i].midY - Tile.tileSize / 2 < event.offsetY
                ) {
                  // 해당 타일이 타워를 설치 가능한 곳인지 확인 후 현재 구매한 타워의 이미지 생성
                  if (Tile.tiles[i].isInstallable) {
                    let img = new Image();
                    img.width = Tower.towerSize;
                    img.height = Tower.towerSize;
                    img.src = selectedImgSrc; // 현재 선택된 이미지 적용

                    // 타워 인스턴스 생성 (이미지, x, y, )
                    let tower = new Tower(
                      img,
                      Tile.tiles[i].midX,
                      Tile.tiles[i].midY,
                      parseInt(e.target.alt.split(";")[4]),
                      parseInt(e.target.alt.split(";")[1]),
                      parseInt(e.target.alt.split(";")[2]),
                      parseInt(e.target.alt.split(";")[3]),
                      parseInt(e.target.alt.split(";")[0])
                    );
                    tower.draw(bctx);
                    Tower.towers.push(tower);
                    Tile.tiles[i].isInstallable = false; // 타워가 설치되면 해당 타일은 설치 불가 상태로 변경
                    hasItem = false; // 현재 구매한 아이템 비워주기

                    bcvs.removeEventListener("click", placeTower);
                    console.log("타워 설치");
                    console.log(Tower.towers);
                    return;
                  } else {
                    console.log("타워 설치 불가");
                    hasItem = false;
                    Status.goldUpdate(
                      (Status.gold += parseInt(e.target.alt.split(";")[0]))
                    ); // 설치 실패시 해당 타워의 금액 환불
                    console.log(hasItem, Status.gold);
                  }
                }
              }
            }
          },
          { once: true } // 이벤트 한 번만 실행되게 설정
        );
      } else {
        console.log("골드 부족, 보유 골드 :", Status.gold);
      }
    } else {
      return;
    }
  });
}

// 기본 상태 -> 맵, 타워 그리기
function drawState() {
  Tile.drawMap(bctx);
  Tower.towers.forEach((tower) => tower.draw(bctx));
  // console.log("drawState");
}

// 게임진행 프레임 그리기
function drawFrame() {
  Tower.updateTowers();
  Projectile.updateProjectiles(bctx);
  Monster.monsterFrame(bctx);
  Status.display();
  // console.log("drawFrame");

  if (Monster.monsters.length === 0) {
    stopGameFrameLoop();
  }

  drawState();
}

function stopGameFrameLoop() {
  if (gameFrameLoop) {
    clearInterval(gameFrameInterval);
    gameFrameLoop = false;
    // drawState();

    console.log("stopGameFrameLoop");
    interval = setTimeout(() => {
      Tower.towers.forEach((tower) => tower.draw(bctx));
    }, 1);
  }
}

// 메인 화면 초기화
function init() {
  Tile.setting();
  statusDisplay();
  drawState();
  console.log("init");
}
let interval;

let isStart = false;
if (!isStart) {
  init();
  isStart = true;
}

// 캔버스 루프 작동 여부
let gameFrameLoop = false;

// 인터벌 설정
let gameFrameInterval;

// 메인화면 시작하기 버튼
const startBtn = document.getElementsByClassName("mainbutton")[0];

startBtn.addEventListener("click", () => {
  console.log("start");
  Status.checkWave();
  Monster.setMonsters(
    Monster.monstersbywave[Status.wave],
    Tile.tiles[10].midX - 150,
    Tile.tiles[10].midY,
    Monster.wavebyhp[Status.wave],
    Monster.wavebyspeed[Status.wave]
  );
  if (!gameFrameLoop) {
    gameFrameLoop = true;
    Projectile.projectiles = [];
    gameFrameInterval = setInterval(() => {
      Status.checkLife();
      drawFrame();
    }, 1000 / 244);
  } else {
    drawState();
  }
});
