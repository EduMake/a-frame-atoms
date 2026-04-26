# a-frame-atoms

Simple GCSE Chemistry atom models built in WebVR

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
