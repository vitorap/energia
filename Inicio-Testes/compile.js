const path = require("path");
const fs = require("fs");
const solc = require("solc");

const VendaEnergiaPath = path.resolve(
  __dirname,
  "contracts",
  "VendaEnergia.sol"
);
const source = fs.readFileSync(VendaEnergiaPath, "utf8");

module.exports = solc.compile(source, 1).contracts[":VendaEnergia"];
