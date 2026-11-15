# Next Level Improvement

Website for **Next Level Improvement**, a home remodeling company in Centreville, Virginia
(kitchens, bathrooms, flooring and painting).

## Features
- 3-second animated intro: the logo draws itself, the slogan appears, and a stair-step transition opens the site
- Interactive 3D "From Blueprint to Your Home" scene (Three.js) that assembles a house as you scroll
- Scroll animations, 3D card tilt, ambient light effects and smooth scrolling (GSAP, Lenis)
- Pages: Home, About, Services, Our Work, Contact
- Contact form with validation that sends the request straight to the company's WhatsApp
- WhatsApp button (+1 571 674 3082) on every page and in the mobile call bar
- "Next Level assistant" chat: answers questions (services, prices, timing, process, area) and collects estimate requests, which it sends via WhatsApp or email
- Responsive layout with a mobile call bar; respects the "reduce motion" accessibility setting

## Run locally
Open `index.html` in a browser (an internet connection is needed for fonts and the 3D/animation libraries).

## Before launch
- Optional: set `formEndpoint` in `index.html` to also receive leads by email
- Optional: deploy `server/chat-worker.js` and set `aiEndpoint` to give the assistant AI-generated replies
- Replace stock photos (Unsplash license) with the company's own project photos
- Confirm the contact email address and add license/insurance details and a privacy policy

## Brand
Logo files: `img/NLI-logo-navy.jpg`, `img/NLI-logo-ivory.jpg`
