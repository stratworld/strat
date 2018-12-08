# The Lit Cloud Language

Lit is a language to represent and deploy cloud infrastructure.

Development is in the extreme early stage -- use at your own risk.

A working example project can be found in examples/includes/Root.lit

# To Run

Copy the litconfig.TEMPLATE.json file as "litconfig.json" and set the keys within.

Then
  $ npm install

Then (this is just for convenience -- you can also create a link from /usr/bin)
  $ chmod +x ./lit.js

Then
  $ ./lit.js build examples/includes/Root.lit

This has not been tested on Windows or MacOS.  It should work on Mac, and I'd be surprised if it worked on Windows.

