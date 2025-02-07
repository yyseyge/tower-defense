import * as Tile from "./Tile.js";

// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");

 let monsterArray=[]; //몬스터 객체 담아놓을 배열
export class Monster { //몬스터 class생성
    constructor(life,posX,posY)  //몬스터 속성으로 생명, x위치값, y위치값 필요 
    {
        this.life=life; //몬스터의 생명은 매개변수로 받는 life임
        this.posX=posX; //몬스터의 posX는 매개변수로 받음
        this.posY=posY; //몬스터의 posY도 매개변수로 받음
        //let img = new Image(); //let으로 img 변수 설정해놓으면 지역변수이므로constructor가 끝나면 다른 메소드에서 조회 불가능
        this.img=new Image(); // 이렇게 this.img로 속성값 설정해야지 다른 메소드에서도 불러올수 있음.
        img.src="https://png.pngtree.com/png-clipart/20190618/original/pngtree-anime-character-campus-game-character-anime-comic-hand-drawn-png-image_3923580.jpg"; //몬스터 객체의 이미지는 속성값으로 고정정, 
    }

    init(life,posX,posY,count) //몬스터 생성 함수 , 맵에서 게임 시작되면 몬스터 생성 함수 호출
    {
        this.createMonster(life,posX,posY,count);  //매개변수로 받은 생명력,x,y,몇마리만들지count를 createMonster에 전달달
    }

    createMonster(life,posX,posY,count){  //몬스터 객체를 count 수 만큼 생성하는 함수, 몬스터 객체 50개가 배열에 담긴다. 이미지 사진은 아직 canvas에 로드되지 않음, 객체 만들어지는 순간 setInterval줘서 이미지 사진 두개 설정해서 걷는것 처럼 보이게 설정. 
        for (let i = 0; i < count; i++){ //매개변수로 받은 count만큼 몬스터 객체 생성
            let monster=new Monster(life,posX,posY); //매개변수로 받은 life,x,y좌표  동일하게 생성
            monsterArray.push(monster);  //배열에 넣어놓음.
        } 
    }

    drawMonster(count)  //실제 몬스터의 이미지를 캔버스에 50개 그리는 함수 
    {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        img.onload=function() {
            for(let i=0; i<count;i++)
            {
                ctx.drawImage(img,500,500,40,40);
            }
        }
    }

    // monsterAni(){
    //     console.log("시작작")
    //     //requestAnimationFrame(monsterAni);
    // }

    // move()
    // {
    //     console.log("이동");

    // }
    
    // getDamage() //맵에서 몬스터 데미지 입었다는 신호 오면 함수 호출
    // {
    //     console.log("맞맞음");

    // }

    // die() //맵에서 몬스터 객체 사망 판정이 나오면 함수 호출 
    // {
    //     console.log("죽음");

    // }
}





// for (let i = 0; i < count; i++) {
//     let img = new Image();
//     aa.push(img);
   
//     img.onload = function() {
//         x = Math.random() * (canvas.width - 50);  // 랜덤 X 좌표
//         y = Math.random() * (canvas.height - 50); // 랜덤 Y 좌표
//         ctx.drawImage(img, x, y, 40, 40);  // (x, y, width, height)로 그리기
        
//     };
// }
// document.getElementsByTagName('button')[0].addEventListener('click',()=>setInterval("i()",100) );




// function i()
// {
    
   
//    ctx.clearRect(0,0,canvas.width,canvas.height);
//    for (let i = 0; i < count; i++) {
//        x = Math.random() * (canvas.width - 50);  // 랜덤 X 좌표
//        y = Math.random() * (canvas.height - 50); // 랜덤 Y 좌표
       
//        ctx.drawImage(aa[i],x,y,40,40);
   
   
// }
// }