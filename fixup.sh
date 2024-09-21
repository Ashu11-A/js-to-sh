#!/bin/bash

cat >dist/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF

cat >dist/mjs/package.json <<!EOF
{
    "type": "module"
}
!EOF

arquivos_js=("dist/cjs/index.js" "dist/mjs/index.js")

for arquivo in "${arquivos_js[@]}"; do
  if ! grep -q "^#!/usr/bin/env node" "$arquivo"; then
    sed -i '1i#!/usr/bin/env node' "$arquivo"
    chmod 777 $arquivo
    echo "Linha adicionada no início do arquivo $arquivo"
  else
    echo "Linha já está presente no arquivo $arquivo"
  fi
done