class MouseCursor {
  constructor(x, y, randomColor, colorID, myID, bump) {
    (this.x = x),
      (this.y = y),
      (this.color = randomColor),
      (this.colorID = colorID),
      (this.userHasControl = true),
      (this.target = undefined),
      (this.pos = undefined),
      (this.wallBounce = false),
      (this.bump = bump),
      (this.ID = myID);
  }

  //--------------------------------------------------------------
  //This client's mouse

  checkControl() {
    if (this.userHasControl) {
      if (
        mouseX <= rectCanvas.x ||
        mouseY <= rectCanvas.y ||
        mouseX >= rectCanvas.x + rectCanvas.w ||
        mouseY >= rectCanvas.y + rectCanvas.h
      ) {
        this.wallBounce = true;
        this.userHasControl = false;
      }
      return;
    } else {
      //check if cursor is in the vicinity of mouse to have it "snap"
      let mouseRect = {
        x: mouseX - 5,
        y: mouseY - 5,
        w: 10,
        h: 10
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
    
    if (imBeingBumped) {
      this.x = mouseBumpX;
      this.y = mouseBumpY;
      mouseX = this.x;
      mouseY = this.y;
    }

    if (
      mouseX <= -10 ||
      mouseX >= width + 10 ||
      mouseY <= -10 ||
      mouseY >= height + 10
    ) {
      this.userHasControl;
      this.wallBounce = false;
      if (mouseX < 0) {
        this.x = 5;
      }
      if (mouseX > width) {
        this.x = width - 19;
      }
      if (mouseY < 0) {
        this.y = 5;
      }
      if (mouseY > height) {
        this.y = height - 19;
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

        this.target.sub(this.pos);
        this.target.normalize();
        this.target.mult(mappedDistance);
        this.pos.add(this.target);
        this.x = this.pos.x;
        this.y = this.pos.y;
      }
    }
  }

  //--------------------------------------------------------------
  //Other Client's Mice
  
  checkCollision() {
    this.pos = createVector(this.x, this.y);

    let distance = dist(this.pos.x, this.pos.y, mouseX, mouseY);
    let minDistance = 24;

    if (distance < minDistance) {
      imBeingBumpedBy = this.ID;
      this.bump = true;
      console.log(this.ID, "was set to this.bump = true");
    } 
    //good for testing;
    line(this.pos.x, this.pos.y, mouseX, mouseY);
  }

  updateBounce() {
    if (this.bump) {
      let mouseToMoveAway = createVector(mouseX, mouseY);
      let mouseToTarget = createVector(this.x, this.y);
      let distance = mouseToMoveAway.dist(mouseToTarget);
      let mappedDistance = map(distance, 24, 0, 24, 25);

      mouseToMoveAway.sub(mouseToTarget); //change to add? or negative?
      mouseToMoveAway.normalize();
      mouseToMoveAway.mult(mappedDistance);
      mouseToTarget.add(mouseToMoveAway);
      mouseBumpX = mouseToTarget.x;
      mouseBumpY = mouseToTarget.y;

      push();
      fill(0, 255, 0, 100);
      ellipse(mouseToTarget.x, mouseToTarget.y, 10);
      pop();
    }
  }

  //--------------------------------------------------------------
  //Both sets of mice

  show() {
    image(this.color, this.x - 5, this.y, 24, 24);
    textSize(10);
    text(this.ID, this.x, this.y);
  }
}

//Help with vector math here:
//https://stackoverflow.com/questions/48250639/making-an-object-move-toward-the-cursor-javascript-p5-js
