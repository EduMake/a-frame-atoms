var fs = require('fs');
var path = require('path');

var hbs = require('hbs');

var Elements = require('../elements');

var OUTPUT_DIR = path.join(__dirname, '..', 'docs');
var PUBLIC_DIR = path.join(__dirname, '..', 'public');
var VIEWS_DIR = path.join(__dirname, '..', 'views');
var PARTIALS_DIR = path.join(VIEWS_DIR, 'partials');

var handlebars = hbs.handlebars;

registerPartials();

var templates = {
  aframe: compileTemplate(path.join(VIEWS_DIR, 'aframe.hbs')),
  layout: compileTemplate(path.join(VIEWS_DIR, 'layout.hbs')),
  element: compileTemplate(path.join(VIEWS_DIR, 'element.hbs')),
  index: compileTemplate(path.join(VIEWS_DIR, 'index.hbs')),
  table: compileTemplate(path.join(VIEWS_DIR, 'table.hbs'))
};

buildStaticSite();

function buildStaticSite() {
  var elements = new Elements();
  var atoms = elements.getAllPositions();
  var tableAtoms = atoms.slice(7);

  resetOutputDirectory();
  copyDirectory(PUBLIC_DIR, OUTPUT_DIR);
  writeFile(path.join(OUTPUT_DIR, '.nojekyll'), '');

  writePage(path.join(OUTPUT_DIR, 'index.html'), renderWithLayout('layout', 'index', {
    title: 'VR Atoms',
    atoms: atoms,
    currentPath: '.'
  }));

  writePage(path.join(OUTPUT_DIR, 'table', 'index.html'), renderWithLayout('aframe', 'table', {
    title: 'Periodic Table',
    atoms: tableAtoms,
    currentPath: '..'
  }));

  atoms.forEach(function (atom) {
    writePage(
      path.join(OUTPUT_DIR, 'element', atom.name, 'index.html'),
      renderWithLayout('aframe', 'element', createAtomLocals(atom))
    );
  });
}

function createAtomLocals(atom) {
  var locals = {};
  Object.keys(atom).forEach(function (key) {
    locals[key] = atom[key];
  });
  locals.currentPath = '../..';
  locals.layout = 'aframe';
  return locals;
}

function renderWithLayout(layoutName, viewName, locals) {
  var body = templates[viewName](locals);
  return templates[layoutName](merge(locals, { body: body }));
}

function registerPartials() {
  var partialFiles = fs.readdirSync(PARTIALS_DIR);

  partialFiles.forEach(function (fileName) {
    var fullPath = path.join(PARTIALS_DIR, fileName);
    var stats = fs.statSync(fullPath);

    if (!stats.isFile()) {
      return;
    }

    var partialName = path.basename(fileName, path.extname(fileName)).replace(/[\s-]+/g, '_');
    var source = fs.readFileSync(fullPath, 'utf8');
    handlebars.registerPartial(partialName, source);
  });
}

function compileTemplate(filePath) {
  return handlebars.compile(fs.readFileSync(filePath, 'utf8'));
}

function resetOutputDirectory() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  fs.readdirSync(sourceDir, { withFileTypes: true }).forEach(function (entry) {
    var sourcePath = path.join(sourceDir, entry.name);
    var targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      return;
    }

    fs.copyFileSync(sourcePath, targetPath);
  });
}

function writePage(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function merge(base, extra) {
  var merged = {};

  Object.keys(base).forEach(function (key) {
    merged[key] = base[key];
  });

  Object.keys(extra).forEach(function (key) {
    merged[key] = extra[key];
  });

  return merged;
}