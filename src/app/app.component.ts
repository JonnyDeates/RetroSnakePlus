import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit  {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  count: 0;
  difficulty: any;
  grid = 4;
  score: any;
  snake: {
    bgColor: string,
    color: string,
    name: string,
    x: number,
    y: number,
    dx: number,
    dy: number,
    cells: any[],
    maxCells: number
  };
  food: any;
  activeFood: any;
  gameStatus: { power: boolean, start: boolean, end: boolean, walls: boolean };

  constructor() {
    this.activeFood = [{name: 'Mouse', color: '#cccccc'}, {name: 'Rat', color: '#777777'},
      {name: 'Snake', color: '#007700'}, {name: 'Fox', color: '#884411'}];
    this.food = [{name: 'Cherry', color: '#ff0000'}, {name: 'Strawberry', color: '#770000'},
      {name: 'Orange', color: '#cc7700'}, {name: 'Apple', color: '#cc0000'}, {name: 'Melon', color: '#00cc00'}];
    this.difficulty = [{setting: 'Easy', color: 'green', multiplier: 0.5, speed: 3},
      {setting: 'Medium', color: 'yellow', multiplier: 1, speed: 2},
      {setting: 'Hard', color: 'orange', multiplier: 1.5, speed: 1}, {
        setting: 'Impossible',
        color: 'red',
        multiplier: 2,
        speed: 0
      }];
    this.score = {current: 0, last10: [], multiplier: 1};
    this.snake = {
      bgColor: '#c7f3ff',
      color: 'green',
      name: '',
      x: 0,
      y: 0,
      dx: this.grid,
      dy: 0,
      cells: [],
      maxCells: 4
    };
    for (let i = 0; i < this.activeFood.length; i++) {
      this.activeFood[i] = {
        name: this.activeFood[i].name, color: this.activeFood[i].color, active: false, x: 0, y: 0,
        growth: i * 2 + 5, score: (i * 2 + 1) * 1500
      };
    }

    for (let i = 0; i < this.food.length; i++) {
      this.food[i] = {
        name: this.food[i].name, color: this.food[i].color, active: false, x: 0, y: 0,
        growth: i * 2 + 1, score: (i * 2 + 1) * 100
      };
    }

    for (const diff of this.difficulty) {
      Object.assign(diff, {active: false});
    }
    this.difficulty.find((diff) => diff.setting === 'Medium').active = true;

    this.gameStatus = {
      power: true,
      start: true,
      end: false,
      walls: (!(this.difficulty.find((diff) => diff.active && diff.setting === 'Impossible')))
    };
  }


  ngOnInit() {
    this.canvas = document.getElementById('snake') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.loadSessionScore();
    this.selectRandomFruits();
    this.selectRandomActiveFood();
    this.loop();

    // const colorPicker = document.getElementById('colorPicker');
    // colorPicker.addEventListener('change', (e) => this.snake.color = document.getElementById('colorPicker').style.color);
    //
    // const bgPicker = document.getElementById('bgPicker');
    // bgPicker.style.color = this.snake.bgColor;
    // bgPicker.addEventListener('change', (e) => {
    //   const currentColor = document.getElementById('bgPicker').style.color;
    //   this.snake.bgColor = currentColor;
    //   document.getElementById('game-wrapper').style.backgroundColor = this.colorLum(currentColor, -0.2);
    //   document.getElementById('snake').style.backgroundColor = currentColor;
    // });

    document.addEventListener('keydown', (e) => {
      // prevent snake from backtracking on itself
      if (e.which === 37 && this.snake.dx === 0) { // Left Key
        this.movePlayer('left');
      } else if (e.which === 38 && this.snake.dy === 0) { // Up
        this.movePlayer('up');
      } else if (e.which === 39 && this.snake.dx === 0) { // right
        this.movePlayer('right');
      } else if (e.which === 40 && this.snake.dy === 0) { // Down
        this.movePlayer('down');
      }
    });
  }

  movePlayer(direction) {
    if (direction === 'left' &&  this.snake.dx === 0) {
      this.snake.dx = -this.grid;
      this.snake.dy = 0;
    } else if (direction === 'up' &&  this.snake.dy === 0) {
      this.snake.dy = -this.grid;
      this.snake.dx = 0;
    } else if (direction === 'right' &&  this.snake.dx === 0) {
      this.snake.dx = this.grid;
      this.snake.dy = 0;
    } else if (direction === 'down' &&  this.snake.dy === 0) {
      this.snake.dy = this.grid;
      this.snake.dx = 0;
    }
  }
  animalMove(animal, movementType, length) {
    const size = animal.movement;
    if (length === 1) {
      const movementTypes = ['loop', 'lateral', 'right', 'left', 'up', 'down'];
      animal.movement = Math.floor(Math.random() * animal.maxMovement);
      animal.movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
    }
    if (animal.movementType === 'loop') {
      return this.loopMovement(animal, size, length);
    } else if (animal.movementType === 'lateral') {
      return this.lateralMovement(animal, size, length);
    } else if (animal.movementType === 'right') {
      return this.cardinalDirMovement('right', animal, size, length);
    } else if (animal.movementType === 'left') {
      return this.cardinalDirMovement('left', animal, size, length);
    } else if (animal.movementType === 'down') {
      return this.cardinalDirMovement('down', animal, size, length);
    } else if (animal.movementType === 'up') {
      return this.cardinalDirMovement('up', animal, size, length);
    }
  }

  cardinalDirMovement(direction, animal, size, length) {
    if (!!(length) || length === 0) {
      if (length <= size) {
        if (direction === 'up') {
          animal.y -= 1;
        } else if (direction === 'left') {
          animal.x -= 1;
        } else if (direction === 'down') {
          animal.y += 1;
        } else if (direction === 'right') {
          animal.x += 1;
        }
        return length;
      } else {
        return 0;
      }
    } else {
      animal.y -= 1;
      return 0;
    }
  }
  // Recieved from https://www.sitepoint.com/javascript-generate-lighter-darker-color/, allows for easy changing of hex format to be increase or decreased based on a percent value
  colorLum(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    let rgb = '#', c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }
    return rgb;
  }

  loopMovement(creature, size, length?) {
    if (!!(length) || length === 0) {
      if (length <= 4 * size) {
        if (length / (1 * size) <= 1) {
          creature.y -= 1;
        } else if (length / (2 * size) <= 1) {
          creature.x -= 1;
        } else if (length / (3 * size) <= 1) {
          creature.y += 1;
        } else if (length / (4 * size) <= 1) {
          creature.x += 1;
        }
        return length;
      } else {
        return 0;
      }
    } else {
      creature.y -= 1;
      return 0;
    }
  }

  lateralMovement(creature, size, distance?) {
    if (!!(distance) || distance === 0) {
      if (distance <= 2 * size) {
        if (distance / (1 * size) <= 1) {
          creature.x -= 1;
        } else if (distance / (2 * size) <= 1) {
          creature.x += 1;
        }
        return distance;
      } else {
        return 0;
      }
    } else {
      creature.x -= 1;
      return 0;
    }
  }



  changeDifficulty(difficulty) {
    for (const diff of this.difficulty) {
      Object.assign(diff, {active: false});
    }
    this.difficulty.find((diff) => diff === difficulty).active = true;
  }

  checkBounds(creature) {
    if (creature.x < 0) {
      creature.x = this.canvas.width - this.grid;
    } else if (creature.x >= this.canvas.width) {
      creature.x = 0;
    }

    if (creature.y < 0) {
      creature.y = this.canvas.height - this.grid;
    } else if (creature.y >= this.canvas.height) {
      creature.y = 0;
    }
  }

  checkCollisionDeath(x, y, index) {
    for (let i = index + 1; i < this.snake.cells.length; i++) {
      if (x === this.snake.cells[i].x && y === this.snake.cells[i].y) {
        this.resetGame();
      }
    }
  }

  checkMinDeath = () => {
    if (this.snake.maxCells < 0) {
      this.resetGame();
    }
  };

  fillCircle(context, centerX, centerY, radius) {
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  loadSessionScore() {
    if (!!(sessionStorage.getItem('score'))) {
      this.score.last10 = JSON.parse(sessionStorage.getItem('score'));
    } else {
      this.score.last10 = [];
    }
  }

  loop() {
    if (!this.gameStatus.power) {
      requestAnimationFrame(() => this.loop());
      const difficulty = this.difficulty.find((diff) => diff.active);
      if (this.count++ < difficulty.speed) {
        return;
      }
      this.count = 0;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.snake.x += this.snake.dx;
      this.snake.y += this.snake.dy;

      this.snake.cells.unshift({x: this.snake.x, y: this.snake.y});

      if (this.snake.cells.length > this.snake.maxCells) {
        this.snake.cells.pop();
      }
      this.checkBounds(this.snake);

      // draw the fruit
      for (const fruit of this.food) {
        if (fruit.active) {
          this.ctx.fillStyle = fruit.color;
          this.ctx.fillRect(fruit.x, fruit.y, this.grid, this.grid);
        }
      }

      for (const animal of this.activeFood) {
        if (animal.active) {
          if (animal.length >= 0) {
            animal.length = this.animalMove(animal, animal.movementType, animal.length + 1);
            this.checkBounds(animal);
          } else {
            Object.assign(animal, {length: 0, movementType: 'lateral', movement: 20, maxMovement: 50});
          }
          this.ctx.fillStyle = animal.color;
          this.ctx.fillRect(animal.x, animal.y, this.grid, this.grid);
        }
      }

      this.ctx.fillStyle = this.snake.color;
      this.snake.cells.forEach((cell, index) => {
        this.ctx.fillRect(cell.x, cell.y, this.grid - 1, this.grid - 1);
        for (const fruit of this.food) {
          if (fruit.active && (cell.x <= fruit.x + this.grid / 2 && cell.x >= fruit.x - this.grid / 2) &&
            (cell.y <= fruit.y + this.grid / 2 && cell.y >= fruit.y - this.grid / 2)) {
            this.snake.maxCells += fruit.growth;
            this.score.current += fruit.score * difficulty.multiplier;
            this.selectRandomFruits(cell.x, cell.y);
          }
        }
        for (const animal of this.activeFood) {
          if (animal.active && (cell.x <= animal.x + this.grid / 2 && cell.x >= animal.x - this.grid / 2) &&
            (cell.y <= animal.y + this.grid / 2 && cell.y >= animal.y - this.grid / 2)) {
            this.snake.maxCells -= animal.growth;
            this.score.current += animal.score * difficulty.multiplier;
            animal.active = false;
            this.checkMinDeath();
            this.snake.cells.splice(this.snake.cells.length - animal.growth - 1, this.snake.cells.length);
            this.selectRandomActiveFood();
          }
        }
        // check collision with all cells after this one (modified bubble sort)
        for (let i = index + 1; i < this.snake.cells.length; i++) {
          // collision. reset game
          this.checkCollisionDeath(cell.x, cell.y, index);
        }
      });
    } else {
      this.checkMinDeath();
    }
  }
  resetColors() {
  }
  resetGame() {
    this.togglePower(false);
    this.toggleEnd();
    this.snake.x = 0;
    this.snake.y = 0;
    this.snake.cells = [];
    this.snake.maxCells = 4;
    this.snake.dx = this.grid;
    this.snake.dy = 0;
    this.activeFood.forEach((fruit) => fruit.active = false);
    this.selectRandomFruits();
    this.selectRandomActiveFood();
    this.saveSessionScore();
    this.loadSessionScore();
  }

  saveSessionScore() {
    if (this.score.last10.length !== 0) {
      for (let i = 0; i < this.score.last10.length; i++) {
        if (this.score.last10[i] < this.score.current) {
          this.score.last10.splice(i, 0, {name: JSON.stringify(this.snake.name), score: JSON.stringify(this.score.current)});
          i += this.score.last10.length;
        }
      }
    } else {
      this.score.last10.push(this.score.current);
    }
    if (this.score.last10.length > 10) {
      this.score.last10.splice(10, this.score.last10.length);
    }
    console.log(this.score.last10);
    this.score.current = 0;
    sessionStorage.setItem(('score'), JSON.stringify(this.score.last10));
  }

  findFreeCell(x, y) {
    if (!!(this.snake.cells.find((cell) => (cell.x === x && cell.y === y)))) {
      x = this.getRandomInt(0, 25) * this.grid;
      y = this.getRandomInt(0, 25) * this.grid;
      return this.findFreeCell( x,  y);
    }
  }

  selectRandomFruits(x2?, y2?) {
    for (const veggie of this.food) {
      veggie.active = false;
    }
    let x = this.getRandomInt(0, 25) * this.grid;
    let y = this.getRandomInt(0, 25) * this.grid;
    const fruit = this.food[Math.floor(this.food.length * Math.random())];
    if (!!(x2) && !!(y2)) {

      console.log(x, y, (!!(this.snake.cells.find((cell) => (cell.x === x && cell.y === y)))));
      this.findFreeCell(x, y);
      console.log(x, y, (!!(this.snake.cells.find((cell) => (cell.x === x && cell.y === y)))));
    }
    Object.assign(fruit, {active: true, x: x, y: y});
  }

  selectRandomActiveFood() {
    if (!!this.activeFood.find((animal) => !animal.active)) {
      const fruit = this.activeFood.find((animal) => !animal.active);
      Object.assign(fruit,
        {active: true, x: this.getRandomInt(0, 25) * this.grid, y: this.getRandomInt(0, 25) * this.grid});
    }
  }

  toggleEnd() {
    this.gameStatus.end = !this.gameStatus.end;
  }
  toggleStart() {
    this.gameStatus.start = !this.gameStatus.start;
  }
  togglePower(bool?) {
    this.gameStatus.power = !this.gameStatus.power;
    if (bool) {
      this.toggleGame();
    }
  }
  toggleGame() {
    this.gameStatus.start = false;
    this.gameStatus.end = false;
    this.gameStatus.power = false;
    this.loop();
  }
}
