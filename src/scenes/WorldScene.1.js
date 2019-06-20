/* jshint esversion:6*/
import { CST } from "../CST.js";
import thisGame from "../main.js";
import { UIScene } from "./UIScene.js";

export class WorldScene extends Phaser.Scene{
	constructor(){
        super({
            key: CST.SCENES.WORLD
        });

    }

    init(){
        console.log("World loading...");
        this.npcText = null;
        this.liikumine = true;

        //Healthbar:
        this.playerHealth = 100; // player health for health bar
        this.playerHealthMax = 100; // player health max
        this.firstTime = null;

        //Quest:
        this.talking = 0;
        this.quest1 = 0;
        this.text = null;
        this.talkedToKing = false;
        this.questUI;

        //graphics
        this.map = null;
        this.tiles = null;
        this.grass = null;
        this.obstacles = null;
        this.graphics = 0;
        this.graphicsText = 0;

        //Mobs and karma mechanics
        this.chickenCount = 69; // amount of chickens spawned
        this.enemyCount = 15; // amount of enemies spawned
        this.enemiesKilled = 0; // enemies killed, gameover reaction
        this.karma = 0; // karma points for game purpose
        this.updateCounter = 0; // timing counter
        this.talkToOneNPCAtATime = true; // so can´t talk to multiple NPCS at a time
        this.talkCounter = 0;

        this.checkHealth = 100;

        this.checkDialog = false;
    }

    preload(){

        // create the map
        this.map = this.make.tilemap({
            key: 'map'
        });

        // first parameter is the name of the tilemap in tiled
        this.tiles = this.map.addTilesetImage('spritesheet', 'tiles');

        // creating the layers
        this.grass = this.map.createStaticLayer('Grass', this.tiles, 0, 0);
        this.obstacles = this.map.createStaticLayer('Obstacles', this.tiles, 0, 0);

        // make all tiles in obstacles collidable
        this.obstacles.setCollisionByExclusion([-1]);

        //  animation with key 'left', we don't need left and right as we will use one and flip the sprite
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [12, 13, 14, 15]
            }),
            frameRate: 10,
            repeat: -1
        });

        // animation with key 'right'
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [8, 9, 10, 11]
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [4, 5, 6, 7]
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [0, 1, 2, 3]
            }),
            frameRate: 10,
            repeat: -1
        });

        // for chicken

        this.anims.create({
            key: 'chickenLeft',
            frames: this.anims.generateFrameNumbers('chicken', {
                frames: [4, 5, 6, 7]
            }),
            frameRate: 10,
            repeat: -1
        });

        // animation with key 'right'
        this.anims.create({
            key: 'chickenRight',
            frames: this.anims.generateFrameNumbers('chicken', {
                frames: [4, 5, 6, 7]
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'chickenUp',
            frames: this.anims.generateFrameNumbers('chicken', {
                frames: [8, 9, 10, 11]
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'chickenDown',
            frames: this.anims.generateFrameNumbers('chicken', {
                frames: [0, 1, 2, 3]
            }),
            frameRate: 10,
            repeat: -1
        });

        // for enemy

        this.anims.create({
            key: 'enemyLeft',
            frames: this.anims.generateFrameNumbers('enemy', {
                frames: [8, 9, 10, 11]
            }),
            frameRate: 10,
            repeat: -1
        });

        // animation with key 'right'
        this.anims.create({
            key: 'enemyRight',
            frames: this.anims.generateFrameNumbers('enemy', {
                frames: [8, 9, 10, 11]
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'enemyUp',
            frames: this.anims.generateFrameNumbers('enemy', {
                frames: [4, 5, 6, 7]
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'enemyDown',
            frames: this.anims.generateFrameNumbers('enemy', {
                frames: [0, 1, 2, 3]
            }),
            frameRate: 10,
            repeat: -1
        });

    }

    create(){
      	let uiScene = this.scene.get(CST.SCENES.UI);

        // our player sprite created through the phycis system

        this.player = this.add.existing(new Player(this, 700, 300));

        this.NPC_King = this.add.existing(new NPC(this, 700, 200, this.player));
        this.NPC_King.NPCType = "King";
        this.NPC_healer = this.add.existing(new NPC(this, 800, 200, this.player));
        this.NPC_healer.NPCType = "Healer";
        this.NPC_witch = this.add.existing(new NPC(this, 900, 200, this.player));
        this.NPC_witch.NPCType = "Witch";
        this.NPC_fool = this.add.existing(new NPC(this, 1000, 200, this.player));
        this.NPC_fool.NPCType = "Fool";

        let npcText = this.add.text(16, 16, 'tere', {
            fontSize: '32px',
            fill: '#000'
        });
        npcText.visible = false;

        this.chickens = this.add.group();
        this.enemies = this.add.group();
        this.npcs = this.add.group();

        this.npcs.add(this.NPC_healer); 
        this.npcs.add(this.NPC_fool);
        this.npcs.add(this.NPC_witch);
        this.npcs.add(this.NPC_King);

        for (let i = 0; i < this.chickenCount; i++) {
            let x = Phaser.Math.RND.between(500, 700);
            let y = Phaser.Math.RND.between(200, 400);

            let singleChicken = this.add.existing(new Chicken(this, x, y, this.player));
            this.physics.add.existing(singleChicken);
            this.chickens.add(singleChicken);

            if (i < this.enemyCount){
                console.log(i + " " + this.enemyCount);
                x = Phaser.Math.RND.between(900, 1300);
                y = Phaser.Math.RND.between(200, 400);
                let singleEnemy = this.add.existing(new Enemy(this, x, y, this.player));
                this.physics.add.existing(singleEnemy);
                this.enemies.add(singleEnemy);
            }
        }

        //treetops and stuff above player
        let top = this.map.createStaticLayer('Top', this.tiles, 0, 0);

        // don't go out of the map
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;
        this.player.setCollideWorldBounds(true);

        // don't walk on trees
        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.collider(this.chickens, this.obstacles);
        this.physics.add.collider(this.enemies, this.obstacles);
        this.physics.add.collider(this.npcs, this.obstacles);

        this.physics.add.collider(this.player, this.chickens, this.collide, false, this);
        this.physics.add.collider(this.player, this.enemies, this.collide, false, this);
        this.physics.add.collider(this.player, this.npcs, this.collide, false, this);

        // limit camera to map
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true; // avoid tile bleed

        // user input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keyT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);

        // quest UI addon
        let uiBackground = this.add.graphics();
        let rect = new Phaser.Geom.Rectangle(8, 30, 85, 25);
        uiBackground.fillStyle(0xFFFFFF, 0.75);
        uiBackground.fillRectShape(rect);
        uiBackground.fixedToCamera = true;
        uiBackground.setScrollFactor(0);
        this.questUITitle = this.add.text(10, 30, "Quest:", { fontFamily: 'Arial', fill: 'black', fontSize: 10, wordWrap: true }).setScrollFactor(0);
        this.questUI = this.add.text(10, 40, "Talk To The King", { fontFamily: 'Arial', fill: 'black', fontSize: 10, wordWrap: true }).setScrollFactor(0);

        this.questUITitle.fixedToCamera = true;
        this.questUI.fixedToCamera = true;

        console.log("WorldScene loaded"); // end
        }

    collide(player, enemy){
        this.attack(player, enemy);
        this.talk(player, enemy);
    }

    attack(player, enemy){
        if ((enemy.firstAttack || enemy.canAttack) && player.health > -1 ){
            enemy.collided = true;
            enemy.firstAttack = false;
            enemy.canAttack = false;
            player.health -= enemy.damage;

            player.visible = false;
            player.turnToVisible = true;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyE)){
            player.anims.play('enemyRight', true);
            enemy.health -= 1;   
            let newAttack = new Pow(this, player, enemy);
        }
    }

    talk(player, enemy) {
        let dialogue;

        if (enemy.NPCType === "Healer"){
            this.heal(player);
        }

        if (this.talkToOneNPCAtATime && enemy.canTalk){ // && enemy.canTalkAgain
            this.talkCounter = 0;
            enemy.canTalk = false;
            this.talkToOneNPCAtATime = false;
            if (enemy.NPCType === "King"){
                this.talkedToKing = true;
                dialogue = ["I´m the king", "Hello"];
            } else if (enemy.NPCType === "Healer"){
                dialogue = ["I´m the healer", "Hello"];
            } else if (enemy.NPCType === "Witch"){
                dialogue = ["I´m the witch", "Hello"];
            } else if (enemy.NPCType === "Fool"){
                dialogue = ["I´m the the fool", "Hello"];
            }

            let talk = new DialogBox(this, 5, 175, 35, dialogue, player, enemy); // scene, x, y, timing, dialogue array, player, enemy
            enemy.number = 0;
        }

        if (this.talkCounter > 150){
            this.talkToOneNPCAtATime = true;
        }
    }

    respawn (player) {
        this.player.x = 50;
        this.player.y = 100;
        this.bar2.width = 30;
        this.t = this.add.text(60, 100, "I AM ALIVE! ", {
            font: "30px Arial",
            fill: "red",
            align: "center"
        });
    }

    heal (player) {
            player.health = 100;
    }

    update(time, delta){

        this.updateCounter++;
        this.talkCounter++;

        if (this.talkedToKing){
            this.questUI.setText("Kill mobs " + this.enemiesKilled + "/" + this.enemyCount);
        }

        if (this.updateCounter == 100){
            this.updateCounter = 0;
        }

        if (this.enemiesKilled === this.enemyCount){
            this.scene.stop('UIScene');
            this.scene.stop('WorldScene');
            this.scene.start('EndScene');
        }
    }
}

class Player extends Phaser.Physics.Arcade.Sprite{
    constructor (scene, x, y){
        super(scene, x, y);
        this.scene = scene;

        this.gameScene = scene.scene.get(CST.SCENES.WORLD);
        this.health = this.gameScene.playerHealth;   

        this.setTexture('player');
        this.setPosition(x, y);
        scene.physics.world.enableBody(this, 0);
        this.body.collideWorldBounds = true;
        this.body.immovable = true;

        this.keys = this.scene.input.keyboard.createCursorKeys();
        this.speed = 200;
        this.movement = true;

        this.counter = 0;

        this.turnToVisible = false;
    }

    create(){

    }

    preUpdate(time, delta){
        super.preUpdate(time, delta);

        this.counter++;

        if (this.turnToVisible){
            this.turnToVisible = false;
            this.counter = 0;
        }

        if (this.counter == 5){
            this.visible = true;
        }

        this.gameScene.playerHealth = this.health;

        this.body.setVelocity(0);

        //Player movement
        // Horizontal movement
        if (this.keys.left.isDown) {
            this.body.setVelocityX(-this.speed);
        } else if (this.keys.right.isDown) {
            this.body.setVelocityX(this.speed);
        }

        // Vertical movement
        if (this.keys.up.isDown) {
            this.body.setVelocityY(-this.speed);
        } else if (this.keys.down.isDown) {
            this.body.setVelocityY(this.speed);
        }

        // Update the animation last and give left/right animations precedence over up/down animations
        if (this.keys.left.isDown) {
            this.anims.play('left', true);
            this.flipX = false;
        } else if (this.keys.right.isDown) {
            this.anims.play('right', true);
            this.flipX = false;
        } else if (this.keys.up.isDown) {
            this.anims.play('up', true);
        } else if (this.keys.down.isDown) {
            this.anims.play('down', true);
        } else {
            this.anims.stop();
        }
    }
}

class NPC extends Phaser.Physics.Arcade.Sprite{
    constructor (scene, x, y, player){
        super(scene, x, y);

        this.setTexture('enemy');
        this.setPosition(x, y);
        scene.physics.world.enableBody(this, 0);
        this.body.collideWorldBounds = true;
        this.body.immovable = true;
        this.keys = this.scene.input.keyboard.createCursorKeys();
        this.body.immovable = true;

        this.scene = scene; // scene object
        this.player = player; // player object

        this.speed = 200; // object speed
        this.karma = -1; // object karma point influence
        this.health = 5; // object health
        this.canAttack = false; // if NPC is able to attack
        this.canTalk = true; // dialogue, so it won´t start talking multiple times
        this.NPCType = "";

        this.collided = false; // collision with player check

        this.counter = 0;
    }

    create(){

    }

    preUpdate(time, delta){
        super.preUpdate(time, delta);
        this.counter += 1;

        if (this.counter === 100){
            this.counter = 0;
        }

        this.body.setVelocity(0);

        this.checkAlive();
    }

    checkAlive(){
        if (this.health <= 0){
            this.disableBody(true, true);
            this.scene.karma += this.karma;
        }
    }

    follow(player){
        this.scene.physics.moveToObject(this, player, 80);
    }
}

class Chicken extends Phaser.Physics.Arcade.Sprite{
    constructor (scene, x, y, player){
        super(scene, x, y);

        this.setTexture('chicken');
        this.setPosition(x, y);
        scene.physics.world.enableBody(this, 0);
        this.body.collideWorldBounds = true;
        this.keys = this.scene.input.keyboard.createCursorKeys();

        this.damage = 5; // object damage
        this.speed = 10; // object movement speed
        this.health = 2; // object health
        this.karma = 1; // object karma point
        this.NPCType = "Chicken";

        this.direction = 0; // moving direction
        this.firstTime = true; // first time launch to start moving without timer
        this.firstAttack = true;
        this.canAttack = true;

        this.interval = Phaser.Math.RND.between(50, 100); // choosing when to switch direction (timer based)
        this.previousTimer = 0; // timers for events
        this.counter = 0; // counter for events

        this.collided = false; // used for following
        this.player = player; // used for following the player

        this.minX = 500;
        this.maxX = 700;
        this.minY = 200;
        this.maxY = 400;
    }

    create(){

    }

    preUpdate(time, delta){
        super.preUpdate(time, delta);
        this.previousTimer += 1;
        this.counter += 1;

        if (this.counter == 100){
            this.canAttack = true;
            this.counter = 0;
        }

        if (!this.collided){
            this.randomRoaming();
            //this.maxBounds();
        } else {
            this.follow(this.player);
    
            if (this.body.velocity.x > 0){

                this.anims.play('chickenRight', true);
                this.flipX = false;
    
            } else if (this.body.velocity.x < 0){
    
                this.anims.play('chickenLeft', true);
                this.flipX = true;
    
            }
        }

        this.checkAlive();
    }

    follow(player){
        this.scene.physics.moveToObject(this, player, 80);
    }

    checkAlive(){
        if (this.health <= 0){
            this.disableBody(true, true);
            this.scene.karma += this.karma;
        }
    }

    maxBounds(){
        if (this.x > this.maxX){
            this.anims.play('chickenRight', true);
            this.flipX = true;
            this.previousTimer = 0;
            this.makeNPCMove(-this.speed, 0);
        } else if (this.x < this.minX){
            this.anims.play('chickenRight', true);
            this.flipX = false;
            this.previousTimer = 0;
            this.makeNPCMove(this.speed, 0);
        }
        if (this.y > this.maxY){
            this.anims.play('chickenUp', true);
            this.previousTimer = 0;
            this.makeNPCMove(0, -this.speed);
        } else if (this.y < this.minY){
            this.anims.play('chickenDown', true);
            this.previousTimer = 0;
            this.makeNPCMove(0, this.speed);
        }
    }

    randomRoaming(){
        if (this.previousTimer == this.interval || this.firstTime){
            this.firstTime = false;
            this.direction = Phaser.Math.RND.between(0, 8);
            if (this.direction == 1){ // right
                this.makeNPCMove(this.speed, 0);

                this.anims.play('chickenRight', true);
                this.flipX = false;

            } else if (this.direction == 2){ // left

                this.makeNPCMove(-this.speed, 0);
                this.anims.play('chickenRight', true);
                this.flipX = true;

            } else if (this.direction == 3){ // down

                this.makeNPCMove(0, this.speed);
                this.anims.play('chickenDown', true);

            } else if (this.direction == 4){ // up

                this.makeNPCMove(0, -this.speed);
                this.anims.play('chickenUp', true);

            } else if (this.direction == 5){

                this.makeNPCMove(this.speed, -this.speed);
                this.anims.play('chickenRight', true);
                this.flipX = false;

            } else if (this.direction == 6){

                this.makeNPCMove(this.speed, this.speed);
                this.anims.play('chickenRight', true);
                this.flipX = false;

            } else if (this.direction == 7){

                this.makeNPCMove(-this.speed, -this.speed);
                this.anims.play('chickenLeft', true);
                this.flipX = true;

            } else if (this.direction == 8){

                this.makeNPCMove(-this.speed, this.speed);
                this.anims.play('chickenLeft', true);
                this.flipX = true;

            }
            this.previousTimer = 0;
        }
    }

    makeNPCMove(x, y){
        this.body.setVelocityX(x);
        this.body.setVelocityY(y);
    }
}

class Enemy extends Phaser.Physics.Arcade.Sprite{
    constructor (scene, x, y, player){
        super(scene, x, y);

        this.setTexture('enemy');
        this.setPosition(x, y);
        scene.physics.world.enableBody(this, 0);
        this.body.collideWorldBounds = true;
        this.keys = this.scene.input.keyboard.createCursorKeys();
        this.player = player;

        this.speed = 80; // object speed
        this.karma = 2; // object karma point
        this.health = 2; // object health
        this.damage = 24; // object damage
        this.NPCType = "Enemy";

        this.collided = false; // used for following

        this.firstTime = true; // first time movement
        this.canAttack = true;
        this.firstAttack = true;

        this.interval = Phaser.Math.RND.between(50, 100); // random timed movement
        this.direction = 0; // random moving direction
        this.previousTimer = 0; // counter
        this.counter = 0;


    }

    create(){

    }

    preUpdate(time, delta){
        super.preUpdate(time, delta);
        this.previousTimer++;
        this.counter++;

        if (this.counter == 100){
            this.canAttack = true;
            this.counter = 0;
        }

        if (!this.collided){
            this.randomRoaming();
        } else {
            this.follow(this.player);
    
            if (this.body.velocity.x > 0){

                this.anims.play('enemyRight', true);
                this.flipX = false;
    
            } else if (this.body.velocity.x < 0){
    
                this.anims.play('enemyLeft', true);
                this.flipX = true;
    
            }
        }

        this.checkAlive();
    }

    follow(player){
        this.scene.physics.moveToObject(this, player, 80);
    }

    checkAlive(){
        if (this.health <= 0){
            this.disableBody(true, true);
            this.scene.karma += this.karma;
            this.scene.enemiesKilled++;
        }
    }

    randomRoaming(){

        if (this.previousTimer == this.interval || this.firstTime){
            this.firstTime = false;
            this.direction = Phaser.Math.RND.between(0, 8);
            if (this.direction == 1){ // right
                this.makeNPCMove(this.speed, 0);

                this.anims.play('enemyRight', true);
                this.flipX = false;

            } else if (this.direction == 2){ // left

                this.makeNPCMove(-this.speed, 0);
                this.anims.play('enemyLeft', true);
                this.flipX = true;

            } else if (this.direction == 3){ // down

                this.makeNPCMove(0, this.speed);
                this.anims.play('enemyDown', true);

            } else if (this.direction == 4){ // up

                this.makeNPCMove(0, -this.speed);
                this.anims.play('enemyUp', true);

            } else if (this.direction == 5){

                this.makeNPCMove(this.speed, -this.speed);
                this.anims.play('enemyRight', true);
                this.flipX = false;

            } else if (this.direction == 6){

                this.makeNPCMove(this.speed, this.speed);
                this.anims.play('enemyRight', true);
                this.flipX = false;

            } else if (this.direction == 7){

                this.makeNPCMove(-this.speed, -this.speed);
                this.anims.play('enemyLeft', true);
                this.flipX = true;

            } else if (this.direction == 8){

                this.makeNPCMove(-this.speed, this.speed);
                this.anims.play('enemyLeft', true);
                this.flipX = true;

            }

            this.previousTimer = 0;
        }
    }

    makeNPCMove(x, y){
        this.body.setVelocityX(x);
        this.body.setVelocityY(y);
    }
}

class DialogBox extends Phaser.GameObjects.Graphics{
    constructor(scene, x, y, timing, texts, player, enemy){
        super(scene);
        scene.add.existing(this);
        this.scene = scene;
        this.player = player;
        this.enemy = enemy;

        this.x = x;
        this.y = y;

        this.texts = texts;
        this.textsLength = this.texts.length;
        this.drawBoolean = true;
        this.drawWhiteBoxFirstTime = true;
        this.timing = timing;
        
        this.currentText;

        this.counter = 0;
        this.number = 0;

        this.rect;
        this.text;

        this.graphicsText;
    }

    preUpdate(){
        this.counter++;

        if (this.number <= this.textsLength && this.counter % this.timing == 0){

            if (this.drawBoolean){
                if(this.drawWhiteBoxFirstTime){
                    this.drawWhiteBox();
                    this.drawWhiteBoxFirstTime = false;
                }
                this.drawText(this.texts[this.number]);
                this.drawBoolean = false;
            } else {
                this.number++;
                this.destroyText();
                this.drawBoolean = true;
            }
        }

        if (this.number == this.textsLength){
            this.enemy.canTalk = true;
            this.destroyWhiteBox();
        }
    }

    drawWhiteBox(){
        this.graphicsText = this.scene.add.graphics();
        this.rect = new Phaser.Geom.Rectangle(this.x, this.y, 310, 61);
        this.graphicsText.fillStyle(0xFFFFFF, 0.75);
        this.graphicsText.fillRectShape(this.rect);
        this.graphicsText.fixedToCamera = true;
        this.graphicsText.setScrollFactor(0);
    }

    destroyWhiteBox(){
        this.graphicsText.destroy();
    }

    drawText(input){
        this.currentText = this.scene.add.text(this.x+5, this.y+5, input, { font: 'bold 16pt Arial', fill: 'black', fontSize: 64, wordWrap: true });
        this.currentText.fixedToCamera = true;
        this.currentText.setScrollFactor(0);
    }

    destroyText(){
        this.currentText.destroy();
    }
}

class Pow extends Phaser.GameObjects.Graphics{ // power of women
    constructor(scene, player, enemy){
        super(scene);
        scene.add.existing(this);
        this.scene = scene;
        this.player = player;
        this.enemy = enemy;

        this.times = 0;
        this.drawBoolean = true;
        this.drawWhiteBoxFirstTime = true;
        
        this.currentText;

        this.counter = 0;
        this.number = 0;

        this.rect;
        this.text;
        this.box;

        this.currentImage;
    }

    preUpdate(){
        this.counter++;

        if (this.number <= this.times && this.counter % 10 == 0){

            if (this.drawBoolean){
                this.drawText();
                this.drawBoolean = false;
            } else {
                this.number++;
                this.destroyText();
                this.drawBoolean = true;
            }
        }

        if (this.number == this.times){
        }
    }

    drawText(){
        this.currentImage = this.scene.add.image(this.enemy.x-10, this.enemy.y-20, 'pow');
    }

    destroyText(){
        this.currentImage.destroy();
    }
}