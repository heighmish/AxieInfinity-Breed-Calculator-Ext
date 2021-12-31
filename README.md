# AxieInfinityBreedCalculatorExtension

This repository contains a chrome extension that is useful for information access for Axie Infinity players. The extension fetches fiat and cryptocurrency prices from binance
and performs some simple calculations that are contextually useful for the game Axie Infinity. 

Chrome store link: https://chrome.google.com/webstore/detail/axie-infinity-breed-cost/kgmmhclhhlkaecmhmfpkcdkamohealeh/

The extension is writen in vanilla javascript, html and css, and uses manifest 3 for chrome extensions. It uses the javascript websocket api to connect to binance for a constant stream of price information.

Some challenges I faced were the unavailability of certain websockets (asx in ethereum for example), for those a conversion rate is calculated from the other websockets that do exist. Using vanilla javascript, there is a significant amount of code used to generate all the document elements.

In the future I would like to add compatability for users to choose other fiat and cryptocurrencies they would like to have displayed in the extension. Currently the only theme is a dark theme, I plan on adding a light theme option.

I learned many things in the project, such as using websockets, and how to implement a spinning loading screen while waiting for data to be received from websockets.
