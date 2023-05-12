# 3D intro screen
A starter template for [Three.js](https://threejs.org/) based intro screens.

> Confused? [Learn more about the project](https://github.com/moonscreens/info).

If you're looking for a more basic template or are more comfortable using the canvas API yourself, check out [intro-example](https://github.com/moonscreens/intro-example).

Include `?channel=moonmoon`, or `?channel=channel1,channel2,channel3...` in your URL to connect to a specific channel, great for testing!

Include `?stats=true` to enable performance stats (should pop up in the top left corner).

# Development
Before you start, you should have [NodeJS](https://nodejs.org/en/) installed.
```
npm install
npm run dev
```

After running `dev`, open [localhost:5173](http://localhost:5173/). The page should automatically refresh when you make a change.

# Building & Deploying
```
npm run build
```
Outputs static files to `/dist/`.

Services like [Netlify](https://www.netlify.com/) have free tiers that can easily deploy simple static webpages like this.
