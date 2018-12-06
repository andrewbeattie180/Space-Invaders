SPACE BALTI

https://andrewbeattie180.github.io/Space-Invaders

As part of an introduction to team based projects and using Git Hub collaboratively, myself and 3 colleagues have built a
HTML canvas based game.

The initial project outline/request was to create a version of Space Invaders. 1 in-joke later and Space Balti was born.

First step was to create a HTML canvas, and draw the basic SVG files onto the screen.

The logic behind the main game mechanics is to run the game on an interval of 10ms, with various variables either automatically
altering, or being manually altered using keydown/keyup event listeners.

To move the various objects around, the variables defining the space around the objects are altered. So instead of physically
manuevering the objects, the game manipulates the space around them, giving the impression of the ship/bullets/aliens moving.

The firing mechanics are based on creating an instance of a bullet upon the fire function running. The game moves all bullets
constantly, removing them from the game whenever they collide with an object, or with the ceiling/floor. There is a selectAlien
function that selects an alien (that is alive) at random and allows them to fire back at the player.

The collision detection is simply a check to whether the current coordinates of a bullet coincide with the current coordinates 
of an object (alien/boss/player). 

Each instance of an alien, bullet and heart are actually objects, with properties that define the current coordinate, and also
a status (in other words alive/dead). In the case of a collision, the status of an object is set to zero. The game is also 
coded to only draw objects that have a status of 1, so that bullets disappear when they touch an alien/ship, and the aliens 
disappear when shot.

As the rows and columns of aliens are deleted, the game listens out for these changes, and will move the aliens further left,
right and further down where appropriate, emulating the motion of the aliens in the original game.

At this point the group was happy with the current version of the project, and I took on the rest rest of the work solo. 
Here I built a boss level that increases with difficulty, and various load screens, a pause functionality, and a credits screen.
Learning how to handle setInterval and clearInterval by using global IDs allowing for various screens to be drawn rather than 
just the initial game was the most challenging part of this task. Clearing intervals that allow the current screen to be shown
where the interval was set inside another function was at first a struggle. Setting globalIDs that can be accessed by various 
functions was the solution I settled on in the end.

Here the game was a working project but had various bugs. 1. Pressing various buttons on the "loadscreen" would break the 
setIntervals 2. The game would not load on Firefox browsers. 3. I noticed variables that I would set to null/undefined would 
have increasing values depending on button presses. 4. Some functions would still run during pause/credit/loading screens when
they shouldn't have.

1. - The solution was down to a faulty eventlistener and the way I had structured the game start functions. Restructuring the 
game start and repurposing the eventlisteners solved the issue.
2. - The issue was within the SVG images. For Firefox to be able to display them you have to manually add a height and width
parameter inside the SVG otherwise it would display them as 0px 0px.
3. - This was a red herring. I haven't noticed any issues with this occuring, and have since removed the error check function
4. - Using various booleans and conditions on functions has effectively disabled this from happening. 

At this point the game is 'complete' to a standard I am happy with. I am going to attempt to rework the game using classes over
solely functions going forward, and also attempt to enable compatability with smartphones/tablets. I may potentially add various
styles of levels similar to various other "bullet hell" space games.

Thanks for reading

Andrew


With thanks to Elliot, Kasir and Jake.
