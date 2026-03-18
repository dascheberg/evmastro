import fs from "fs";
import path from "path";

// const fs = require('fs');
// const path = require('path');

// Verzeichnisse und Dateien, die ausgeschlossen werden sollen
const excludedDirectories = [
  "node_modules",
  "public",
  ".next",
  ".git",
  ".vscode",
  "tools",
  "drizzle",
  ".vercel",
  "dist",
  ".astro",
];
const excludedFiles = [
  ".env",
  ".env.local",
  "next-env.d.ts",
  "eslint.config.mjs",
  "README.md",
  ".env.prod",
  ".gitignore",
  "eslint.config.mjs",
  "drizzle.config.ts",
  "package.json",
  "package-lock.json",
  "postcss.config.mjs",
  "tsconfig.json",
  "AlleDateienKopieren.js",
  "CodeAllerDateien.txt",
  "*.cmd",
];

// Ziel-Textdatei
const outputFilePath = "CodeEMADateien.txt";

// Funktion, um die Verzeichnisstruktur anzuzeigen
function printDirectoryStructure(dir, indent = "") {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (excludedDirectories.includes(file)) {
      return; // Überspringe ausgeschlossene Verzeichnisse
    }

    console.log(indent + file + (stats.isDirectory() ? "/" : ""));

    if (stats.isDirectory()) {
      printDirectoryStructure(fullPath, indent + "  ");
    }
  });
}

// Funktion, um alle Dateien einzulesen und in die Textdatei zu schreiben
function readFilesAndWriteToOutput(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (excludedDirectories.includes(file)) {
      return; // Überspringe ausgeschlossene Verzeichnisse
    }

    if (stats.isDirectory()) {
      readFilesAndWriteToOutput(fullPath); // Rekursiver Aufruf für Unterverzeichnisse
    } else if (!excludedFiles.includes(file)) {
      // Schreibe den Pfad der Datei in die Ausgabedatei
      fs.appendFileSync(outputFilePath, `\n\n--- Pfad: ${fullPath} ---\n\n`);

      // Schreibe den Inhalt der Datei in die Ausgabedatei
      const content = fs.readFileSync(fullPath, "utf8");
      fs.appendFileSync(outputFilePath, content);
    }
  });
}

// Hauptfunktion
function main() {
  const directoryPath = "/home/dieter/dev/evmastro/"; // Hier das gewünschte Verzeichnis angeben

  // Leere die Ausgabedatei, falls sie bereits existiert
  fs.writeFileSync(outputFilePath, "");

  // Zeige die Verzeichnisstruktur an
  console.log("Verzeichnisstruktur:");
  printDirectoryStructure(directoryPath);

  // Lese alle Dateien und schreibe sie in die Ausgabedatei
  readFilesAndWriteToOutput(directoryPath);

  console.log(`\nAlle Dateien wurden in ${outputFilePath} gespeichert.`);
}

// Führe die Hauptfunktion aus
main();
