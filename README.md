# MK7TORQUETUNE

MK7TORQUETUNE is a Shazam-style prototype for car issue sounds. Record or upload a short sound clip, add driving context, and the app suggests likely problems such as brake squeal, brake grinding, CV axle clicking, engine knock, belt chirp, underbody rattle, acceleration whine, engine-bay hissing, shifting thuds, and cabin fan chirp.

The customer-facing app does not show a sound library or training panel. Known sound fingerprints are embedded privately in the software and used by the matching engine behind the scenes.

Diagnosed recordings and uploaded clips are stored locally in the browser so a customer can replay the exact sound for a mechanic. They are not uploaded anywhere by this static prototype.

The vehicle selector stores year, make, and model locally, checks 1996+ year/make/model combinations against the NHTSA vPIC vehicle database when online, and shows starter trouble spots with age-based fallback checks for other vehicles.

The 3D blueprint uses the selected vehicle to switch between detailed model-specific blueprint approximations, including sedans, pickups, SUVs, coupes, vans, EVs, trucks, crossovers, and off-road forms. For example, selecting Ford and typing F-150 turns the blueprint into a more detailed F-Series-style pickup with grille, bed rails, wheel arches, and highlighted problem zones. Drag the blueprint to rotate it, or tap the hotspot buttons to highlight the likely problem area.

The app also includes a local customer profile, VIN lookup, mechanic notes, photo/video attachments, a mechanic dashboard, report export, an owner manual finder, and a damaged-part photo page that builds replacement-part search links from the selected vehicle.

Future AI training clips can be marked in the saved recordings section. This keeps a local training queue in the browser; real AI matching from thousands of sounds will need a backend, a licensed sound dataset, and a trained model.

## Run locally

Open `index.html` in a browser, or serve the folder over localhost for microphone support:

```sh
node server.js
```

On Mac, you can also double-click `Start TorqueTune.command`.

This is an assistive prototype, not a replacement for a mechanic's inspection.
