# a-frame-atoms

Simple GCSE Chemistry atom models built in WebVR.

Live demo: https://edumake.github.io/a-frame-atoms/

## Static build

This repository can now export a GitHub Pages friendly static site into `docs/`.

```sh
npm run build:static
```

The build copies assets from `public/` and pre-renders:

- `/`
- `/table/`
- `/element/<ElementName>/`

For GitHub Pages, publish the `docs/` folder.
