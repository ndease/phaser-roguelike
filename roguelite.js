
var config = {
    type: Phaser.AUTO,
    width: 1280,
    height:720,
    backgroundColor: 'gray',
    physics: {
        default: 'arcade'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var xp = 0;
var xpNextLevel = 50;
var enemies;
var spawnTimer = 0;
var enemyLvl=1;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var fireRate = 0;
var bullet;
var game = new Phaser.Game(config);

//Character stats
var playerLvl = 1;
var damageModifier = 4;
var currentHP = 100;
var maxHP = 100;
var strength = 10;
var dexterity = 10;
var vitality = 10;
var magic = 10;

//Items
var playerPotions = 3;

function preload ()
{
    this.load.image('field', 'assets/field.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.spritesheet('hero', 'assets/hero.png', {frameWidth:32, frameHeight:32});
    this.load.spritesheet('bullet', 'assets/bullet.png', {frameWidth:32, frameHeight:32});
    this.load.spritesheet('xpPoint', 'assets/xp.png', {frameWidth:32, frameHeight:32});
    this.load.image('drop','assets/drop.png'), { frameWidth: 25, frameHeight: 25 };
    this.load.image('potion','assets/potion.png');
}

function create ()
{
    keys = this.input.keyboard.addKeys("W,A,S,D,Q");
    this.add.image(640, 360, 'field').setScale(1);
    player = this.physics.add.sprite(640, 360, 'hero');
    player.setCollideWorldBounds(true);
    this.cameras.main.setSize(1280, 720);
    this.cameras.main.startFollow(player);
    this.cameras.main.setZoom(1.4);
    this.anims.create({
      key:'xp',
      frames: this.anims.generateFrameNumbers('xpPoint', {start:0, end:5}),
      frameRate:10,
      repeat: -1
    })
    this.anims.create({
      key:'bullet',
      frames: this.anims.generateFrameNumbers('bullet', {start:0, end:3}),
      frameRate:20,
      repeat: -1
    })
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('hero', {start:0, end:3}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: this.anims.generateFrameNumbers('hero', {start:0, end:3}),
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('hero', {start:0, end:3}),
        frameRate: 10,
        repeat: -1
    });
    cursors = this.input.keyboard.createCursorKeys();
    enemies = this.physics.add.group();
    // enemies.children.iterate(function (child) {
    //   const circle = new Phaser.Geom.Circle(200, 300, 1030);
    //   //  Randomly position the sprites within the circle
    //      Phaser.Actions.PlaceOnCircle(enemies.getChildren(), circle);
    //
    // });

    bullets = this.physics.add.group();
    xpPoint = this.physics.add.group();
    potions = this.physics.add.group();
    barriers = this.physics.add.static;

    this.physics.add.collider(enemies, barriers);
    this.physics.add.overlap(player, enemies, collectenemy, null, this);
    this.physics.add.overlap(player, xpPoint, collectXP, null, this);
    this.physics.add.overlap(player, potions, getPotion, null, this);
    this.physics.add.overlap(bullets, enemies, enemyHit, null, this);
    // var enemies = this.physics.add.group(
    //   { key: 'enemy',
    //    repeat: 300 }
    //  );
    // const circle = new Phaser.Geom.Circle(200, 300, 1030);
    // //  Randomly position the sprites within the circle
    //    Phaser.Actions.RandomCircle(enemies.getChildren(), circle);


//**********************Heads Up Display ****************************************
  hpText = this.add.text(player.x-35, player.y-50, "HP: " + currentHP + "/" + maxHP, {fontSize:'16px', fill: '#000'});
  lvlText =this.add.text(0, 0, "LVL: " + playerLvl, {fontSize:'16px', fill: '#000'});
  scoreText = this.add.text(0, 0, 'score: 0', { fontSize: '16px', fill: '#000' });
  potionText = this.add.text(0,0, 'Potions: ' + playerPotions,{fontSize: '16px', fill:'#000'});

  this.input.keyboard.on('keydown-Q', function (event){
      quaffPotion();
    });
}

function update ()
{

//**********************SHOOTIN********************************************
fireRate++;

if (fireRate>10)
  {
      shoot();
      fireRate=0;
  }

function shoot(){
  if (cursors.left.isDown)
  {
      this.bullets.create(player.x,player.y,'bullet').setVelocityX(-400).anims.play('bullet', true).setScale(dexterity/100+1).angle = 180;
  }
  else if (cursors.right.isDown)
  {
        this.bullets.create(player.x,player.y,'bullet').setVelocityX(400).anims.play('bullet', true).setScale(dexterity/100+1);

  }
  else if (cursors.up.isDown)
  {
    this.bullets.create(player.x,player.y,'bullet').setVelocityY(-400).anims.play('bullet', true).setScale(dexterity/100+1).angle=270;
  }
  else if (cursors.down.isDown)
  {
    this.bullets.create(player.x,player.y,'bullet').setVelocityY(400).anims.play('bullet', true).setScale(dexterity/100+1).angle=90;

  }
}

//****************ENEMIES AND ENEMY BEHAVIOR********************************

spawnTimer++;

if (spawnTimer>300 && enemies.countActive(true) <= 100){
  enemyLvl++;
  for (var i=0; i<2; i++){
    createEnemy();
    spawnTimer=0;
  }
  function createEnemy() {
    enemies.create(player.x+game.config.width/2+Phaser.Math.Between(0,100),player.y+Phaser.Math.Between(-1000,1000), 'enemy').health=1*enemyLvl;
    enemies.create(player.x-game.config.width/2-Phaser.Math.Between(0,100),player.y-Phaser.Math.Between(-1000,1000), 'enemy').health=1*enemyLvl;
    enemies.create(player.x+Phaser.Math.Between(-1000,1000),player.y-game.config.height/2-Phaser.Math.Between(0,100), 'enemy').health=1*enemyLvl;
    enemies.create(player.x+Phaser.Math.Between(-1000,1000),player.y+game.config.height/2+Phaser.Math.Between(0,100), 'enemy').health=1*enemyLvl;
  }
}

if (gameOver!=true){
  for (let i=0; i<enemies.children.entries.length;i++) {
  enemies.children.entries[i].setVelocityX((player.x - enemies.children.entries[i].x)*.2);
  enemies.children.entries[i].setVelocityY((player.y - enemies.children.entries[i].y)*.2);
}
}

//****************Character Advancement**************************//
//leveling up
if (xp>=xpNextLevel){
  playerLvl+=1;
  damageModifier=damageModifier+damageModifier*.2;
  lvlText.setText('LVL: ' + playerLvl);
  xpNextLevel= xpNextLevel+xpNextLevel*.25;
  dexterity+=10;
}


// *******************ENDING THE GAME************************
if (currentHP <= 0) {
  gameOver=true;
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('turn');
}

    if (gameOver)
    {
        return;
    }

//*****************PLAYER MOVEMENT**************************

  player.setVelocity(0);
  player.anims.play('right', true);

if (keys.W.isDown){
  player.setVelocityY(-100);
  // player.anims.play('right', true);
}
else if (keys.S.isDown){
  player.setVelocityY(100);
  // player.anims.play('left', true);
}

if (keys.A.isDown){
  player.setVelocityX(-100);
  // player.anims.play('left', true);
}

else if (keys.D.isDown){
  player.setVelocityX(100);
  // player.anims.play('right', true);
}
else{
  // player.anims.play('turn');
}


  //*******************Display stats*****************************
      hpText.setPosition(player.x-35,player.y-50);
      scoreText.setPosition(player.x-35,player.y-65);
      lvlText.setPosition(player.x-35,player.y-80);
      potionText.setPosition(player.x-35,player.y-95);

}

function collectenemy (player, enemy)
{
    enemy.health-=1;
    if (enemy.health<=0){
    enemy.disableBody(true, true);
  }
    //  Add and update the score
    score += 10;
    currentHP -=1;
    scoreText.setText('Score: ' + score);
    hpText.setText('HP: ' + currentHP + "/" + maxHP);

    // if (enemies.countActive(true) <= 250)
    // {
    //     //  A new batch of enemies to collect
    //     enemies.children.iterate(function (child) {
    //         // child.enableBody(true, child.x, 0, true, true);
    //         const rectangle = new Phaser.Geom.Rectangle(player.x-150, player.y-150, 1000, 1000);
    //         Phaser.Actions.PlaceOnRectangle(enemies.getChildren(), rectangle);
    //     });
    // }
}

function collectXP(player, xpPoint){
    xp+=1;
    xpPoint.disableBody(true,true);
}

function getPotion(player, potion){
  playerPotions+=1;
  potion.disableBody(true,true);
  potionText.setText('Potions: ' + playerPotions);
}

function enemyHit (bullets, enemy){
  enemy.health-=1*damageModifier;
  bullets.disableBody(true, true);
  enemy.setTint(0xff0000);
  let damageText = this.add.text(enemy.x+Phaser.Math.Between(-20,20), enemy.y-50+Phaser.Math.Between(-20,20), 1*damageModifier).setFontSize(24).setFontFamily("Times").setColor("yellow").setShadow(2, 2, 'rgba(0,0,0,1)', 1);
  this.tweens.add({
          targets: damageText,
          alpha: 0,
          duration: 1000,
          ease: 'Power2'
        }, this);
  if (enemy.health<=0){
   var particles = this.add.particles('drop');
   particles.createEmitter({
        angle: { start: 0, end: 360, steps: 15 },
        lifespan: 200,
        speed: 400,
        quantity: 32,
        scale: { start: 1, end: 0 },
        on: false
    });
  particles.emitParticleAt(enemy.x, enemy.y);

  enemy.disableBody(true, true);
  xpPoint.create(enemy.x,enemy.y, 'xpPoint').anims.play('xp', true).setScale(.8);
  let rng = Phaser.Math.Between(0,1000);
  if (rng >= 995){
    potions.create(enemy.x,enemy.y, 'potion');
  }
  score += 10;
  scoreText.setText('Score: ' + score);
}
}

function quaffPotion() {
  if (playerPotions >= 1){
    currentHP+=50;
    playerPotions--;
    if (currentHP>maxHP){
      currentHP=maxHP;
    }
    potionText.setText('Potions: ' + playerPotions);
    hpText.setText('HP: ' + currentHP + "/" + maxHP);
  }

}
