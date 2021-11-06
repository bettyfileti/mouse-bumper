class MouseCursor {
  constructor(x, y, randomColor, colorID, myID) {
    (this.x = x),
      (this.y = y),
      (this.color = randomColor),
      (this.colorID = colorID),
      (this.userHasControl = true),
      (this.target = undefined),
      (this.pos = undefined),
      (this.wallBounce = false),
      (this.bump = undefined),
      (this.ID = myID),
      (this.index = undefined);
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

  checkCollision() {
    this.bump = undefined;

    for (let mice of mouseCursors) {
      let otherMice = createVector(mice.x, mice.y);
      let myMouse = createVector(this.x, this.y); //was mouseX, mouseY
      let distance = otherMice.dist(myMouse);
      let minDistance = 24;

      if (distance < minDistance) {
        imBeingBumpedBy = mice.ID;
        this.bump = true;
        this.userHasControl = false;
        return;
      } else if (distance > minDistance && this.bump != true) {
        this.userHasControl = false;
        //this.bump = false; //= false;
      }
    }

    //good for testing;
    // line(this.x, this.y, mouseX, mouseY);
  }

  update() {

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

      if (this.bump) {
        //if we're bouncing another mouse, then do this...
        let otherMouse = mouseCursors.find(x => x.ID === imBeingBumpedBy);
        let mouseToMoveAway = createVector(otherMouse.x, otherMouse.y);
        let mouseToTarget = createVector(mouseX, mouseY);

        //creates a faux target to send mouse towards outside of the mouse region
        let newVector = createVector(mouseToMoveAway.x, mouseToMoveAway.y);
        let distanceVect = createVector(
          mouseToMoveAway.x - mouseToTarget.x,
          mouseToMoveAway.y - mouseToTarget.y
        );

        distanceVect.normalize();
        distanceVect.mult(48 * 1.5);
        newVector.sub(distanceVect);

        // push();
        // textSize(20);
        // fill("green");
        // text("newVector", newVector.x, newVector.y);
        // pop();

        let newMousePos = bumpMouse(mouseToTarget, newVector);
        this.x = newMousePos.x;
        this.y = newMousePos.y;
        mouseX = this.x;
        mouseY = this.y;
      } else if (this.wallBounce) {
        //if we're bouncing off the wall then do this...

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
        //if (this.x != mouseX && this.y != mouseY){
          this.target = createVector(mouseX, mouseY);
          let distance = this.target.dist(this.pos);
          let mappedDistance = map(distance, 100, 0, 25, 0.5); 
  
          this.target.sub(this.pos);
          this.target.normalize();
          this.target.mult(mappedDistance);
          this.pos.add(this.target);
          this.x = this.pos.x;
          this.y = this.pos.y;
        //}

      }
    }
  }

  //--------------------------------------------------------------
  //Both sets of mice

  show() {
    image(this.color, this.x - 5, this.y, 24, 24);

    // Helpful for testing
    // textSize(10);
    // text(this.ID, this.x, this.y);
  }
}

//--------------------------------------------------------------
//

function bumpMouse(mouseToMoveAway, mouseToTarget) {
  let distance = mouseToMoveAway.dist(mouseToTarget);
  let mappedDistance = map(distance, 0, 48, 0, 4);

  mouseToMoveAway.sub(mouseToTarget);
  mouseToMoveAway.normalize();
  mouseToMoveAway.mult(mappedDistance);
  mouseToTarget.add(mouseToMoveAway);

  return mouseToTarget;
}

//Help with vector math here:
//https://stackoverflow.com/questions/48250639/making-an-object-move-toward-the-cursor-javascript-p5-js
