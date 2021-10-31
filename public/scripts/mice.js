class MouseCursor {
  constructor(x, y, randomColor, colorID) {
    this.x = x,
    this.y = y,
    this.color = randomColor,
    this.colorID = colorID,
    this.userHasControl,
    this.target,
    this.pos,
    this.wallBounce = false,
    this.mouseCollide = false;
  }

  checkControl() {
    if (this.userHasControl) {

      if (mouseX <= rectCanvas.x ||
        mouseY <= rectCanvas.y ||
        mouseX >= rectCanvas.x + rectCanvas.w ||
        mouseY >= rectCanvas.y + rectCanvas.h) {
        this.wallBounce = true;
        this.userHasControl = false
      }

      //if mouse bumps into another mouse

      return;
    } else {

      //check if cursor is in the vicinity of mouse to have it "snap"
      let mouseRect = {
        x: mouseX - 5,
        y: mouseY - 5,
        w: 10,
        h: 10,
      };

      if (
        this.x >= mouseRect.x &&
        this.x <= mouseRect.x + mouseRect.w &&
        this.y >= mouseRect.y &&
        this.y <= mouseRect.y + mouseRect.h
      ) {
        this.userHasControl = true;
      } else {
        this.userHasControl = false;
      }
    }
  }

  update() {
    if (mouseX <= -10 ||
      mouseX >= width + 10 ||
      mouseY <= -10 ||
      mouseY >= height + 10) {
      this.userHasControl;
      this.wallBounce = false;
      if (mouseX < 0) {
        this.x = 0;
      }
      if (mouseX > width) {
        this.x = width - 24;
      }
      if (mouseY < 0) {
        this.y = 0;
      }
      if (mouseY > height) {
        this.y = height - 24;
      }
    }

    if (this.userHasControl) {
      this.x = mouseX;
      this.y = mouseY;
    } else {

      this.pos = createVector(this.x, this.y);

      //if we're bouncing then do this...
      if (this.wallBounce) {

        //"bounce" off the edge by pulling towards center canvas
        this.target = createVector(width / 2, height / 2);
        let distance = this.target.dist(this.pos);
        let mappedDistance = map(distance, 100, 0, 6, 0.5);

        //line(this.pos.x, this.pos.y, this.target.x, this.target.y);

        this.target.sub(this.pos);
        this.target.normalize();
        this.target.mult(mappedDistance);

        if (mappedDistance <= 10) {
          this.wallBounce = false;
          return;
        } else {
          this.pos.add(this.target);
          this.x = this.pos.x;
          this.y = this.pos.y;
        }

      } else {
        this.target = createVector(mouseX, mouseY);
        let distance = this.target.dist(this.pos);

        let mappedDistance = map(distance, 100, 0, 8, 0.5);

        //good for testing!
        //line(this.pos.x, this.pos.y, this.target.x, this.target.y);

        this.target.sub(this.pos);
        this.target.normalize();
        this.target.mult(mappedDistance);
        this.pos.add(this.target);
        this.x = this.pos.x;
        this.y = this.pos.y;
      }



    }
  }

  show() {
    image(this.color, this.x - 5, this.y, 24, 24);
  }
}

  //Help with vector math here:
  //https://stackoverflow.com/questions/48250639/making-an-object-move-toward-the-cursor-javascript-p5-js
