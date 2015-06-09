# vlc-api

HTTP API client for node.js

(Yes, vlc has an http api)

## Credits:
* Joshua Holbrook https://github.com/jesusabdullah For his vlc-api
* Jelte Lagendijk https://github.com/j3lte For making me do this!

## Example:
(Notice: VLC's web control must be enabled, fill in the authentication details in the constructor)

```js
$ node
> var vlc = require('./')({username:'example', password:'example'});
undefined
> vlc
{ _base: 'http://localhost:8080',
  status: 
   { [Function]
     forceUpdate: [Function],
     fullscreen: [Function],
     play: [Function],
     pause: [Function],
     stop: [Function],
     resume: [Function],
     volume: [Function],
     togglePause: [Function],
     data: {},
  playlist: 
   { [Function]
     next: [Function],
     previous: [Function],
     empty: [Function],
     random: [Function],
     loop: [Function],
     repeat: [Function] } }

```

## Usage
First make sure you have VLC's webinterface enabled, also make sure to enable remote access by settings a password!
Every function will return a promise object, the rest is pretty self-explanatory.
Example code:
```
var vlc = require('vlc-node')({username:'example', password:'example'}),
    Q = require('q');

vlc.status.pause()
.then(vlc.status.play())
.then(vlc.status.fullscreen());
```

## Tests:

1. Turn on vlc with the http interface enabled and listening on 8080.
3. Get a playlist going.
3. Run `npm test` for a CRAZY ROBOT REMIX

## License:

MIT/X11.
